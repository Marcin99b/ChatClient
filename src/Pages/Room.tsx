import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Candidate, Room } from "../Models/ApiModels";
import { useRoomsApi, useWebRtcApi } from "../Hooks/useApi";
import { useMedia } from "../Hooks/useMedia";
import { useAuth } from "../Auth/AuthContext";
import { Box, Stack, Text } from "@chakra-ui/react";
import { useSignalR } from "../SignalR/SignalRContext";
import { useRtc } from "../Hooks/useRtc";

const RoomPage = () => {
  const { user } = useAuth();
  const { roomId } = useParams();
  const [room, setRoom] = useState<Room>();
  const isMount = useRef(false);
  const isInvokedRoomConfiguredByReceiver = useRef(false);
  const { getRoom } = useRoomsApi();
  const rtcApi = useWebRtcApi();
  const { openMedia, localStreamRef, remoteStreamRef, localAudioRef, remoteAudioRef } = useMedia();
  const [role, setRole] = useState<"caller" | "receiver" | undefined>();
  const rtcConnection = useRef<RTCPeerConnection>();
  const signalR = useSignalR();

  const rtc = useRtc();

  //get room from DB
  useEffect(() => {
    if (isMount.current) {
      return;
    }
    isMount.current = true;

    getRoom({ roomId }).then((x) => {
      const roleName: "caller" | "receiver" = x.room!.callingUserId === user?.id ? "caller" : "receiver";
      if (roleName !== "receiver") {
        return;
      }
      setRoom(x.room!);
      openMedia().then(() => {
        console.log({ room: x.room!, me: user?.id });
        setRole(roleName);
        rtc.getConnection(x.room!.id!, localStreamRef.current!).then((peerConnection) => {
          rtc.sendOfferAndCandidates(peerConnection, x.room!.id!).then(() => {
            peerConnection.addEventListener("track", (event) => {
              event.streams[0].getTracks().forEach((track) => remoteStreamRef.current!.addTrack(track));
            });
            rtcConnection.current = peerConnection;
            peerConnection.addEventListener("icegatheringstatechange", () => {
              console.log("icegatheringstatechange" + peerConnection.iceGatheringState);
              if (peerConnection.iceGatheringState === "complete") {
                rtcApi.notifyCaller({ roomId: x.room!.id! }).then(() => console.log("Caller notified"));
              }
            });
          });
        });
      });
    });
  }, [getRoom, localStreamRef, openMedia, remoteStreamRef, room, roomId, rtc, rtcApi, user?.id]);

  useEffect(() => {
    if (
      isInvokedRoomConfiguredByReceiver.current ||
      signalR.roomConfiguredByReceiver === undefined ||
      room !== undefined
    ) {
      return;
    }
    const { rtcRoom } = signalR.roomConfiguredByReceiver;
    getRoom({ roomId }).then((x) => {
      setRoom(x.room!);
      openMedia().then(() => {
        console.log({ room: x.room!, me: user?.id });
        const roleName: "caller" | "receiver" = x.room!.callingUserId === user?.id ? "caller" : "receiver";
        if (roleName !== "caller") {
          return;
        }
        setRole(roleName);

        console.log("Gathering data from receiver as caller");

        console.log({ rtcRoom });
        rtc.getConnection(x.room!.id!, localStreamRef.current!).then((peerConnection) => {
          rtc.sendIceCandidates(peerConnection, rtcRoom.id!);
          peerConnection.addEventListener("track", (event) => {
            event.streams[0].getTracks().forEach((track) => remoteStreamRef.current!.addTrack(track));
          });
          const offer = rtcRoom.offer;
          peerConnection.setRemoteDescription(new RTCSessionDescription(offer as any)).then(() => {
            setRemoteDescriptionIsSet(true);
            peerConnection.createAnswer().then((answer) => {
              peerConnection.setLocalDescription(answer).then(() => {
                rtcApi
                  .setAnswer({
                    webRtcRoomId: rtcRoom.id,
                    answer: {
                      type: answer.type,
                      sdp: answer.sdp,
                    },
                  })
                  .then(() => {
                    const candidates = rtcRoom.offerCandidates!.map((x: any) => x.data);
                    for (const item of candidates) {
                      const c = new RTCIceCandidate({
                        candidate: item.candidate!,
                        sdpMid: item.sdpMid!,
                        sdpMLineIndex: item.sdpMLineIndex!,
                        usernameFragment: item.usernameFragment!,
                      });
                      peerConnection.addIceCandidate(c).then((x) => console.log("Candidate added"));
                    }
                    //rtcApi.notifyReceiver({ roomId: x.room!.id! }).then(() => console.log("Receiver notified"));
                  });
              });
            });
          });
        });
      });
    });
  }, [
    getRoom,
    localStreamRef,
    openMedia,
    remoteStreamRef,
    room,
    roomId,
    rtc,
    rtcApi,
    signalR.roomConfiguredByReceiver,
    user?.id,
  ]);

  useEffect(() => {
    if (signalR.roomConfiguredByCaller === undefined) {
      return;
    }
    console.log("Gathering data from caller as receiver");
    const { rtcRoom } = signalR.roomConfiguredByCaller;
    console.log({ rtcRoom });

    const rtcSessionDescription = new RTCSessionDescription(rtcRoom.answer as any);
    rtcConnection.current!.setRemoteDescription(rtcSessionDescription);
    setRemoteDescriptionIsSet(true);

    const candidates = rtcRoom.answerCandidates!;
    for (const item of candidates) {
      const c = new RTCIceCandidate({
        candidate: item.candidate!,
        sdpMid: item.sdpMid!,
        sdpMLineIndex: item.sdpMLineIndex!,
        usernameFragment: item.usernameFragment!,
      });
      rtcConnection.current!.addIceCandidate(c).then((x) => console.log("Candidate added"));
    }
  }, [signalR.roomConfiguredByCaller]);

  const candidatesToAddLater = useRef<Candidate[]>([]);

  useEffect(() => {
    if (signalR.candidateAddedToRoom === undefined || rtcConnection.current === undefined) {
      return;
    }
    const { candidate } = signalR.candidateAddedToRoom;
    if (rtcConnection.current.remoteDescription === null) {
      candidatesToAddLater.current.push(candidate);
      console.log("Added candidate to queue");
      return;
    }

    const c = new RTCIceCandidate({
      candidate: candidate.candidate!,
      sdpMid: candidate.sdpMid!,
      sdpMLineIndex: candidate.sdpMLineIndex!,
      usernameFragment: candidate.usernameFragment!,
    });
    rtcConnection.current.addIceCandidate(c).then(() => console.log("added remote candidate"));
  }, [role, signalR.candidateAddedToRoom, rtcConnection]);

  const [remoteDescriptionIsSet, setRemoteDescriptionIsSet] = useState(false);
  useEffect(() => {
    if (remoteDescriptionIsSet === false) {
      return;
    }
    console.log(`${candidatesToAddLater.current.length} candidates on queue`);
    if (candidatesToAddLater.current.length > 0) {
      const list = [...candidatesToAddLater.current];
      for (const item of list) {
        const c = new RTCIceCandidate({
          candidate: item.candidate!,
          sdpMid: item.sdpMid!,
          sdpMLineIndex: item.sdpMLineIndex!,
          usernameFragment: item.usernameFragment!,
        });
        rtcConnection.current!.addIceCandidate(c).then(() => console.log("added remote candidate. from queue"));
        candidatesToAddLater.current = candidatesToAddLater.current.filter((x) => x.candidate !== item.candidate);
      }
    }
  }, [remoteDescriptionIsSet]);

  return (
    <Box>
      <audio ref={localAudioRef} muted></audio>
      <audio ref={remoteAudioRef}></audio>
      <Stack>
        <Text>Room {roomId}</Text>
        <Text>You are {role}</Text>
      </Stack>
    </Box>
  );
};

export default RoomPage;

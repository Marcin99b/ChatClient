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
      setRoom(x.room!);
      openMedia().then(() => {
        console.log({ room, myId: user?.id });
        const roleName: "caller" | "receiver" = x.room!.callingUserId === user?.id ? "caller" : "receiver";
        setRole(roleName);
        if (roleName === "receiver") {
          rtc.getConnection(x.room!.id!, localStreamRef.current!).then((peerConnection) => {
            rtc.sendOfferAndCandidates(peerConnection, x.room!.id!).then(() => {
              peerConnection.addEventListener("track", (event) => {
                event.streams[0].getTracks().forEach((track) => remoteStreamRef.current!.addTrack(track));
              });
              rtcConnection.current = peerConnection;
              rtcApi.notifyCaller({ roomId: roomId }).then(() => console.log("Caller notified"));
            });
          });
        } else if (roleName === "caller") {
          if (signalR.roomConfiguredByReceiver === undefined) {
            return;
          }
          console.log("Gathering data from receiver as caller");
          const { rtcRoom } = signalR.roomConfiguredByReceiver;
          console.log({ rtcRoom });
          rtc.getConnection(x.room!.id!, localStreamRef.current!).then((peerConnection) => {
            rtc.sendIceCandidates(peerConnection, rtcRoom.id!);
            peerConnection.addEventListener("track", (event) => {
              event.streams[0].getTracks().forEach((track) => remoteStreamRef.current!.addTrack(track));
            });
            const offer = rtcRoom.offer;
            peerConnection.setRemoteDescription(new RTCSessionDescription(offer as any)).then(() => {
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
                      for (const candidate of candidates) {
                        const c = new RTCIceCandidate(candidate);
                        peerConnection.addIceCandidate(c);
                      }
                      rtcApi.notifyReceiver({ roomId: roomId }).then(() => console.log("Receiver notified"));
                    });
                });
              });
            });
          });
        }
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
    if (signalR.roomConfiguredByCaller === undefined || role !== "receiver") {
      return;
    }
    console.log("Gathering data from caller as receiver");
    const { rtcRoom } = signalR.roomConfiguredByCaller;
    console.log({ rtcRoom });

    const rtcSessionDescription = new RTCSessionDescription(rtcRoom.answer as any);
    rtcConnection.current!.setRemoteDescription(rtcSessionDescription);

    /*
    const candidates = rtcRoom.answerCandidates!.map((x: any) => x.data);
    for (const candidate of candidates) {
      const c = new RTCIceCandidate(candidate);
      rtcConnection.current!.addIceCandidate(c);
    }
    */
  }, [role, signalR.roomConfiguredByCaller]);

  const waitingCandidatesQueue = useRef<Candidate[]>([]);

  useEffect(() => {
    if (signalR.candidateAddedToRoom === undefined) {
      return;
    }
    const { candidate } = signalR.candidateAddedToRoom;
    if (rtcConnection.current?.remoteDescription === null || rtcConnection.current?.remoteDescription === undefined) {
      waitingCandidatesQueue.current.push(candidate);
      return;
    }
    if (waitingCandidatesQueue.current.length > 0) {
      for (const item of waitingCandidatesQueue.current) {
        const c = new RTCIceCandidate(item as any);
        rtcConnection.current!.addIceCandidate(c).then(() => console.log("added remote candidate from queue"));
        waitingCandidatesQueue.current = waitingCandidatesQueue.current.filter((x) => x.candidate !== item.candidate);
      }
    }
    const c = new RTCIceCandidate(candidate as any);
    rtcConnection.current!.addIceCandidate(c).then(() => console.log("added remote candidate"));
  }, [role, signalR.candidateAddedToRoom]);

  return (
    <Box>
      <audio ref={localAudioRef} muted></audio>
      <audio ref={remoteAudioRef}></audio>
      <Stack>
        <Text>Room {roomId}</Text>
        <Text>You are {role}</Text>
        <Text>You are {role}</Text>
      </Stack>
    </Box>
  );
};

export default RoomPage;

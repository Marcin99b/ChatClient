import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Room } from "../Models/ApiModels";
import { useRoomsApi } from "../Hooks/useApi";
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
        setRole(roleName);
        rtc.createRoom(x.room!.id!, localStreamRef.current!, remoteStreamRef.current!).then((peerConnection) => {
          console.log("create room finished");
          rtcConnection.current = peerConnection;
          signalR.clearRoomConfiguredByCaller();
        });
      });
    });
  }, [getRoom, localStreamRef, openMedia, remoteStreamRef, room, roomId, rtc, signalR, user?.id]);

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
        rtc.joinRoom(x.room!.id!, rtcRoom, localStreamRef.current!, remoteStreamRef.current!).then((peerConnection) => {
          console.log("join room finished");
          rtcConnection.current = peerConnection;
          signalR.clearRoomConfiguredByReceiver();
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
    signalR,
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

    const mappedAnswer = rtcRoom.answer as RTCSessionDescriptionInit;
    console.log({ mappedAnswer });
    const rtcSessionDescription = new RTCSessionDescription(mappedAnswer);
    rtcConnection.current!.setRemoteDescription(rtcSessionDescription);

    const candidates = rtcRoom.answerCandidates!;
    for (const item of candidates) {
      const c = new RTCIceCandidate({
        candidate: item.candidate!,
        sdpMid: item.sdpMid!,
        sdpMLineIndex: item.sdpMLineIndex!,
        usernameFragment: item.usernameFragment!,
      });
      rtcConnection.current!.addIceCandidate(c).then((x) => console.log("Remote candidate added"));
    }
  }, [signalR.roomConfiguredByCaller]);

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

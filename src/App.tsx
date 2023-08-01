import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import React, { useEffect, useRef, useState } from "react";
import { addAnswer, addCandidate, createOffer, getOffer } from "./Requests";

const configuration = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

export const App = () => {
  const localStream = useRef<MediaStream>();
  const remoteStream = useRef<MediaStream>();
  const [signalrConnection, setSignalrConnection] = useState<HubConnection>();
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const [roomId, setRoomId] = useState<string>();
  const [joined, setJoined] = useState<boolean>();
  const [connectionState, setConnectionState] = useState("");

  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection>();

  //create RTC
  useEffect(() => {
    openMedia();
    if (peerConnection !== undefined) {
      return;
    }
    setPeerConnection(new RTCPeerConnection(configuration));
  }, [peerConnection]);

  //RTC is created, let's configure RTC and create SignalR
  useEffect(() => {
    if (signalrConnection !== undefined || peerConnection === undefined) {
      return;
    }
    peerConnection.addEventListener("icegatheringstatechange", () => {
      console.log(`ICE gathering state changed: ${peerConnection.iceGatheringState}`);
    });

    peerConnection.addEventListener("connectionstatechange", () => {
      setConnectionState(peerConnection.connectionState);
      console.log(`Connection state change: ${peerConnection.connectionState}`);
    });

    peerConnection.addEventListener("signalingstatechange", () => {
      console.log(`Signaling state change: ${peerConnection.signalingState}`);
    });

    peerConnection.addEventListener("iceconnectionstatechange ", () => {
      console.log(`ICE connection state change: ${peerConnection.iceConnectionState}`);
    });

    const conn = new HubConnectionBuilder().withUrl("https://localhost:8080/chatHub").withAutomaticReconnect().build();
    setSignalrConnection(conn);
  }, [peerConnection, signalrConnection]);

  //SignalR is created, let's configure it
  useEffect(() => {
    if (signalrConnection === undefined || peerConnection === undefined) {
      return;
    }
    signalrConnection.start().then(() => {
      signalrConnection.on("AnswerAddedToRoom", async (roomId, answer) => {
        console.log("AnswerAddedToRoom");
        const rtcSessionDescription = new RTCSessionDescription(answer);
        await peerConnection.setRemoteDescription(rtcSessionDescription);
      });

      signalrConnection.on("CandidateAddedToRoom", async (roomId, candidate) => {
        console.log("CandidateAddedToRoom");
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      });
    });
  }, [signalrConnection, peerConnection]);

  const openMedia = async () => {
    if (isMediaOpen) {
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
    if (localAudioRef.current === null || remoteAudioRef.current === null) {
      return;
    }
    localStream.current = stream;
    remoteStream.current = new MediaStream();
    localAudioRef.current!.srcObject = localStream.current;
    remoteAudioRef.current!.srcObject = remoteStream.current;
    setIsMediaOpen(true);
  };

  const createRoom = async () => {
    openMedia();
    if (
      peerConnection === undefined ||
      signalrConnection === undefined ||
      remoteStream.current === undefined ||
      localStream.current === undefined
    ) {
      return;
    }

    localStream.current!.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream.current!);
    });

    const offer = await peerConnection!.createOffer();
    const roomWithOffer = {
      offer: {
        type: offer.type,
        sdp: offer.sdp,
      },
    };
    const tempRoomId = await createOffer(roomWithOffer.offer);
    setRoomId(tempRoomId);

    peerConnection.addEventListener("icecandidate", async (event) => {
      if (!event.candidate) {
        return;
      }
      await addCandidate(tempRoomId!, event.candidate.toJSON());
    });

    await peerConnection.setLocalDescription(offer);

    peerConnection.addEventListener("track", (event) => {
      event.streams[0].getTracks().forEach((track) => remoteStream.current!.addTrack(track));
    });
    console.log("a");
    signalrConnection.on("AnswerAddedToRoom", async (roomId, answer) => {
      console.log("AnswerAddedToRoom");
      const rtcSessionDescription = new RTCSessionDescription(answer);
      await peerConnection.setRemoteDescription(rtcSessionDescription);
    });

    signalrConnection.on("CandidateAddedToRoom", async (roomId, candidate) => {
      console.log("CandidateAddedToRoom");
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    });
    setJoined(true);
  };

  const joinRoom = async () => {
    openMedia();
    if (
      peerConnection === undefined ||
      signalrConnection === undefined ||
      remoteStream.current === undefined ||
      localStream.current === undefined ||
      roomId === undefined ||
      roomId.length === 0
    ) {
      return;
    }

    localStream.current!.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream.current!);
    });

    peerConnection.addEventListener("icecandidate", async (event) => {
      if (!event.candidate) {
        return;
      }
      await addCandidate(roomId!, event.candidate.toJSON());
    });

    peerConnection.addEventListener("track", (event) => {
      event.streams[0].getTracks().forEach((track) => remoteStream.current!.addTrack(track));
    });

    const offer = await getOffer(roomId);
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    const roomWithAnswer = {
      answer: {
        type: answer.type,
        sdp: answer.sdp,
      },
    };
    await addAnswer(roomId, roomWithAnswer.answer);
    signalrConnection.on("CandidateAddedToRoom", async (roomId, candidate) => {
      console.log("CandidateAddedToRoom");
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    });
    setJoined(true);
  };

  return (
    <div>
      <audio ref={localAudioRef} muted></audio>
      <audio ref={remoteAudioRef}></audio>
      <button onClick={createRoom}>Create room</button>
      <button onClick={joinRoom}>Join room</button>
      <span>ROOM ID: {joined && roomId !== undefined ? roomId : "NOT JOINED"}</span>
      <input type="text" placeholder="Room ID" onChange={(x) => setRoomId(x.target.value)}></input>
      <span>Connection state: {connectionState}</span>
    </div>
  );
};

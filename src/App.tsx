import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import React, { useEffect, useRef, useState } from "react";
import { createRoom, joinRoom } from "./WebRtc/RtcActions";

const baseAddress = "https://monkfish-app-lzibp.ondigitalocean.app";

export const App = () => {
  const signalrConnectionRef = useRef<HubConnection>();

  const isMediaOpenRef = useRef(false);
  const localStreamRef = useRef<MediaStream>();
  const remoteStreamRef = useRef<MediaStream>();
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  const openMedia = async () => {
    if (isMediaOpenRef.current) {
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
    if (localAudioRef.current === null || remoteAudioRef.current === null) {
      return;
    }
    localStreamRef.current = stream;
    remoteStreamRef.current = new MediaStream();
    localAudioRef.current!.srcObject = localStreamRef.current;
    remoteAudioRef.current!.srcObject = remoteStreamRef.current;
    isMediaOpenRef.current = true;
  };

  const connectToSignalR = async () => {
    if (signalrConnectionRef.current !== undefined) {
      return;
    }
    const conn = new HubConnectionBuilder()
      .withUrl(baseAddress! + "/chatHub")
      .withAutomaticReconnect()
      .build();
    await conn.start();
    signalrConnectionRef.current = conn;
  };

  useEffect(() => {}, []);

  const handleCreateRoom = async () => {
    if (baseAddress === undefined) {
      return;
    }
    if (!isMediaOpenRef.current) {
      await openMedia();
    }
    await connectToSignalR();
    await createRoom(
      baseAddress,
      signalrConnectionRef,
      localStreamRef,
      remoteStreamRef,
      setIceGatheringState,
      setConnectionState,
      setSignalingState,
      setIceConnection,
      setRoomId
    );
  };

  const handleJoinRoom = async () => {
    if (baseAddress === undefined || roomId === undefined || roomId.length < 5) {
      return;
    }
    if (!isMediaOpenRef.current) {
      await openMedia();
    }
    await connectToSignalR();
    await joinRoom(
      roomId,
      baseAddress,
      signalrConnectionRef,
      localStreamRef,
      remoteStreamRef,
      setIceGatheringState,
      setConnectionState,
      setSignalingState,
      setIceConnection
    );
  };

  const [iceGatheringState, setIceGatheringState] = useState<string>();
  const [connectionState, setConnectionState] = useState<string>();
  const [signalingState, setSignalingState] = useState<string>();
  const [iceConnection, setIceConnection] = useState<string>();
  const [roomId, setRoomId] = useState<string>();

  return (
    <div>
      <audio ref={localAudioRef} muted></audio>
      <audio ref={remoteAudioRef}></audio>
      <span>Base address: {baseAddress}</span>
      <br />
      <button onClick={handleCreateRoom}>Create room</button>
      <button onClick={handleJoinRoom}>Join room</button>
      <br />
      <br />
      Set room ID <input type="text" placeholder="Room ID" onChange={(x) => setRoomId(x.target.value)}></input>
      <br />
      <p>States</p>
      <ul>
        <li>roomId: {roomId}</li>
        <li>iceGatheringState: {iceGatheringState}</li>
        <li>connectionState: {connectionState}</li>
        <li>signalingState: {signalingState}</li>
        <li>iceConnection: {iceConnection}</li>
      </ul>
      <br />
    </div>
  );
};

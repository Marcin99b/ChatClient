import { useRef, useState } from "react";
import { Candidate, SdpData, WebRtcRoom } from "../Models/ApiModels";
import { useWebRtcApi } from "./useApi";

export const useRtc = () => {
  const rtcApi = useWebRtcApi();
  const roomIdRef = useRef<string>();
  const offerToSend = useRef<SdpData>();
  const answerToSend = useRef<SdpData>();
  const candidatesToSend = useRef<Candidate[]>([]);

  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>();

  const setupStateHandling = (peerConnection: RTCPeerConnection) => {
    peerConnection.addEventListener("icegatheringstatechange", async () => {
      console.log("STATE CHANGED");
      console.log("icegatheringstatechange: " + peerConnection.iceGatheringState);
      if (peerConnection.iceGatheringState === "complete") {
        if (offerToSend.current !== undefined) {
          await rtcApi.createRoom({
            roomId: roomIdRef.current!,
            offer: offerToSend.current!,
            candidates: candidatesToSend.current!,
          });
        } else if (answerToSend !== undefined) {
          await rtcApi.setAnswer({
            roomId: roomIdRef.current!,
            answer: answerToSend.current!,
            candidates: candidatesToSend.current!,
          });
        } else {
          console.error("State is completed but data set incorrectly");
        }
      }
    });

    peerConnection.addEventListener("connectionstatechange", () => {
      console.log("STATE CHANGED");
      console.log("connectionstatechange: " + peerConnection.connectionState);
      setConnectionState(peerConnection.connectionState);
    });

    peerConnection.addEventListener("signalingstatechange", () => {
      console.log("STATE CHANGED");
      console.log("signalingstatechange: " + peerConnection.signalingState);
    });

    peerConnection.addEventListener("iceconnectionstatechange ", () => {
      console.log("STATE CHANGED");
      console.log("iceconnectionstatechange: " + peerConnection.iceConnectionState);
    });
  };

  const generateIceCandidates = (peerConnection: RTCPeerConnection) => {
    peerConnection.addEventListener("icecandidate", async (event) => {
      if (!event.candidate) {
        return;
      }
      const c = event.candidate.toJSON() as Candidate;
      console.log("Candidate added to list");
      candidatesToSend.current.push(c);
    });
  };

  const getConnection = async (roomId: string, localStream: MediaStream): Promise<RTCPeerConnection> => {
    const iceServers = (await rtcApi.getIceServers({ roomId: roomId })).iceServers! as RTCIceServer[];
    const configuration: RTCConfiguration = { iceServers: iceServers };
    const peerConnection = new RTCPeerConnection(configuration);

    setupStateHandling(peerConnection);

    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });
    return peerConnection;
  };

  const generateOfferAndCandidates = async (peerConnection: RTCPeerConnection, roomId: string): Promise<void> => {
    generateIceCandidates(peerConnection);
    const offer = await peerConnection.createOffer();
    offerToSend.current = {
      type: offer.type,
      sdp: offer.sdp,
    };
    await peerConnection.setLocalDescription(offer);
  };

  const createRoom = async (
    roomId: string,
    localStream: MediaStream,
    remoteStream: MediaStream
  ): Promise<RTCPeerConnection> => {
    roomIdRef.current = roomId;
    const peerConnection = await getConnection(roomId, localStream);
    await generateOfferAndCandidates(peerConnection, roomId);
    peerConnection.addEventListener("track", (event) => {
      event.streams[0].getTracks().forEach((track) => remoteStream.addTrack(track));
    });
    return peerConnection;
  };

  const joinRoom = async (
    roomId: string,
    rtcRoom: WebRtcRoom,
    localStream: MediaStream,
    remoteStream: MediaStream
  ): Promise<RTCPeerConnection> => {
    roomIdRef.current = roomId;
    const peerConnection = await getConnection(roomId, localStream);
    generateIceCandidates(peerConnection);
    peerConnection.addEventListener("track", (event) => {
      event.streams[0].getTracks().forEach((track) => remoteStream.addTrack(track));
    });

    const mappedOffer = rtcRoom.offer as RTCSessionDescriptionInit;
    console.log({ mappedOffer });
    await peerConnection.setRemoteDescription(new RTCSessionDescription(mappedOffer));

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    answerToSend.current = {
      type: answer.type,
      sdp: answer.sdp,
    };
    for (const item of rtcRoom.offerCandidates!) {
      const c = new RTCIceCandidate({
        candidate: item.candidate!,
        sdpMid: item.sdpMid!,
        sdpMLineIndex: item.sdpMLineIndex!,
        usernameFragment: item.usernameFragment!,
      });
      peerConnection.addIceCandidate(c).then(() => console.log("Remote candidate added"));
    }
    return peerConnection;
  };
  return {
    createRoom,
    joinRoom,
    connectionState,
  };
};

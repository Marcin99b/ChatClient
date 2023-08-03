import { HubConnection } from "@microsoft/signalr";
import { createOffer, getOffer, addAnswer } from "../Requests";
import {
  setupStateHandling,
  setupAddIceCandidate,
  setupAnswerAddedToRoom,
  setupCandidateAddedToRoom,
} from "./RtcSetup";

export const createRoom = async (
  configuration: RTCConfiguration,
  baseAddress: string,
  signalrConnectionRef: React.MutableRefObject<HubConnection | undefined>,
  localStreamRef: React.MutableRefObject<MediaStream | undefined>,
  remoteStreamRef: React.MutableRefObject<MediaStream | undefined>,
  displayIceGatheringState: (state: string) => void,
  displayConnectionState: (state: string) => void,
  displaySignalingState: (state: string) => void,
  displayIceConnection: (state: string) => void,
  displayRoomId: (id: string) => void
) => {
  console.log("Creating connection with config", { configuration });
  const peerConnection = new RTCPeerConnection(configuration);

  setupStateHandling(
    peerConnection,
    displayIceGatheringState,
    displayConnectionState,
    displaySignalingState,
    displayIceConnection
  );

  localStreamRef.current!.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStreamRef.current!);
  });

  const offer = await peerConnection!.createOffer();
  const roomId = await createOffer(baseAddress!, {
    type: offer.type,
    sdp: offer.sdp,
  });

  setupAddIceCandidate(baseAddress, roomId, peerConnection);

  await peerConnection.setLocalDescription(offer);

  peerConnection.addEventListener("track", (event) => {
    event.streams[0].getTracks().forEach((track) => remoteStreamRef.current!.addTrack(track));
  });

  setupAnswerAddedToRoom(peerConnection, signalrConnectionRef);
  setupCandidateAddedToRoom(peerConnection, signalrConnectionRef);

  displayRoomId(roomId);
};

export const joinRoom = async (
  configuration: RTCConfiguration,
  roomId: string,
  baseAddress: string,
  signalrConnectionRef: React.MutableRefObject<HubConnection | undefined>,
  localStreamRef: React.MutableRefObject<MediaStream | undefined>,
  remoteStreamRef: React.MutableRefObject<MediaStream | undefined>,
  displayIceGatheringState: (state: string) => void,
  displayConnectionState: (state: string) => void,
  displaySignalingState: (state: string) => void,
  displayIceConnection: (state: string) => void
) => {
  console.log("Creating connection with config", { configuration });
  const peerConnection = new RTCPeerConnection(configuration);

  setupStateHandling(
    peerConnection,
    displayIceGatheringState,
    displayConnectionState,
    displaySignalingState,
    displayIceConnection
  );

  localStreamRef.current!.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStreamRef.current!);
  });

  setupAddIceCandidate(baseAddress, roomId, peerConnection);

  peerConnection.addEventListener("track", (event) => {
    event.streams[0].getTracks().forEach((track) => remoteStreamRef.current!.addTrack(track));
  });

  const offer = await getOffer(baseAddress!, roomId);
  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  await addAnswer(baseAddress!, roomId, {
    type: answer.type,
    sdp: answer.sdp,
  });

  setupCandidateAddedToRoom(peerConnection, signalrConnectionRef);
};

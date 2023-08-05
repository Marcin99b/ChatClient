import { HubConnection } from "@microsoft/signalr";
import {
  setupStateHandling,
  setupAddIceCandidate,
  setupAnswerAddedToRoom,
  setupCandidateAddedToRoom,
} from "./RtcSetup";

export const createRoom = async (
  configuration: RTCConfiguration,
  baseAddress: string,
  signalrConnection: HubConnection,
  localStreamRef: React.MutableRefObject<MediaStream | undefined>,
  remoteStreamRef: React.MutableRefObject<MediaStream | undefined>,
  displayConnectionState: (state: RTCPeerConnectionState) => void
) => {
  const peerConnection = createConnection(configuration, displayConnectionState);

  localStreamRef.current!.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStreamRef.current!);
  });

  const offer = await peerConnection!.createOffer();
  /*
  const roomId = await createOffer(baseAddress!, {
    type: offer.type,
    sdp: offer.sdp,
  });

  setupAddIceCandidate(baseAddress, roomId, peerConnection, "offer");

  await peerConnection.setLocalDescription(offer);

  peerConnection.addEventListener("track", (event) => {
    event.streams[0].getTracks().forEach((track) => remoteStreamRef.current!.addTrack(track));
  });

  setupAnswerAddedToRoom(peerConnection, signalrConnection);
  setupCandidateAddedToRoom(peerConnection, signalrConnection);
  */
};

export const joinRoom = async (
  configuration: RTCConfiguration,
  roomId: string,
  baseAddress: string,
  signalrConnection: HubConnection,
  localStreamRef: React.MutableRefObject<MediaStream | undefined>,
  remoteStreamRef: React.MutableRefObject<MediaStream | undefined>,
  displayConnectionState: (state: RTCPeerConnectionState) => void
) => {
  const peerConnection = createConnection(configuration, displayConnectionState);
  /*
  localStreamRef.current!.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStreamRef.current!);
  });

  setupAddIceCandidate(baseAddress, roomId, peerConnection, "answer");

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

  const room = await getRoomById(baseAddress, roomId);
  const candidates = room.offerCandidates.map((x: any) => x.data);
  for (const candidate of candidates) {
    const c = new RTCIceCandidate(candidate);
    peerConnection.addIceCandidate(c);
  }

  setupCandidateAddedToRoom(peerConnection, signalrConnection);
  */
};

const createConnection = (
  configuration: RTCConfiguration,
  displayConnectionState: (state: RTCPeerConnectionState) => void
): RTCPeerConnection => {
  const peerConnection = new RTCPeerConnection(configuration);

  setupStateHandling(peerConnection, displayConnectionState);

  return peerConnection;
};

import { HubConnection } from "@microsoft/signalr";
import { addCandidate } from "../Requests";

export const setupStateHandling = (
  peerConnection: RTCPeerConnection,
  displayIceGatheringState: (state: string) => void,
  displayConnectionState: (state: string) => void,
  displaySignalingState: (state: string) => void,
  displayIceConnection: (state: string) => void
) => {
  peerConnection.addEventListener("icegatheringstatechange", () => {
    console.log(peerConnection.iceGatheringState);
    displayIceGatheringState(peerConnection.iceGatheringState);
  });

  peerConnection.addEventListener("connectionstatechange", () => {
    console.log(peerConnection.connectionState);
    displayConnectionState(peerConnection.connectionState);
  });

  peerConnection.addEventListener("signalingstatechange", () => {
    console.log(peerConnection.signalingState);
    displaySignalingState(peerConnection.signalingState);
  });

  peerConnection.addEventListener("iceconnectionstatechange ", () => {
    console.log(peerConnection.iceConnectionState);
    displayIceConnection(peerConnection.iceConnectionState);
  });
};

export const setupAddIceCandidate = (baseAddress: string, roomId: string, peerConnection: RTCPeerConnection) => {
  peerConnection.addEventListener("icecandidate", async (event) => {
    if (!event.candidate) {
      return;
    }
    await addCandidate(baseAddress, roomId, event.candidate.toJSON());
  });
};

export const setupAnswerAddedToRoom = (
  peerConnection: RTCPeerConnection,
  signalrConnectionRef: React.MutableRefObject<HubConnection | undefined>
) => {
  signalrConnectionRef.current!.on("AnswerAddedToRoom", async (roomId, answer) => {
    console.log("AnswerAddedToRoom");
    const rtcSessionDescription = new RTCSessionDescription(answer);
    await peerConnection.setRemoteDescription(rtcSessionDescription);
  });
};

export const setupCandidateAddedToRoom = (
  peerConnection: RTCPeerConnection,
  signalrConnectionRef: React.MutableRefObject<HubConnection | undefined>
) => {
  signalrConnectionRef.current!.on("CandidateAddedToRoom", async (roomId, candidate) => {
    console.log("CandidateAddedToRoom");
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  });
};

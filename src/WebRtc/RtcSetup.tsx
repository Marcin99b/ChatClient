import { HubConnection } from "@microsoft/signalr";
import { addOfferCandidate, addAnswerCandidate } from "../Requests";

export const setupStateHandling = (
  peerConnection: RTCPeerConnection,
  displayConnectionState: (state: RTCPeerConnectionState) => void
) => {
  peerConnection.addEventListener("icegatheringstatechange", () => {
    console.log("icegatheringstatechange" + peerConnection.iceGatheringState);
  });

  peerConnection.addEventListener("connectionstatechange", () => {
    console.log("connectionstatechange" + peerConnection.connectionState);
    displayConnectionState(peerConnection.connectionState);
  });

  peerConnection.addEventListener("signalingstatechange", () => {
    console.log("signalingstatechange" + peerConnection.signalingState);
  });

  peerConnection.addEventListener("iceconnectionstatechange ", () => {
    console.log("iceconnectionstatechange" + peerConnection.iceConnectionState);
  });
};

export const setupAddIceCandidate = (
  baseAddress: string,
  roomId: string,
  peerConnection: RTCPeerConnection,
  type: "offer" | "answer"
) => {
  peerConnection.addEventListener("icecandidate", async (event) => {
    if (!event.candidate) {
      return;
    }
    console.log("Sending my candidate to server");
    console.log({ roomId, candidate: event.candidate.toJSON(), type });
    if (type === "offer") await addOfferCandidate(baseAddress, roomId, event.candidate.toJSON());
    else await addAnswerCandidate(baseAddress, roomId, event.candidate.toJSON());
  });
};

export const setupAnswerAddedToRoom = (peerConnection: RTCPeerConnection, signalrConnection: HubConnection) => {
  signalrConnection.on("AnswerAddedToRoom", async (roomId, answer) => {
    console.log("Answer received. Setting remote description");
    const rtcSessionDescription = new RTCSessionDescription(answer);
    console.log({ rtcSessionDescription });
    await peerConnection.setRemoteDescription(rtcSessionDescription);
  });
};

export const setupCandidateAddedToRoom = (peerConnection: RTCPeerConnection, signalrConnection: HubConnection) => {
  signalrConnection.on("CandidateAddedToRoom", async (roomId, candidate) => {
    console.log("Candidate received. Adding remote candidate");
    const c = new RTCIceCandidate(candidate);
    console.log({ candidate: c });
    await peerConnection.addIceCandidate(c);
  });
};

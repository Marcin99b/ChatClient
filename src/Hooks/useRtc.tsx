import { Candidate } from "../Models/ApiModels";
import { setupStateHandling } from "../WebRtc/RtcSetup";
import { useWebRtcApi } from "./useApi";

export const useRtc = () => {
  const rtcApi = useWebRtcApi();

  const sendIceCandidates = (peerConnection: RTCPeerConnection, rtcRoomId: string) => {
    peerConnection.addEventListener("icecandidate", async (event) => {
      if (!event.candidate) {
        return;
      }
      const c = event.candidate.toJSON() as Candidate;
      console.log("Sending candidate", { candidate: event.candidate.toJSON(), mappedTo: c });
      await rtcApi.addCandidate({ candidate: c, webRtcRoomId: rtcRoomId });
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

  const sendOfferAndCandidates = async (peerConnection: RTCPeerConnection, roomId: string): Promise<void> => {
    const offer = await peerConnection.createOffer();
    const webRtcRoom = await rtcApi.createRoom({
      roomId: roomId,
      offer: {
        type: offer.type,
        sdp: offer.sdp,
      },
    });
    sendIceCandidates(peerConnection, webRtcRoom.rtcRoom?.id!);
    await peerConnection.setLocalDescription(offer);
  };
  return { getConnection, sendOfferAndCandidates, sendIceCandidates };
};

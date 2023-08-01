export const createOffer = async (offer: { type: RTCSdpType; sdp: string | undefined }): Promise<string> => {
  const response = await fetch("https://localhost:8080/Rooms/CreateOffer", {
    method: "POST",
    body: JSON.stringify({ offer: offer }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const json = await response.json();
  return json.roomId;
};

export const addCandidate = async (roomId: string, candidate: RTCIceCandidateInit): Promise<void> => {
  await fetch(`https://localhost:8080/Rooms/${roomId}/AddCandidate`, {
    method: "POST",
    body: JSON.stringify({ candidate: candidate }),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const getOffer = async (roomId: string): Promise<{ type: RTCSdpType; sdp: string | undefined }> => {
  const response = await fetch(`https://localhost:8080/Rooms/${roomId}/GetOffer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const json = await response.json();
  return json.offer;
};

export const addAnswer = async (
  roomId: string,
  answer: { type: RTCSdpType; sdp: string | undefined }
): Promise<void> => {
  await fetch(`https://localhost:8080/Rooms/${roomId}/AddAnswer`, {
    method: "POST",
    body: JSON.stringify({ answer: answer }),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

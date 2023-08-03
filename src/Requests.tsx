export const createOffer = async (
  baseAddress: string,
  offer: { type: RTCSdpType; sdp: string | undefined }
): Promise<string> => {
  const response = await fetch(baseAddress + "/Rooms/CreateOffer", {
    method: "POST",
    body: JSON.stringify({ offer: offer }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const json = await response.json();
  return json.roomId;
};

export const addOfferCandidate = async (
  baseAddress: string,
  roomId: string,
  candidate: RTCIceCandidateInit
): Promise<void> => {
  await fetch(baseAddress + `/Rooms/${roomId}/AddOfferCandidate`, {
    method: "POST",
    body: JSON.stringify({ candidate: candidate }),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const addAnswerCandidate = async (
  baseAddress: string,
  roomId: string,
  candidate: RTCIceCandidateInit
): Promise<void> => {
  await fetch(baseAddress + `/Rooms/${roomId}/AddAnswerCandidate`, {
    method: "POST",
    body: JSON.stringify({ candidate: candidate }),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const getOffer = async (
  baseAddress: string,
  roomId: string
): Promise<{ type: RTCSdpType; sdp: string | undefined }> => {
  const response = await fetch(baseAddress + `/Rooms/${roomId}/GetOffer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const json = await response.json();
  return json.offer;
};

export const addAnswer = async (
  baseAddress: string,
  roomId: string,
  answer: { type: RTCSdpType; sdp: string | undefined }
): Promise<void> => {
  await fetch(baseAddress + `/Rooms/${roomId}/AddAnswer`, {
    method: "POST",
    body: JSON.stringify({ answer: answer }),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const getRoomIds = async (baseAddress: string): Promise<string[]> => {
  const response = await fetch(baseAddress + `/Rooms/GetRooms`, {
    method: "POST",
  });
  const json = await response.json();
  return json.ids;
};

export const deleteRoom = async (baseAddress: string, roomId: string) => {
  await fetch(baseAddress + `/Rooms/${roomId}/Delete`, {
    method: "POST",
  });
};

export const getIceServers = async (baseAddress: string) => {
  const response = await fetch(baseAddress + `/WebRtc/GetIceServers`, {
    method: "POST",
  });
  const json = await response.json();
  return json.iceServers;
};

export const getRoomById = async (baseAddress: string, roomId: string) => {
  const response = await fetch(baseAddress + `/Rooms/GetRoom/${roomId}`, {
    method: "POST",
  });
  const json = await response.json();
  return json;
};

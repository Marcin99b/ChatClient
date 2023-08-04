import { paths, components } from "../Models/ApiModels";

type Path = keyof paths;
type PathMethod<T extends Path> = keyof paths[T];

const baseAddress = "https://monkfish-app-lzibp.ondigitalocean.app";

const apiCall = async <P extends Path, M extends PathMethod<P>>(path: P, method: M, request?: any): Promise<any> => {
  const url = path;

  const response = await fetch(baseAddress + url, {
    method: method as string,
    body: request === undefined ? undefined : JSON.stringify(request),
    headers:
      request === undefined
        ? undefined
        : {
            "Content-Type": "application/json",
          },
  });
  const json = await response.json();
  return json;
};

export const useApi = () => {
  const roomsCreateOffer = async (request: components["schemas"]["CreateOfferRequest"]) => {
    const resultAny = await apiCall("/Rooms/CreateOffer", "post");
    const mapped = resultAny as components["schemas"]["CreateOfferResponse"];
    return mapped;
  };

  const roomsAddOfferCandidate = async (request: components["schemas"]["AddCandidateRequest"]) => {
    await apiCall("/Rooms/{id}/AddOfferCandidate", "post", request);
  };

  const roomsAddAnswerCandidate = async (request: components["schemas"]["AddCandidateRequest"]) => {
    await apiCall("/Rooms/{id}/AddAnswerCandidate", "post");
  };

  const roomsAddAnswer = async (request: components["schemas"]["AddAnswerRequest"]) => {
    await apiCall("/Rooms/{id}/AddAnswer", "post");
  };

  return { roomsCreateOffer };
};

import {
  AcceptCallRequest,
  AcceptCallResponse,
  Api,
  ProposeCallRequest,
  ProposeCallResponse,
  HttpResponse,
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  GetUsersListRequest,
  GetUsersListResponse,
  GetUserRequest,
  GetUserResponse,
  GetIceServersRequest,
  GetIceServersResponse,
  CreateRoomRequest,
  CreateRoomResponse,
  AddCandidateRequest,
  AddCandidateResponse,
  SetAnswerRequest,
  SetAnswerResponse,
} from "../Models/ApiModels";

const baseAddress =
  window.location.hostname === "localhost" ? "https://localhost:7072" : "https://monkfish-app-lzibp.ondigitalocean.app";
const api = new Api({ baseUrl: baseAddress });

const unpack = async <TOut,>(response: Promise<HttpResponse<TOut, any>>) => {
  const r = await response;
  //todo error handling
  return r.data;
};

export const useRoomsApi = () => {
  const proposeCall = (request: ProposeCallRequest): Promise<ProposeCallResponse> => {
    return unpack(api.public.apiV10RoomsProposeCallCreate(request));
  };

  const acceptCall = (request: AcceptCallRequest): Promise<AcceptCallResponse> => {
    return unpack(api.public.apiV10RoomsAcceptCallCreate(request));
  };

  return { proposeCall, acceptCall };
};

export const useUsersApi = () => {
  const register = (request: RegisterRequest): Promise<RegisterResponse> => {
    return unpack(api.public.apiV10UsersRegisterCreate(request));
  };

  const login = (request: LoginRequest): Promise<LoginResponse> => {
    return unpack(api.public.apiV10UsersLoginCreate(request));
  };

  const getUsersList = (request: GetUsersListRequest): Promise<GetUsersListResponse> => {
    return unpack(api.public.apiV10UsersGetUsersListCreate(request));
  };

  const getUser = (request: GetUserRequest): Promise<GetUserResponse> => {
    return unpack(api.public.apiV10UsersGetUserCreate(request));
  };

  return { register, login, getUsersList, getUser };
};

export const useWebRtcApi = () => {
  const getIceServers = (request: GetIceServersRequest): Promise<GetIceServersResponse> => {
    return unpack(api.public.apiV10WebRtcGetIceServersCreate(request));
  };

  const createRoom = (request: CreateRoomRequest): Promise<CreateRoomResponse> => {
    return unpack(api.public.apiV10WebRtcCreateRoomCreate(request));
  };

  const addCandidate = (request: AddCandidateRequest): Promise<AddCandidateResponse> => {
    return unpack(api.public.apiV10WebRtcAddCandidateCreate(request));
  };

  const setAnswer = (request: SetAnswerRequest): Promise<SetAnswerResponse> => {
    return unpack(api.public.apiV10WebRtcSetAnswerCreate(request));
  };

  return { getIceServers, createRoom, addCandidate, setAnswer };
};

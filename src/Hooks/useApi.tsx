import { useNavigate } from "react-router-dom";
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
  GetCurrentUserRequest,
  GetCurrentUserResponse,
  GetRoomRequest,
  GetRoomResponse,
  NotifyCallerAboutRoomConfiguredRequest,
  NotifyCallerAboutRoomConfiguredResponse,
  NotifyReceiverAboutRoomConfiguredRequest,
  NotifyReceiverAboutRoomConfiguredResponse,
} from "../Models/ApiModels";

export const baseAddress =
  window.location.hostname === "localhost" ? "https://localhost:7072" : "https://monkfish-app-lzibp.ondigitalocean.app";
const api = new Api({ baseUrl: baseAddress });

const useErrorHandler = () => {
  const navigate = useNavigate();
  const onError = (code: number) => {
    console.log("Error: " + code);
    if (code === 401) {
      navigate("/login");
    } else {
      navigate("/");
    }
  };
  return { onError };
};

const unpack = async <TOut,>(
  response: Promise<HttpResponse<TOut, any>>,
  errorHandler?: {
    onError: (code: number) => void;
  }
) => {
  try {
    const r = await response;
    if (r.ok === false && errorHandler !== undefined) {
      errorHandler.onError(r.status);
    }
    return r.data;
  } catch (error) {
    errorHandler?.onError(500);
    return {};
  }
};

export const useRoomsApi = () => {
  const errorHandler = useErrorHandler();
  const proposeCall = (request: ProposeCallRequest): Promise<ProposeCallResponse> => {
    return unpack(api.public.apiV10RoomsProposeCallCreate(request), errorHandler);
  };

  const acceptCall = (request: AcceptCallRequest): Promise<AcceptCallResponse> => {
    return unpack(api.public.apiV10RoomsAcceptCallCreate(request), errorHandler);
  };

  const getRoom = (request: GetRoomRequest): Promise<GetRoomResponse> => {
    return unpack(api.public.apiV10RoomsGetRoomCreate(request), errorHandler);
  };

  return { proposeCall, acceptCall, getRoom };
};

export const useUsersApi = () => {
  const errorHandler = useErrorHandler();
  const register = (request: RegisterRequest): Promise<RegisterResponse> => {
    return unpack(api.public.apiV10UsersRegisterCreate(request), errorHandler);
  };

  const login = (request: LoginRequest): Promise<LoginResponse> => {
    return unpack(api.public.apiV10UsersLoginCreate(request), errorHandler);
  };

  const getUsersList = (request: GetUsersListRequest): Promise<GetUsersListResponse> => {
    return unpack(api.public.apiV10UsersGetUsersListCreate(request), errorHandler);
  };

  const getUser = (request: GetUserRequest): Promise<GetUserResponse> => {
    return unpack(api.public.apiV10UsersGetUserCreate(request), errorHandler);
  };

  const getCurrentUser = (request: GetCurrentUserRequest): Promise<GetCurrentUserResponse> => {
    return unpack(api.public.apiV10UsersGetCurrentUserCreate(request));
  };

  return { register, login, getUsersList, getUser, getCurrentUser };
};

export const useWebRtcApi = () => {
  const errorHandler = useErrorHandler();
  const getIceServers = (request: GetIceServersRequest): Promise<GetIceServersResponse> => {
    return unpack(api.public.apiV10WebRtcGetIceServersCreate(request), errorHandler);
  };

  const createRoom = (request: CreateRoomRequest): Promise<CreateRoomResponse> => {
    return unpack(api.public.apiV10WebRtcCreateRoomCreate(request), errorHandler);
  };

  const addCandidate = (request: AddCandidateRequest): Promise<AddCandidateResponse> => {
    return unpack(api.public.apiV10WebRtcAddCandidateCreate(request), errorHandler);
  };

  const setAnswer = (request: SetAnswerRequest): Promise<SetAnswerResponse> => {
    return unpack(api.public.apiV10WebRtcSetAnswerCreate(request), errorHandler);
  };

  const notifyCaller = (
    request: NotifyCallerAboutRoomConfiguredRequest
  ): Promise<NotifyCallerAboutRoomConfiguredResponse> => {
    return unpack(api.public.apiV10WebRtcNotifyCallerAboutRoomConfiguredCreate(request), errorHandler);
  };

  const notifyReceiver = (
    request: NotifyReceiverAboutRoomConfiguredRequest
  ): Promise<NotifyReceiverAboutRoomConfiguredResponse> => {
    return unpack(api.public.apiV10WebRtcNotifyReceiverAboutRoomConfiguredCreate(request), errorHandler);
  };

  return { getIceServers, createRoom, addCandidate, setAnswer, notifyCaller, notifyReceiver };
};

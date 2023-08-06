/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface AcceptCallRequest {
  /** @format uuid */
  callingUserId?: string;
}

export interface AcceptCallResponse {
  /** @format uuid */
  createdRoomId?: string;
}

export interface AddCandidateRequest {
  /** @format uuid */
  webRtcRoomId?: string;
  candidate?: Candidate;
}

export type AddCandidateResponse = object;

export interface Candidate {
  candidate?: string | null;
  /** @format int32 */
  sdpMLineIndex?: number;
  sdpMid?: string | null;
  usernameFragment?: string | null;
}

export interface CreateRoomRequest {
  /** @format uuid */
  roomId?: string;
  offer?: SdpData;
}

export interface CreateRoomResponse {
  rtcRoom?: WebRtcRoom;
}

export type GetCurrentUserRequest = object;

export interface GetCurrentUserResponse {
  user?: User;
}

export interface GetIceServersRequest {
  /** @format uuid */
  roomId?: string;
}

export interface GetIceServersResponse {
  iceServers?: IceServers[] | null;
}

export interface GetRoomRequest {
  /** @format uuid */
  roomId?: string;
}

export interface GetRoomResponse {
  room?: Room;
}

export interface GetUserRequest {
  /** @format uuid */
  userId?: string;
}

export interface GetUserResponse {
  user?: User;
}

export type GetUsersListRequest = object;

export interface GetUsersListResponse {
  users?: UserRoomDetails[] | null;
}

export interface IceServers {
  url?: string | null;
  urls?: string | null;
  username?: string | null;
  credential?: string | null;
}

export interface LoginRequest {
  username?: string | null;
}

export type LoginResponse = object;

export interface NotifyCallerAboutRoomConfiguredRequest {
  /** @format uuid */
  roomId?: string;
}

export type NotifyCallerAboutRoomConfiguredResponse = object;

export interface NotifyReceiverAboutRoomConfiguredRequest {
  /** @format uuid */
  roomId?: string;
}

export type NotifyReceiverAboutRoomConfiguredResponse = object;

export interface ProposeCallRequest {
  /** @format uuid */
  receivingUserId?: string;
}

export type ProposeCallResponse = object;

export interface RegisterRequest {
  username?: string | null;
}

export type RegisterResponse = object;

export interface Room {
  /** @format uuid */
  id?: string;
  /** @format date-time */
  createdAt?: string;
  /** @format uuid */
  callingUserId?: string;
  /** @format uuid */
  receivingUserId?: string;
}

export interface SdpData {
  sdp?: string | null;
  type?: string | null;
}

export interface SetAnswerRequest {
  /** @format uuid */
  webRtcRoomId?: string;
  answer?: SdpData;
}

export type SetAnswerResponse = object;

export interface User {
  /** @format uuid */
  id?: string;
  /** @format date-time */
  createdAt?: string;
  username?: string | null;
}

export interface UserRoomDetails {
  user?: User;
  isActive?: boolean;
}

export interface WebRtcRoom {
  /** @format uuid */
  id?: string;
  /** @format date-time */
  createdAt?: string;
  /** @format uuid */
  roomId?: string;
  offer?: SdpData;
  offerCandidates?: Candidate[] | null;
  answerCandidates?: Candidate[] | null;
  answer?: SdpData;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (securityData: SecurityDataType | null) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "include",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter((key) => "undefined" !== typeof query[key]);
    return keys
      .map((key) => (Array.isArray(query[key]) ? this.addArrayQueryParam(query, key) : this.addQueryParam(query, key)))
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string") ? JSON.stringify(input) : input,
    [ContentType.Text]: (input: any) => (input !== null && typeof input !== "string" ? JSON.stringify(input) : input),
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
            ? JSON.stringify(property)
            : `${property}`,
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(`${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`, {
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
      },
      signal: (cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal) || null,
      body: typeof body === "undefined" || body === null ? null : payloadFormatter(body),
    }).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title ChatServer.WebApi
 * @version 1.0
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  public = {
    /**
     * No description
     *
     * @tags Rooms
     * @name ApiV10RoomsProposeCallCreate
     * @request POST:/public/api/v1.0/Rooms/ProposeCall
     */
    apiV10RoomsProposeCallCreate: (data: ProposeCallRequest, params: RequestParams = {}) =>
      this.request<ProposeCallResponse, any>({
        path: `/public/api/v1.0/Rooms/ProposeCall`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Rooms
     * @name ApiV10RoomsAcceptCallCreate
     * @request POST:/public/api/v1.0/Rooms/AcceptCall
     */
    apiV10RoomsAcceptCallCreate: (data: AcceptCallRequest, params: RequestParams = {}) =>
      this.request<AcceptCallResponse, any>({
        path: `/public/api/v1.0/Rooms/AcceptCall`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Rooms
     * @name ApiV10RoomsGetRoomCreate
     * @request POST:/public/api/v1.0/Rooms/GetRoom
     */
    apiV10RoomsGetRoomCreate: (data: GetRoomRequest, params: RequestParams = {}) =>
      this.request<GetRoomResponse, any>({
        path: `/public/api/v1.0/Rooms/GetRoom`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name ApiV10UsersRegisterCreate
     * @request POST:/public/api/v1.0/Users/Register
     */
    apiV10UsersRegisterCreate: (data: RegisterRequest, params: RequestParams = {}) =>
      this.request<RegisterResponse, any>({
        path: `/public/api/v1.0/Users/Register`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name ApiV10UsersLoginCreate
     * @request POST:/public/api/v1.0/Users/Login
     */
    apiV10UsersLoginCreate: (data: LoginRequest, params: RequestParams = {}) =>
      this.request<LoginResponse, any>({
        path: `/public/api/v1.0/Users/Login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name ApiV10UsersGetUsersListCreate
     * @request POST:/public/api/v1.0/Users/GetUsersList
     */
    apiV10UsersGetUsersListCreate: (data: GetUsersListRequest, params: RequestParams = {}) =>
      this.request<GetUsersListResponse, any>({
        path: `/public/api/v1.0/Users/GetUsersList`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name ApiV10UsersGetUserCreate
     * @request POST:/public/api/v1.0/Users/GetUser
     */
    apiV10UsersGetUserCreate: (data: GetUserRequest, params: RequestParams = {}) =>
      this.request<GetUserResponse, any>({
        path: `/public/api/v1.0/Users/GetUser`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name ApiV10UsersGetCurrentUserCreate
     * @request POST:/public/api/v1.0/Users/GetCurrentUser
     */
    apiV10UsersGetCurrentUserCreate: (data: GetCurrentUserRequest, params: RequestParams = {}) =>
      this.request<GetCurrentUserResponse, any>({
        path: `/public/api/v1.0/Users/GetCurrentUser`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags WebRtc
     * @name ApiV10WebRtcGetIceServersCreate
     * @request POST:/public/api/v1.0/WebRtc/GetIceServers
     */
    apiV10WebRtcGetIceServersCreate: (data: GetIceServersRequest, params: RequestParams = {}) =>
      this.request<GetIceServersResponse, any>({
        path: `/public/api/v1.0/WebRtc/GetIceServers`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags WebRtc
     * @name ApiV10WebRtcCreateRoomCreate
     * @request POST:/public/api/v1.0/WebRtc/CreateRoom
     */
    apiV10WebRtcCreateRoomCreate: (data: CreateRoomRequest, params: RequestParams = {}) =>
      this.request<CreateRoomResponse, any>({
        path: `/public/api/v1.0/WebRtc/CreateRoom`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags WebRtc
     * @name ApiV10WebRtcNotifyCallerAboutRoomConfiguredCreate
     * @request POST:/public/api/v1.0/WebRtc/NotifyCallerAboutRoomConfigured
     */
    apiV10WebRtcNotifyCallerAboutRoomConfiguredCreate: (
      data: NotifyCallerAboutRoomConfiguredRequest,
      params: RequestParams = {},
    ) =>
      this.request<NotifyCallerAboutRoomConfiguredResponse, any>({
        path: `/public/api/v1.0/WebRtc/NotifyCallerAboutRoomConfigured`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags WebRtc
     * @name ApiV10WebRtcNotifyReceiverAboutRoomConfiguredCreate
     * @request POST:/public/api/v1.0/WebRtc/NotifyReceiverAboutRoomConfigured
     */
    apiV10WebRtcNotifyReceiverAboutRoomConfiguredCreate: (
      data: NotifyReceiverAboutRoomConfiguredRequest,
      params: RequestParams = {},
    ) =>
      this.request<NotifyReceiverAboutRoomConfiguredResponse, any>({
        path: `/public/api/v1.0/WebRtc/NotifyReceiverAboutRoomConfigured`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags WebRtc
     * @name ApiV10WebRtcAddCandidateCreate
     * @request POST:/public/api/v1.0/WebRtc/AddCandidate
     */
    apiV10WebRtcAddCandidateCreate: (data: AddCandidateRequest, params: RequestParams = {}) =>
      this.request<AddCandidateResponse, any>({
        path: `/public/api/v1.0/WebRtc/AddCandidate`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags WebRtc
     * @name ApiV10WebRtcSetAnswerCreate
     * @request POST:/public/api/v1.0/WebRtc/SetAnswer
     */
    apiV10WebRtcSetAnswerCreate: (data: SetAnswerRequest, params: RequestParams = {}) =>
      this.request<SetAnswerResponse, any>({
        path: `/public/api/v1.0/WebRtc/SetAnswer`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}

/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/** @default "MEDIA_TYPE_UNSPECIFIED" */
export enum MediaType {
  MEDIA_TYPE_UNSPECIFIED = "MEDIA_TYPE_UNSPECIFIED",
  MEDIA_TYPE_GUILD_ICON = "MEDIA_TYPE_GUILD_ICON",
  MEDIA_TYPE_USER_ICON = "MEDIA_TYPE_USER_ICON",
}

export interface Any {
  "@type"?: string;
  [key: string]: any;
}

export interface AuthMeResponse {
  userId: string;
  exp: string;
  iat: string;
}

export interface Category {
  id: string;
  guildId: string;
  name: string;
  /** @format date-time */
  createdAt: string;
}

export interface CategoryDetail {
  id: string;
  guildId: string;
  name: string;
  /** @format date-time */
  createdAt: string;
  channels: Channel[];
}

export interface Channel {
  id: string;
  categoryId: string;
  name: string;
  /** @format date-time */
  createdAt: string;
}

export interface CheckChannelAccessResponse {
  hasAccess?: boolean;
}

export interface CreateBody {
  content: string;
  replyId?: string;
}

export interface CreateCategoryBody {
  name: string;
}

export interface CreateCategoryResponse {
  category: Category;
}

export interface CreateChannelBody {
  name: string;
}

export interface CreateChannelResponse {
  channel: Channel;
}

export interface CreateGuildInviteBody {
  /** @format int32 */
  maxUses?: number;
  /** @format date-time */
  expiresAt?: string;
}

export interface CreateGuildInviteResponse {
  invite: Invite;
}

export interface CreateGuildRequest {
  /** owner_idはjwtから取得するため不要 */
  name: string;
  description: string;
  iconUrl: string;
}

export interface CreateGuildResponse {
  guild: Guild;
}

export interface CreateResponse {
  message: Message;
}

export interface DeleteByMessageIDResponse {
  empty: object;
}

export interface DeleteCategoryResponse {
  empty: object;
}

export interface DeleteChannelResponse {
  empty: object;
}

export interface DeleteGuildInviteResponse {
  empty: object;
}

export interface DeleteGuildMemberResponse {
  empty: object;
}

export interface ExistsResponse {
  exists?: boolean;
}

export interface GetByChannelIDResponse {
  messages: Message[];
}

export interface GetCurrentUserResponse {
  user: UserUser;
}

export interface GetGuildByIDResponse {
  guild: GuildWithMembers;
}

export interface GetGuildByInviteCodeResponse {
  invite: Invite;
}

export interface GetGuildInvitesResponse {
  invites: Invite[];
}

export interface GetGuildOverviewResponse {
  guild: GuildDetail;
}

export interface GetPresignedUploadURLRequest {
  mediaType: MediaType;
  filename: string;
}

export interface GetPresignedUploadURLResponse {
  uploadUrl: string;
}

export interface GetUserByIDResponse {
  user: UserUser;
}

export interface GetUsersByIDsResponse {
  users?: UserUser[];
}

export interface Guild {
  id: string;
  name: string;
  ownerId: string;
  description: string;
  iconUrl: string;
  defaultChannelId: string;
  /** @format int32 */
  memberCount?: number;
  /** @format date-time */
  createdAt: string;
}

export interface GuildDetail {
  id: string;
  name: string;
  ownerId: string;
  description: string;
  iconUrl: string;
  defaultChannelId: string;
  /** @format date-time */
  createdAt: string;
  categories: CategoryDetail[];
}

export interface GuildWithMemberCount {
  id: string;
  name: string;
  ownerId: string;
  description: string;
  iconUrl: string;
  defaultChannelId: string;
  /** @format int32 */
  memberCount: number;
  /** @format date-time */
  createdAt: string;
}

export interface GuildWithMembers {
  id: string;
  name: string;
  ownerId: string;
  description: string;
  iconUrl: string;
  defaultChannelId: string;
  /** @format int32 */
  memberCount: number;
  members: Member[];
  /** @format date-time */
  createdAt: string;
}

export interface Invite {
  guildId: string;
  guild?: Guild;
  creatorId: string;
  creator?: GuildUser;
  /** @format int32 */
  maxUses?: number;
  /** @format int32 */
  currentUses: number;
  inviteCode: string;
  /** @format date-time */
  expiresAt?: string;
  /** @format date-time */
  createdAt: string;
}

export type JoinGuildBody = object;

export interface JoinGuildResponse {
  member?: Member;
}

export interface LeaveGuildResponse {
  empty: object;
}

export interface ListMyGuildsResponse {
  guilds: GuildWithMemberCount[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface Member {
  userId: string;
  guildId: string;
  user?: GuildUser;
  /** @format date-time */
  joinedAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  sender?: MsgUser;
  channelId: string;
  replyId?: string;
  content: string;
  /** @format date-time */
  createdAt: string;
}

export interface RegisterRequest {
  displayId: string;
  password: string;
  email: string;
  name: string;
  bio: string;
  iconUrl: string;
}

export interface RegisterResponse {
  user: UserUser;
}

export interface Status {
  /** @format int32 */
  code?: number;
  message?: string;
  details?: Any[];
}

export interface UpdateByMessageIDBody {
  content: string;
  replyId?: string;
}

export interface UpdateByMessageIDResponse {
  message: Message;
}

export interface UpdateCategoryBody {
  name: string;
}

export interface UpdateCategoryResponse {
  category: Category;
}

export interface UpdateChannelBody {
  name: string;
}

export interface UpdateChannelResponse {
  channel: Channel;
}

export interface UpdateGuildBody {
  name: string;
  iconUrl: string;
  description: string;
  defaultChannelId: string;
}

export interface UpdateGuildResponse {
  guild: Guild;
}

export interface UpdateRequest {
  displayId: string;
  name: string;
  bio: string;
  iconUrl: string;
}

export interface UpdateResponse {
  user: UserUser;
}

/** TODO: あとからProtoをリファクタするときにuser protoのものをimportして使うようにする */
export interface GuildUser {
  id: string;
  displayId: string;
  name: string;
  iconUrl: string;
  /** @format date-time */
  createdAt: string;
}

export interface MsgUser {
  id: string;
  name: string;
  displayId: string;
  iconUrl: string;
  /** @format date-time */
  createdAt: string;
}

export interface UserUser {
  id: string;
  displayId: string;
  name: string;
  bio: string;
  iconUrl: string;
  /** @format date-time */
  createdAt: string;
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

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
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
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.JsonApi]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) => {
      if (input instanceof FormData) {
        return input;
      }

      return Object.keys(input || {}).reduce((formData, key) => {
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
      }, new FormData());
    },
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
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

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
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

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const responseToParse = responseFormat ? response.clone() : response;
      const data = !responseFormat
        ? r
        : await responseToParse[responseFormat]()
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
 * @title guild_type.proto
 * @version version not set
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * No description
     *
     * @tags Auth
     * @name Login
     * @request POST:/api/auth/login
     */
    login: (body: LoginRequest, params: RequestParams = {}) =>
      this.request<LoginResponse, Status>({
        path: `/api/auth/login`,
        method: "POST",
        body: body,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name AuthMe
     * @request GET:/api/auth/me
     */
    authMe: (params: RequestParams = {}) =>
      this.request<AuthMeResponse, Status>({
        path: `/api/auth/me`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name Register
     * @request POST:/api/auth/register
     */
    register: (body: RegisterRequest, params: RequestParams = {}) =>
      this.request<RegisterResponse, Status>({
        path: `/api/auth/register`,
        method: "POST",
        body: body,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Category
     * @name DeleteCategory
     * @request DELETE:/api/categories/{categoryId}
     */
    deleteCategory: (categoryId: string, params: RequestParams = {}) =>
      this.request<DeleteCategoryResponse, Status>({
        path: `/api/categories/${categoryId}`,
        method: "DELETE",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Category
     * @name UpdateCategory
     * @request PUT:/api/categories/{categoryId}
     */
    updateCategory: (
      categoryId: string,
      body: UpdateCategoryBody,
      params: RequestParams = {},
    ) =>
      this.request<UpdateCategoryResponse, Status>({
        path: `/api/categories/${categoryId}`,
        method: "PUT",
        body: body,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Channel
     * @name CreateChannel
     * @request POST:/api/categories/{categoryId}/channels
     */
    createChannel: (
      categoryId: string,
      body: CreateChannelBody,
      params: RequestParams = {},
    ) =>
      this.request<CreateChannelResponse, Status>({
        path: `/api/categories/${categoryId}/channels`,
        method: "POST",
        body: body,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Channel
     * @name DeleteChannel
     * @request DELETE:/api/channels/{channelId}
     */
    deleteChannel: (channelId: string, params: RequestParams = {}) =>
      this.request<DeleteChannelResponse, Status>({
        path: `/api/channels/${channelId}`,
        method: "DELETE",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Channel
     * @name UpdateChannel
     * @request PUT:/api/channels/{channelId}
     */
    updateChannel: (
      channelId: string,
      body: UpdateChannelBody,
      params: RequestParams = {},
    ) =>
      this.request<UpdateChannelResponse, Status>({
        path: `/api/channels/${channelId}`,
        method: "PUT",
        body: body,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Message
     * @name GetByChannelId
     * @request GET:/api/channels/{channelId}/messages
     */
    getByChannelId: (channelId: string, params: RequestParams = {}) =>
      this.request<GetByChannelIDResponse, Status>({
        path: `/api/channels/${channelId}/messages`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Message
     * @name Create
     * @request POST:/api/channels/{channelId}/messages
     */
    create: (channelId: string, body: CreateBody, params: RequestParams = {}) =>
      this.request<CreateResponse, Status>({
        path: `/api/channels/${channelId}/messages`,
        method: "POST",
        body: body,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Guild
     * @name CreateGuild
     * @request POST:/api/guilds
     */
    createGuild: (body: CreateGuildRequest, params: RequestParams = {}) =>
      this.request<CreateGuildResponse, Status>({
        path: `/api/guilds`,
        method: "POST",
        body: body,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Guild
     * @name GetGuildById
     * @request GET:/api/guilds/{guildId}
     */
    getGuildById: (guildId: string, params: RequestParams = {}) =>
      this.request<GetGuildByIDResponse, Status>({
        path: `/api/guilds/${guildId}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Guild
     * @name UpdateGuild
     * @request PUT:/api/guilds/{guildId}
     */
    updateGuild: (
      guildId: string,
      body: UpdateGuildBody,
      params: RequestParams = {},
    ) =>
      this.request<UpdateGuildResponse, Status>({
        path: `/api/guilds/${guildId}`,
        method: "PUT",
        body: body,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Category
     * @name CreateCategory
     * @request POST:/api/guilds/{guildId}/categories
     */
    createCategory: (
      guildId: string,
      body: CreateCategoryBody,
      params: RequestParams = {},
    ) =>
      this.request<CreateCategoryResponse, Status>({
        path: `/api/guilds/${guildId}/categories`,
        method: "POST",
        body: body,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Invite
     * @name GetGuildInvites
     * @request GET:/api/guilds/{guildId}/invites
     */
    getGuildInvites: (guildId: string, params: RequestParams = {}) =>
      this.request<GetGuildInvitesResponse, Status>({
        path: `/api/guilds/${guildId}/invites`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Invite
     * @name CreateGuildInvite
     * @request POST:/api/guilds/{guildId}/invites
     */
    createGuildInvite: (
      guildId: string,
      body: CreateGuildInviteBody,
      params: RequestParams = {},
    ) =>
      this.request<CreateGuildInviteResponse, Status>({
        path: `/api/guilds/${guildId}/invites`,
        method: "POST",
        body: body,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Member
     * @name LeaveGuild
     * @request DELETE:/api/guilds/{guildId}/members/me
     */
    leaveGuild: (guildId: string, params: RequestParams = {}) =>
      this.request<LeaveGuildResponse, Status>({
        path: `/api/guilds/${guildId}/members/me`,
        method: "DELETE",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Member
     * @name DeleteGuildMember
     * @request DELETE:/api/guilds/{guildId}/members/{userId}
     */
    deleteGuildMember: (
      guildId: string,
      userId: string,
      params: RequestParams = {},
    ) =>
      this.request<DeleteGuildMemberResponse, Status>({
        path: `/api/guilds/${guildId}/members/${userId}`,
        method: "DELETE",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Guild
     * @name GetGuildOverview
     * @request GET:/api/guilds/{guildId}/overview
     */
    getGuildOverview: (guildId: string, params: RequestParams = {}) =>
      this.request<GetGuildOverviewResponse, Status>({
        path: `/api/guilds/${guildId}/overview`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Invite
     * @name GetGuildByInviteCode
     * @request GET:/api/invites/{inviteCode}
     */
    getGuildByInviteCode: (inviteCode: string, params: RequestParams = {}) =>
      this.request<GetGuildByInviteCodeResponse, Status>({
        path: `/api/invites/${inviteCode}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Invite
     * @name DeleteGuildInvite
     * @request DELETE:/api/invites/{inviteCode}
     */
    deleteGuildInvite: (inviteCode: string, params: RequestParams = {}) =>
      this.request<DeleteGuildInviteResponse, Status>({
        path: `/api/invites/${inviteCode}`,
        method: "DELETE",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Invite
     * @name JoinGuild
     * @request POST:/api/invites/{inviteCode}/join
     */
    joinGuild: (
      inviteCode: string,
      body: JoinGuildBody,
      params: RequestParams = {},
    ) =>
      this.request<JoinGuildResponse, Status>({
        path: `/api/invites/${inviteCode}/join`,
        method: "POST",
        body: body,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Media
     * @name GetPresignedUploadUrl
     * @request POST:/api/media/upload-url
     */
    getPresignedUploadUrl: (
      body: GetPresignedUploadURLRequest,
      params: RequestParams = {},
    ) =>
      this.request<GetPresignedUploadURLResponse, Status>({
        path: `/api/media/upload-url`,
        method: "POST",
        body: body,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Message
     * @name DeleteByMessageId
     * @request DELETE:/api/messages/{messageId}
     */
    deleteByMessageId: (messageId: string, params: RequestParams = {}) =>
      this.request<DeleteByMessageIDResponse, Status>({
        path: `/api/messages/${messageId}`,
        method: "DELETE",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Message
     * @name UpdateByMessageId
     * @request PUT:/api/messages/{messageId}
     */
    updateByMessageId: (
      messageId: string,
      body: UpdateByMessageIDBody,
      params: RequestParams = {},
    ) =>
      this.request<UpdateByMessageIDResponse, Status>({
        path: `/api/messages/${messageId}`,
        method: "PUT",
        body: body,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name GetCurrentUser
     * @request GET:/api/user/me
     */
    getCurrentUser: (params: RequestParams = {}) =>
      this.request<GetCurrentUserResponse, Status>({
        path: `/api/user/me`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name Update
     * @request PUT:/api/users/me
     */
    update: (body: UpdateRequest, params: RequestParams = {}) =>
      this.request<UpdateResponse, Status>({
        path: `/api/users/me`,
        method: "PUT",
        body: body,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Guild
     * @name ListMyGuilds
     * @request GET:/api/users/me/guilds
     */
    listMyGuilds: (params: RequestParams = {}) =>
      this.request<ListMyGuildsResponse, Status>({
        path: `/api/users/me/guilds`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name GetUserById
     * @request GET:/api/users/{id}
     */
    getUserById: (id: string, params: RequestParams = {}) =>
      this.request<GetUserByIDResponse, Status>({
        path: `/api/users/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),
  };
}

import type {
	AuthMeResponse,
	CreateBody,
	CreateCategoryBody,
	CreateCategoryResponse,
	CreateChannelBody,
	CreateChannelResponse,
	CreateGuildInviteBody,
	CreateGuildInviteResponse,
	CreateGuildRequest,
	CreateGuildResponse,
	CreateResponse,
	GetGuildInvitesResponse,
	GetGuildOverviewResponse,
	JoinGuildBody,
	JoinGuildResponse,
	ListMyGuildsResponse,
	LoginRequest,
	LoginResponse,
	RegisterRequest,
	RegisterResponse,
} from "../types/Api.ts";
import { HttpClient } from "./fetch.ts";

export interface ResponseStatus {
	success: boolean;
}

export class Client {
	private http: HttpClient;
	private userId?: string;
	private token?: string;
	private currentGuildId?: string;
	private currentChannelId?: string;

	constructor(baseUrl: string) {
		this.http = new HttpClient(baseUrl);
	}

	register(userData: RegisterRequest) {
		const res = this.http.post<RegisterRequest, RegisterResponse>(
			"/api/auth/register",
			userData,
		);
		this.userId = res.data.user.id;
		return {
			success: res.status >= 200 && res.status < 300,
			userId: this.userId,
		};
	}

	login(email: string, password: string) {
		const res = this.http.post<LoginRequest, LoginResponse>("/api/auth/login", {
			email,
			password,
		});
		this.token = res.data.token;
		this.http.setToken(this.token);
		return {
			success: res.status >= 200 && res.status < 300,
			token: this.token,
		};
	}

	authMe() {
		const res = this.http.get<AuthMeResponse>("/api/auth/me");
		this.userId = res.data.userId;
		return {
			success: res.status >= 200 && res.status < 300,
			userId: this.userId,
		};
	}

	getMyGuilds() {
		const res = this.http.get<ListMyGuildsResponse>("/api/users/me/guilds");
		return {
			success: res.status >= 200 && res.status < 300,
			guilds: res.data.guilds || [],
		};
	}

	getGuild(guildId: string) {
		const res = this.http.get(`/api/guilds/${guildId}`);
		return { success: res.status >= 200 && res.status < 300 };
	}

	createGuild(guildData: CreateGuildRequest) {
		const res = this.http.post<CreateGuildRequest, CreateGuildResponse>(
			"/api/guilds",
			guildData,
		);
		this.currentGuildId = res.data.guild.id;
		return {
			success: res.status >= 200 && res.status < 300,
			guildId: this.currentGuildId,
		};
	}

	createCategory(guildId: string, name: string) {
		const res = this.http.post<CreateCategoryBody, CreateCategoryResponse>(
			`/api/guilds/${guildId}/categories`,
			{ name },
		);
		return {
			success: res.status >= 200 && res.status < 300,
			categoryId: res.data.category.id,
		};
	}

	createChannel(categoryId: string, name: string) {
		const res = this.http.post<CreateChannelBody, CreateChannelResponse>(
			`/api/categories/${categoryId}/channels`,
			{ name },
		);
		return {
			success: res.status >= 200 && res.status < 300,
			channelId: res.data.channel.id,
		};
	}

	getInvites(guildId: string) {
		const res = this.http.get<GetGuildInvitesResponse>(
			`/api/guilds/${guildId}/invites`,
		);
		return {
			success: res.status >= 200 && res.status < 300,
			invites: res.data.invites || [],
		};
	}

	getInvite(inviteCode: string) {
		const res = this.http.get(`/api/invites/${inviteCode}`);
		return { success: res.status >= 200 && res.status < 300 };
	}

	createInvite(guildId: string, expiresAt: string) {
		const res = this.http.post<
			CreateGuildInviteBody,
			CreateGuildInviteResponse
		>(`/api/guilds/${guildId}/invites`, { expiresAt });
		return {
			success: res.status >= 200 && res.status < 300,
			inviteCode: res.data.invite.inviteCode,
		};
	}

	joinGuild(inviteCode: string) {
		const res = this.http.post<JoinGuildBody, JoinGuildResponse>(
			`/api/invites/${inviteCode}/join`,
			{},
		);
		return {
			success: res.status >= 200 && res.status < 300,
			guildId: res.data.member?.guildId,
		};
	}

	getGuildOverview(guildId: string) {
		const res = this.http.get<GetGuildOverviewResponse>(
			`/api/guilds/${guildId}/overview`,
		);
		this.currentChannelId = res.data.guild.defaultChannelId;
		return {
			success: res.status >= 200 && res.status < 300,
			defaultChannelId: this.currentChannelId,
		};
	}

	getMessages(channelId: string) {
		const res = this.http.get(`/api/channels/${channelId}/messages`);
		return { success: res.status >= 200 && res.status < 300 };
	}

	sendMessage(channelId: string, content: string) {
		const res = this.http.post<CreateBody, CreateResponse>(
			`/api/channels/${channelId}/messages`,
			{ content },
		);
		return {
			success: res.status >= 200 && res.status < 300,
			messageId: res.data.message?.id,
		};
	}

	getToken() {
		return this.token;
	}

	getUserId() {
		return this.userId;
	}

	getCurrentGuildId() {
		return this.currentGuildId;
	}

	getCurrentChannelId() {
		return this.currentChannelId;
	}
}

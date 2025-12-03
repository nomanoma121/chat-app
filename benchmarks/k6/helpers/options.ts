export interface BenchmarkOptions {
	vus: number;
	durationMinutes: number;
}

export const generateBenchOptions = ({
	vus,
	durationMinutes,
}: BenchmarkOptions) => {
	// 各シナリオの割合
	const ACTIVE_USER_RATIO = 0.2;
	const NEW_USER_RATIO = 0.05;
	const LURKERS_RATIO = 0.7;
	const SPIKE_LOAD_RATIO = 0.8;

	// 新規ユーザーのarrival-rate計算用
	const NEW_USER_BASE_RATE = (vus * NEW_USER_RATIO) / 20;

	const duration = `${durationMinutes}m`;
	const durationSeconds = durationMinutes * 60;

	const spikeWarmup = Math.floor(durationSeconds / 3);
	const spikeRampUp = Math.floor(durationSeconds / 12);
	const spikePeak = Math.floor(durationSeconds / 6);
	const spikeRampDown = Math.floor(durationSeconds / 12);
	const spikeCooldown = Math.floor(durationSeconds / 3);

	return {
		scenarios: {
			// アクティブユーザー: 全体の20% - メッセージを積極的に送信
			activeUser: {
				executor: "constant-vus",
				exec: "activeUser",
				vus: Math.floor(vus * ACTIVE_USER_RATIO),
				duration: duration,
			},
			// 新規ユーザー: 全体の5% - 新規登録して参加
			newUser: {
				executor: "constant-arrival-rate",
				exec: "newUser",
				rate: Math.max(1, Math.floor(NEW_USER_BASE_RATE * 5)),
				timeUnit: "1s",
				duration: duration,
				preAllocatedVUs: Math.max(1, Math.floor(vus * NEW_USER_RATIO * 0.2)),
				maxVUs: Math.max(1, Math.floor(vus * NEW_USER_RATIO)),
			},
			// スパイク負荷: 不定期に発生する急激な負荷
			spikeLoad: {
				executor: "ramping-vus",
				exec: "spikeLoad",
				startVUs: 0,
				stages: [
					{ duration: `${spikeWarmup}s`, target: Math.floor(vus * SPIKE_LOAD_RATIO * 0.1) },
					{ duration: `${spikeRampUp}s`, target: Math.floor(vus * SPIKE_LOAD_RATIO * 0.5) },
					{ duration: `${spikePeak}s`, target: Math.floor(vus * SPIKE_LOAD_RATIO) },
					{ duration: `${spikeRampDown}s`, target: Math.floor(vus * SPIKE_LOAD_RATIO * 0.5) },
					{ duration: `${spikeCooldown}s`, target: Math.floor(vus * SPIKE_LOAD_RATIO * 0.1) },
				],
				gracefulRampDown: "10s",
			},
			// lurkers（ROM専）: 全体の70% - 読み取り専用
			lurkers: {
				executor: "constant-vus",
				exec: "luckers",
				vus: Math.floor(vus * LURKERS_RATIO),
				duration: duration,
			},
		},
		summaryTrendStats: ["count", "avg", "min", "med", "max", "p(95)", "p(99)"],
		thresholds: {
			http_req_duration: ["p(95)<500", "p(99)<1000"],
			http_req_failed: ["rate<0.01"],

			"http_req_duration{name:POST /api/auth/register}": ["p(95)<500"],
			"http_req_duration{name:POST /api/auth/login}": ["p(95)<500"],
			"http_req_duration{name:GET /api/auth/me}": ["p(95)<500"],
			"http_req_duration{name:GET /api/users/me/guilds}": ["p(95)<500"],
			"http_req_duration{name:POST /api/guilds}": ["p(95)<500"],
			"http_req_duration{name:POST /api/guilds/:id/invites}": ["p(95)<500"],
			"http_req_duration{name:POST /api/invites/:code/join}": ["p(95)<500"],
			"http_req_duration{name:GET /api/guilds/:id/overview}": ["p(95)<500"],
			"http_req_duration{name:GET /api/channels/:id/messages}": ["p(95)<500"],
			"http_req_duration{name:POST /api/channels/:id/messages}": ["p(95)<500"],
			"http_req_duration{name:GET /api/guilds/:id/invites}": ["p(95)<500"],
			"http_req_duration{name:GET /api/guilds/:id}": ["p(95)<500"],
			"http_req_duration{name:GET /api/invites/:code}": ["p(95)<500"],
			"http_req_duration{name:POST /api/guilds/:id/categories}": ["p(95)<500"],
			"http_req_duration{name:POST /api/categories/:id/channels}": ["p(95)<500"],
		},
	};
};

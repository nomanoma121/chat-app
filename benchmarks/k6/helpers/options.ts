export interface BenchmarkOptions {
	vus: number;
	durationMinutes: number;
}

export const generateBenchOptions = ({
	vus,
	durationMinutes,
}: BenchmarkOptions) => {
	// 各シナリオの割合
	const ACTIVE_USER_RATIO = 0.2; // 20%
	const NEW_USER_RATIO = 0.05; // 5%
	const LURKERS_RATIO = 0.7; // 70%
	const SPIKE_LOAD_RATIO = 0.2; // スパイク時の割合

	// 新規ユーザーのarrival-rate計算用
	const NEW_USER_BASE_RATE = (vus * NEW_USER_RATIO) / 50;

	const warmupTime = `${Math.floor(durationMinutes * 0.1)}m`; // 10%
	const normalTime = `${Math.floor(durationMinutes * 0.4)}m`; // 40%
	const peakTime = `${Math.floor(durationMinutes * 0.2)}m`; // 20%
	const cooldownTime = `${Math.floor(durationMinutes * 0.2)}m`; // 20%
	const endTime = `${Math.floor(durationMinutes * 0.1)}m`; // 10%

	const spikeWaitTime = `${Math.floor(durationMinutes * 0.47)}m`;
	const spikeRampUpTime = "30s";
	const spikeDurationTime = "1m";
	const spikeRampDownTime = "30s";
	const spikeEndWaitTime = `${Math.floor(durationMinutes * 0.47)}m`;

	return {
		scenarios: {
			// アクティブユーザー: 全体の20% - メッセージを積極的に送信
			activeUser: {
				executor: "ramping-vus",
				exec: "activeUser",
				startVUs: 0,
				stages: [
					{ duration: warmupTime, target: Math.floor(vus * ACTIVE_USER_RATIO * 0.7) },
					{ duration: normalTime, target: Math.floor(vus * ACTIVE_USER_RATIO * 0.7) },
					{ duration: peakTime, target: Math.floor(vus * ACTIVE_USER_RATIO) },
					{ duration: cooldownTime, target: Math.floor(vus * ACTIVE_USER_RATIO * 0.7) },
					{ duration: endTime, target: 0 },
				],
				gracefulRampDown: "30s",
			},
			// 新規ユーザー: 全体の5% - 新規登録して参加
			newUser: {
				executor: "ramping-arrival-rate",
				exec: "newUser",
				startRate: Math.floor(NEW_USER_BASE_RATE),
				timeUnit: "1s",
				preAllocatedVUs: Math.floor(vus * NEW_USER_RATIO * 0.2),
				maxVUs: Math.floor(vus * NEW_USER_RATIO),
				stages: [
					{ duration: warmupTime, target: Math.floor(NEW_USER_BASE_RATE * 2) },
					{ duration: normalTime, target: Math.floor(NEW_USER_BASE_RATE * 5) },
					{ duration: peakTime, target: Math.floor(NEW_USER_BASE_RATE * 3) },
					{ duration: cooldownTime, target: Math.floor(NEW_USER_BASE_RATE) },
				],
			},
			// スパイク負荷: 不定期に発生する急激な負荷
			spikeLoad: {
				executor: "ramping-vus",
				exec: "spikeLoad",
				startVUs: 0,
				stages: [
					{ duration: spikeWaitTime, target: 0 },
					{ duration: spikeRampUpTime, target: Math.floor(vus * SPIKE_LOAD_RATIO) },
					{ duration: spikeDurationTime, target: Math.floor(vus * SPIKE_LOAD_RATIO) },
					{ duration: spikeRampDownTime, target: 0 },
					{ duration: spikeEndWaitTime, target: 0 },
				],
				gracefulRampDown: "10s",
			},
			// lurkers（ROM専）: 全体の70% - 読み取り専用
			lurkers: {
				executor: "ramping-vus",
				exec: "luckers",
				startVUs: 0,
				stages: [
					{ duration: warmupTime, target: Math.floor(vus * LURKERS_RATIO * 0.6) },
					{ duration: peakTime, target: Math.floor(vus * LURKERS_RATIO * 0.6) },
					{ duration: normalTime, target: Math.floor(vus * LURKERS_RATIO) },
					{ duration: peakTime, target: Math.floor(vus * LURKERS_RATIO * 0.6) },
					{ duration: endTime, target: 0 },
				],
				gracefulRampDown: "30s",
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

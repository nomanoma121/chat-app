import http from 'k6/http';
import ws from 'k6/ws';
import { check, sleep } from 'k6';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

// テスト設定
export const options = {
  vus: 2000,           // 仮想ユーザー数
  duration: '300s',  // テスト実行時間
};

const BASE_URL = 'http://localhost:8000';
const WS_URL = 'ws://localhost:50054';

// メインテスト関数（各VUが繰り返し実行）
export default function() {
  const uuid = uuidv4();
  const shortId = uuid.replace(/-/g, '').substring(0, 12); // ハイフン除去して最初の12文字
  const displayId = `u_${shortId}`; // u_ + 12文字 = 14文字（20文字以内）
  const name = `User${shortId.substring(0, 10)}`; // User + 10文字 = 14文字（15文字以内）
  const email = `${uuid}@example.com`;
  const password = 'password123';

  // 1. ユーザー登録
  const registerRes = http.post(
    `${BASE_URL}/api/auth/register`,
    JSON.stringify({
      displayId: displayId,
      name: name,
      email: email,
      password: password,
      bio: 'Test user for k6 load testing',
      iconUrl: 'https://example.com/icon.png'
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(registerRes, {
    'register status is 200': (r) => r.status === 200,
    'register has user': (r) => r.json('user') !== undefined,
  });

  if (registerRes.status !== 200) {
    console.error(`Registration failed for ${displayId}: status=${registerRes.status}, body=${registerRes.body}`);
    return;
  }

  sleep(0.5);

  // 2. ログイン（トークン取得）
  const loginRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({
      email: email,
      password: password
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(loginRes, {
    'login status is 200': (r) => r.status === 200,
    'login has token': (r) => r.json('token') !== undefined,
  });

  if (loginRes.status !== 200) {
    console.error(`Login failed for ${email}`);
    return;
  }

  const token = loginRes.json('token');
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  sleep(0.5);

  // 3. ギルド作成
  const guildRes = http.post(
    `${BASE_URL}/api/guilds`,
    JSON.stringify({
      name: `Guild_${__VU}_${__ITER}`,
      description: `Test guild for user ${displayId}`,
      iconUrl: 'https://example.com/guild-icon.png'
    }),
    { headers: authHeaders }
  );

  check(guildRes, {
    'guild created': (r) => r.status === 200,
    'guild has data': (r) => r.json('guild') !== undefined,
    'guild has id': (r) => r.json('guild.id') !== undefined,
  });

  if (!guildRes.json('guild') || !guildRes.json('guild.id')) {
    console.error(`Guild creation failed for ${displayId}`);
    return;
  }

  const guildId = guildRes.json('guild.id');
  sleep(0.5);

  // 4. ギルド詳細取得（カテゴリとチャンネルを取得）
  const overviewRes = http.get(
    `${BASE_URL}/api/guilds/${guildId}/overview`,
    { headers: authHeaders }
  );

  check(overviewRes, {
    'overview retrieved': (r) => r.status === 200,
    'has categories': (r) => r.json('guild.categories') && r.json('guild.categories').length > 0,
  });

  if (!overviewRes.json('guild.categories') || overviewRes.json('guild.categories').length === 0) {
    console.error(`No categories found for guild ${guildId}`);
    return;
  }

  // 最初のカテゴリの最初のチャンネルを取得
  const firstCategory = overviewRes.json('guild.categories')[0];
  if (!firstCategory.channels || firstCategory.channels.length === 0) {
    console.error(`No channels found in first category`);
    return;
  }

  const channelId = firstCategory.channels[0].id;
  sleep(0.5);

  // 5. メッセージをHTTP経由で送信
  for (let i = 0; i < 3; i++) {
    const messageRes = http.post(
      `${BASE_URL}/api/channels/${channelId}/messages`,
      JSON.stringify({
        content: `HTTP Message ${i + 1} from ${displayId} at ${new Date().toISOString()}`
      }),
      { headers: authHeaders }
    );

    check(messageRes, {
      'message sent': (r) => r.status === 200 || r.status === 201,
    });

    sleep(1);
  }

  // 6. WebSocket接続してメッセージ受信をテスト
  const wsUrl = `${WS_URL}/ws`;

  const wsResponse = ws.connect(wsUrl, function(socket) {
    socket.on('open', function() {
      // 接続直後に認証メッセージを送信
      const authMessage = JSON.stringify({
        type: 'AUTH_REQUEST',
        data: {
          token: token
        }
      });
      socket.send(authMessage);
    });

    socket.on('message', function(data) {
      const message = JSON.parse(data);

      // 認証成功を確認
      if (message.type === 'AUTH_SUCCESS') {
        console.log(`WebSocket authenticated for ${displayId}, user_id: ${message.data.user_id}`);
        check(message, {
          'websocket auth success': (m) => m.type === 'AUTH_SUCCESS',
        });
      } else if (message.type === 'AUTH_ERROR') {
        console.error(`WebSocket auth failed for ${displayId}: ${message.data.message}`);
        check(message, {
          'websocket auth failed': (m) => m.type !== 'AUTH_ERROR',
        });
      } else {
        // その他のメッセージ（MESSAGE_CREATE等）
        check(message, {
          'websocket message received': (m) => m.type !== null,
        });
      }
    });

    socket.on('error', function(e) {
      if (e.error() != 'websocket: close sent') {
        console.error(`WebSocket error for ${displayId}: ${e.error()}`);
      }
    });

    socket.on('close', function() {
      console.log(`WebSocket closed for ${displayId}`);
    });

    // 30秒間WebSocket接続を維持してメッセージを受信
    socket.setTimeout(function() {
      socket.close();
    }, 30000);
  });

  check(wsResponse, {
    'websocket connected': (r) => r && r.status === 101,
  });
}

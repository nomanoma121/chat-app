import {
  index,
  layout,
  prefix,
  type RouteConfig,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/page.tsx"),
  route("login", "routes/login/page.tsx"),
  route("signup", "routes/signup/page.tsx"),
  ...prefix("invite", [route(":inviteId", "routes/invite/page.tsx")]), // UI上ではGuildのことをServerと呼ぶ
  layout("routes/layout.tsx", [
    ...prefix("servers", [
      index("routes/guilds/page.tsx"),
      route("settings", "routes/guilds/settings/page.tsx"),
      route("create", "routes/guilds/create/page.tsx"),
      ...prefix(":serverId", [
        route("invite", "routes/guilds/invite/page.tsx"),
        ...prefix("channels", [
          route(":channelId", "routes/guilds/channels/page.tsx"),
        ]),
      ]),
    ]),
    ...prefix("settings", [index("routes/settings/page.tsx")]),
  ]),
] satisfies RouteConfig;

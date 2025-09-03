import { type RouteConfig, index, prefix, route } from "@react-router/dev/routes";

export default [
  index("routes/page.tsx"),
  ...prefix("servers", [
    route("settings", "routes/servers/settings/page.tsx"),
    route("create", "routes/servers/create/page.tsx"),
    ...prefix(":serverId", [
      index("routes/servers/page.tsx"),
      route("invite", "routes/servers/invite/page.tsx"),
      ...prefix("channels", [
        route(":channelId", "routes/servers/channels/page.tsx"),
      ])
    ])
  ]),
  ...prefix("settings", [
    index("routes/settings/page.tsx"),
    route("general", "routes/settings/general/page.tsx")
  ]),
  route("login", "routes/login/page.tsx"),
  route("signup", "routes/signup/page.tsx"),
  ...prefix("invite", [
    route(":inviteId", "routes/invite/page.tsx")
  ])
] satisfies RouteConfig;

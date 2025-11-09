## OpenNext + Cloudflare 要点总结


- 产物结构与绑定

  - OpenNext 输出位于 `.open-next/`；Worker 入口为 `.open-next/worker.js`，静态资源位于 `.open-next/assets`。
  - `wrangler.toml` 已指向上述产物：
    - `main = ".open-next/worker.js"`
    - `[assets].directory = ".open-next/assets"` 并绑定为 `ASSETS`，由 CDN 缓存与回源。
    - 通过 `[[services]]` 将自身绑定为 `WORKER_SELF_REFERENCE`，便于内部自调用（如再验证/预热等）。

- 运行时与兼容

  - Workers 为 Edge Runtime，不提供 Node 内置模块；本仓库启用了 `compatibility_flags = ["nodejs_compat", "global_fetch_strictly_public"]` 以获得有限 Node 兼容与更严格的 fetch 语义。即便如此，仍推荐优先使用 Web API（`fetch`/Streams/Web Crypto）。
  - 图片/二进制重处理不在 Worker 内进行，建议改走 Cloudflare Images/R2 或构建期处理。

- 开发体验（dev/preview）

  - `next.config.ts` 末尾显式调用 `initOpenNextCloudflareForDev()`，让 `next dev` 下也能模拟 Cloudflare 运行时，尽量早暴露边缘不兼容问题。
  - 脚本约定：
    - `pnpm preview` → `opennextjs-cloudflare build && ... preview`（本地预览 Worker 产物）。
    - `pnpm deploy` → `opennextjs-cloudflare build && ... deploy`（推送到 Cloudflare）。

- 配置文件职责

  - `open-next.config.ts`：使用 `defineCloudflareConfig()` 默认配置，保持与 OpenNext 版本同步；遇到路由/缓存/运行时细节再按需覆写。
  - `wrangler.toml`：Workers 名称、兼容日期/标记、静态资源绑定、服务绑定及后续 KV/D1/R2 等资源的声明位置。
  - `package.json`：与 OpenNext 的 CLI 脚本绑定；此外提供 `cf-typegen` 脚本：
    - `pnpm cf-typegen` 通过 `wrangler types` 生成 `cloudflare-env.d.ts`，在 TS 中为 `env` 绑定提供强类型。

- 渲染与缓存策略

  - 优先使用 SSG/ISR（`revalidate`）降低 Worker 压力；确需 SSR 的页面要严格控制数据请求和计算量，并尽量使用流式响应以减少 TTFB。
  - 静态资源与 `.next/static` 交由 CDN 缓存，不经 Worker 动态代理；接口响应可结合 `Cache-Control`/`ETag`/`stale-while-revalidate` 提升命中率。

- 依赖与打包

  - 选用边缘友好依赖（基于 Web API、无原生扩展、无需 `postinstall` 编译）。
  - 避免体积臃肿库与 Node-only 库；若必须，已开启的 `nodejs_compat` 能覆盖部分场景，但会增加包体与冷启动时间，应审慎使用。

- 数据与服务集成（按需）

  - 后续如接入 KV/D1/R2/Queues/Durable Objects，应在 `wrangler.toml` 声明绑定，并通过 `cf-typegen` 产出类型，避免 `any` 隐患。
  - SSR/Route Handler 访问远端服务时注意区域延迟与超时；必要时在边缘增加缓存或异步队列解耦。

- 观测与调试

  - 本地：`pnpm build` 捕捉构建期问题，`pnpm preview` 在 Worker 语义下验证产物。
  - 线上：`wrangler tail` 查看实时日志；建议为关键路径加入结构化日志与错误上报（Sentry Workers 版本等）。

- 常见坑与本仓库决策
  - Node-only 依赖：统一以 Web API 版本替换；若少数库无法替代，再评估 `nodejs_compat` 与包体增量。
  - 过度 SSR：本仓库的学习页面以客户端/轻 SSR 为主，复杂运算放到客户端或静态化，降低 Worker CPU time 风险。
  - 图片处理：不在 Worker 内做重处理，减少超时与内存压力。

## 其他提示

- `pnpm lint` 运行 ESLint；
- `pnpm preview` 使用 OpenNext Cloudflare 的 preview 层，模拟真实边缘运行环境；
- 本仓库已预装的 `@tanstack/react-query`, `jotai`, `recoil`, `zustand` 均可直接在各自 `learn` 页面中探索；
- 若需要添加新的状态管理模块，可在 `app/learn` 下新增子目录，并在 `app/learn/page.tsx` 添加对应卡片。

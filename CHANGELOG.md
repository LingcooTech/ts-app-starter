# Changelog

Starter 遵循语义化版本。`.starter-version`、根 `package.json` 的版本以及 CLI 的 `templateVersion` 必须保持一致；CLI 自身的 patch 修复可以独立发布。

## [0.1.0] - 2026-08-18

### Added

- NestJS + Fastify API 和独立 Worker 运行入口。
- PostgreSQL、Drizzle migration 和 readiness health check。
- React + Vite Admin/Web 空白前端入口。
- Docker、Docker Compose、Caddy 和通用 CI/CD 基线。
- CLI 生成项目 smoke test、版本对齐检查和生产 Docker smoke test。
- 最小 NestJS 模块生成器和模块依赖方向检查。
- 统一 HTTP 错误结构与 Zod 请求校验约定。

### Boundary

- Starter 不包含认证、Redis、队列、支付、邮件、对象存储、UI 组件库或任何业务模块。

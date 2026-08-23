# Application modules

业务能力应以 NestJS Module 形式加入此目录。Starter 不预置任何业务模块。

使用：

```bash
pnpm generate:module <module-name>
```

生成后，确认模块边界、输入校验、数据库 schema、migration 和测试，再在 `app.module.ts` 中注册模块。

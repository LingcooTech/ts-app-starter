# Package 边界与验证结论

## 目的

Starter 的验证项目不是用来完整迁移 Edu 或 Retail 业务，而是验证：

1. `ts-app-starter` 能否通过 npx 生成独立应用；
2. 独立应用能否消费已发布的 `@lingcoo-tech/*` package；
3. 多个真实项目是否暴露出稳定、值得公共化的重复能力。

## Edu 与 Retail 验证结果

| 验证项                   | Edu                                 | Retail                                    |
| ------------------------ | ----------------------------------- | ----------------------------------------- |
| Starter CLI 生成         | 通过                                | 通过                                      |
| 独立 Git 仓库            | 通过                                | 通过                                      |
| npm package 安装         | 通过                                | 通过                                      |
| `@lingcoo-tech/security` | 真实登录、密码哈希、JWT、`/auth/me` | 密码哈希、JWT、Bearer Token contract 测试 |
| `@lingcoo-tech/http`     | Nest 错误 filter 和校验错误响应     | HTTP 错误响应 contract 测试               |
| `@lingcoo-tech/crypto`   | package 集成验证                    | 配置加解密 contract 测试                  |
| `@lingcoo-tech/mailer`   | 可安装和消费                        | SMTP factory contract 测试                |
| PostgreSQL migration     | 账户认证表真实 migration            | Starter 数据库基线待按需验证              |
| 完整工程检查             | 通过                                | 通过                                      |

Edu 已经完成一条真实 API 纵向验证链路，Retail 则以更小的 contract 验证证明同一组 npm package 可以被第二个独立应用消费。两者共同证明 Starter 与独立公共 package 仓库的组合模式成立。

## 当前四个 package 的结论

现有四个 package 已覆盖当前三个项目中最稳定的重复基础能力，暂时不需要新增公共 package：

| Package                  | 结论                 | 边界                                                                             |
| ------------------------ | -------------------- | -------------------------------------------------------------------------------- |
| `@lingcoo-tech/security` | 保留并继续演进       | 密码哈希、JWT、Bearer Token 等安全原语；不包含用户表、角色模型和登录流程         |
| `@lingcoo-tech/http`     | 保留并继续演进       | 框架无关的错误对象和响应 contract；不包含 Nest/Fastify 适配实现                  |
| `@lingcoo-tech/crypto`   | 保留并继续演进       | AES-GCM、版本化密文和配置加解密原语；不包含 Qiniu、支付或 SMTP 配置              |
| `@lingcoo-tech/mailer`   | 保留，按真实需求演进 | provider-neutral mail contract 和 SMTP adapter；不包含验证码、模板或业务邮件流程 |

## 暂不新增的能力

- `config`：环境变量 schema 属于应用，Starter 已经提供 Zod 校验基线；
- `database`：连接、schema、migration 和事务边界属于应用；
- `validation`：直接使用成熟的 Zod，不再包一层；
- `rate-limit`：依赖 Web 框架、Redis 和应用的 key 策略；
- `rbac`：Edu、Retail、Core 的角色和权限语义不同；
- `audit`：审计字段、存储和业务事件仍属于应用能力；
- `storage`：对象存储和 Qiniu 适配带有供应商及业务语义；
- 支付、队列、Redis、通知和认证流程：都不属于当前公共基础 package 范围。

## 决策规则

候选能力只有同时满足以下条件，才进入公共 package 评估：

- 至少两个独立应用存在重复实现；
- API 边界已经稳定；
- 不包含行业、产品或供应商语义；
- 能用成熟依赖解决时，不重复自研；
- 可以在独立 package 中测试和版本化；
- 被第二个应用实际消费后仍然没有明显定制分支。

当前阶段的下一步是继续用 Edu 和 Retail 做回归验证、完善四个 package 的文档和版本发布流程，而不是继续迁移业务模块或扩充 package 数量。

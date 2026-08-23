# HTTP conventions

业务模块应遵循以下约定：

- Controller 只负责 HTTP 输入输出和状态码；
- Service 负责用例编排；
- Repository 负责数据库访问；
- 请求输入使用 Zod schema，并通过 `ZodValidationPipe` 显式绑定；
- 未处理异常统一由 `ApiErrorFilter` 转换为稳定的错误结构；
- 错误响应格式为 `{ error: { code, message, details?, requestId } }`；
- 业务错误使用明确的稳定 `code`，不要把数据库错误或堆栈直接返回给客户端。

示例：

```ts
const createThingSchema = z.object({ name: z.string().trim().min(1) });
type CreateThingInput = z.infer<typeof createThingSchema>;

@Post()
create(@Body(new ZodValidationPipe(createThingSchema)) input: CreateThingInput) {
  return this.service.create(input);
}
```

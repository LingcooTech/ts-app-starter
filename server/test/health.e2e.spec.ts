import { Body, Controller, Post } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { z } from 'zod';

import { AppModule } from '../src/app.module';
import { configureHttpApplication } from '../src/http-bootstrap';
import { DatabaseService } from '../src/infrastructure/database/database.service';
import { ZodValidationPipe } from '../src/common/http/zod-validation.pipe';

const contractSchema = z.object({ name: z.string().trim().min(1) });

@Controller('contract')
class ContractController {
  @Post()
  create(@Body(new ZodValidationPipe(contractSchema)) body: z.infer<typeof contractSchema>) {
    return body;
  }
}

describe('health endpoints', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [ContractController],
    })
      .overrideProvider(DatabaseService)
      .useValue({ ping: async () => undefined })
      .compile();

    app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await configureHttpApplication(app);
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('reports liveness without a database dependency', async () => {
    const response = await app.getHttpAdapter().getInstance().inject({
      method: 'GET',
      url: '/health/live',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ status: 'ok' });
    expect(response.headers['x-request-id']).toBeTruthy();
  });

  it('reports readiness after the database check succeeds', async () => {
    const response = await app.getHttpAdapter().getInstance().inject({
      method: 'GET',
      url: '/health/ready',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: 'ok',
      info: { database: { status: 'up' } },
    });
  });

  it('returns the stable validation error shape for invalid request input', async () => {
    const response = await app.getHttpAdapter().getInstance().inject({
      method: 'POST',
      url: '/api/contract',
      payload: {},
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
      },
    });
    expect(response.json().error.requestId).toBeTruthy();
  });
});

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // ✅ Habilita CORS permitindo qualquer origem
  app.enableCors({
    origin: 'http://localhost:4200', // ou '*' para todas as origens (não recomendado para produção)
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();

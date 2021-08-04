import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { ValidationError } from "class-validator";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    exceptionFactory: (validationErrors: ValidationError[] = []) => {
      return new BadRequestException({ success: false, errors: validationErrors.map((error => {
        return {property: error.property, constraints: error.constraints}})) });
    },
  }))
  app.enableCors()
  await app.listen(3000);
}
bootstrap();

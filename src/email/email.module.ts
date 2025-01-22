import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { ConfigModule } from '@nestjs/config';
import { OpenAIService } from 'src/openai/openai.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [EmailController],
  providers: [EmailService, OpenAIService],
})
export class EmailModule {}

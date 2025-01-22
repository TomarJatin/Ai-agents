import { Module } from '@nestjs/common';
import { DocsService } from './document.service';
import { DocsController } from './document.controller';
import { ConfigModule } from '@nestjs/config';
import { OpenAIModule } from '../openai/openai.module';

@Module({
  imports: [ConfigModule.forRoot(), OpenAIModule],
  controllers: [DocsController],
  providers: [DocsService],
})
export class DocsModule {}

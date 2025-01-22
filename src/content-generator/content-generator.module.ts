import { Module } from '@nestjs/common';
import { ContentGeneratorService } from './content-generator.service';
import { ContentGeneratorController } from './content-generator.controller';
import { ResearchAgentModule } from '../research-agent/research-agent.module';
import { OpenAIService } from '../openai/openai.service';
import { ResearchAgentService } from 'src/research-agent/research-agent.service';

@Module({
  imports: [ResearchAgentModule],
  controllers: [ContentGeneratorController],
  providers: [ContentGeneratorService, OpenAIService, ResearchAgentService],
  exports: [ContentGeneratorService],
})
export class ContentGeneratorModule {}

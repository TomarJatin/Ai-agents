import { Module } from '@nestjs/common';
import { ResearchAgentService } from './research-agent.service';
import { ResearchAgentController } from './research-agent.controller';
import { OpenAIService } from '../openai/openai.service';

@Module({
  controllers: [ResearchAgentController],
  providers: [ResearchAgentService, OpenAIService],
  exports: [ResearchAgentService],
})
export class ResearchAgentModule {}

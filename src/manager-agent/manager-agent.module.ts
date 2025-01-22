import { Module } from '@nestjs/common';
import { ManagerAgentService } from './manager-agent.service';
import { OpenAIModule } from '../openai/openai.module';
import { ResearchAgentModule } from '../research-agent/research-agent.module';
import { ContentGeneratorModule } from '../content-generator/content-generator.module';
import { EmailModule } from '../email/email.module';
import { DocsModule } from '../documents/document.module';
import { EmailService } from 'src/email/email.service';
import { ContentGeneratorService } from 'src/content-generator/content-generator.service';
import { DocsService } from 'src/documents/document.service';

@Module({
  imports: [
    OpenAIModule,
    ResearchAgentModule,
    ContentGeneratorModule,
    EmailModule,
    DocsModule,
  ],
  providers: [
    ManagerAgentService,
    EmailService,
    DocsService,
    ContentGeneratorService,
  ],
  exports: [ManagerAgentService],
})
export class ManagerAgentModule {}

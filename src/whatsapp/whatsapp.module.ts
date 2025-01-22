import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { OpenAIModule } from 'src/openai/openai.module';
import { ExecutiveDirectorService } from 'src/manager-agent/manager-agent.service';
import { OpenAIService } from 'src/openai/openai.service';
import { ResearchAgentService } from 'src/research-agent/research-agent.service';
import { EmailService } from 'src/email/email.service';
import { DocsService } from 'src/documents/document.service';
import { ContentGeneratorService } from 'src/content-generator/content-generator.service';

@Module({
  providers: [
    WhatsappService,
    OpenAIModule,
    ExecutiveDirectorService,
    OpenAIService,
    ResearchAgentService,
    EmailService,
    DocsService,
    ContentGeneratorService,
  ],
})
export class WhatsappModule {}

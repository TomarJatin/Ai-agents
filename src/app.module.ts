import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { OpenAIModule } from './openai/openai.module';
import { EmailModule } from './email/email.module';
import { DocsModule } from './documents/document.module';
import { ResearchAgentModule } from './research-agent/research-agent.module';
import { ContentGeneratorModule } from './content-generator/content-generator.module';
import { ManagerAgentModule } from './manager-agent/manager-agent.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    WhatsappModule,
    OpenAIModule,
    EmailModule,
    DocsModule,
    ContentGeneratorModule,
    ResearchAgentModule,
    ManagerAgentModule,
  ],
})
export class AppModule {}

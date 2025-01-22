import { Injectable, OnModuleInit } from '@nestjs/common';
import { create, Client, Message } from '@open-wa/wa-automate';
import { ConfigService } from '@nestjs/config';
import { OpenAIService } from '../openai/openai.service';
import { ExecutiveDirectorService } from '../manager-agent/manager-agent.service';

@Injectable()
export class WhatsappService implements OnModuleInit {
  private client: Client;
  private ownerNumber: string;

  constructor(
    private configService: ConfigService,
    private openaiService: OpenAIService,
    private ExecutiveDirectorService: ExecutiveDirectorService,
  ) {
    this.ownerNumber = this.configService.get<string>('WHATSAPP_OWNER_NUMBER');
  }

  async onModuleInit() {
    this.client = await create({
      sessionId: 'AI_AGENT',
      multiDevice: true,
      authTimeout: 60,
      blockCrashLogs: true,
      disableSpins: true,
      headless: true,
      logConsole: false,
      popup: true,
      qrTimeout: 0,
      port: 7001,
      eventMode: true,
    });

    this.client.onAnyMessage(async (message: Message) => {
      await this.handleMessage(message);
    });
  }

  private async handleMessage(message: Message) {
    // Process all messages from or to owner number

    // if (!isFromOwner && !isToOwner) {
    //   return;
    // }
    if (!message.from.includes('918527179469')) {
      return;
    }

    console.log('Received message:', {
      from: message.from,
      to: message.to,
      body: message.body,
      fromMe: message.fromMe,
    });

    try {
      let inputText: string;

      // Handle voice messages
      if (message.mimetype && message.mimetype.includes('audio')) {
        const mediaData = await this.client.decryptMedia(message);
        const base64Data = `data:${message.mimetype};base64,${mediaData.toString()}`;
        inputText = await this.openaiService.transcribeAudio(base64Data);
      } else {
        // Handle text messages
        inputText = message.body;
      }

      // Get response from Manager Agent
      const response =
        await this.ExecutiveDirectorService.processInput(inputText);

      // Send response back
      await this.client.sendText(message.from, response);
    } catch (error) {
      console.error('Error processing message:', error);
      await this.client.sendText(
        message.from,
        'Sorry, there was an error processing your message.',
      );
    }
  }
}

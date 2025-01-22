import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class OpenAIService {
  private azureOpenAI: OpenAI;
  private azureWhisperOpenAI: OpenAI; // Changed from standardOpenAI

  constructor(private configService: ConfigService) {
    // Azure OpenAI client for chat completions
    this.azureOpenAI = new OpenAI({
      apiKey: this.configService.get<string>('AZURE_API_KEY'),
      baseURL: `${this.configService.get<string>('AZURE_ENDPOINT')}/openai/deployments/${this.configService.get<string>('AZURE_DEPLOYMENT')}`,
      defaultQuery: {
        'api-version': this.configService.get<string>('AZURE_API_VERSION'),
      },
      defaultHeaders: {
        'api-key': this.configService.get<string>('AZURE_API_KEY'),
      },
    });

    // Update Whisper client to use Azure credentials
    this.azureWhisperOpenAI = new OpenAI({
      apiKey: this.configService.get<string>('AZURE_WHISPER_API_KEY'),
      baseURL: `${this.configService.get<string>('AZURE_WHISPER_ENDPOINT')}/openai/deployments/${this.configService.get<string>('AZURE_WHISPER_DEPLOYMENT')}`,
      defaultQuery: {
        'api-version': this.configService.get<string>(
          'AZURE_WHISPER_API_VERSION',
        ),
      },
      defaultHeaders: {
        'api-key': this.configService.get<string>('AZURE_WHISPER_API_KEY'),
      },
    });
  }

  async transcribeAudio(audioData: string): Promise<string> {
    try {
      // Convert base64 to buffer
      const buffer = Buffer.from(audioData.split(',')[1], 'base64');

      // Create temporary file
      const tempFilePath = path.join(
        __dirname,
        '../../temp',
        `audio-${Date.now()}.ogg`,
      );
      await fs.promises.mkdir(path.dirname(tempFilePath), { recursive: true });
      await fs.promises.writeFile(tempFilePath, buffer);

      // Create file object for OpenAI
      const file = await fs.promises.readFile(tempFilePath);

      // Update the transcription call to use azureWhisperOpenAI
      const response =
        await this.azureWhisperOpenAI.audio.transcriptions.create({
          file: new File([file], 'audio.ogg', { type: 'audio/ogg' }),
          model: this.configService.get<string>('AZURE_WHISPER_DEPLOYMENT'),
        });

      // Clean up temporary file
      await fs.promises.unlink(tempFilePath);

      return response.text;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw error;
    }
  }

  async getCompletion(input: string): Promise<string> {
    const completion = await this.azureOpenAI.chat.completions.create({
      messages: [{ role: 'user', content: input }],
      model: this.configService.get<string>('AZURE_DEPLOYMENT'),
    });

    return completion.choices[0].message.content;
  }

  async generateEmbeddings(text: string) {
    const response = await this.azureOpenAI.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });
    return response.data[0].embedding;
  }

  async generateImage(prompt: string) {
    const response = await this.azureOpenAI.images.generate({
      model: 'dall-e-3',
      prompt,
      response_format: 'url',
      size: '1024x1024',
    });
    return response.data[0].url;
  }
}

import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { OpenAIService } from '../openai/openai.service';

@Injectable()
export class EmailService {
  private oauth2Client: OAuth2Client;
  private gmail: any;

  constructor(private openAIService: OpenAIService) {
    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );

    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  async generateEmbeddings(text: string) {
    return this.openAIService.generateEmbeddings(text);
  }

  async queryEmails(query: string) {
    // Get recent emails
    const emails = await this.gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread',
    });

    // Create context from emails
    const context = await Promise.all(
      emails.data.messages.map(async (message: any) => {
        const email = await this.gmail.users.messages.get({
          userId: 'me',
          id: message.id,
        });
        return email.data.snippet;
      }),
    );

    // Generate embeddings for context and query
    const contextEmbeddings = await Promise.all(
      context.map((text) => this.generateEmbeddings(text)),
    );
    const queryEmbedding = await this.generateEmbeddings(query);

    // Find relevant context using cosine similarity
    const relevantContext = this.findRelevantContext(
      queryEmbedding,
      contextEmbeddings,
      context,
    );

    // Generate response using OpenAI
    const response = await this.openAIService.getCompletion(
      `Context: ${relevantContext.join('\n\n')}\n\nQuestion: ${query}`,
    );

    return response;
  }

  async composeEmail(prompt: string) {
    return this.openAIService.getCompletion(prompt);
  }

  private findRelevantContext(
    queryEmbedding: number[],
    contextEmbeddings: number[][],
    context: string[],
  ) {
    // Calculate cosine similarity
    const similarities = contextEmbeddings.map((embedding) =>
      this.cosineSimilarity(queryEmbedding, embedding),
    );

    // Get top 3 most relevant contexts
    const topContextIndices = this.getTopK(similarities, 3);
    return topContextIndices.map((index) => context[index]);
  }

  private cosineSimilarity(a: number[], b: number[]) {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  private getTopK(arr: number[], k: number) {
    return arr
      .map((value, index) => ({ value, index }))
      .sort((a, b) => b.value - a.value)
      .slice(0, k)
      .map(({ index }) => index);
  }
}

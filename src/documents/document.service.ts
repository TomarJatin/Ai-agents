import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { OpenAIService } from '../openai/openai.service';

@Injectable()
export class DocsService {
  private oauth2Client: OAuth2Client;
  private drive: any;
  private docs: any;

  constructor(private openAIService: OpenAIService) {
    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );

    this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
    this.docs = google.docs({ version: 'v1', auth: this.oauth2Client });
  }

  async searchDocuments(query: string) {
    // Get all documents
    const response = await this.drive.files.list({
      q: "mimeType='application/vnd.google-apps.document'",
      fields: 'files(id, name)',
    });

    const documents = response.data.files;
    const results = [];

    // Process each document
    for (const doc of documents) {
      const content = await this.getDocumentContent(doc.id);
      const embedding = await this.generateEmbeddings(content);
      const queryEmbedding = await this.generateEmbeddings(query);

      const similarity = this.cosineSimilarity(queryEmbedding, embedding);

      if (similarity > 0.7) {
        // Threshold for relevance
        results.push({
          id: doc.id,
          name: doc.name,
          similarity,
          preview: content.substring(0, 200) + '...',
        });
      }
    }

    return results.sort((a, b) => b.similarity - a.similarity);
  }

  async createDocument(prompt: string) {
    // Generate content using OpenAI
    const content = await this.openAIService.getCompletion(prompt);

    // Create new document
    const document = await this.docs.documents.create({
      requestBody: {
        title: this.generateTitle(prompt),
      },
    });

    // Update document content
    await this.docs.documents.batchUpdate({
      documentId: document.data.documentId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: {
                index: 1,
              },
              text: content,
            },
          },
        ],
      },
    });

    return {
      documentId: document.data.documentId,
      content,
    };
  }

  async updateDocument(documentId: string, prompt: string) {
    // Generate content using OpenAI
    const content = await this.openAIService.getCompletion(prompt);

    // Update document content
    await this.docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: {
                index: 1,
              },
              text: content,
            },
          },
        ],
      },
    });

    return {
      documentId,
      content,
    };
  }

  async createDrawing(prompt: string) {
    // Generate image using OpenAI
    const imageUrl = await this.openAIService.generateImage(prompt);

    // Create new document with image
    const document = await this.docs.documents.create({
      requestBody: {
        title: this.generateTitle(prompt),
      },
    });

    // Insert image into document
    await this.docs.documents.batchUpdate({
      documentId: document.data.documentId,
      requestBody: {
        requests: [
          {
            insertInlineImage: {
              location: {
                index: 1,
              },
              uri: imageUrl,
            },
          },
        ],
      },
    });

    return {
      documentId: document.data.documentId,
      imageUrl,
    };
  }

  private async getDocumentContent(documentId: string) {
    const document = await this.docs.documents.get({
      documentId,
    });

    return document.data.body.content
      .map(
        (item: any) =>
          item.paragraph?.elements
            ?.map((element: any) => element.textRun?.content || '')
            .join('') || '',
      )
      .join('');
  }

  private async generateEmbeddings(text: string) {
    return await this.openAIService.generateEmbeddings(text);
  }

  private cosineSimilarity(a: number[], b: number[]) {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  private generateTitle(prompt: string) {
    console.log(prompt);
    return `Generated Document - ${new Date().toLocaleDateString()}`;
  }
}

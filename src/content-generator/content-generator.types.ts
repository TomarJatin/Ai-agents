export enum ContentType {
  TEXT = 'text',
  IMAGE = 'image',
  TEXT_AND_IMAGE = 'text_and_image',
}

export interface ContentGenerationRequest {
  topic: string;
  contentType: ContentType;
  tone?: string;
  targetAudience?: string;
  additionalContext?: string;
}

export interface GeneratedContent {
  text?: string;
  imageUrl?: string;
  sourceReferences?: string[];
}

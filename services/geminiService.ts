import { WritingTaskAnalysis } from "../types";

/**
 * Analyzes the user's input (text or image) to understand the writing task.
 * Calls the backend API to protect the API Key.
 */
export const analyzeWritingTask = async (
  textInput: string,
  imageInput?: string,
  imageMimeType?: string
): Promise<WritingTaskAnalysis> => {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'analyze',
      textInput,
      imageInput,
      imageMimeType,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to analyze writing task');
  }

  return await response.json();
};

/**
 * Generates a Mind Map Image using Nano Banana Pro.
 * Calls the backend API.
 */
export const generateMindMapImage = async (
  analysis: WritingTaskAnalysis,
  type: 'basic' | 'advanced'
): Promise<string> => {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'generate_image',
      analysis,
      type,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate image');
  }

  const data = await response.json();
  return data.imageUrl;
};

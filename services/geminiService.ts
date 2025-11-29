import { GoogleGenAI, Type } from "@google/genai";
import { WritingTaskAnalysis } from "../types";

// Helper to get a fresh client instance. 
// This is crucial because the API_KEY might change or be set after the app loads.
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes the user's input (text or image) to understand the writing task.
 * Uses Gemini 3 Pro Preview for deep reasoning.
 */
export const analyzeWritingTask = async (
  textInput: string,
  imageInput?: string,
  imageMimeType?: string
): Promise<WritingTaskAnalysis> => {
  
  const ai = getAiClient();
  const model = "gemini-3-pro-preview";
  
  const parts: any[] = [];
  
  if (imageInput && imageMimeType) {
    parts.push({
      inlineData: {
        data: imageInput,
        mimeType: imageMimeType
      }
    });
    parts.push({ text: "请分析这张图片中的写作要求。" });
  }
  
  if (textInput) {
    parts.push({ text: `写作要求/题目：${textInput}` });
  }

  const prompt = `
    你是一位资深的小学语文老师。请分析上述的写作要求。
    你需要提取以下信息，用于指导孩子写作：
    1. 核心主题 (Topic)
    2. 写作结构 (Structure - e.g., 开头, 中间, 结尾)
    3. 适合该主题的好词 (Keywords - 5-8个)
    4. 适合该主题的优美示范句 (Sentences - 3-4句)
    5. 整体基调 (Tone - e.g., 欢快, 温馨, 想象力丰富)

    请以 JSON 格式返回。
  `;
  
  parts.push({ text: prompt });

  const response = await ai.models.generateContent({
    model: model,
    contents: { parts: parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          structure: { type: Type.ARRAY, items: { type: Type.STRING } },
          keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          sentences: { type: Type.ARRAY, items: { type: Type.STRING } },
          tone: { type: Type.STRING }
        },
        required: ["topic", "structure", "keywords", "sentences", "tone"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No analysis generated");
  
  return JSON.parse(text) as WritingTaskAnalysis;
};

/**
 * Generates a Mind Map Image using Nano Banana Pro (gemini-3-pro-image-preview).
 */
export const generateMindMapImage = async (
  analysis: WritingTaskAnalysis,
  type: 'basic' | 'advanced'
): Promise<string> => {
  // Use gemini-3-pro-image-preview for high quality images as requested
  const ai = getAiClient();
  const model = "gemini-3-pro-image-preview";

  let prompt = "";
  
  const commonStyle = "Style: High quality, colorful, cute hand-drawn illustration style, white background, educational poster design. Clear layout. Fun and engaging for children.";

  if (type === 'basic') {
    prompt = `
      Create a cute, colorful mind map image for a children's writing task about "${analysis.topic}".
      Central text: "${analysis.topic}" in large Chinese characters.
      Draw visual branches showing the structure: ${analysis.structure.join(", ")}.
      Decorate with simple icons related to ${analysis.topic}.
      Include these keywords visually around the branches in Chinese: ${analysis.keywords.slice(0, 5).join(", ")}.
      ${commonStyle} Simple and clean.
    `;
  } else {
    prompt = `
      Create a detailed, advanced mind map image for a children's writing task about "${analysis.topic}".
      Central text: "${analysis.topic}" in large Chinese characters.
      Visual sections/branches for structure: ${analysis.structure.join(" -> ")}.
      Include bubble text boxes containing these sentences in Chinese:
      ${analysis.sentences.join("; ")}.
      Make the text legible and clear.
      ${commonStyle} Rich details, professional layout, vibrant colors.
    `;
  }

  const response = await ai.models.generateContent({
    model: model,
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: "4:3", // Good for documents/maps
        imageSize: "2K",   // High resolution
      }
    }
  });

  // Extract image
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image generated");
};
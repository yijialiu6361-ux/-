import { GoogleGenAI, Type } from "@google/genai";

// NOTE: This file is designed to run in a Node.js environment (like Vercel Serverless Functions).
// Ensure process.env.API_KEY is set in your deployment environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export default async function handler(req: Request) {
  // Handle CORS Preflight if necessary (mostly for local dev proxies)
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), { 
        status: 405,
        headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'analyze') {
      const { textInput, imageInput, imageMimeType } = body;
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
      
      // Parse to ensure valid JSON before sending back
      const jsonResponse = JSON.parse(text);

      return new Response(JSON.stringify(jsonResponse), {
        headers: { 'Content-Type': 'application/json' }
      });

    } else if (action === 'generate_image') {
      const { analysis, type } = body;
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
            aspectRatio: "4:3",
            imageSize: "2K", 
          }
        }
      });

      let imageUrl = "";
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (!imageUrl) throw new Error("No image generated");

      return new Response(JSON.stringify({ imageUrl }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
    });
  }
}

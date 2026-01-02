import { GoogleGenAI } from "@google/genai";
import { ExtractedContent } from "../types";

// Helper to convert file to Base64
const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const processImageWithGemini = async (file: File): Promise<ExtractedContent> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key not found in environment variables");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Using gemini-3-pro-preview for advanced STEM reasoning and OCR capabilities
    // as per guidelines for "Complex Text Tasks (e.g. math, STEM)"
    const modelId = "gemini-3-pro-preview";

    const base64Data = await fileToGenerativePart(file);

    const prompt = `
      You are an advanced OCR engine specialized in scientific documents. 
      Analyze the provided image and extract all text content.
      
      CRITICAL RULES:
      1. Identify all mathematical equations and chemical formulas.
      2. Convert them strictly into standard LaTeX format.
      3. Use '$' delimiters for inline math (e.g., $E=mc^2$).
      4. Use '$$' delimiters for block/display math.
      5. Preserve the structure of the document (headings, lists, paragraphs) using Markdown.
      6. If there are tables, represent them as Markdown tables.
      7. Do not wrap the entire output in a markdown code block (like \`\`\`markdown). Return raw markdown content.
      8. If text is illegible, mark it as [unreadable].
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data
            }
          },
          {
            text: prompt
          }
        ]
      }
    });

    const text = response.text || "";

    return {
      rawText: text,
      markdown: text
    };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
};
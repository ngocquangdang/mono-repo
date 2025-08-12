import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

export const solveCaptcha = async (
  base64Image: string,
  mimeType: string
): Promise<string> => {
  if (!process.env.GOOGLE_GENAI_API_KEY) {
    throw new Error("GOOGLE_GENAI_API_KEY environment variable not set.");
  }

  try {
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType,
      },
    };
    const textPart = {
      text: "Analyze this image, which is a captcha. Extract the exact text from it. The text might be distorted, contain noise, or use unusual fonts. Your response should consist only of the characters you identify in the image, with no additional explanations, introductions, or formatting.",
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        // Optimize for speed by disabling thinking. Ideal for direct OCR tasks.
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("Error solving captcha with Gemini:", error);
    throw new Error(
      "The AI model failed to process the captcha image. Check your API key and network connection."
    );
  }
};

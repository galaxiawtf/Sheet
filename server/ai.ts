import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

function getAi() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set. Please set your Gemini API Key in the environment variables.");
    }
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return ai;
}

export async function askGemini(prompt: string): Promise<string> {
  try {
    const client = getAi();
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert web development assistant. You provide correct code snippets and explanations for HTML, CSS, and JavaScript. Keep your answers concise, accurate, and provide code blocks when requested.",
      },
    });
    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    let errorMessage = "An unexpected error occurred.";
    
    // Try to parse the API error message if it's a JSON string
    try {
      if (error.message) {
        const parsed = JSON.parse(error.message);
        if (parsed.error && parsed.error.message) {
          errorMessage = parsed.error.message;
        } else {
          errorMessage = error.message;
        }
      }
    } catch {
      errorMessage = error.message || errorMessage;
    }
    
    throw new Error(`AI Assistant Error: ${errorMessage}`);
  }
}

import { GoogleGenAI, Chat } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `You are AURA, a helpful and friendly AI companion. Your goal is to be encouraging, curious, and engaging. 
You should address the user in a warm and positive manner.
Your responses should be natural, conversational, and easy to understand.
Feel free to be expressive, but avoid using markdown or emojis. 
Keep your answers helpful and relatively concise, typically a few sentences long.
Always respond in the same language as the user's query.`;

export function createChatSession(): Chat {
    const chat: Chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.8,
            topP: 0.9,
        },
    });
    return chat;
}
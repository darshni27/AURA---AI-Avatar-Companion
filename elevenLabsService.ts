// Fix: Correctly read the ElevenLabs API key from environment variables instead of using a hardcoded value.
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

if (!ELEVENLABS_API_KEY) {
    console.warn("ELEVENLABS_API_KEY environment variable not set. Falling back to browser TTS.");
}

export const ELEVENLABS_VOICES = [
    { id: 'x3gYeuNB0kLLYxOZsaSh', name: 'AURA (Default)' },
    { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam (Deep)' },
    { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel (Calm)' },
    { id: 'yD0Zg2jxgfQLY8I2MEHO', name: 'Arnold (Narrator)' },
    { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel (British)' },
    { id: 'LcfcDJNUP1GQjkzn1xUU', name: 'Emily (Pleasant)' },
    { id: 'jsCqWAovK2LkecY7zXl4', name: 'Freya (Friendly)' },
    { id: 'pMsXgVXv3BLzUgSXRplE', name: 'Serena (Expressive)' },
];

export async function textToSpeech(text: string, voiceId: string): Promise<Blob> {
    if (!ELEVENLABS_API_KEY) {
        throw new Error("ElevenLabs API key not configured.");
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
            text: text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
            },
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("ElevenLabs API Error:", errorBody);
        throw new Error("ElevenLabs API request failed");
    }

    const audioBlob = await response.blob();
    return audioBlob;
}
import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

export async function enrichBusinessWithGemini(
  businessName: string,
  city: string,
): Promise<{ phone_numbers: string[]; social_media_urls: string[]; google_maps_url: string | null }> {
  if (!businessName) {
    return { phone_numbers: [], social_media_urls: [], google_maps_url: null };
  }

  const prompt = `Search the web for the real Iraqi business "${businessName}" in ${city}, Iraq. Return ONLY valid JSON with phone_numbers, social_media_urls, google_maps_url.`;

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const text = response.text ?? '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { phone_numbers: [], social_media_urls: [], google_maps_url: null };

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      phone_numbers: Array.isArray(parsed.phone_numbers) ? parsed.phone_numbers : [],
      social_media_urls: Array.isArray(parsed.social_media_urls) ? parsed.social_media_urls : [],
      google_maps_url: typeof parsed.google_maps_url === 'string' ? parsed.google_maps_url : null,
    };
  } catch {
    return { phone_numbers: [], social_media_urls: [], google_maps_url: null };
  }
}

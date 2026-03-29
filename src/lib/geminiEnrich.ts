import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

export async function enrichBusinessWithGemini(
  businessName: string,
  city: string
): Promise<{ phone_numbers: string[]; social_media_urls: string[]; google_maps_url: string | null }> {
  if (!businessName) {
    return { phone_numbers: [], social_media_urls: [], google_maps_url: null };
  }

  const prompt = `
    Search the web for the real Iraqi business "${businessName}" in ${city}, Iraq.
    Return ONLY valid JSON:
    {
      "phone_numbers": ["phone numbers"],
      "social_media_urls": ["Facebook URL", "Instagram URL"],
      "google_maps_url": "full URL or null"
    }
  `;

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2 },
      tools: [{ googleSearch: {} }],
    });

    const text = result.response.text();
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

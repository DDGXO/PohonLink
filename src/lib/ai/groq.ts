/**
 * Groq AI Client & Utilities for Pohonlink
 * Using llama-3.3-70b-versatile for high quality copy generation and insights.
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

function getGroqApiKey(): string {
  return process.env.GROQ_API_KEY || '';
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function callGroqChat(messages: ChatMessage[], temperature = 0.7, max_tokens = 600): Promise<string | null> {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new Error('GROQ_API_KEY tidak terkonfigurasi di server');
  }

  try {
    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature,
        max_tokens,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Groq API Error:', errorText);
      return null;
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.error('Groq fetch error:', err);
    return null;
  }
}

/**
 * Generate 3 catchy bio options based on user prompt / niche
 */
export async function generateBioOptions(prompt: string, tone = 'modern & engaging'): Promise<string[]> {
  const systemPrompt = `Kamu adalah copywriter profesional untuk platform biolink Pohonlink. 
Tugasmu adalah membuat 3 opsi Bio singkat (maksimal 150 karakter per opsi) dalam Bahasa Indonesia.
Nada: ${tone}.
Format output HARUS persis seperti JSON array string: ["opsi 1", "opsi 2", "opsi 3"]. Jangan tambahkan teks lain.`;

  const userPrompt = `Buatkan 3 opsi bio profil untuk: "${prompt}"`;

  const response = await callGroqChat([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ], 0.7, 300);

  if (!response) return [];

  try {
    const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    if (Array.isArray(parsed)) return parsed.slice(0, 3);
  } catch {
    // fallback split by line
    return response.split('\n').filter(l => l.trim().length > 0).slice(0, 3);
  }
  return [];
}

/**
 * Generate title and subtitle for a link
 */
export async function generateLinkCopyOptions(input: string): Promise<{ title: string; subtitle: string; cta: string } | null> {
  const systemPrompt = `Kamu adalah ahli optimasi conversion rate dan copywriter biolink.
Buatkan judul link yang menarik, subtitle penjelas yang persuasif, dan teks tombol CTA.
Format output JSON:
{
  "title": "Judul Link Menarik",
  "subtitle": "Subtitle penjelasan singkat yang memikat",
  "cta": "Teks Tombol (misal: Beli Sekarang / Lihat Portofolio)"
}
Hanya berikan output JSON tanpa komentar lain.`;

  const response = await callGroqChat([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Buatkan copy link untuk konten/produk berikut: "${input}"` },
  ], 0.6, 250);

  if (!response) return null;

  try {
    const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch {
    return null;
  }
}

/**
 * Generate actionable AI recommendations based on link analytics
 */
export async function generateAnalyticsInsights(stats: {
  totalViews: number;
  totalClicks: number;
  ctr: number;
  topLinks: { title: string; clicks: number }[];
}): Promise<string> {
  const systemPrompt = `Kamu adalah analis pertumbuhan dan konversi digital untuk pengguna Pohonlink.
Berikan 3 poin rekomendasi taktis singkat (bullet points) dalam Bahasa Indonesia berdasarkan data analitik profil.
Gunakan format markdown yang rapi, padat, dan langsung to the point.`;

  const userPrompt = `Data Analitik Akun:
- Total Views: ${stats.totalViews}
- Total Clicks: ${stats.totalClicks}
- Rata-rata CTR: ${stats.ctr.toFixed(1)}%
- Performa Link:
${stats.topLinks.map((l, i) => `  ${i + 1}. "${l.title}": ${l.clicks} klik`).join('\n')}

Berikan analisis singkat dan 3 rekomendasi langkah selanjutnya untuk menaikkan rasio klik.`;

  const response = await callGroqChat([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ], 0.7, 450);

  return response || 'Analitik akun Anda stabil. Pertahankan konsistensi pembagian link di media sosial.';
}

/**
 * Generate Auto-DM Templates for Instagram & TikTok
 */
export async function generateAutoDmTemplates(keyword: string, linkUrl: string, topic?: string): Promise<{
  directReply: string;
  commentPrompt: string;
  storyCaption: string;
}> {
  const systemPrompt = `Kamu adalah spesialis otomasi media sosial (ManyChat/Instagram Auto-DM/TikTok Auto-Reply).
Buatkan template pesan balasan otomatis yang ramah, profesional, dan siap pakai saat audiens mengetik keyword tertentu.
Format output JSON:
{
  "directReply": "Isi pesan DM otomatis yang ramah menyertakan link",
  "commentPrompt": "Template ajakan komentar di caption postingan",
  "storyCaption": "Template ajakan interaksi di Instagram/TikTok Story"
}
Hanya berikan output JSON tanpa komentar lain.`;

  const userPrompt = `Keyword pemicu: "${keyword}"
Link target: "${linkUrl}"
Topik/Konteks: "${topic || 'Tautan penting'}"`;

  const response = await callGroqChat([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ], 0.7, 350);

  if (!response) {
    return {
      directReply: `Halo! Ini tautan yang kamu minta: ${linkUrl} 🎉 Terima kasih sudah berkunjung!`,
      commentPrompt: `Ketik "${keyword}" di kolom komentar untuk mendapatkan tautan lengkap via DM langsung! 🚀`,
      storyCaption: `Balas story ini dengan "${keyword}" dan bot kami akan langsung kirimkan link ke DM kamu! 🌿`,
    };
  }

  try {
    const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch {
    return {
      directReply: `Halo! Ini tautan yang kamu minta: ${linkUrl} 🎉`,
      commentPrompt: `Ketik "${keyword}" di kolom komentar untuk mendapatkan linknya!`,
      storyCaption: `Balas story dengan "${keyword}" untuk link instan!`,
    };
  }
}

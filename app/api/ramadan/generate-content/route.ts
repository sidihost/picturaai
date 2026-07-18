export async function POST(req: Request) {
  try {
    const { type, context } = await req.json()

    const apiKey = process.env.MISTRAL_API_KEY
    if (!apiKey) {
      return Response.json({ error: 'Mistral API key not configured' }, { status: 500 })
    }

    const systemPrompts: Record<string, string> = {
      greeting: `You are an expert in Islamic culture and Ramadan traditions. Generate a beautiful, heartfelt Ramadan greeting message. It should be warm, spiritual, and suitable for a greeting card. Keep it to 2-3 sentences. If context is provided, personalize the greeting. Return ONLY the greeting text, nothing else. Do not use markdown.`,
      quran: `You are a knowledgeable Islamic scholar. Provide a beautiful and well-known Quran verse that is relevant to Ramadan, fasting, prayer, gratitude, or mercy. Include the Surah name and verse number. Format as: "verse text" - Surah Name (Chapter:Verse). Return ONLY the formatted verse, nothing else. Do not use markdown. Pick a different verse each time.`,
      hadith: `You are a knowledgeable Islamic scholar. Provide an authentic and well-known Hadith related to Ramadan, fasting, charity, or prayer. Include the source (e.g., Sahih Bukhari, Sahih Muslim). Format as: "hadith text" - Source. Return ONLY the formatted hadith, nothing else. Do not use markdown. Pick a different hadith each time.`,
      dua: `You are a knowledgeable Islamic scholar. Provide a beautiful dua (supplication) related to Ramadan, breaking fast (iftar), or seeking forgiveness. Include the Arabic transliteration if well-known, followed by the English translation. Keep it concise. Return ONLY the dua text, nothing else. Do not use markdown.`,
      custom: `You are an expert in Islamic culture and Ramadan traditions. The user wants to create custom text for a Ramadan greeting card. Based on their input, generate beautiful, eloquent card text that is spiritual and warm. Keep it to 2-4 sentences. Return ONLY the card text, nothing else. Do not use markdown.`,
    }

    const systemPrompt = systemPrompts[type] || systemPrompts.greeting

    const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: context || `Generate a ${type} for Ramadan` },
        ],
        max_tokens: 400,
        temperature: 0.9,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Mistral API error:', err)
      return Response.json({ error: 'Failed to generate content' }, { status: 502 })
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content?.trim()

    if (!content) {
      return Response.json({ error: 'No response from Mistral' }, { status: 502 })
    }

    return Response.json({ content })
  } catch (error) {
    console.error('Ramadan content generation error:', error)
    return Response.json({ error: 'Failed to generate content' }, { status: 500 })
  }
}

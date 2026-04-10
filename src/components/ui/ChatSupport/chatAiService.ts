import type { StoryContext } from './chatSupportTypes'
import { SYSTEM_PROMPT } from './chatSupportConstants'

interface AiResponse {
  content: string
  error?: string
}

export async function callAi(
  userMessage: string,
  storyContext: StoryContext | null,
  apiKey: string,
  provider: 'openai' | 'gemini' = 'openai',
): Promise<AiResponse> {
  const contextNote = storyContext
    ? `\n\n現在ユーザーが見ているストーリー: ${storyContext.title} / ${storyContext.name}\n説明: ${storyContext.description || 'なし'}`
    : ''

  const systemMessage = SYSTEM_PROMPT + contextNote

  try {
    if (provider === 'gemini') {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemMessage }] },
            contents: [{ role: 'user', parts: [{ text: userMessage }] }],
          }),
        },
      )
      const data = await res.json()
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (!text) return { content: '', error: 'AI応答を取得できませんでした' }
      return { content: text }
    }

    // OpenAI
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-5.4-nano',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage },
        ],
        max_completion_tokens: 1024,
      }),
    })
    const data = await res.json()
    const text = data?.choices?.[0]?.message?.content
    if (!text) return { content: '', error: 'AI応答を取得できませんでした' }
    return { content: text }
  } catch (e) {
    return { content: '', error: `API呼び出しエラー: ${(e as Error).message}` }
  }
}

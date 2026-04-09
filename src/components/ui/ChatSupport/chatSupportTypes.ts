export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  source?: 'faq' | 'guide' | 'ai'
  timestamp: number
}

export interface StoryContext {
  title: string
  name: string
  description?: string
}

export interface FaqEntry {
  keywords: string[]
  question: string
  answer: string
}

export interface StoryGuide {
  title: string
  tips: string[]
  codeRef?: string
  relatedStories?: string[]
}

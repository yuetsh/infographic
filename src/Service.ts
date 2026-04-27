import OpenAI from "openai"
import { SYSTEM_PROMPT } from "./Prompt"

const MODEL = "deepseek-v4-flash"

export interface StreamGenerateContentOptions {
  prompt: string
  onChunk: (chunk: string) => void
  onComplete?: (fullContent: string) => void
  onError?: (error: Error) => void
}

export class AIServiceError extends Error {
  statusCode?: number

  constructor(message: string, statusCode?: number) {
    super(message)
    this.name = "AIServiceError"
    this.statusCode = statusCode
  }
}

export async function streamGenerateContent(
  options: StreamGenerateContentOptions,
): Promise<void> {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY
  if (!apiKey) {
    throw new AIServiceError("请配置 VITE_DEEPSEEK_API_KEY 环境变量")
  }

  const client = new OpenAI({
    apiKey,
    baseURL: "https://api.deepseek.com",
    dangerouslyAllowBrowser: true,
  })

  try {
    const stream = await client.chat.completions.stream({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: options.prompt },
      ],
    })

    let fullContent = ""

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content ?? ""
      if (delta) {
        fullContent += delta
        options.onChunk(delta)
      }
    }

    options.onComplete?.(fullContent)
  } catch (error) {
    const serviceError =
      error instanceof AIServiceError
        ? error
        : new AIServiceError(
            error instanceof Error ? error.message : "发送消息失败，请稍后重试",
          )
    options.onError?.(serviceError)
    throw serviceError
  }
}

import { SYSTEM_PROMPT } from "./Prompt"

const API_URL = "https://api.deepseek.com/chat/completions"
const MODEL = "deepseek-chat"
const TEMPERATURE = 0.7

export interface GenerateContentOptions {
  prompt: string
}

export interface GenerateContentResult {
  content: string
}

export class AIServiceError extends Error {
  statusCode?: number

  constructor(message: string, statusCode?: number) {
    super(message)
    this.name = "AIServiceError"
    this.statusCode = statusCode
  }
}

/**
 * 生成内容
 * @param options 生成选项
 * @returns 生成的内容
 * @throws {AIServiceError} 当 API 调用失败时抛出
 */
export async function generateContent(
  options: GenerateContentOptions,
): Promise<GenerateContentResult> {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY
  if (!apiKey) {
    throw new AIServiceError("请配置 VITE_DEEPSEEK_API_KEY 环境变量")
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: options.prompt,
          },
        ],
        temperature: TEMPERATURE,
        stream: false,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new AIServiceError(
        errorData.error?.message || `HTTP error! status: ${response.status}`,
        response.status,
      )
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ""

    if (!content) {
      throw new AIServiceError("未收到有效响应")
    }

    return { content }
  } catch (error) {
    if (error instanceof AIServiceError) {
      throw error
    }
    throw new AIServiceError(
      error instanceof Error ? error.message : "发送消息失败，请稍后重试",
    )
  }
}

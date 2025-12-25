import { SYSTEM_PROMPT } from "./Prompt"

const API_URL = "https://api.deepseek.com/chat/completions"
const MODEL = "deepseek-chat"
const TEMPERATURE = 0.7

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

/**
 * 流式生成内容
 * @param options 生成选项，包含 onChunk 回调用于接收流式数据
 * @throws {AIServiceError} 当 API 调用失败时抛出
 */
export async function streamGenerateContent(
  options: StreamGenerateContentOptions,
): Promise<void> {
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
        stream: true,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new AIServiceError(
        errorData.error?.message || `HTTP error! status: ${response.status}`,
        response.status,
      )
    }

    if (!response.body) {
      throw new AIServiceError("响应体为空")
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ""
    let fullContent = ""

    try {
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          // 流结束，处理剩余的缓冲区内容
          if (buffer.trim()) {
            const lines = buffer.split("\n")
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6)
                if (data !== "[DONE]") {
                  try {
                    const json = JSON.parse(data)
                    const delta = json.choices?.[0]?.delta?.content || ""
                    if (delta) {
                      fullContent += delta
                      options.onChunk(delta)
                    }
                  } catch (parseError) {
                    console.warn("解析 SSE 数据失败:", parseError, data)
                  }
                }
              }
            }
          }
          break
        }

        // 解码新的数据块
        buffer += decoder.decode(value, { stream: true })
        
        // 处理完整的 SSE 消息
        const lines = buffer.split("\n")
        buffer = lines.pop() || "" // 保留最后一个不完整的行

        for (const line of lines) {
          if (line.trim() === "") {
            continue // 跳过空行
          }
          
          if (line.startsWith("data: ")) {
            const data = line.slice(6) // 移除 "data: " 前缀
            
            if (data === "[DONE]") {
              // 流结束标记
              if (options.onComplete) {
                options.onComplete(fullContent)
              }
              return
            }

            try {
              const json = JSON.parse(data)
              const delta = json.choices?.[0]?.delta?.content || ""
              
              if (delta) {
                fullContent += delta
                options.onChunk(delta)
              }
            } catch (parseError) {
              // 忽略 JSON 解析错误，继续处理下一行
              console.warn("解析 SSE 数据失败:", parseError, data)
            }
          }
        }
      }

      // 流正常结束时调用 onComplete
      if (options.onComplete) {
        options.onComplete(fullContent)
      }
    } finally {
      reader.releaseLock()
    }
  } catch (error) {
    if (error instanceof AIServiceError) {
      if (options.onError) {
        options.onError(error)
      }
      throw error
    }
    const serviceError = new AIServiceError(
      error instanceof Error ? error.message : "发送消息失败，请稍后重试",
    )
    if (options.onError) {
      options.onError(serviceError)
    }
    throw serviceError
  }
}

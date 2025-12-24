import { useState } from "react"
import { Card, Typography, Input, Button, message } from "antd"
import { Icon } from "@iconify/react"
import { SYSTEM_PROMPT } from "./Prompt"

const { Title } = Typography
const { TextArea } = Input

interface ChatProps {
  onContentGenerated: (content: string) => void
  onLoadingChange?: (loading: boolean) => void
}

function Chat({ onContentGenerated, onLoadingChange }: ChatProps) {
  const [value, setValue] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!value.trim()) {
      return
    }

    setLoading(true)
    onLoadingChange?.(true)
    try {
      const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY
      if (!apiKey) {
        message.error("请配置 VITE_DEEPSEEK_API_KEY 环境变量")
        setLoading(false)
        return
      }

      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT,
            },
            {
              role: "user",
              content: value,
            },
          ],
          temperature: 0.7,
          stream: false,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content || ""
      
      if (!content) {
        throw new Error("未收到有效响应")
      }

      // 直接使用 AI 返回的原始内容
      onContentGenerated(content)
      setValue("")
      message.success("生成成功！")
    } catch (error) {
      console.error("发送消息失败:", error)
      message.error(error instanceof Error ? error.message : "发送消息失败，请稍后重试")
    } finally {
      setLoading(false)
      onLoadingChange?.(false)
    }
  }

  return (
    <Card
      className="h-full !rounded-2xl !shadow-lg !shadow-slate-200/50 !border-slate-100 !bg-white/80 backdrop-blur-sm"
      styles={{
        body: { height: "100%", display: "flex", flexDirection: "column", padding: "20px" }
      }}
    >
      <div className="mb-4 sm:mb-6">
        <Title level={4} className="mt-0 !mb-0 !text-slate-800 !text-lg sm:!text-xl">
          对话区域
        </Title>
      </div>
      <div className="flex flex-col gap-3 sm:gap-4 flex-1 min-h-0">
        <TextArea
          value={value}
          rows={5}
          onChange={(e) => setValue(e.target.value)}
          placeholder="请输入内容，支持多行输入...&#10;按 Enter 发送，Shift + Enter 换行"
          className="flex-1 !resize-none"
          styles={{
            textarea: { 
              height: "100%",
              fontSize: "14px",
              lineHeight: "1.6"
            }
          }}
          onPressEnter={(e) => {
            if (e.shiftKey) {
              return
            }
            e.preventDefault()
            handleSend()
          }}
        />
        <Button
          type="primary"
          onClick={handleSend}
          disabled={!value.trim() || loading}
          loading={loading}
          size="large"
          icon={<Icon icon="mingcute:send-plane-line" className="text-base" />}
        >
          {loading ? "生成中..." : "AI 生成"}
        </Button>
      </div>
    </Card>
  )
}

export default Chat

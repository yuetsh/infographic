import { useState } from "react"
import { Card, Typography, Input, Button, message, Popconfirm } from "antd"
import { Icon } from "@iconify/react"
import History, { type ChatHistory } from "./History"
import { useHistory } from "./useHistory"
import { generateContent, AIServiceError } from "./Service"

const { Title } = Typography
const { TextArea } = Input

interface ChatProps {
  onContentGenerated: (content: string) => void
  onLoadingChange?: (loading: boolean) => void
}

function Chat({ onContentGenerated, onLoadingChange }: ChatProps) {
  const [value, setValue] = useState("")
  const [loading, setLoading] = useState(false)
  const { history, addHistory, deleteHistory, clearAllHistory } = useHistory()

  // 点击历史记录项
  const handleHistoryClick = (item: ChatHistory) => {
    setValue(item.prompt)
    onContentGenerated(item.content)
  }

  const handleSend = async () => {
    if (!value.trim()) {
      return
    }

    setLoading(true)
    onLoadingChange?.(true)
    try {
      const result = await generateContent({ prompt: value.trim() })

      // 直接使用 AI 返回的原始内容
      onContentGenerated(result.content)

      // 保存历史记录
      addHistory(value.trim(), result.content)

      setValue("")
      message.success("生成成功！")
    } catch (error) {
      console.error("发送消息失败:", error)
      message.error(
        error instanceof AIServiceError
          ? error.message
          : "发送消息失败，请稍后重试",
      )
    } finally {
      setLoading(false)
      onLoadingChange?.(false)
    }
  }

  return (
    <Card
      className="h-full !rounded-2xl !shadow-lg !shadow-slate-200/50 !border-slate-100 !bg-white/80 backdrop-blur-sm"
      styles={{
        body: {
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "20px",
        },
      }}
    >
      <div className="mb-4 sm:mb-6 flex items-center justify-between flex-wrap gap-2">
        <Title
          level={4}
          className="mt-0 !mb-0 !text-slate-800 !text-lg sm:!text-xl"
        >
          对话区域
        </Title>
        {history.length > 0 && (
          <Popconfirm
            title="确定要清空所有历史记录吗？"
            onConfirm={clearAllHistory}
            okText="确定"
            cancelText="取消"
          >
            <Button
              icon={<Icon icon="mingcute:delete-line" className="text-base" />}
            >
              清空历史
            </Button>
          </Popconfirm>
        )}
      </div>

      {/* 历史记录列表 */}
      <History
        history={history}
        onHistoryClick={handleHistoryClick}
        onDeleteHistory={deleteHistory}
      />

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
              lineHeight: "1.6",
            },
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

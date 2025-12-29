import { useState } from "react"
import { Card, Typography, Input, Button, message, Popconfirm, Select } from "antd"
import { Icon } from "@iconify/react"
import History, { type ChatHistory } from "./History"
import { useHistory } from "./useHistory"
import { streamGenerateContent, AIServiceError } from "./Service"
import { TEMPLATE_NAMES } from "./Prompt"

const { Title } = Typography
const { TextArea } = Input

interface ChatProps {
  onContentGenerated: (content: string) => void
  onLoadingChange?: (loading: boolean) => void
}

function Chat({ onContentGenerated, onLoadingChange }: ChatProps) {
  const [value, setValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>("")
  const { history, addHistory, deleteHistory, clearAllHistory } = useHistory()

  // 点击历史记录项
  const handleHistoryClick = (item: ChatHistory) => {
    setValue(item.prompt)
    onContentGenerated(item.content)
  }

  // 处理模板选择
  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template)

    if (!template || template === "") {
      // 如果清空选择，移除模板提示
      const templatePattern = /使用.+风格的信息图\s*$/
      setValue((prev) => prev.replace(templatePattern, "").trim())
      return
    }

    const templateName = TEMPLATE_NAMES[template] || template
    const templateText = `使用 ${templateName} 作为模版的信息图`

    setValue((prev) => {
      // 移除之前的模板提示（如果存在）
      const templatePattern = /使用.+风格的信息图\s*$/
      const cleanedPrev = prev.replace(templatePattern, "").trim()

      // 如果输入框为空，直接添加模板提示
      if (!cleanedPrev) {
        return templateText
      }

      // 在末尾添加新的模板提示
      return `${cleanedPrev}\n${templateText}`
    })
  }

  const handleSend = async () => {
    if (!value.trim()) {
      return
    }

    const prompt = value.trim()
    setLoading(true)
    onLoadingChange?.(true)

    let accumulatedContent = ""

    try {
      await streamGenerateContent({
        prompt,
        onChunk: (chunk) => {
          // 逐步累积内容并更新预览
          accumulatedContent += chunk
          onContentGenerated(accumulatedContent)
        },
        onComplete: (fullContent) => {
          // 流式生成完成，保存历史记录
          addHistory(prompt, fullContent)
          setValue("")
          message.success("生成成功！")
        },
        onError: (error) => {
          console.error("发送消息失败:", error)
          message.error(
            error instanceof AIServiceError
              ? error.message
              : "发送消息失败，请稍后重试",
          )
        },
      })
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
          对话
        </Title>
        {history.length > 0 && (
          <Popconfirm
            title="确定要清空所有历史记录吗？"
            onConfirm={clearAllHistory}
            okText="确定"
            cancelText="取消"
          >
            <Button
              danger
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
        <div className="flex gap-2">
          <Select
            placeholder="模板选择"
            value={selectedTemplate}
            onChange={handleTemplateChange}
            options={Object.keys(TEMPLATE_NAMES).map((template) => ({
              label: TEMPLATE_NAMES[template] || template,
              value: template,
            }))}
            style={{ flex: 1 }}
            size="large"
            allowClear
            disabled={!value.trim()}
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
      </div>
    </Card>
  )
}

export default Chat

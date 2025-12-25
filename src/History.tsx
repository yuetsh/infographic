import {
  Card,
  Typography,
  Button,
  message,
  Popconfirm,
  Tooltip,
  Space,
  Flex,
  Divider,
} from "antd"
import { Icon } from "@iconify/react"

const { Text } = Typography

export interface ChatHistory {
  id: string
  prompt: string
  content: string
  timestamp: number
}

interface HistoryProps {
  history: ChatHistory[]
  onHistoryClick: (item: ChatHistory) => void
  onDeleteHistory: (id: string) => void
}

function History({ history, onHistoryClick, onDeleteHistory }: HistoryProps) {
  // 格式化时间
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "刚刚"
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" })
  }

  // 点击历史记录项
  const handleHistoryClick = (item: ChatHistory) => {
    onHistoryClick(item)
    message.success("已加载历史记录")
  }

  if (history.length === 0) {
    return null
  }

  return (
    <Card
      className="mb-4 !border-slate-200 !bg-slate-50/50"
      styles={{
        body: { padding: 0, maxHeight: "192px", overflowY: "auto" },
      }}
    >
      <Space vertical size={0} className="w-full">
        {history.map((item, index) => (
          <div key={item.id}>
            <Flex
              className="px-3 py-2 cursor-pointer hover:bg-blue-50/50 transition-colors group"
              onClick={() => handleHistoryClick(item)}
              align="center"
              justify="space-between"
              gap="small"
            >
              <Flex vertical className="flex-1 min-w-0" gap={4}>
                <Tooltip title={item.prompt} placement="topLeft">
                  <Text
                    ellipsis={{ tooltip: false }}
                    className="!text-sm !text-slate-700 !mb-0"
                  >
                    {item.prompt}
                  </Text>
                </Tooltip>
                <Text className="!text-xs !text-slate-400">
                  {formatTime(item.timestamp)}
                </Text>
              </Flex>
              <Popconfirm
                title="确定要删除这条历史记录吗？"
                onConfirm={(e) => {
                  e?.stopPropagation()
                  onDeleteHistory(item.id)
                }}
                okText="确定"
                cancelText="取消"
              >
                <Button
                  type="text"
                  danger
                  icon={
                    <Icon icon="mingcute:delete-line" className="text-sm" />
                  }
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation()
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                />
              </Popconfirm>
            </Flex>
            {index < history.length - 1 && <Divider className="!my-0" />}
          </div>
        ))}
      </Space>
    </Card>
  )
}

export default History

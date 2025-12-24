import { useState } from "react"
import { Icon } from "@iconify/react"
import { Typography, Space, Flex } from "antd"
import Chat from "./Chat"
import Preview from "./Preview"

const { Title, Text } = Typography

function App() {
  const [infographicContent, setInfographicContent] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 py-8 sm:py-12 lg:py-16">
        <Flex vertical gap="large" className="mb-6 sm:mb-8">
          <Space size="large" align="center" className="flex-wrap">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center transition-transform hover:scale-105">
              <Icon 
                icon="mingcute:ai-line" 
                className="w-8 h-8 sm:w-10 sm:h-10 text-white"
              />
            </div>
            <Title 
              level={1} 
              className="mt-0 !mb-0 !text-3xl sm:!text-4xl lg:!text-5xl !font-bold bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text !text-transparent"
            >
              信息图表生成器（测试版）
            </Title>
          </Space>
          <Text className="!text-base sm:!text-lg lg:!text-xl !text-slate-600 !leading-relaxed block max-w-3xl">
            将你的内容粘贴到这里，AI 会理解你的内容并生成对应的信息图
          </Text>
        </Flex>

        <Flex gap="large" vertical className="lg:flex-row lg:min-h-[600px] lg:gap-6">
          <div className="flex-1 min-w-0">
            <Chat 
              onContentGenerated={setInfographicContent} 
              onLoadingChange={setIsGenerating}
            />
          </div>
          <div className="flex-1 min-w-0">
            <Preview content={infographicContent} loading={isGenerating} />
          </div>
        </Flex>
      </div>
    </div>
  )
}

export default App

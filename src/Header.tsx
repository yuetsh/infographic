import { Icon } from "@iconify/react"
import { Typography, Space, Flex } from "antd"

const { Title, Text } = Typography

function Header() {
  return (
    <>
      <style>{`
        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animated-gradient {
          background: linear-gradient(
            90deg,
            #06b6d4,
            #8b5cf6,
            #ec4899,
            #f59e0b,
            #10b981,
            #3b82f6,
            #06b6d4
          );
          background-size: 300% 300%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradient-shift 5s ease infinite;
        }
      `}</style>
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
            className="mt-0 !mb-0 !text-3xl sm:!text-4xl lg:!text-5xl !font-bold animated-gradient"
          >
            徐越的信息图表生成器（测试版）
          </Title>
        </Space>
        <Text className="!text-base sm:!text-lg lg:!text-xl !text-slate-600 !leading-relaxed block max-w-3xl">
          将你的文字内容粘贴到这里，AI 会试图理解并生成对应的信息图表
        </Text>
      </Flex>
    </>
  )
}

export default Header


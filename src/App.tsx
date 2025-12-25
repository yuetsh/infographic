import { useState, useEffect } from "react"
import { Flex, message } from "antd"
import Chat from "./Chat"
import Preview from "./Preview"
import Header from "./Header"

function App() {
  const [infographicContent, setInfographicContent] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    message.config({
      maxCount: 1,
    })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 py-8 sm:py-12 lg:py-16">
        <Header />

        <Flex
          gap="large"
          vertical
          className="lg:flex-row lg:min-h-[600px] lg:gap-6"
        >
          <div className="flex-[3] min-w-0">
            <Chat
              onContentGenerated={setInfographicContent}
              onLoadingChange={setIsGenerating}
            />
          </div>
          <div className="flex-[7] min-w-0">
            <Preview
              content={infographicContent}
              loading={isGenerating}
              onContentChange={setInfographicContent}
            />
          </div>
        </Flex>
      </div>
    </div>
  )
}

export default App

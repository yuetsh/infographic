import { Card, Typography, Spin, Button, message } from "antd"
import { Infographic } from "@antv/infographic"
import { useEffect, useRef, useCallback } from "react"
import { Icon } from "@iconify/react"

const { Title } = Typography

interface PreviewProps {
  content: string
  loading?: boolean
}

function Preview({ content, loading = false }: PreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const infographicRef = useRef<Infographic | null>(null)

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    // 初始化 Infographic 实例
    if (!infographicRef.current) {
      infographicRef.current = new Infographic({
        container: containerRef.current,
        width: "100%",
        height: "100%",
      })
    }

    // 如果有内容，则渲染
    if (content) {
      try {
        infographicRef.current.render(content)
      } catch (error) {
        console.error("渲染失败:", error)
      }
    }

    return () => {
      if (infographicRef.current) {
        infographicRef.current.destroy()
        infographicRef.current = null
      }
    }
  }, [content])

  const handleCopy = useCallback(async () => {
    if (!infographicRef.current || !content) {
      return
    }

    try {
      message.loading("正在生成图片...", 0)

      const dataUrl = await infographicRef.current.toDataURL()
      if (!dataUrl) {
        throw new Error("无法生成图片数据")
      }

      const clipboard = navigator?.clipboard
      if (!clipboard) {
        throw new Error("浏览器不支持剪贴板 API")
      }

      if ('write' in clipboard && typeof ClipboardItem !== 'undefined') {
        const res = await fetch(dataUrl)
        const blob = await res.blob()
        await clipboard.write([new ClipboardItem({ [blob.type]: blob })])
      } else if ('writeText' in clipboard) {
        await clipboard.writeText(dataUrl)
      } else {
        throw new Error("剪贴板 API 不可用")
      }

      message.destroy()
      message.success("图片已复制到剪贴板！")
    } catch (error) {
      console.error("复制失败:", error)
      message.destroy()
      message.error(error instanceof Error ? error.message : "复制失败，请稍后重试")
    }
  }, [content])

  return (
    <Card
      className="h-full !rounded-2xl !shadow-lg !shadow-slate-200/50 !border-slate-100 !bg-white/80 backdrop-blur-sm"
      styles={{
        body: { height: "100%", display: "flex", flexDirection: "column", padding: "20px" }
      }}
    >
      <div className="mb-4 sm:mb-6 flex items-center justify-between flex-wrap gap-2">
        <Title level={4} className="mt-0 !mb-0 !text-slate-800 !text-lg sm:!text-xl">
          预览区域
        </Title>
        {content && (
          <Button
            type="primary"
            icon={<Icon icon="mingcute:copy-line" className="text-base" />}
            onClick={handleCopy}
            disabled={loading}
            size="large"
          >
            复制图片
          </Button>
        )}
      </div>
      <div ref={containerRef} className="flex-1 min-h-0 relative rounded-lg overflow-hidden bg-slate-50/50 border border-slate-100">
        {!content && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-6">
            <Icon icon="mingcute:image-line" className="w-16 h-16 sm:w-20 sm:h-20 mb-4 opacity-50" />
            <p className="text-sm sm:text-base text-center max-w-xs">
              生成的信息图将在这里显示
            </p>
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
            <Spin size="large" />
            <p className="mt-4 text-slate-600 text-sm sm:text-base">正在生成信息图...</p>
          </div>
        )}
      </div>
    </Card>
  )
}

export default Preview

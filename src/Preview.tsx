import { Card, Typography, Spin, Button, message, Modal, Input } from "antd"
import { Infographic } from "@antv/infographic"
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  useState,
} from "react"
import { Icon } from "@iconify/react"

const { Title } = Typography
const { TextArea } = Input

interface PreviewProps {
  content: string
  loading?: boolean
  onContentChange?: (content: string) => void
}

function Preview({ content, loading = false, onContentChange }: PreviewProps) {
  const infographicContainerRef = useRef<HTMLDivElement | null>(null)
  const infographicRef = useRef<Infographic | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editedCode, setEditedCode] = useState("")
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [imageDataUrl, setImageDataUrl] = useState<string>("")
  const renderTimerRef = useRef<number | null>(null)
  const lastRenderedContentRef = useRef<string>("")
  const isMountedRef = useRef(true)
  const initTimerRef = useRef<number | null>(null)

  // 初始化 Infographic 实例的辅助函数
  const initInfographic = useCallback(() => {
    if (!infographicContainerRef.current || !isMountedRef.current) {
      return false
    }

    try {
      // 如果已存在实例，先销毁
      if (infographicRef.current) {
        try {
          infographicRef.current.destroy()
        } catch (e) {
          // 忽略销毁错误
        }
      }

      infographicRef.current = new Infographic({
        container: infographicContainerRef.current,
        width: "100%",
        height: "100%",
      })
      return true
    } catch (error) {
      console.error("初始化 Infographic 失败:", error)
      return false
    }
  }, [])

  // 使用回调 ref 确保容器准备好
  const setInfographicContainer = useCallback(
    (node: HTMLDivElement | null) => {
      infographicContainerRef.current = node
      // 如果容器准备好了且 Infographic 还没初始化，则初始化
      if (node && !infographicRef.current && isMountedRef.current) {
        // 使用 setTimeout 确保 DOM 完全准备好
        if (initTimerRef.current) {
          clearTimeout(initTimerRef.current)
        }
        initTimerRef.current = window.setTimeout(() => {
          if (
            isMountedRef.current &&
            infographicContainerRef.current &&
            !infographicRef.current
          ) {
            initInfographic()
          }
          initTimerRef.current = null
        }, 0)
      }
    },
    [initInfographic],
  )

  // 流式渲染函数，使用防抖优化性能
  const renderContent = useCallback(
    (contentToRender: string) => {
      if (!contentToRender || !infographicContainerRef.current) {
        return
      }

      // 如果内容没有变化，跳过渲染
      if (contentToRender === lastRenderedContentRef.current) {
        return
      }

      // 清除之前的定时器
      if (renderTimerRef.current !== null) {
        cancelAnimationFrame(renderTimerRef.current)
      }

      // 使用 requestAnimationFrame 优化渲染时机
      renderTimerRef.current = requestAnimationFrame(() => {
        renderTimerRef.current = null

        // 检查组件是否仍然挂载
        if (!isMountedRef.current || !infographicContainerRef.current) {
          return
        }

        // 如果实例不存在，尝试初始化
        if (!infographicRef.current) {
          if (!initInfographic()) {
            return
          }
        }

        try {
          infographicRef.current!.render(contentToRender)
          lastRenderedContentRef.current = contentToRender
        } catch (error) {
          console.error("渲染失败:", error)
          // 如果渲染失败，尝试重新初始化并重试
          if (initInfographic() && infographicRef.current) {
            try {
              infographicRef.current.render(contentToRender)
              lastRenderedContentRef.current = contentToRender
            } catch (retryError) {
              console.error("重试渲染失败:", retryError)
            }
          }
        }
      })
    },
    [initInfographic],
  )

  // 初始化挂载状态
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // 使用 useLayoutEffect 确保在 React 清理 DOM 之前先清理 Infographic
  useLayoutEffect(() => {
    return () => {
      // 清理初始化定时器
      if (initTimerRef.current !== null) {
        clearTimeout(initTimerRef.current)
        initTimerRef.current = null
      }

      // 清理渲染定时器
      if (renderTimerRef.current !== null) {
        cancelAnimationFrame(renderTimerRef.current)
        renderTimerRef.current = null
      }

      // 清理 Infographic 实例 - 在 React 清理 DOM 之前执行
      if (infographicRef.current) {
        try {
          // 先清理 Infographic，避免它修改的 DOM 与 React 冲突
          infographicRef.current.destroy()
        } catch (e) {
          // 忽略销毁错误，可能节点已经被移除
          console.warn("清理 Infographic 时出错:", e)
        }
        infographicRef.current = null
      }
      lastRenderedContentRef.current = ""
    }
  }, []) // 空依赖数组，只在卸载时执行

  // 内容变化时触发渲染
  useEffect(() => {
    if (!isMountedRef.current || !content) {
      return
    }

    // 如果实例不存在，尝试初始化
    if (!infographicRef.current && infographicContainerRef.current) {
      initInfographic()
    }

    renderContent(content)
  }, [content, renderContent, initInfographic])

  const handleViewCode = useCallback(() => {
    setEditedCode(content)
    setIsModalOpen(true)
  }, [content])

  const handleSaveCode = useCallback(() => {
    if (onContentChange) {
      onContentChange(editedCode)
      message.success("代码已更新！")
    }
    setIsModalOpen(false)
  }, [editedCode, onContentChange])

  const handleCancel = useCallback(() => {
    setIsModalOpen(false)
    setEditedCode("")
  }, [])

  const generateImageDataUrl = useCallback(async (): Promise<string> => {
    if (!infographicRef.current || !content) {
      throw new Error("无法生成图片：内容为空")
    }

    const dataUrl = await infographicRef.current.toDataURL()
    if (!dataUrl) {
      throw new Error("无法生成图片数据")
    }

    return dataUrl
  }, [content])

  const handleFullscreen = useCallback(async () => {
    try {
      const dataUrl = await generateImageDataUrl()
      setImageDataUrl(dataUrl)
      setIsImageModalOpen(true)
      message.destroy()
    } catch (error) {
      console.error("生成图片失败:", error)
      message.destroy()
      message.error(
        error instanceof Error ? error.message : "生成图片失败，请稍后重试",
      )
    }
  }, [generateImageDataUrl])

  const handleCopy = useCallback(async () => {
    try {
      const dataUrl = await generateImageDataUrl()

      const clipboard = navigator?.clipboard
      if (!clipboard) {
        throw new Error("浏览器不支持剪贴板 API")
      }

      if ("write" in clipboard && typeof ClipboardItem !== "undefined") {
        const res = await fetch(dataUrl)
        const blob = await res.blob()
        await clipboard.write([new ClipboardItem({ [blob.type]: blob })])
      } else if ("writeText" in clipboard) {
        await clipboard.writeText(dataUrl)
      } else {
        throw new Error("剪贴板 API 不可用")
      }

      message.destroy()
      message.success("图片已复制到剪贴板！")
    } catch (error) {
      console.error("复制失败:", error)
      message.destroy()
      message.error(
        error instanceof Error ? error.message : "复制失败，请稍后重试",
      )
    }
  }, [generateImageDataUrl])

  const handleDownload = useCallback(async () => {
    if (!infographicRef.current || !content) {
      message.error("无法下载：内容为空")
      return
    }

    try {
      message.loading({ content: "正在生成高清图片...", key: "download" })

      // 使用 Infographic 的原生 toDataURL 方法
      const originalDataUrl = await infographicRef.current.toDataURL()
      if (!originalDataUrl) {
        throw new Error("无法生成图片数据")
      }

      // 使用 Canvas 添加白色背景
      const img = new Image()
      img.crossOrigin = "anonymous"

      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          try {
            // 创建 Canvas
            const canvas = document.createElement("canvas")
            canvas.width = img.width
            canvas.height = img.height
            const ctx = canvas.getContext("2d")

            if (!ctx) {
              reject(new Error("无法获取 Canvas 上下文"))
              return
            }

            // 先填充白色背景
            ctx.fillStyle = "#ffffff"
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // 绘制原始图片
            ctx.drawImage(img, 0, 0)

            // 导出为新的 dataUrl
            const dataUrl = canvas.toDataURL("image/png")

            // 创建下载链接
            const link = document.createElement("a")
            link.download = `信息图表-${Date.now()}.png`
            link.href = dataUrl
            document.body.appendChild(link)
            link.click()
            // 安全地移除链接
            if (link.parentNode) {
              document.body.removeChild(link)
            }

            resolve()
          } catch (error) {
            reject(error)
          }
        }

        img.onerror = () => {
          reject(new Error("图片加载失败"))
        }

        img.src = originalDataUrl
      })

      message.destroy("download")
      message.success("高清图片下载成功！")
    } catch (error) {
      console.error("下载失败:", error)
      message.destroy("download")
      message.error(
        error instanceof Error ? error.message : "下载失败，请稍后重试",
      )
    }
  }, [content])

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
          预览
        </Title>
        {content && (
          <div className="flex items-center gap-2">
            <Button
              icon={<Icon icon="mingcute:code-line" className="text-base" />}
              onClick={handleViewCode}
              disabled={loading}
            >
              编辑代码
            </Button>
            <Button
              icon={
                <Icon icon="mingcute:fullscreen-line" className="text-base" />
              }
              onClick={handleFullscreen}
              disabled={loading}
            >
              查看大图
            </Button>
            <Button
              icon={<Icon icon="mingcute:copy-line" className="text-base" />}
              onClick={handleCopy}
              disabled={loading}
            >
              复制图片
            </Button>
            <Button
              color="primary"
              variant="outlined"
              icon={
                <Icon icon="mingcute:download-line" className="text-base" />
              }
              onClick={handleDownload}
              disabled={loading}
            >
              下载图片
            </Button>
          </div>
        )}
      </div>
      <div className="flex-1 min-h-0 relative rounded-lg overflow-hidden bg-slate-50/50 border border-slate-100">
        {/* Infographic 容器 - 独立的 div 供 Infographic 库操作 */}
        <div
          ref={setInfographicContainer}
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: content ? "auto" : "none" }}
        />
        {!content && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-6 z-20">
            <Icon
              icon="mingcute:image-line"
              className="w-16 h-16 sm:w-20 sm:h-20 mb-4 opacity-50"
            />
            <p className="text-sm sm:text-base text-center max-w-xs">
              生成的信息图表将在这里显示
            </p>
          </div>
        )}
        {loading && !content && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
            <Spin size="large" />
            <p className="mt-4 text-slate-600 text-sm sm:text-base">
              正在生成信息图表...
            </p>
          </div>
        )}
        {loading && content && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-slate-200">
            <Spin size="small" />
            <span className="text-xs text-slate-600">生成中...</span>
          </div>
        )}
      </div>
      <Modal
        title="编辑代码"
        open={isModalOpen}
        onOk={handleSaveCode}
        onCancel={handleCancel}
        width={900}
        okText="保存"
        cancelText="取消"
        styles={{
          body: { maxHeight: "70vh", overflow: "auto" },
        }}
      >
        <TextArea
          value={editedCode}
          onChange={(e) => setEditedCode(e.target.value)}
          rows={20}
          className="font-mono text-sm"
          placeholder="在此编辑代码..."
        />
      </Modal>
      <Modal
        title="查看大图"
        open={isImageModalOpen}
        onCancel={() => setIsImageModalOpen(false)}
        footer={null}
        width="90%"
        styles={{
          body: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            maxHeight: "90vh",
            overflow: "auto",
          },
        }}
      >
        {imageDataUrl && (
          <img
            src={imageDataUrl}
            alt="信息图大图"
            className="max-w-full max-h-[80vh] object-contain"
          />
        )}
      </Modal>
    </Card>
  )
}

export default Preview

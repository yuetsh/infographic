<template>
  <n-card title="预览">
    <template #header-extra>
      <n-flex v-if="content">
        <n-button @click="handleViewCode" :disabled="loading">
          <template #icon>
            <Icon icon="mingcute:code-line" />
          </template>
          编辑代码
        </n-button>
        <n-button @click="handleFullscreen" :disabled="loading">
          <template #icon>
            <Icon icon="mingcute:fullscreen-line" />
          </template>
          查看大图
        </n-button>
        <n-button @click="handleCopy" :disabled="loading">
          <template #icon>
            <Icon icon="mingcute:copy-line" />
          </template>
          复制图片
        </n-button>
        <n-button
          type="primary"
          ghost
          @click="handleDownload"
          :disabled="loading"
        >
          <template #icon>
            <Icon icon="mingcute:download-line" />
          </template>
          下载图片
        </n-button>
      </n-flex>
    </template>
    <div>
      <div ref="containerRef" />
      <n-flex v-if="!content && !loading" vertical>
        <Icon icon="mingcute:image-line" />
        <n-text>生成的信息图表将在这里显示</n-text>
      </n-flex>
      <n-flex v-if="loading && !content" vertical>
        <n-spin size="large" />
        <n-text>正在生成信息图表...</n-text>
      </n-flex>
      <n-flex v-if="loading && content">
        <n-spin size="small" />
        <n-text>生成中...</n-text>
      </n-flex>
    </div>

    <n-modal
      v-model:show="isModalOpen"
      preset="dialog"
      title="编辑代码"
      positive-text="保存"
      negative-text="取消"
      @positive-click="handleSaveCode"
      @negative-click="handleCancel"
      :auto-focus="false"
    >
      <n-input
        v-model:value="editedCode"
        type="textarea"
        :rows="20"
        placeholder="在此编辑代码..."
      />
    </n-modal>

    <n-modal
      v-model:show="isImageModalOpen"
      preset="card"
      title="查看大图"
      :bordered="false"
    >
      <div>
        <img
          v-if="imageDataUrl"
          :src="imageDataUrl"
          alt="信息图大图"
        />
      </div>
    </n-modal>
  </n-card>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from "vue"
import {
  NCard,
  NButton,
  NInput,
  NModal,
  NSpin,
  NFlex,
  NText,
  useMessage,
} from "naive-ui"
import { Icon } from "@iconify/vue"
import { Infographic } from "@antv/infographic"

interface Props {
  content: string
  loading?: boolean
  onContentChange?: (content: string) => void
}

const props = defineProps<Props>()
const emit = defineEmits<{
  "update:content": [value: string]
}>()
const message = useMessage()

const containerRef = ref<HTMLDivElement | null>(null)
let infographic: Infographic | null = null

const isModalOpen = ref(false)
const editedCode = ref("")
const isImageModalOpen = ref(false)
const imageDataUrl = ref<string>("")

onMounted(() => {
  nextTick(() => {
    if (containerRef.value) {
      infographic = new Infographic({
        container: containerRef.value,
        width: "100%",
        height: "100%",
      })

      // 如果有初始内容，立即渲染
      if (props.content) {
        try {
          infographic.render(props.content)
        } catch (error) {
          console.error("初始渲染失败:", error)
        }
      }
    }
  })
})

onBeforeUnmount(() => {
  if (infographic) {
    infographic.destroy()
    infographic = null
  }
})

// 内容变化时触发渲染
watch(
  () => props.content,
  (newContent) => {
    if (newContent) {
      // 如果实例还未创建，先创建
      if (!infographic) {
        nextTick(() => {
          if (containerRef.value) {
            infographic = new Infographic({
              container: containerRef.value,
              width: "100%",
              height: "100%",
            })

            if (infographic) {
              try {
                infographic.render(newContent)
              } catch (error) {
                console.error("渲染失败:", error)
              }
            }
          }
        })
      } else {
        // 实例已存在，直接渲染
        try {
          infographic.render(newContent)
        } catch (error) {
          console.error("渲染失败:", error)
        }
      }
    }
  },
)

const handleViewCode = () => {
  editedCode.value = props.content
  isModalOpen.value = true
}

const handleSaveCode = () => {
  if (props.onContentChange) {
    props.onContentChange(editedCode.value)
  }
  emit("update:content", editedCode.value)
  message.success("代码已更新！")
  isModalOpen.value = false
  return true
}

const handleCancel = () => {
  isModalOpen.value = false
  editedCode.value = ""
}

const generateImageDataUrl = async (): Promise<string> => {
  if (!infographic || !props.content) {
    throw new Error("无法生成图片：内容为空")
  }

  const dataUrl = await infographic.toDataURL()
  if (!dataUrl) {
    throw new Error("无法生成图片数据")
  }

  return dataUrl
}

const handleFullscreen = async () => {
  try {
    const dataUrl = await generateImageDataUrl()
    imageDataUrl.value = dataUrl
    isImageModalOpen.value = true
  } catch (error) {
    console.error("生成图片失败:", error)
    message.error(
      error instanceof Error ? error.message : "生成图片失败，请稍后重试",
    )
  }
}

const handleCopy = async () => {
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

    message.success("图片已复制到剪贴板！")
  } catch (error) {
    console.error("复制失败:", error)
    message.error(
      error instanceof Error ? error.message : "复制失败，请稍后重试",
    )
  }
}

const handleDownload = async () => {
  if (!infographic || !props.content) {
    message.error("无法下载：内容为空")
    return
  }

  let loadingMessage: ReturnType<typeof message.loading> | null = null
  try {
    loadingMessage = message.loading("正在生成高清图片...", { duration: 0 })

    // 使用 Infographic 的原生 toDataURL 方法
    const originalDataUrl = await infographic.toDataURL()
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

    loadingMessage?.destroy()
    message.success("高清图片下载成功！")
  } catch (error) {
    console.error("下载失败:", error)
    loadingMessage?.destroy()
    message.error(
      error instanceof Error ? error.message : "下载失败，请稍后重试",
    )
  }
}
</script>


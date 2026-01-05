<template>
  <n-card title="对话">
    <template #header-extra>
      <n-popconfirm
        v-if="history.length > 0"
        :show-icon="false"
        positive-text="确定"
        negative-text="取消"
        @positive-click="handleClearAllHistory"
      >
        <template #trigger>
          <n-button danger>
            <template #icon>
              <Icon icon="mingcute:delete-line" />
            </template>
            清空历史
          </n-button>
        </template>
        确定要清空所有历史记录吗？
      </n-popconfirm>
    </template>

    <History
      :history="history"
      @history-click="handleHistoryClick"
      @delete-history="deleteHistory"
    />

    <n-flex vertical>
      <n-input
        v-model:value="value"
        type="textarea"
        :rows="5"
        placeholder="请输入内容，支持多行输入...&#10;按 Enter 发送，Shift + Enter 换行"
        @keydown="handleKeyDown"
      />
      <n-select
        v-model:value="selectedTemplate"
        placeholder="模板选择"
        :options="templateOptions"
        size="large"
        clearable
        :disabled="!value.trim()"
        @update:value="handleTemplateChange"
      />
      <n-button
        type="primary"
        :disabled="!value.trim() || loading"
        :loading="loading"
        size="large"
        @click="handleSend"
      >
        <template #icon>
          <Icon icon="mingcute:send-plane-line" />
        </template>
        {{ loading ? "生成中..." : "AI 生成" }}
      </n-button>
    </n-flex>
  </n-card>
</template>

<script setup lang="ts">
import { ref } from "vue"
import {
  NCard,
  NButton,
  NInput,
  NSelect,
  NPopconfirm,
  NFlex,
  useMessage,
} from "naive-ui"
import { Icon } from "@iconify/vue"
import History from "./History.vue"
import { useHistory } from "../composables/useHistory"
import { streamGenerateContent, AIServiceError } from "../Service"
import { TEMPLATE_NAMES } from "../Template"
import type { ChatHistory } from "../types/History"

interface Props {
  onContentGenerated?: (content: string) => void
  onLoadingChange?: (loading: boolean) => void
}

const props = defineProps<Props>()
const message = useMessage()
const { history, addHistory, deleteHistory, clearAllHistory } = useHistory()

const value = ref("")
const loading = ref(false)
const selectedTemplate = ref<string | null>(null)

// 模板选项
const templateOptions = Object.keys(TEMPLATE_NAMES).map((template) => ({
  label: TEMPLATE_NAMES[template] || template,
  value: template,
}))

// 点击历史记录项
const handleHistoryClick = (item: ChatHistory) => {
  value.value = item.prompt
  props.onContentGenerated?.(item.content)
}

// 处理模板选择
const handleTemplateChange = (template: string | null) => {
  selectedTemplate.value = template

  if (!template || template === "") {
    // 如果清空选择，移除模板提示
    const templatePattern = /使用.+风格的信息图\s*$/
    value.value = value.value.replace(templatePattern, "").trim()
    return
  }

  const templateName = TEMPLATE_NAMES[template] || template
  const templateText = `使用 ${templateName} 作为模版的信息图`

  // 移除之前的模板提示（如果存在）
  const templatePattern = /使用.+风格的信息图\s*$/
  const cleanedPrev = value.value.replace(templatePattern, "").trim()

  // 如果输入框为空，直接添加模板提示
  if (!cleanedPrev) {
    value.value = templateText
  } else {
    // 在末尾添加新的模板提示
    value.value = `${cleanedPrev}\n${templateText}`
  }
}

// 处理键盘事件
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

// 清空所有历史记录
const handleClearAllHistory = () => {
  clearAllHistory()
  message.success("已清空所有历史记录")
}

// 发送消息
const handleSend = async () => {
  if (!value.value.trim()) {
    return
  }

  const prompt = value.value.trim()
  loading.value = true
  props.onLoadingChange?.(true)

  let accumulatedContent = ""

  try {
    await streamGenerateContent({
      prompt,
      onChunk: (chunk) => {
        // 逐步累积内容并更新预览
        accumulatedContent += chunk
        props.onContentGenerated?.(accumulatedContent)
      },
      onComplete: (fullContent) => {
        // 流式生成完成，保存历史记录
        addHistory(prompt, fullContent)
        value.value = ""
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
    loading.value = false
    props.onLoadingChange?.(false)
  }
}
</script>

<style scoped></style>

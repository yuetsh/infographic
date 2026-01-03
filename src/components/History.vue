<template>
  <n-card class="history-card" v-if="history.length > 0">
    <div v-for="(item, index) in history" :key="item.id">
      <div class="history-item" @click="handleHistoryClick(item)">
        <n-flex align="center" justify="space-between" :gap="8" :wrap="false">
          <n-flex vertical>
            <n-ellipsis :line-clamp="1">{{ item.prompt }}</n-ellipsis>
            <n-text>{{ formatTime(item.timestamp) }}</n-text>
          </n-flex>
          <n-popconfirm
            :show-icon="false"
            positive-text="确定"
            negative-text="取消"
            @positive-click="() => handleDelete(item.id)"
            @click.stop
          >
            <template #trigger>
              <n-button quaternary type="error" size="small" @click.stop>
                <template #icon>
                  <Icon icon="mingcute:delete-line" />
                </template>
              </n-button>
            </template>
            确定要删除这条历史记录吗？
          </n-popconfirm>
        </n-flex>
      </div>
      <n-divider v-if="index < history.length - 1" />
    </div>
  </n-card>
</template>

<script setup lang="ts">
import {
  NCard,
  NFlex,
  NText,
  NEllipsis,
  NButton,
  NPopconfirm,
  NDivider,
  useMessage,
} from "naive-ui"
import { Icon } from "@iconify/vue"
import type { ChatHistory } from "../types/History"

interface Props {
  history: ChatHistory[]
}

interface Emits {
  (e: "history-click", item: ChatHistory): void
  (e: "delete-history", id: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const message = useMessage()

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
  emit("history-click", item)
  message.success("已加载历史记录")
}

// 删除历史记录
const handleDelete = (id: string) => {
  emit("delete-history", id)
}
</script>

<style scoped>
.history-card {
  margin-bottom: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.history-item {
  cursor: pointer;
}
</style>

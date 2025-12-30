<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN">
  <n-message-provider>
    <div class="app-container">
      <div class="app-content">
        <Header />

        <n-grid :cols="isLargeScreen ? 10 : 1" :x-gap="24" responsive="screen">
          <n-gi :span="isLargeScreen ? 3 : 1">
            <Chat
              :on-content-generated="setInfographicContent"
              :on-loading-change="setIsGenerating"
            />
          </n-gi>
          <n-gi :span="isLargeScreen ? 7 : 1">
            <Preview
              :content="infographicContent"
              :loading="isGenerating"
              :on-content-change="setInfographicContent"
            />
          </n-gi>
        </n-grid>
      </div>
    </div>
  </n-message-provider>
</n-config-provider>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"
import { NGrid, NGi, NMessageProvider, NConfigProvider, zhCN, dateZhCN } from "naive-ui"
import Header from "./components/Header.vue"
import Chat from "./components/Chat.vue"
import Preview from "./components/Preview.vue"

const window = globalThis.window
const isLargeScreen = ref(window.innerWidth >= 1024)

const handleResize = () => {
  isLargeScreen.value = window.innerWidth >= 1024
}

onMounted(() => {
  window.addEventListener("resize", handleResize)
})

onUnmounted(() => {
  window.removeEventListener("resize", handleResize)
})

const infographicContent = ref<string>("")
const isGenerating = ref(false)

const setInfographicContent = (content: string) => {
  infographicContent.value = content
}

const setIsGenerating = (loading: boolean) => {
  isGenerating.value = loading
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: linear-gradient(to bottom right, #f8fafc, #eff6ff, #eef2ff);
}

.app-content {
  position: relative;
  margin: 0 auto;
  max-width: 1280px;
  padding: 32px 16px;
}
</style>

<template>
  <div class="header-container">
    <n-flex align="center">
      <div class="header-icon-wrapper">
        <Icon icon="mingcute:ai-line" class="header-icon" />
      </div>
      <n-text class="header-title">徐越的信息图表生成器</n-text>
    </n-flex>
    <n-text class="header-text">
      将你的文字内容粘贴到这里，AI 会试图理解并生成对应的信息图表
    </n-text>
  </div>
</template>

<script setup lang="ts">
import { NFlex, NText } from "naive-ui"
import { Icon } from "@iconify/vue"
</script>

<style scoped>
.header-container {
  margin-bottom: 24px;
}

.header-icon-wrapper {
  padding: 12px;
  background: linear-gradient(to bottom right, #3b82f6, #4f46e5);
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
  cursor: pointer;
}

.header-icon-wrapper:hover {
  transform: scale(1.05);
}

.header-icon {
  width: 24px;
  height: 24px;
  color: white;
}

.header-title {
  margin: 0;
  font-size: 30px;
  font-weight: 700;
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

.header-text {
  font-size: 16px;
  color: #475569;
  line-height: 1.75;
  display: block;
  max-width: 768px;
  margin-top: 16px;
}

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
</style>

import { useState, useEffect } from "react"
import { message } from "antd"
import type { ChatHistory } from "./History"

const STORAGE_KEY = "infographic_chat_history"
const MAX_HISTORY = 50 // 最多保存50条历史记录

export function useHistory() {
  const [history, setHistory] = useState<ChatHistory[]>([])

  // 从localStorage加载历史记录
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setHistory(Array.isArray(parsed) ? parsed : [])
      }
    } catch (error) {
      console.error("加载历史记录失败:", error)
    }
  }, [])

  // 保存历史记录到localStorage
  const saveHistory = (newHistory: ChatHistory[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
      setHistory(newHistory)
    } catch (error) {
      console.error("保存历史记录失败:", error)
    }
  }

  // 添加历史记录
  const addHistory = (prompt: string, content: string) => {
    const newItem: ChatHistory = {
      id: Date.now().toString(),
      prompt,
      content,
      timestamp: Date.now(),
    }
    const newHistory = [newItem, ...history].slice(0, MAX_HISTORY)
    saveHistory(newHistory)
  }

  // 删除历史记录
  const deleteHistory = (id: string) => {
    const newHistory = history.filter((item) => item.id !== id)
    saveHistory(newHistory)
  }

  // 清空所有历史记录
  const clearAllHistory = () => {
    saveHistory([])
    message.success("已清空所有历史记录")
  }

  return {
    history,
    addHistory,
    deleteHistory,
    clearAllHistory,
  }
}


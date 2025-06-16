import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`
}

// 检测是否为触摸设备
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

// 获取移动端优化的按钮样式
export function getMobileOptimizedButtonClass(baseClass: string = ""): string {
  return cn(
    baseClass,
    "touch-target", // 确保触摸目标足够大
    "transition-all duration-200"
  )
}
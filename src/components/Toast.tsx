'use client'
import { useEffect, useState } from 'react'

type ToastProps = {
  message: string
  type: 'success' | 'error' | 'info'
  onClose: () => void
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  const colors = {
    success: 'bg-ph-blue text-white',
    error: 'bg-ph-red text-white',
    info: 'bg-ink text-white',
  }

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  }

  return (
    <div
      className={`toast ${colors[type]} rounded shadow-2xl flex items-start gap-3 p-4 cursor-pointer`}
      onClick={onClose}
    >
      <span className="text-lg font-bold mt-0.5">{icons[type]}</span>
      <div>
        <p className="font-body text-sm leading-snug">{message}</p>
        <p className="text-xs opacity-60 mt-1 font-mono">Click to dismiss</p>
      </div>
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type })
  }

  const hideToast = () => setToast(null)

  const ToastComponent = toast ? (
    <Toast message={toast.message} type={toast.type} onClose={hideToast} />
  ) : null

  return { showToast, ToastComponent }
}

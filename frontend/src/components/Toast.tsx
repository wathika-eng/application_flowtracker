import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  onDone: () => void
}

export default function Toast({ message, onDone }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      onDone()
    }, 2500)
    return () => clearTimeout(timer)
  }, [onDone])

  if (!visible) return null

  return <div className="ios-toast">{message}</div>
}

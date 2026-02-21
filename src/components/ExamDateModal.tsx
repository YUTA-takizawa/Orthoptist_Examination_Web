import { useState } from 'react'
import { motion } from 'framer-motion'

interface ExamDateModalProps {
  currentDate: string | null
  onSave: (date: string) => void
  onClose: () => void
}

export function ExamDateModal({ currentDate, onSave, onClose }: ExamDateModalProps) {
  const nextFeb = (() => {
    const now = new Date()
    const year = now.getMonth() >= 2 ? now.getFullYear() + 1 : now.getFullYear()
    return `${year}-02-20`
  })()

  const [date, setDate] = useState(currentDate ?? nextFeb)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 px-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-xl"
      >
        <h2 className="text-lg font-bold text-text mb-2">試験日を設定</h2>
        <p className="text-sm text-text-light mb-4">
          視能訓練士国家試験は毎年2月に実施されます。試験日を設定すると、1日の推奨問題数を自動計算します。
        </p>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:border-primary"
        />
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-text-light hover:bg-gray-50"
          >
            あとで
          </button>
          <button
            onClick={() => onSave(date)}
            className="flex-1 py-3 rounded-xl bg-primary text-text text-sm font-bold hover:bg-primary-dark transition-colors"
          >
            設定する
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

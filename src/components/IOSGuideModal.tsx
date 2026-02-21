import { motion } from 'framer-motion'
import { Share, Plus } from 'lucide-react'

interface IOSGuideModalProps {
  onClose: () => void
}

export function IOSGuideModal({ onClose }: IOSGuideModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-end justify-center bg-black/40 z-50 px-4 pb-4"
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-xl"
      >
        <h2 className="text-lg font-bold text-text mb-3">ホーム画面に追加</h2>
        <p className="text-sm text-text-light mb-4">
          アプリのように使うために、ホーム画面に追加しましょう！
        </p>

        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <Share className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-text">1. 共有ボタンをタップ</p>
              <p className="text-xs text-text-light">画面下部の共有アイコン（四角に上矢印）をタップ</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
              <Plus className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-text">2. 「ホーム画面に追加」を選択</p>
              <p className="text-xs text-text-light">メニューをスクロールして「ホーム画面に追加」をタップ</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <span className="text-sm">✓</span>
            </div>
            <div>
              <p className="text-sm font-medium text-text">3. 追加をタップ</p>
              <p className="text-xs text-text-light">右上の「追加」をタップして完了</p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-primary text-text text-sm font-bold hover:bg-primary-dark transition-colors"
        >
          OK
        </button>
      </motion.div>
    </motion.div>
  )
}

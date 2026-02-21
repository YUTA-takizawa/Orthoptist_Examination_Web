import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, AlertTriangle, CreditCard, Download } from 'lucide-react'
import type { GameData } from '@/types'

interface CompletionScreenProps {
  gameData: GameData
  dailyCorrect: number
  dailyTotal: number
  examDate: string | null
  onNavigate: (page: 'pastExam' | 'flashcard' | 'weak') => void
}

const TRIVIA = [
  '角膜には血管がなく、涙液と房水から酸素・栄養を得ている',
  '人間の眼球の重さは約7g、直径は約24mm',
  '涙液は1日に約1ml分泌される',
  'ロドプシンの再合成には約30分かかる（暗順応）',
  '新生児の視力は約0.02程度',
  '角膜の屈折力は約43Dで、眼球全体の約2/3を占める',
  '瞳孔の直径は2mm〜8mmの間で変化する',
  '黄斑部の中心窩には錐体細胞のみが存在する',
]

export function CompletionScreen({ gameData, dailyCorrect, dailyTotal, examDate, onNavigate }: CompletionScreenProps) {
  const trivia = useMemo(() => TRIVIA[Math.floor(Math.random() * TRIVIA.length)], [])

  const daysUntilExam = useMemo(() => {
    if (!examDate) return null
    const diff = new Date(examDate).getTime() - new Date().getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }, [examDate])

  function handleExport() {
    const data = {
      srs: localStorage.getItem('ort_srs_data'),
      game: localStorage.getItem('ort_game_data'),
      examDate: localStorage.getItem('ort_exam_date'),
      exportDate: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ort-study-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-full flex flex-col items-center justify-center px-4 py-8"
    >
      {/* Main completion message */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="text-center mb-8"
      >
        <div className="text-5xl mb-3">🎊</div>
        <h1 className="text-2xl font-bold text-text mb-2">今日のノルマ達成！</h1>
        <p className="text-text-light text-sm">
          {dailyCorrect}/{dailyTotal}問正解
        </p>
      </motion.div>

      {/* Stats cards */}
      <div className="w-full max-w-sm space-y-3 mb-6">
        <div className="bg-card rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
          <span className="text-sm text-text-light">獲得XP</span>
          <span className="text-lg font-bold text-primary-dark">{gameData.xp} XP</span>
        </div>
        <div className="bg-card rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
          <span className="text-sm text-text-light">レベル</span>
          <span className="text-lg font-bold text-accent-dark">Lv.{gameData.level}</span>
        </div>
        <div className="bg-card rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
          <span className="text-sm text-text-light">連続学習</span>
          <span className="text-lg font-bold text-orange-500">🔥 {gameData.streak}日</span>
        </div>
        {daysUntilExam !== null && (
          <div className="bg-card rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
            <span className="text-sm text-text-light">試験まで</span>
            <span className="text-lg font-bold text-red-500">あと{daysUntilExam}日</span>
          </div>
        )}
      </div>

      {/* Trivia */}
      <div className="w-full max-w-sm bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-8">
        <p className="text-xs text-blue-500 font-medium mb-1">💡 今日の豆知識</p>
        <p className="text-sm text-blue-800">{trivia}</p>
      </div>

      {/* Navigation buttons */}
      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={() => onNavigate('pastExam')}
          className="w-full flex items-center gap-3 bg-card rounded-2xl shadow-sm border border-gray-100 p-4 hover:border-primary transition-colors"
        >
          <BookOpen className="w-5 h-5 text-primary-dark" />
          <span className="text-sm font-medium">過去問ビューアー</span>
        </button>
        <button
          onClick={() => onNavigate('flashcard')}
          className="w-full flex items-center gap-3 bg-card rounded-2xl shadow-sm border border-gray-100 p-4 hover:border-primary transition-colors"
        >
          <CreditCard className="w-5 h-5 text-accent-dark" />
          <span className="text-sm font-medium">フラッシュカード</span>
        </button>
        <button
          onClick={() => onNavigate('weak')}
          className="w-full flex items-center gap-3 bg-card rounded-2xl shadow-sm border border-gray-100 p-4 hover:border-primary transition-colors"
        >
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          <span className="text-sm font-medium">苦手問題</span>
        </button>
        <button
          onClick={handleExport}
          className="w-full flex items-center gap-3 bg-card rounded-2xl shadow-sm border border-gray-100 p-4 hover:border-primary transition-colors"
        >
          <Download className="w-5 h-5 text-text-light" />
          <span className="text-sm font-medium">データバックアップ</span>
        </button>
      </div>
    </motion.div>
  )
}

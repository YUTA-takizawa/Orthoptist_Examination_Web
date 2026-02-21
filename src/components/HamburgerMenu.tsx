import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, BookOpen, CreditCard, AlertTriangle, Calendar, Trophy } from 'lucide-react'
import type { GameData } from '@/types'

interface HamburgerMenuProps {
  gameData: GameData
  onNavigate: (page: string) => void
}

export function HamburgerMenu({ gameData, onNavigate }: HamburgerMenuProps) {
  const [open, setOpen] = useState(false)

  function handleNav(page: string) {
    setOpen(false)
    onNavigate(page)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-30 w-10 h-10 flex items-center justify-center rounded-full bg-card shadow-md border border-gray-100"
        aria-label="メニューを開く"
      >
        <Menu className="w-5 h-5 text-text" />
      </button>

      {/* XP badge */}
      <div className="fixed top-4 right-4 z-30 flex items-center gap-2">
        <span className="text-xs font-bold text-orange-500">🔥{gameData.streak}</span>
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/20 text-primary-dark">
          Lv.{gameData.level}
        </span>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/30 z-40"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-card shadow-xl z-50 p-6"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-bold text-text">メニュー</h2>
                <button onClick={() => setOpen(false)} aria-label="メニューを閉じる">
                  <X className="w-5 h-5 text-text-light" />
                </button>
              </div>

              {/* Stats */}
              <div className="bg-bg rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text-light">XP</span>
                  <span className="text-sm font-bold text-primary-dark">{gameData.xp}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text-light">レベル</span>
                  <span className="text-sm font-bold text-accent-dark">Lv.{gameData.level}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-light">連続学習</span>
                  <span className="text-sm font-bold text-orange-500">🔥 {gameData.streak}日</span>
                </div>
              </div>

              {/* Nav items */}
              <nav className="space-y-2">
                <button
                  onClick={() => handleNav('study')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-bg transition-colors text-left"
                >
                  <BookOpen className="w-5 h-5 text-primary-dark" />
                  <span className="text-sm font-medium">今日の学習</span>
                </button>
                <button
                  onClick={() => handleNav('pastExam')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-bg transition-colors text-left"
                >
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium">過去問ビューアー</span>
                </button>
                <button
                  onClick={() => handleNav('flashcard')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-bg transition-colors text-left"
                >
                  <CreditCard className="w-5 h-5 text-accent-dark" />
                  <span className="text-sm font-medium">フラッシュカード</span>
                </button>
                <button
                  onClick={() => handleNav('weak')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-bg transition-colors text-left"
                >
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-medium">苦手問題</span>
                </button>
                <button
                  onClick={() => handleNav('examDate')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-bg transition-colors text-left"
                >
                  <Calendar className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-medium">試験日設定</span>
                </button>
                <button
                  onClick={() => handleNav('badges')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-bg transition-colors text-left"
                >
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-medium">バッジ一覧</span>
                </button>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

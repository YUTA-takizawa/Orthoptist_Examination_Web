import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { useGame } from '@/contexts/GameContext'
import { BADGE_DEFINITIONS } from '@/types'

interface BadgeViewProps {
  onBack: () => void
}

export function BadgeView({ onBack }: BadgeViewProps) {
  const { gameData } = useGame()

  return (
    <div className="min-h-full flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-4 pb-4">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-text" />
        </button>
        <h1 className="text-lg font-bold text-text">バッジ一覧</h1>
      </div>

      <div className="px-4 pb-8 grid grid-cols-2 gap-3">
        {Object.entries(BADGE_DEFINITIONS).map(([key, badge]) => {
          const earned = gameData.badges.includes(key)
          return (
            <motion.div
              key={key}
              whileHover={{ scale: 1.02 }}
              className={`bg-card rounded-2xl border p-4 text-center ${
                earned ? 'border-yellow-300 shadow-sm' : 'border-gray-100 opacity-40'
              }`}
            >
              <div className="text-3xl mb-2">{earned ? '🏆' : '🔒'}</div>
              <p className="text-sm font-bold text-text mb-1">{badge.name}</p>
              <p className="text-xs text-text-light">{badge.description}</p>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

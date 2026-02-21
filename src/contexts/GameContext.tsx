import { createContext, useContext, useCallback, type ReactNode } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import type { GameData } from '@/types'

function today(): string {
  return new Date().toISOString().split('T')[0]
}

const defaultGameData: GameData = {
  xp: 0,
  level: 1,
  streak: 0,
  lastStudyDate: '',
  badges: [],
}

interface GameContextType {
  gameData: GameData
  addXP: (amount: number) => { leveledUp: boolean }
  updateStreak: () => void
  addBadge: (badge: string) => void
  hasBadge: (badge: string) => boolean
  totalCorrect: () => number
}

const GameContext = createContext<GameContextType | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameData, setGameData] = useLocalStorage<GameData>('ort_game_data', defaultGameData)

  const addXP = useCallback(
    (amount: number) => {
      let leveledUp = false
      setGameData((prev) => {
        const newXP = prev.xp + amount
        const newLevel = Math.floor(newXP / 100) + 1
        if (newLevel > prev.level) {
          leveledUp = true
        }
        return { ...prev, xp: newXP, level: newLevel }
      })
      return { leveledUp }
    },
    [setGameData]
  )

  const updateStreak = useCallback(() => {
    setGameData((prev) => {
      const todayStr = today()
      if (prev.lastStudyDate === todayStr) return prev

      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      const newStreak = prev.lastStudyDate === yesterdayStr ? prev.streak + 1 : 1
      return { ...prev, streak: newStreak, lastStudyDate: todayStr }
    })
  }, [setGameData])

  const addBadge = useCallback(
    (badge: string) => {
      setGameData((prev) => {
        if (prev.badges.includes(badge)) return prev
        return { ...prev, badges: [...prev.badges, badge] }
      })
    },
    [setGameData]
  )

  const hasBadge = useCallback(
    (badge: string) => gameData.badges.includes(badge),
    [gameData.badges]
  )

  const totalCorrect = useCallback(() => {
    try {
      const raw = localStorage.getItem('ort_srs_data')
      if (!raw) return 0
      const store = JSON.parse(raw) as Record<string, { correct: number }>
      return Object.values(store).reduce((sum, d) => sum + d.correct, 0)
    } catch {
      return 0
    }
  }, [])

  return (
    <GameContext.Provider value={{ gameData, addXP, updateStreak, addBadge, hasBadge, totalCorrect }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) throw new Error('useGame must be used within GameProvider')
  return context
}

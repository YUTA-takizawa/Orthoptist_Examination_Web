import { useState, useMemo } from 'react'
import { ArrowLeft } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import type { Question } from '@/types'
import { QuestionCard } from './QuestionCard'
import { loadSRSStore, updateSRS, getWeakQuestions } from '@/utils/srs'
import { useGame } from '@/contexts/GameContext'
import { FeedbackOverlay } from './FeedbackOverlay'

interface WeakQuestionsViewProps {
  questions: Question[]
  onBack: () => void
}

export function WeakQuestionsView({ questions, onBack }: WeakQuestionsViewProps) {
  const [srsStore, setSrsStore] = useState(loadSRSStore)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [feedbackType, setFeedbackType] = useState<'correct' | 'wrong' | 'weak_overcome' | null>(null)
  const { addXP, updateStreak } = useGame()

  const weakIds = useMemo(() => getWeakQuestions(srsStore), [srsStore])
  const weakQuestions = useMemo(
    () => questions.filter((q) => weakIds.includes(q.id)),
    [questions, weakIds]
  )

  const currentQuestion = weakQuestions[currentIndex]

  function handleAnswer(isCorrect: boolean) {
    if (!currentQuestion) return

    const result = updateSRS(srsStore, currentQuestion.id, isCorrect)
    setSrsStore(result.store)

    if (isCorrect) {
      addXP(result.overcameWeak ? 20 : 10)
      setFeedbackType(result.overcameWeak ? 'weak_overcome' : 'correct')
    } else {
      setFeedbackType('wrong')
    }
    updateStreak()

    setTimeout(() => {
      setFeedbackType(null)
      if (currentIndex + 1 < weakQuestions.length) {
        setCurrentIndex(currentIndex + 1)
      } else {
        // Reload weak list
        setSrsStore(loadSRSStore())
        setCurrentIndex(0)
      }
    }, result.overcameWeak ? 2000 : 800)
  }

  if (weakQuestions.length === 0) {
    return (
      <div className="min-h-full flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-4 pb-2">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-text" />
          </button>
          <h1 className="text-lg font-bold text-text">苦手問題</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-3">✨</div>
            <p className="text-lg font-bold text-text mb-2">苦手問題はありません！</p>
            <p className="text-sm text-text-light">素晴らしい！全問題を克服しています。</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full pt-16 pb-8">
      <button
        onClick={onBack}
        className="fixed top-4 left-4 z-30 w-10 h-10 flex items-center justify-center rounded-full bg-card shadow-md border border-gray-100"
      >
        <ArrowLeft className="w-5 h-5 text-text" />
      </button>

      <div className="text-center mb-4">
        <span className="text-xs font-medium px-3 py-1 rounded-full bg-orange-100 text-orange-600">
          苦手問題 {weakQuestions.length}問
        </span>
      </div>

      <AnimatePresence mode="wait">
        {currentQuestion && (
          <QuestionCard
            key={currentQuestion.id + currentIndex}
            question={currentQuestion}
            onAnswer={handleAnswer}
            questionNumber={currentIndex}
            totalQuestions={weakQuestions.length}
          />
        )}
      </AnimatePresence>

      <FeedbackOverlay
        type={feedbackType ?? 'correct'}
        visible={feedbackType !== null}
        xp={feedbackType === 'weak_overcome' ? 20 : 10}
      />
    </div>
  )
}

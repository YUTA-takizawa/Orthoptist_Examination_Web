import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Question } from '@/types'
import { cn } from '@/lib/utils'

interface QuestionCardProps {
  question: Question
  onAnswer: (isCorrect: boolean) => void
  questionNumber: number
  totalQuestions: number
}

export function QuestionCard({ question, onAnswer, questionNumber, totalQuestions }: QuestionCardProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)

  const isCorrect = selected === question.answer
  const hasAnswered = selected !== null

  function handleSelect(index: number) {
    if (hasAnswered) return
    setSelected(index)
    setShowExplanation(true)

    // Auto-advance after delay
    setTimeout(() => {
      onAnswer(index === question.answer)
    }, 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-lg mx-auto px-4"
    >
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5 mb-4">
        {Array.from({ length: Math.min(totalQuestions, 10) }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'w-2.5 h-2.5 rounded-full transition-colors',
              i < questionNumber ? 'bg-primary-dark' : i === questionNumber ? 'bg-primary' : 'bg-gray-300'
            )}
          />
        ))}
        {totalQuestions > 10 && <span className="text-xs text-text-light ml-1">+{totalQuestions - 10}</span>}
      </div>

      {/* Subject tag */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/30 text-accent-dark">
          {question.subject}
        </span>
        <span className="text-xs text-text-light">
          {question.year}年 第{question.id.split('-')[1]}回
        </span>
      </div>

      {/* Question text */}
      <div className="bg-card rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
        <p className="text-base font-medium leading-relaxed">{question.question}</p>
      </div>

      {/* Choices */}
      <div className="space-y-2.5">
        {question.choices.map((choice, index) => {
          const isThis = selected === index
          const isAnswer = index === question.answer

          return (
            <motion.button
              key={index}
              whileTap={!hasAnswered ? { scale: 0.98 } : undefined}
              onClick={() => handleSelect(index)}
              disabled={hasAnswered}
              className={cn(
                'w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all text-sm',
                !hasAnswered && 'border-gray-200 bg-card hover:border-primary active:bg-primary/10',
                hasAnswered && isAnswer && 'border-correct bg-correct/10 text-correct',
                hasAnswered && isThis && !isCorrect && 'border-wrong bg-wrong/10 text-wrong',
                hasAnswered && !isThis && !isAnswer && 'border-gray-100 bg-gray-50 text-text-light opacity-50'
              )}
            >
              <span className="font-medium mr-2">
                {String.fromCharCode(65 + index)}.
              </span>
              {choice}
            </motion.button>
          )
        })}
      </div>

      {/* Feedback overlay */}
      <AnimatePresence>
        {hasAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            {/* Correct/Wrong indicator */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                'text-center py-2 rounded-xl font-bold text-lg mb-3',
                isCorrect ? 'text-correct' : 'text-wrong'
              )}
            >
              {isCorrect ? '✓ 正解！ +10XP' : '✗ 不正解'}
            </motion.div>

            {/* Explanation */}
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-blue-50 border border-blue-100 rounded-xl p-4"
              >
                <p className="text-sm text-blue-900 font-medium mb-1">解説</p>
                <p className="text-sm text-blue-800 leading-relaxed">{question.explanation}</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

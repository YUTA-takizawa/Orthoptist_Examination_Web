import { useState, useMemo } from 'react'
import { ArrowLeft } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import type { Question } from '@/types'
import { SUBJECTS } from '@/types'
import { QuestionCard } from './QuestionCard'
import { loadSRSStore, updateSRS } from '@/utils/srs'
import { useGame } from '@/contexts/GameContext'

interface PastExamViewProps {
  questions: Question[]
  onBack: () => void
  initialQuestionId?: string | null
}

export function PastExamView({ questions, onBack, initialQuestionId }: PastExamViewProps) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mode, setMode] = useState<'browse' | 'quiz'>(initialQuestionId ? 'quiz' : 'browse')
  const { addXP, updateStreak } = useGame()

  const years = useMemo(() => [...new Set(questions.map((q) => q.year))].sort((a, b) => b - a), [questions])

  const filtered = useMemo(() => {
    let result = questions
    if (selectedYear) result = result.filter((q) => q.year === selectedYear)
    if (selectedSubject) result = result.filter((q) => q.subject === selectedSubject)
    return result
  }, [questions, selectedYear, selectedSubject])

  // If we have an initial question ID, find and show it
  const initialQuestion = useMemo(() => {
    if (!initialQuestionId) return null
    return questions.find((q) => q.id === initialQuestionId) ?? null
  }, [questions, initialQuestionId])

  function startQuiz(startIndex: number = 0) {
    setCurrentIndex(startIndex)
    setMode('quiz')
  }

  function handleAnswer(isCorrect: boolean) {
    const store = loadSRSStore()
    const q = initialQuestion ?? filtered[currentIndex]
    if (q) {
      updateSRS(store, q.id, isCorrect)
      if (isCorrect) addXP(10)
      updateStreak()
    }

    setTimeout(() => {
      if (initialQuestion) {
        setMode('browse')
        return
      }
      if (currentIndex + 1 < filtered.length) {
        setCurrentIndex(currentIndex + 1)
      } else {
        setMode('browse')
      }
    }, 800)
  }

  if (mode === 'quiz') {
    const q = initialQuestion ?? filtered[currentIndex]
    if (!q) {
      setMode('browse')
      return null
    }
    return (
      <div className="min-h-full pt-16 pb-8">
        <button
          onClick={() => setMode('browse')}
          className="fixed top-4 left-4 z-30 w-10 h-10 flex items-center justify-center rounded-full bg-card shadow-md border border-gray-100"
        >
          <ArrowLeft className="w-5 h-5 text-text" />
        </button>
        <AnimatePresence mode="wait">
          <QuestionCard
            key={q.id}
            question={q}
            onAnswer={handleAnswer}
            questionNumber={currentIndex}
            totalQuestions={initialQuestion ? 1 : filtered.length}
          />
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="min-h-full flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-text" />
        </button>
        <h1 className="text-lg font-bold text-text">過去問ビューアー</h1>
      </div>

      {/* Year filter */}
      <div className="flex gap-2 px-4 pb-2 overflow-x-auto">
        <button
          onClick={() => setSelectedYear(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
            !selectedYear ? 'bg-primary text-text' : 'bg-gray-100 text-text-light'
          }`}
        >
          全年度
        </button>
        {years.map((y) => (
          <button
            key={y}
            onClick={() => setSelectedYear(y)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
              selectedYear === y ? 'bg-primary text-text' : 'bg-gray-100 text-text-light'
            }`}
          >
            {y}年
          </button>
        ))}
      </div>

      {/* Subject filter */}
      <div className="flex gap-2 px-4 pb-4 overflow-x-auto">
        <button
          onClick={() => setSelectedSubject(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
            !selectedSubject ? 'bg-accent text-white' : 'bg-gray-100 text-text-light'
          }`}
        >
          全科目
        </button>
        {SUBJECTS.map((s) => (
          <button
            key={s}
            onClick={() => setSelectedSubject(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
              selectedSubject === s ? 'bg-accent text-white' : 'bg-gray-100 text-text-light'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Question list */}
      <div className="flex-1 px-4 pb-8 space-y-2">
        {filtered.length === 0 ? (
          <p className="text-center text-text-light py-8">問題が見つかりません</p>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-text-light">{filtered.length}問</p>
              <button
                onClick={() => startQuiz(0)}
                className="px-4 py-2 rounded-xl bg-primary text-text text-sm font-bold hover:bg-primary-dark transition-colors"
              >
                まとめて解く
              </button>
            </div>
            {filtered.map((q, i) => (
              <button
                key={q.id}
                onClick={() => startQuiz(i)}
                className="w-full text-left bg-card rounded-xl border border-gray-100 p-4 hover:border-primary transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/20 text-accent-dark">
                    {q.subject}
                  </span>
                  <span className="text-xs text-text-light">{q.year}年</span>
                </div>
                <p className="text-sm text-text line-clamp-2">{q.question}</p>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

import { useState, useEffect, useMemo, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { GameProvider, useGame } from '@/contexts/GameContext'
import { useQuestions } from '@/hooks/useQuestions'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import {
  loadSRSStore,
  updateSRS,
  getDueQuestions,
  shouldUseSRS,
  getRandomQuestions,
} from '@/utils/srs'
import type { SRSStore } from '@/types'
import { QuestionCard } from '@/components/QuestionCard'
import { FeedbackOverlay } from '@/components/FeedbackOverlay'
import { CompletionScreen } from '@/components/CompletionScreen'
import { HamburgerMenu } from '@/components/HamburgerMenu'
import { ExamDateModal } from '@/components/ExamDateModal'
import { FlashCardView } from '@/components/FlashCardView'
import { PastExamView } from '@/components/PastExamView'
import { WeakQuestionsView } from '@/components/WeakQuestionsView'
import { BadgeView } from '@/components/BadgeView'
import { FormulaView } from '@/components/FormulaView'
import { ShareButton } from '@/components/ShareButton'
import { IOSGuideModal } from '@/components/IOSGuideModal'

type Page = 'study' | 'completed' | 'pastExam' | 'flashcard' | 'weak' | 'badges' | 'examDate' | 'formula'

function StudyApp() {
  const { questions, loading, error } = useQuestions()
  const { gameData, addXP, updateStreak, addBadge, totalCorrect } = useGame()
  const [examDate, setExamDate] = useLocalStorage<string | null>('ort_exam_date', null)
  const [showExamModal, setShowExamModal] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)
  const [page, setPage] = useState<Page>('study')
  const [srsStore, setSrsStore] = useState<SRSStore>(loadSRSStore)
  const [sessionQuestions, setSessionQuestions] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [feedbackType, setFeedbackType] = useState<'correct' | 'wrong' | 'weak_overcome' | 'level_up' | null>(null)
  const [dailyCorrect, setDailyCorrect] = useState(0)
  const [sharedQuestionId, setSharedQuestionId] = useState<string | null>(null)

  // Check for shared question via URL param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const qId = params.get('q')
    if (qId) {
      setSharedQuestionId(qId)
      setPage('pastExam')
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  // iOS guide check
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const guideShown = localStorage.getItem('ort_ios_guide_shown')

    if (isIOS && !isStandalone && !guideShown) {
      setShowIOSGuide(true)
    }
  }, [])

  // First launch exam date prompt
  useEffect(() => {
    if (!loading && questions.length > 0 && examDate === null && !sharedQuestionId) {
      setShowExamModal(true)
    }
  }, [loading, questions.length, examDate, sharedQuestionId])

  // Calculate daily target
  const dailyTarget = useMemo(() => {
    if (!examDate) return 10
    const daysLeft = Math.max(
      1,
      Math.ceil((new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    )
    const allIds = questions.map((q) => q.id)
    const completedCount = Object.keys(srsStore).filter(
      (id) => allIds.includes(id) && srsStore[id].interval >= 7
    ).length
    const remaining = Math.max(0, questions.length - completedCount)
    return Math.max(5, Math.min(30, Math.ceil(remaining / daysLeft)))
  }, [examDate, questions, srsStore])

  // Build session questions
  useEffect(() => {
    if (questions.length === 0) return
    if (sessionQuestions.length > 0) return

    const allIds = questions.map((q) => q.id)
    const store = loadSRSStore()

    let selected: string[]
    if (shouldUseSRS(store)) {
      selected = getDueQuestions(store, allIds).slice(0, dailyTarget)
    } else {
      selected = getRandomQuestions(allIds, dailyTarget)
    }

    if (selected.length === 0) {
      selected = getRandomQuestions(allIds, dailyTarget)
    }

    setSessionQuestions(selected)
  }, [questions, dailyTarget, sessionQuestions.length])

  // Check badges
  const checkBadges = useCallback(() => {
    const correct = totalCorrect()
    if (correct >= 100) addBadge('first_100')
    if (gameData.streak >= 7) addBadge('streak_7')

    // Check weak overcome count
    const store = loadSRSStore()
    const overcomeCount = Object.values(store).filter((d) => !d.weak && d.wrong > 0 && d.correct >= 3).length
    if (overcomeCount >= 10) addBadge('weak_10')
  }, [totalCorrect, gameData.streak, addBadge])

  function handleAnswer(isCorrect: boolean) {
    const qId = sessionQuestions[currentIndex]
    if (!qId) return

    const result = updateSRS(srsStore, qId, isCorrect)
    setSrsStore(result.store)

    if (isCorrect) {
      const xpAmount = result.overcameWeak ? 20 : 10
      const { leveledUp } = addXP(xpAmount)
      setDailyCorrect((c) => c + 1)

      if (result.overcameWeak) {
        setFeedbackType('weak_overcome')
      } else if (leveledUp) {
        setFeedbackType('level_up')
      } else {
        setFeedbackType('correct')
      }
    } else {
      setFeedbackType('wrong')
    }

    updateStreak()
    checkBadges()

    const duration = feedbackType === 'level_up' ? 2500 : feedbackType === 'weak_overcome' ? 2000 : 800

    setTimeout(() => {
      setFeedbackType(null)
      if (currentIndex + 1 < sessionQuestions.length) {
        setCurrentIndex(currentIndex + 1)
      } else {
        setPage('completed')
      }
    }, duration)
  }

  function handleNavigate(target: string) {
    setPage(target as Page)
    if (target === 'study') {
      // Restart session
      setSessionQuestions([])
      setCurrentIndex(0)
      setDailyCorrect(0)
    }
  }

  function handleExamDateSave(date: string) {
    setExamDate(date)
    setShowExamModal(false)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-light text-sm">問題を読み込んでいます...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg px-4">
        <div className="text-center">
          <p className="text-wrong text-lg font-bold mb-2">エラー</p>
          <p className="text-text-light text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Hamburger menu */}
      {(page === 'study' || page === 'completed') && (
        <HamburgerMenu gameData={gameData} onNavigate={handleNavigate} />
      )}

      {/* Main content */}
      {page === 'study' && (
        <div className="min-h-screen pt-16 pb-8">
          {sessionQuestions.length > 0 && currentIndex < sessionQuestions.length ? (
            <>
              <AnimatePresence mode="wait">
                {(() => {
                  const q = questions.find((item) => item.id === sessionQuestions[currentIndex])
                  if (!q) return null
                  return (
                    <QuestionCard
                      key={q.id}
                      question={q}
                      onAnswer={handleAnswer}
                      questionNumber={currentIndex}
                      totalQuestions={sessionQuestions.length}
                    />
                  )
                })()}
              </AnimatePresence>
              <ShareButton questionId={sessionQuestions[currentIndex]} />
            </>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-text-light">問題を準備中...</p>
            </div>
          )}
        </div>
      )}

      {page === 'completed' && (
        <CompletionScreen
          gameData={gameData}
          dailyCorrect={dailyCorrect}
          dailyTotal={sessionQuestions.length}
          examDate={examDate}
          onNavigate={handleNavigate}
        />
      )}

      {page === 'pastExam' && (
        <PastExamView
          questions={questions}
          onBack={() => handleNavigate('study')}
          initialQuestionId={sharedQuestionId}
        />
      )}

      {page === 'flashcard' && <FlashCardView onBack={() => handleNavigate('study')} />}

      {page === 'weak' && (
        <WeakQuestionsView questions={questions} onBack={() => handleNavigate('study')} />
      )}

      {page === 'badges' && <BadgeView onBack={() => handleNavigate('study')} />}

      {page === 'formula' && <FormulaView onBack={() => handleNavigate('study')} />}

      {page === 'examDate' && (
        <div className="min-h-screen flex items-center justify-center">
          <ExamDateModal
            currentDate={examDate}
            onSave={(date) => {
              handleExamDateSave(date)
              setPage('study')
            }}
            onClose={() => setPage('study')}
          />
        </div>
      )}

      {/* Feedback overlay */}
      <FeedbackOverlay
        type={feedbackType ?? 'correct'}
        visible={feedbackType !== null}
        level={gameData.level}
        xp={feedbackType === 'weak_overcome' ? 20 : 10}
      />

      {/* Exam date modal (first launch) */}
      <AnimatePresence>
        {showExamModal && (
          <ExamDateModal
            currentDate={null}
            onSave={handleExamDateSave}
            onClose={() => setShowExamModal(false)}
          />
        )}
      </AnimatePresence>

      {/* iOS guide modal */}
      <AnimatePresence>
        {showIOSGuide && (
          <IOSGuideModal
            onClose={() => {
              setShowIOSGuide(false)
              localStorage.setItem('ort_ios_guide_shown', 'true')
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default function App() {
  return (
    <GameProvider>
      <StudyApp />
    </GameProvider>
  )
}

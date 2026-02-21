import { useState, useMemo } from 'react'
import { motion, AnimatePresence, type PanInfo } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useFlashcards } from '@/hooks/useFlashcards'

interface FlashCardViewProps {
  onBack: () => void
}

const CATEGORIES = [
  { key: undefined as string | undefined, label: '全カテゴリ' },
  { key: 'anatomy', label: '解剖学' },
  { key: 'optics', label: '眼光学' },
  { key: 'diseases', label: '疾患' },
  { key: 'examination', label: '検査' },
  { key: 'law', label: '関係法規' },
]

export function FlashCardView({ onBack }: FlashCardViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined)
  const { cards, loading } = useFlashcards(selectedCategory)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState<Set<string>>(new Set())
  const [direction, setDirection] = useState(0)

  const remaining = useMemo(
    () => cards.filter((c) => !known.has(c.id)),
    [cards, known]
  )

  const currentCard = remaining[currentIndex % Math.max(1, remaining.length)]

  function handleSwipe(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    if (!currentCard) return
    if (Math.abs(info.offset.x) < 80) return

    if (info.offset.x > 0) {
      // Right swipe = known
      setKnown((prev) => new Set([...prev, currentCard.id]))
      setDirection(1)
    } else {
      // Left swipe = unknown, keep for review
      setDirection(-1)
    }
    setFlipped(false)
    setCurrentIndex((prev) => prev + 1)
  }

  function handleTap() {
    setFlipped((f) => !f)
  }

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <p className="text-text-light">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-text" />
        </button>
        <h1 className="text-lg font-bold text-text">フラッシュカード</h1>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 px-4 pb-4 overflow-x-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key ?? 'all'}
            onClick={() => {
              setSelectedCategory(cat.key)
              setCurrentIndex(0)
              setKnown(new Set())
              setFlipped(false)
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat.key
                ? 'bg-accent text-white'
                : 'bg-gray-100 text-text-light hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Card area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        {remaining.length === 0 ? (
          <div className="text-center">
            <div className="text-4xl mb-3">🎉</div>
            <p className="text-lg font-bold text-text mb-2">全カード完了！</p>
            <button
              onClick={() => {
                setKnown(new Set())
                setCurrentIndex(0)
              }}
              className="px-6 py-2 rounded-xl bg-primary text-text text-sm font-bold"
            >
              もう一度
            </button>
          </div>
        ) : currentCard ? (
          <>
            <p className="text-sm text-text-light mb-4">
              残り {remaining.length}枚 / 全{cards.length}枚
            </p>

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentCard.id + currentIndex}
                custom={direction}
                initial={{ x: direction * 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: direction * -300, opacity: 0 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleSwipe}
                onClick={handleTap}
                className="w-full max-w-sm aspect-[3/4] cursor-pointer select-none"
              >
                <div className="w-full h-full bg-card rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col items-center justify-center">
                  {!flipped ? (
                    <div className="text-center">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/20 text-accent-dark mb-4 inline-block">
                        {currentCard.category}
                      </span>
                      <p className="text-lg font-bold text-text leading-relaxed">{currentCard.front}</p>
                      <p className="text-xs text-text-light mt-4">タップで裏面を表示</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-xs font-medium text-accent-dark mb-3">答え</p>
                      <p className="text-base font-medium text-text leading-relaxed whitespace-pre-line">
                        {currentCard.back}
                      </p>
                      <div className="flex gap-3 mt-6 text-xs text-text-light">
                        <span>← まだ</span>
                        <span>覚えた →</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </>
        ) : null}
      </div>
    </div>
  )
}

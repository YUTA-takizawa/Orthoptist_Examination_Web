import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ChevronDown } from 'lucide-react'

interface Formula {
  id: string
  category: string
  title: string
  formula: string
  description: string
  example: string
}

interface FormulaViewProps {
  onBack: () => void
}

const BASE = import.meta.env.BASE_URL

const CATEGORY_COLORS: Record<string, string> = {
  '視力': 'bg-green-100 text-green-800',
  '屈折・レンズ': 'bg-blue-100 text-blue-800',
  '調節': 'bg-purple-100 text-purple-800',
  'プリズム': 'bg-orange-100 text-orange-800',
  '眼球光学定数': 'bg-red-100 text-red-800',
  '拡大鏡・ルーペ': 'bg-teal-100 text-teal-800',
}

export function FormulaView({ onBack }: FormulaViewProps) {
  const [formulas, setFormulas] = useState<Formula[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${BASE}data/formulas.json`)
        const data = (await res.json()) as Formula[]
        setFormulas(data)
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const categories = [...new Set(formulas.map((f) => f.category))]
  const filtered = selectedCategory
    ? formulas.filter((f) => f.category === selectedCategory)
    : formulas

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <p className="text-text-light">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-full flex flex-col pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5 text-text" />
        </button>
        <h1 className="text-lg font-bold text-text">公式集</h1>
        <span className="text-xs text-text-light ml-auto">{filtered.length}公式</span>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 px-4 pb-4 overflow-x-auto">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
            selectedCategory === null
              ? 'bg-accent text-white'
              : 'bg-gray-100 text-text-light hover:bg-gray-200'
          }`}
        >
          全て
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-accent text-white'
                : 'bg-gray-100 text-text-light hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Formula cards */}
      <div className="px-4 space-y-3">
        {filtered.map((f) => {
          const isExpanded = expandedId === f.id
          const colorClass = CATEGORY_COLORS[f.category] || 'bg-gray-100 text-gray-800'

          return (
            <motion.div
              key={f.id}
              layout
              className="bg-card rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Formula header - always visible */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : f.id)}
                className="w-full text-left p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${colorClass} inline-block mb-2`}>
                      {f.category}
                    </span>
                    <p className="text-sm font-bold text-text mb-1">{f.title}</p>
                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                      <p className="text-sm font-mono font-bold text-primary-dark whitespace-pre-line">
                        {f.formula}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-text-light mt-1 transition-transform flex-shrink-0 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Expandable detail */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3">
                      {/* Description */}
                      <p className="text-xs text-text-light leading-relaxed">{f.description}</p>

                      {/* Example */}
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                        <p className="text-xs font-bold text-blue-900 mb-1">計算例</p>
                        <p className="text-xs text-blue-800 leading-relaxed whitespace-pre-line font-mono">
                          {f.example}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

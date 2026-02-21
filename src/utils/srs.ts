import type { SRSData, SRSStore } from '@/types'

const SRS_STORAGE_KEY = 'ort_srs_data'

function today(): string {
  return new Date().toISOString().split('T')[0]
}

export function loadSRSStore(): SRSStore {
  try {
    const raw = localStorage.getItem(SRS_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SRSStore) : {}
  } catch {
    return {}
  }
}

export function saveSRSStore(store: SRSStore): void {
  localStorage.setItem(SRS_STORAGE_KEY, JSON.stringify(store))
}

function defaultSRSData(): SRSData {
  return {
    nextDate: today(),
    interval: 0,
    easeFactor: 2.5,
    correct: 0,
    wrong: 0,
    weak: false,
  }
}

/**
 * SM-2 based algorithm simplified to correct/incorrect binary.
 * - Correct: increase interval (1 -> 3 -> 7 -> 14 -> ...) with ease factor
 * - Incorrect: reset interval to 1 day, decrease ease factor
 */
export function updateSRS(
  store: SRSStore,
  questionId: string,
  isCorrect: boolean
): { store: SRSStore; data: SRSData; wasWeak: boolean; overcameWeak: boolean } {
  const prev = store[questionId] ?? defaultSRSData()
  const wasWeak = prev.weak

  let interval: number
  let easeFactor = prev.easeFactor

  if (isCorrect) {
    if (prev.interval === 0) {
      interval = 1
    } else if (prev.interval === 1) {
      interval = 3
    } else {
      interval = Math.round(prev.interval * easeFactor)
    }
    easeFactor = Math.min(3.0, easeFactor + 0.1)
  } else {
    interval = 1
    easeFactor = Math.max(1.3, easeFactor - 0.2)
  }

  const nextDate = new Date()
  nextDate.setDate(nextDate.getDate() + interval)

  const correctCount = isCorrect ? prev.correct + 1 : prev.correct
  const wrongCount = isCorrect ? prev.wrong : prev.wrong + 1

  // Weak flag: set on incorrect, clear after 3 consecutive correct
  // Track consecutive correct by checking if wrong count didn't change
  let weak = prev.weak
  let consecutiveCorrect = 0

  if (!isCorrect) {
    weak = true
    consecutiveCorrect = 0
  } else if (prev.weak) {
    // Count recent consecutive correct from the record
    // Simple approach: use interval as a proxy - if interval >= 3, that means at least 3 consecutive correct
    consecutiveCorrect = prev.interval === 0 ? 1 : prev.interval >= 3 ? 3 : prev.interval
    if (consecutiveCorrect >= 3) {
      weak = false
    }
  }

  const overcameWeak = wasWeak && !weak

  const data: SRSData = {
    nextDate: nextDate.toISOString().split('T')[0],
    interval,
    easeFactor,
    correct: correctCount,
    wrong: wrongCount,
    weak,
  }

  const newStore = { ...store, [questionId]: data }
  saveSRSStore(newStore)

  return { store: newStore, data, wasWeak, overcameWeak }
}

/**
 * Get questions due for review today, sorted by priority.
 * New questions (not in store) are also included.
 */
export function getDueQuestions(store: SRSStore, allQuestionIds: string[]): string[] {
  const todayStr = today()
  const due: string[] = []
  const newQuestions: string[] = []

  for (const id of allQuestionIds) {
    const data = store[id]
    if (!data) {
      newQuestions.push(id)
    } else if (data.nextDate <= todayStr) {
      due.push(id)
    }
  }

  // Prioritize: weak questions first, then due, then new
  due.sort((a, b) => {
    const aWeak = store[a]?.weak ? 0 : 1
    const bWeak = store[b]?.weak ? 0 : 1
    return aWeak - bWeak
  })

  return [...due, ...newQuestions]
}

/**
 * Get weak questions only.
 */
export function getWeakQuestions(store: SRSStore): string[] {
  return Object.entries(store)
    .filter(([, data]) => data.weak)
    .map(([id]) => id)
}

/**
 * For initial 10 or fewer questions, use random selection.
 * After that, switch to SRS.
 */
export function shouldUseSRS(store: SRSStore): boolean {
  return Object.keys(store).length > 10
}

/**
 * Get random questions for initial phase.
 */
export function getRandomQuestions(allQuestionIds: string[], count: number): string[] {
  const shuffled = [...allQuestionIds].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

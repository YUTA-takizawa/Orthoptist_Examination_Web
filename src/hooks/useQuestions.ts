import { useState, useEffect } from 'react'
import type { Question } from '@/types'

const BASE = import.meta.env.BASE_URL

export function useQuestions() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const indexRes = await fetch(`${BASE}data/index.json`)
        const index = (await indexRes.json()) as { years: number[] }

        const allQuestions: Question[] = []
        for (const year of index.years) {
          const res = await fetch(`${BASE}data/questions/${year}.json`)
          const yearQuestions = (await res.json()) as Question[]
          allQuestions.push(...yearQuestions)
        }

        setQuestions(allQuestions)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'データの読み込みに失敗しました')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return { questions, loading, error }
}

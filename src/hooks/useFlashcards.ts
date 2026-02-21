import { useState, useEffect } from 'react'
import type { FlashCard } from '@/types'

const BASE = import.meta.env.BASE_URL

export function useFlashcards(category?: string) {
  const [cards, setCards] = useState<FlashCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const indexRes = await fetch(`${BASE}data/index.json`)
        const index = (await indexRes.json()) as { flashcardCategories: string[] }

        const categoriesToLoad = category
          ? index.flashcardCategories.filter((c) => c === category)
          : index.flashcardCategories

        const allCards: FlashCard[] = []
        for (const cat of categoriesToLoad) {
          const res = await fetch(`${BASE}data/flashcards/${cat}.json`)
          const catCards = (await res.json()) as FlashCard[]
          allCards.push(...catCards)
        }
        setCards(allCards)
      } catch {
        // Silently fail - flashcards are optional
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [category])

  return { cards, loading }
}

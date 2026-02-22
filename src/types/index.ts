export const SUBJECTS = [
  '視覚生理',
  '眼光学',
  '眼科学',
  '神経眼科学',
  '眼筋学',
  '視野学',
  'ロービジョン',
  '関係法規',
  '臨床総合',
] as const

export type Subject = (typeof SUBJECTS)[number]

export interface Question {
  id: string
  year: number
  subject: Subject
  question: string
  choices: string[]
  answer: number
  explanation: string
  calculationSteps?: string[]
  relatedFormula?: string
  image: string | null
}

export interface FlashCard {
  id: string
  category: string
  front: string
  back: string
}

export interface SRSData {
  nextDate: string
  interval: number
  easeFactor: number
  correct: number
  wrong: number
  weak: boolean
}

export type SRSStore = Record<string, SRSData>

export interface GameData {
  xp: number
  level: number
  streak: number
  lastStudyDate: string
  badges: string[]
}

export const BADGE_DEFINITIONS: Record<string, { name: string; description: string }> = {
  first_100: { name: '100問達成', description: '累計100問正解' },
  streak_7: { name: '7日連続', description: '7日連続学習達成' },
  weak_10: { name: '苦手克服10', description: '苦手問題を10問克服' },
  subject_視覚生理: { name: '視覚生理マスター', description: '視覚生理の正解率80%以上' },
  subject_眼光学: { name: '眼光学マスター', description: '眼光学の正解率80%以上' },
  subject_眼科学: { name: '眼科学マスター', description: '眼科学の正解率80%以上' },
  subject_神経眼科学: { name: '神経眼科学マスター', description: '神経眼科学の正解率80%以上' },
  subject_眼筋学: { name: '眼筋学マスター', description: '眼筋学の正解率80%以上' },
  subject_視野学: { name: '視野学マスター', description: '視野学の正解率80%以上' },
  subject_ロービジョン: { name: 'ロービジョンマスター', description: 'ロービジョンの正解率80%以上' },
  subject_関係法規: { name: '関係法規マスター', description: '関係法規の正解率80%以上' },
  subject_臨床総合: { name: '臨床総合マスター', description: '臨床総合の正解率80%以上' },
}

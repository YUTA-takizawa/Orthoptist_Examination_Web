import { Share2 } from 'lucide-react'

interface ShareButtonProps {
  questionId: string
}

export function ShareButton({ questionId }: ShareButtonProps) {
  async function handleShare() {
    const url = `${window.location.origin}${import.meta.env.BASE_URL}?q=${questionId}`
    const shareData = {
      title: 'ORT国試スタディ',
      text: 'この問題を一緒に解こう！',
      url,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch {
        // User cancelled or share failed, fall through to clipboard
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url)
      alert('URLをコピーしました')
    } catch {
      // Last resort
      prompt('URLをコピーしてください:', url)
    }
  }

  return (
    <button
      onClick={handleShare}
      className="fixed bottom-4 right-4 z-30 w-12 h-12 flex items-center justify-center rounded-full bg-accent shadow-lg hover:bg-accent-dark transition-colors"
      aria-label="問題をシェア"
    >
      <Share2 className="w-5 h-5 text-white" />
    </button>
  )
}

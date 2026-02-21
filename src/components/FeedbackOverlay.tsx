import { motion, AnimatePresence } from 'framer-motion'

interface FeedbackOverlayProps {
  type: 'correct' | 'wrong' | 'weak_overcome' | 'level_up'
  xp?: number
  level?: number
  visible: boolean
}

export function FeedbackOverlay({ type, xp, level, visible }: FeedbackOverlayProps) {
  return (
    <AnimatePresence>
      {visible && type === 'correct' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 pointer-events-none z-40"
        >
          <motion.div
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 bg-correct/10"
          />
        </motion.div>
      )}

      {visible && type === 'wrong' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 pointer-events-none z-40"
        >
          <motion.div
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-wrong/10"
          />
        </motion.div>
      )}

      {visible && type === 'weak_overcome' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
              className="text-5xl mb-2"
            >
              🎉
            </motion.div>
            <p className="text-2xl font-bold text-accent-dark">克服！ +{xp ?? 20}XP</p>
          </div>
        </motion.div>
      )}

      {visible && type === 'level_up' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
        >
          <motion.div
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, y: 50 }}
            className="bg-card rounded-3xl p-8 mx-4 text-center shadow-xl"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: 2 }}
              className="text-6xl mb-4"
            >
              ⭐
            </motion.div>
            <h2 className="text-2xl font-bold text-text mb-2">レベルアップ！</h2>
            <p className="text-4xl font-bold text-primary-dark mb-2">Lv.{level}</p>
            <p className="text-sm text-text-light">このまま頑張ろう！</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

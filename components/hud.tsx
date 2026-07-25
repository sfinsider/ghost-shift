"use client"

import { useGame } from "@/contexts/game-context"
import { Users, Target, Clock, RotateCcw } from "lucide-react"

export function HUD({ onRestart }: { onRestart?: () => void }) {
  const { gameState, resetGame } = useGame()

  if (gameState.currentStage === 0 || gameState.isMinigameActive || gameState.currentStage === 5) return null

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const quotaProgress = (gameState.quota / gameState.quotaTarget) * 100

  const handleRestart = () => {
    resetGame()
    onRestart?.()
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Primary: Quota Progress */}
          <div className="flex items-center gap-2 flex-1">
            <Target className="w-5 h-5 text-orange-400" />
            <div className="flex flex-col flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-mono font-bold text-white">
                  {gameState.quota}/{gameState.quotaTarget}
                </span>
                <span className="text-xs text-gray-400">units</span>
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-400 transition-all duration-300"
                  style={{ width: `${quotaProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Secondary: Worker Count */}
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-mono text-white">{gameState.workers}</span>
          </div>

          {/* Tertiary: Timer */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-red-400" />
            <span className="text-sm font-mono text-white">{formatTime(gameState.timer)}</span>
          </div>

          <button
            onClick={handleRestart}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md transition-colors"
            title="Restart Game"
          >
            <RotateCcw className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400 hidden sm:inline">Restart</span>
          </button>
        </div>
      </div>
    </div>
  )
}

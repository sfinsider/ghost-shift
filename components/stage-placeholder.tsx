"use client"

import { motion } from "framer-motion"
import { useGame } from "@/contexts/game-context"

export function StagePlaceholder() {
  const { gameState } = useGame()

  return (
    <div className="min-h-screen pt-20 px-4 flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-white">Stage {gameState.currentStage}</h2>
        <p className="text-gray-400 font-mono">Coming soon...</p>
        <div className="grid grid-cols-2 gap-4 mt-8 text-left text-sm font-mono">
          <div className="bg-white/5 p-4 rounded border border-white/10">
            <div className="text-gray-400">Quota</div>
            <div className="text-white text-xl">
              {gameState.quota}/{gameState.quotaTarget}
            </div>
          </div>
          <div className="bg-white/5 p-4 rounded border border-white/10">
            <div className="text-gray-400">Workers</div>
            <div className="text-white text-xl">{gameState.workers}</div>
          </div>
          <div className="bg-white/5 p-4 rounded border border-white/10">
            <div className="text-gray-400">Humanity</div>
            <div className="text-white text-xl">{gameState.humanityScore}</div>
          </div>
          <div className="bg-white/5 p-4 rounded border border-white/10">
            <div className="text-gray-400">Darkness</div>
            <div className="text-white text-xl">{Math.round(gameState.darknessLevel)}%</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

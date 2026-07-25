"use client"

import { useGame } from "@/contexts/game-context"
import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function StageFour() {
  const { gameState, setEnding, advanceStage, setWorkers, trackDecision } = useGame()

  const handleChoice = (choice: "lightsOut" | "oversight") => {
    if (choice === "lightsOut") {
      console.log("[v0] Decision 4: Lights Out - workers → 0")
      trackDecision(4, "Enable Lights Out", "Workers → 0, Full automation")
      setWorkers(0) // Absolute: any → 0
      setEnding("automated")
    } else {
      console.log("[v0] Decision 4: Maintain Oversight - workers preserved at", gameState.workers)
      trackDecision(4, "Maintain Oversight", `Workers preserved at ${gameState.workers}`)
      // Workers unchanged (stays at current level: 100, 75, 20, or 3)

      // Determine ending based on final worker count
      if (gameState.workers >= 50) {
        setEnding("lastThree") // High worker count = "Factory is Alive"
      } else if (gameState.workers > 0) {
        setEnding("lastThree") // Some workers remain = "The Last Three"
      } else {
        setEnding("automated") // Already at 0 somehow
      }
    }
    advanceStage()
  }

  return (
    <div className="relative w-full min-h-screen overflow-y-auto">
      <div className="absolute inset-0">
        <Image
          src="/images/darkfactory_05_kis.png"
          alt="The Button"
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/60 to-black" />
      </div>

      <motion.div
        className="relative min-h-screen flex items-center justify-center px-4 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        <div className="max-w-3xl w-full bg-black/80 backdrop-blur-sm p-8 md:p-12 rounded-lg border border-white/10 my-4">
          <motion.div
            className="text-center space-y-3 mb-8 pb-6 border-b border-white/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="text-sm font-mono text-green-400">SHIFT ANALYSIS</div>
            <div className="flex justify-center gap-8 text-sm">
              <div className="text-white/70">
                Workers: <span className="text-white font-bold">{gameState.workers}</span>
              </div>
              <div className="text-white/70">
                Humanity: <span className="text-white font-bold">{gameState.humanityScore}</span>
              </div>
              <div className="text-white/70">
                Quota: <span className="text-white font-bold">{Math.floor(gameState.quota)}</span>
              </div>
            </div>
          </motion.div>

          {gameState.decisionHistory.length > 0 && (
            <motion.div
              className="mb-8 space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <h3 className="text-lg font-bold text-orange-400 font-mono text-center">YOUR DECISION HISTORY:</h3>
              <div className="space-y-2 px-2">
                {gameState.decisionHistory.map((decision, index) => (
                  <motion.div
                    key={index}
                    className="bg-gray-900/50 border border-white/10 rounded p-3 space-y-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                  >
                    <div className="text-sm text-white/50 font-mono">Stage {decision.stage}</div>
                    <div className="text-base text-white font-semibold">{decision.choiceLabel}</div>
                    <div className="text-xs text-orange-300">{decision.impactLabel}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          <motion.h1
            className="text-3xl md:text-4xl font-bold text-white mb-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
          >
            SHIFT COMPLETE
          </motion.h1>

          <motion.p
            className="text-base md:text-lg text-white/70 mb-6 leading-relaxed text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
          >
            The quota is met. The shift is over. One final directive remains.
          </motion.p>

          <motion.div
            className="space-y-3 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2 }}
          >
            <Button
              onClick={() => handleChoice("lightsOut")}
              className="w-full text-sm md:text-lg py-6 bg-red-600 hover:bg-red-700 text-white font-bold leading-tight whitespace-normal"
            >
              ENABLE LIGHTS OUT MODE
            </Button>
            <Button
              onClick={() => handleChoice("oversight")}
              className="w-full text-sm md:text-lg py-6 bg-blue-600 hover:bg-blue-700 text-white font-bold leading-tight whitespace-normal"
            >
              MAINTAIN HUMAN OVERSIGHT
            </Button>
          </motion.div>

          <motion.p
            className="text-xs md:text-sm text-white/40 mt-6 font-mono text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
          >
            This is the final decision. There is no going back.
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
}

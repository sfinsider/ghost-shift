"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useGame } from "@/contexts/game-context"
import { motion, AnimatePresence } from "framer-motion"
import { DecisionModal } from "./decision-modal"
import { Button } from "./ui/button"

interface FloatingText {
  id: string
  x: number
  y: number
  text: string
}

export function StageTwo() {
  const { gameState, updateQuota, pauseGame, advanceStage } = useGame()
  const [showDecision, setShowDecision] = useState(false)
  const [decisionShown, setDecisionShown] = useState(false)
  const [stage3Ready, setStage3Ready] = useState(false)

  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([])
  const [isHolding, setIsHolding] = useState(false)
  const [overworkMeter, setOverworkMeter] = useState(0)
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const meterDecayRef = useRef<NodeJS.Timeout | null>(null)

  const isManualMode = !gameState.isAutomated || gameState.autoProductionRate === 0
  const isConveyorPhase = decisionShown && gameState.quota >= 100 && gameState.quota < 150

  useEffect(() => {
    if (gameState.quota >= 100 && gameState.quota < 150 && !decisionShown && gameState.currentStage === 2) {
      console.log("[v0] Stage 2: Triggering Decision 2 at quota", gameState.quota)
      setDecisionShown(true)
      pauseGame()
      setShowDecision(true)
    }
  }, [gameState.quota, decisionShown, gameState.currentStage, pauseGame])

  useEffect(() => {
    if (gameState.quota >= 150 && decisionShown && !stage3Ready && gameState.currentStage === 2) {
      console.log("[v0] Stage 2: Quota reached 150, advancing to Stage 3")
      setStage3Ready(true)
      pauseGame()
      advanceStage()
    }
  }, [gameState.quota, decisionShown, stage3Ready, gameState.currentStage, pauseGame, advanceStage])

  useEffect(() => {
    return () => {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current)
      if (meterDecayRef.current) clearInterval(meterDecayRef.current)
    }
  }, [])

  const handleSkip = () => {
    // Force set quota to exactly 100
    const quotaDiff = 100 - gameState.quota
    updateQuota(quotaDiff)

    // Immediately pause and trigger Decision 2
    pauseGame()
    setDecisionShown(true)
    setShowDecision(true)
  }

  const handleTap = (e: React.MouseEvent) => {
    if (!isManualMode) return

    updateQuota(1)
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newText: FloatingText = {
      id: Date.now().toString(),
      x,
      y,
      text: "+1",
    }
    setFloatingTexts((prev) => [...prev, newText])

    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((t) => t.id !== newText.id))
    }, 1000)
  }

  const handleHoldStart = () => {
    if (!isManualMode) return

    setIsHolding(true)
    if (meterDecayRef.current) {
      clearInterval(meterDecayRef.current)
      meterDecayRef.current = null
    }

    holdIntervalRef.current = setInterval(() => {
      updateQuota(2)
      setOverworkMeter((prev) => Math.min(100, prev + 10))
    }, 500)
  }

  const handleHoldEnd = () => {
    setIsHolding(false)
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current)
      holdIntervalRef.current = null
    }

    meterDecayRef.current = setInterval(() => {
      setOverworkMeter((prev) => {
        const newValue = Math.max(0, prev - 5)
        if (newValue === 0 && meterDecayRef.current) {
          clearInterval(meterDecayRef.current)
          meterDecayRef.current = null
        }
        return newValue
      })
    }, 200)
  }

  if (showDecision) {
    return <DecisionModal stage={2} onDecisionMade={() => setShowDecision(false)} />
  }

  return (
    <>
      <div className="relative w-full h-screen overflow-hidden">
        <div className="relative h-full flex flex-col items-center justify-center px-4">
          {isManualMode ? (
            <>
              <motion.div
                className="relative w-full max-w-2xl aspect-square cursor-pointer select-none"
                onMouseDown={handleHoldStart}
                onMouseUp={handleHoldEnd}
                onMouseLeave={handleHoldEnd}
                onTouchStart={handleHoldStart}
                onTouchEnd={handleHoldEnd}
                onClick={handleTap}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <AnimatePresence>
                  {floatingTexts.map((text) => (
                    <motion.div
                      key={text.id}
                      className="absolute text-4xl font-bold text-orange-400 pointer-events-none"
                      style={{ left: text.x, top: text.y }}
                      initial={{ opacity: 1, y: 0, scale: 1 }}
                      animate={{ opacity: 0, y: -100, scale: 1.5 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1 }}
                    >
                      {text.text}
                    </motion.div>
                  ))}
                </AnimatePresence>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <motion.div className="text-6xl font-bold text-white/90" animate={{ scale: isHolding ? 1.1 : 1 }}>
                      TAP
                    </motion.div>
                    <div className="text-xl text-white/70">to assemble units</div>
                    <div className="text-sm text-white/50">Hold for faster production</div>
                    <div className="text-xs text-orange-400 mt-4">Manual Mode: Target {gameState.quotaTarget}</div>
                  </div>
                </div>
              </motion.div>

              {overworkMeter > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 w-full max-w-md space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/70">Overwork Level</span>
                    {overworkMeter > 70 && (
                      <motion.span
                        className="text-red-400 font-semibold"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                      >
                        Slow down! You're burning out...
                      </motion.span>
                    )}
                  </div>
                  <div className="w-full bg-gray-800/80 h-3 rounded-full overflow-hidden backdrop-blur-sm">
                    <motion.div
                      className={`h-full transition-colors ${overworkMeter > 70 ? "bg-red-500" : "bg-yellow-500"}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${overworkMeter}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </motion.div>
              )}
            </>
          ) : isConveyorPhase ? (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
              <motion.div
                className="font-mono text-sm text-green-400"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                CONVEYOR SYSTEMS: ONLINE [+{gameState.autoProductionRate}/sec]
              </motion.div>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <motion.div
                className="text-3xl md:text-5xl font-bold text-orange-400 px-4"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                AUTOMATED PRODUCTION
              </motion.div>
              <div className="text-base md:text-xl text-white/70">+{gameState.autoProductionRate} units per second</div>
              <div className="text-xs md:text-sm text-white/50">The machines never rest</div>

              {gameState.isAutomated && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2 }}>
                  <Button
                    onClick={handleSkip}
                    variant="outline"
                    className="mt-8 bg-black/50 border-white/20 hover:bg-black/70 text-white"
                  >
                    SKIP TO COMPLETION
                  </Button>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

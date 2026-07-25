"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useGame } from "@/contexts/game-context"
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
              <div
                className="relative w-full max-w-2xl aspect-square cursor-pointer select-none hover:scale-102 active:scale-98 transition-transform"
                onMouseDown={handleHoldStart}
                onMouseUp={handleHoldEnd}
                onMouseLeave={handleHoldEnd}
                onTouchStart={handleHoldStart}
                onTouchEnd={handleHoldEnd}
                onClick={handleTap}
              >
                {floatingTexts.map((text) => (
                  <div
                    key={text.id}
                    className="absolute text-4xl font-bold text-orange-400 pointer-events-none animate-pulse"
                    style={{ left: text.x, top: text.y, opacity: 0.8 }}
                  >
                    {text.text}
                  </div>
                ))}

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className={`text-6xl font-bold text-white/90 transition-transform ${isHolding ? "scale-110" : "scale-100"}`}>
                      TAP
                    </div>
                    <div className="text-xl text-white/70">to assemble units</div>
                    <div className="text-sm text-white/50">Hold for faster production</div>
                    <div className="text-xs text-orange-400 mt-4">Manual Mode: Target {gameState.quotaTarget}</div>
                  </div>
                </div>
              </div>

              {overworkMeter > 0 && (
                <div className="mt-8 w-full max-w-md space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/70">Overwork Level</span>
                    {overworkMeter > 70 && (
                      <span className="text-red-400 font-semibold animate-pulse">
                        Slow down! You're burning out...
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-gray-800/80 h-3 rounded-full overflow-hidden backdrop-blur-sm">
                    <div
                      className={`h-full transition-all duration-300 ${overworkMeter > 70 ? "bg-red-500" : "bg-yellow-500"}`}
                      style={{ width: `${overworkMeter}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          ) : isConveyorPhase ? (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
              <div className="font-mono text-sm text-green-400 animate-pulse">
                CONVEYOR SYSTEMS: ONLINE [+{gameState.autoProductionRate}/sec]
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="text-3xl md:text-5xl font-bold text-orange-400 px-4 animate-pulse">
                AUTOMATED PRODUCTION
              </div>
              <div className="text-base md:text-xl text-white/70">+{gameState.autoProductionRate} units per second</div>
              <div className="text-xs md:text-sm text-white/50">The machines never rest</div>

              {gameState.isAutomated && (
                <div className="mt-8">
                  <Button
                    onClick={handleSkip}
                    variant="outline"
                    className="mt-8 bg-black/50 border-white/20 hover:bg-black/70 text-white"
                  >
                    SKIP TO COMPLETION
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

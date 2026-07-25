"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useGame } from "@/contexts/game-context"
import { DecisionModal } from "./decision-modal"

interface FloatingText {
  id: string
  x: number
  y: number
  text: string
}

export function StageOne() {
  const { gameState, updateQuota, pauseGame } = useGame()
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>()
  const [isHolding, setIsHolding] = useState(false)
  const [overworkMeter, setOverworkMeter] = useState(0)
  const [showDecision, setShowDecision] = useState(false)
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const meterDecayRef = useRef<NodeJS.Timeout | null>(null)

  // Check if quota reached 50 for decision
  useEffect(() => {
    if (gameState.quota >= 50 && !showDecision && gameState.currentStage === 1) {
      pauseGame()
      setShowDecision(true)
    }
  }, [gameState.quota, showDecision, gameState.currentStage, pauseGame])

  const handleTap = (e: React.MouseEvent) => {
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
    setFloatingTexts((prev) => [...(prev || []), newText])

    setTimeout(() => {
      setFloatingTexts((prev) => prev?.filter((t) => t.id !== newText.id))
    }, 1000)
  }

  const handleHoldStart = () => {
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

  useEffect(() => {
    return () => {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current)
      if (meterDecayRef.current) clearInterval(meterDecayRef.current)
    }
  }, [])

  if (showDecision) {
    return <DecisionModal stage={1} onDecisionMade={() => setShowDecision(false)} />
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Interaction Area */}
      <div className="relative h-full flex flex-col items-center justify-center px-4">
        <div
          className="relative w-full max-w-2xl aspect-square cursor-pointer select-none hover:scale-102 active:scale-98 transition-transform"
          onMouseDown={handleHoldStart}
          onMouseUp={handleHoldEnd}
          onMouseLeave={handleHoldEnd}
          onTouchStart={handleHoldStart}
          onTouchEnd={handleHoldEnd}
          onClick={handleTap}
        >
          {/* Floating +1 texts */}
          {floatingTexts?.map((text) => (
            <div
              key={text.id}
              className="absolute text-4xl font-bold text-orange-400 pointer-events-none animate-pulse"
              style={{ left: text.x, top: text.y, opacity: 0.8 }}
            >
              {text.text}
            </div>
          ))}

          {/* Central prompt */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className={`text-6xl font-bold text-white/90 transition-transform ${isHolding ? "scale-110" : "scale-100"}`}>
                TAP
              </div>
              <div className="text-xl text-white/70">to assemble units</div>
              <div className="text-sm text-white/50">Hold for faster production</div>
              <div className="text-xs text-orange-400 mt-4">Manual Mode: Target 50</div>
            </div>
          </div>
        </div>

        {/* Overwork Meter */}
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
      </div>
    </div>
  )
}

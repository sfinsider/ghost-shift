"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useGame } from "@/contexts/game-context"
import { motion, AnimatePresence } from "framer-motion"
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
          {/* Floating +1 texts */}
          <AnimatePresence>
            {floatingTexts?.map((text) => (
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

          {/* Central prompt */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4">
              <motion.div className="text-6xl font-bold text-white/90" animate={{ scale: isHolding ? 1.1 : 1 }}>
                TAP
              </motion.div>
              <div className="text-xl text-white/70">to assemble units</div>
              <div className="text-sm text-white/50">Hold for faster production</div>
              <div className="text-xs text-orange-400 mt-4">Manual Mode: Target 50</div>
            </div>
          </div>
        </motion.div>

        {/* Overwork Meter */}
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
      </div>
    </div>
  )
}

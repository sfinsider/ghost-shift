"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import { type GameState, INITIAL_GAME_STATE, type GameStage, type EndingType } from "@/lib/game-types"

interface GameContextType {
  gameState: GameState
  startGame: () => void
  updateQuota: (amount: number) => void
  updateWorkers: (amount: number) => void
  setWorkers: (count: number) => void
  updateHumanityScore: (amount: number) => void
  advanceStage: () => void
  resetGame: () => void
  enableAutomation: (rate: number) => void
  pauseGame: () => void
  resumeGame: () => void
  updateQuotaTarget: (target: number) => void
  addMistake: () => void
  setEnding: (ending: EndingType) => void
  setMinigameActive: (active: boolean) => void
  trackDecision: (stage: number, choiceLabel: string, impactLabel: string) => void
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE)

  // Timer effect
  useEffect(() => {
    if (!gameState.isRunning || gameState.timer <= 0) return

    const interval = setInterval(() => {
      setGameState((prev) => ({
        ...prev,
        timer: Math.max(0, prev.timer - 1),
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [gameState.isRunning, gameState.timer])

  useEffect(() => {
    if (!gameState.isRunning || gameState.paused || !gameState.isAutomated || gameState.autoProductionRate <= 0) {
      return
    }

    console.log("[v0] Automation active: +", gameState.autoProductionRate, "per second")

    // STRICT: Only increment once per second with exact rate
    const interval = setInterval(() => {
      setGameState((prev) => {
        // Don't exceed the quota target
        if (prev.quota >= prev.quotaTarget) {
          return prev
        }

        const newQuota = prev.quota + prev.autoProductionRate
        return {
          ...prev,
          quota: Math.min(newQuota, prev.quotaTarget), // Cap at target
        }
      })
    }, 1000) // Exactly 1 second

    return () => clearInterval(interval)
  }, [
    gameState.isRunning,
    gameState.paused,
    gameState.isAutomated,
    gameState.autoProductionRate,
    gameState.quotaTarget,
  ])

  // Darkness level effect - increases as timer decreases
  useEffect(() => {
    const maxTime = 300
    const darknessLevel = Math.min(100, ((maxTime - gameState.timer) / maxTime) * 100)
    setGameState((prev) => ({
      ...prev,
      darknessLevel,
    }))
  }, [gameState.timer])

  const startGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      currentStage: 1,
      isRunning: true,
    }))
  }, [])

  const updateQuota = useCallback((amount: number) => {
    setGameState((prev) => ({
      ...prev,
      quota: prev.quota + amount,
    }))
  }, [])

  const updateWorkers = useCallback((amount: number) => {
    setGameState((prev) => ({
      ...prev,
      workers: Math.max(0, prev.workers + amount),
    }))
  }, [])

  const setWorkers = useCallback((count: number) => {
    setGameState((prev) => ({
      ...prev,
      workers: Math.max(0, count),
    }))
  }, [])

  const updateHumanityScore = useCallback((amount: number) => {
    setGameState((prev) => ({
      ...prev,
      humanityScore: Math.max(-100, Math.min(100, prev.humanityScore + amount)),
    }))
  }, [])

  const advanceStage = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      currentStage: Math.min(5, prev.currentStage + 1) as GameStage,
    }))
  }, [])

  const resetGame = useCallback(() => {
    setGameState(INITIAL_GAME_STATE)
  }, [])

  const enableAutomation = useCallback((rate: number) => {
    setGameState((prev) => ({
      ...prev,
      isAutomated: true,
      autoProductionRate: rate,
    }))
  }, [])

  const pauseGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      isRunning: false,
      paused: true,
    }))
  }, [])

  const resumeGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      isRunning: true,
      paused: false,
    }))
  }, [])

  const updateQuotaTarget = useCallback((target: number) => {
    setGameState((prev) => ({
      ...prev,
      quotaTarget: target,
    }))
  }, [])

  const addMistake = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      mistakeCount: prev.mistakeCount + 1,
    }))
  }, [])

  const setEnding = useCallback((ending: EndingType) => {
    setGameState((prev) => ({
      ...prev,
      ending,
    }))
  }, [])

  const setMinigameActive = useCallback((active: boolean) => {
    setGameState((prev) => ({
      ...prev,
      isMinigameActive: active,
    }))
  }, [])

  const trackDecision = useCallback((stage: number, choiceLabel: string, impactLabel: string) => {
    setGameState((prev) => ({
      ...prev,
      decisionHistory: [...prev.decisionHistory, { stage, choiceLabel, impactLabel }],
    }))
  }, [])

  const contextValue = useMemo(
    () => ({
      gameState,
      startGame,
      updateQuota,
      updateWorkers,
      setWorkers,
      updateHumanityScore,
      advanceStage,
      resetGame,
      enableAutomation,
      pauseGame,
      resumeGame,
      updateQuotaTarget,
      addMistake,
      setEnding,
      setMinigameActive,
      trackDecision,
    }),
    [
      gameState,
      startGame,
      updateQuota,
      updateWorkers,
      setWorkers,
      updateHumanityScore,
      advanceStage,
      resetGame,
      enableAutomation,
      pauseGame,
      resumeGame,
      updateQuotaTarget,
      addMistake,
      setEnding,
      setMinigameActive,
      trackDecision,
    ],
  )

  return <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
}

export function useGame() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider")
  }
  return context
}

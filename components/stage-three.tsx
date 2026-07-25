"use client"

import { useEffect, useState } from "react"
import { useGame } from "@/contexts/game-context"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { DecisionModal } from "./decision-modal"

interface DefectItem {
  id: string
  isDefect: boolean
}

export function StageThree() {
  const {
    gameState,
    updateQuota,
    pauseGame,
    resumeGame,
    updateHumanityScore,
    addMistake,
    advanceStage,
    enableAutomation,
    updateQuotaTarget,
    setMinigameActive,
    setWorkers,
    trackDecision, // Added trackDecision
  } = useGame()
  const [showDecision, setShowDecision] = useState(false)
  const [showMinigame, setShowMinigame] = useState(false)
  const [items, setItems] = useState<DefectItem[]>([])
  const [mistakes, setMistakes] = useState(0)
  const [scanEffect, setScanEffect] = useState(false)
  const [systemOverride, setSystemOverride] = useState(false)
  const [observerMode, setObserverMode] = useState(false)
  const [decisionShown, setDecisionShown] = useState(false)

  useEffect(() => {
    console.log(
      "[v0] Stage 3: Checking trigger - quota:",
      gameState.quota,
      "stage:",
      gameState.currentStage,
      "decisionShown:",
      decisionShown,
    )

    // STRICT: Must have quota >= 150 to trigger
    if (gameState.quota < 150) {
      console.log("[v0] Stage 3: Quota not yet at 150, waiting...")
      return
    }

    if (!decisionShown && gameState.currentStage === 3 && gameState.quota >= 150) {
      console.log("[v0] Stage 3: Triggering Decision 3 at quota", gameState.quota)
      setDecisionShown(true)
      pauseGame()
      setShowDecision(true)
    }
  }, [gameState.quota, gameState.currentStage, decisionShown, pauseGame])

  useEffect(() => {
    setMinigameActive(showMinigame)
  }, [showMinigame, setMinigameActive])

  useEffect(() => {
    if (gameState.quota >= 200 && gameState.currentStage === 3 && !showDecision) {
      pauseGame()
      advanceStage()
    }
  }, [gameState.quota, gameState.currentStage, showDecision, pauseGame, advanceStage])

  useEffect(() => {
    if (showMinigame || observerMode) return
    const interval = setInterval(() => {
      setScanEffect(true)
      setTimeout(() => setScanEffect(false), 1000)
    }, 3000)
    return () => clearInterval(interval)
  }, [showMinigame, observerMode])

  useEffect(() => {
    // Don't spawn items if not in minigame mode or in observer mode
    if (!showMinigame || observerMode) {
      console.log("[v0] Spawner disabled - showMinigame:", showMinigame, "observerMode:", observerMode)
      return
    }

    console.log("[v0] Starting item spawner")

    const spawnInterval = setInterval(
      () => {
        const isDefect = Math.random() < 0.2
        const newItem: DefectItem = {
          id: `item-${Date.now()}-${Math.random()}`,
          isDefect,
        }

        console.log("[v0] Spawning item:", newItem.id, "isDefect:", isDefect)

        // Use functional update to ensure we always have the latest state
        setItems((prevItems) => {
          console.log("[v0] Current items count:", prevItems.length)
          return [...prevItems, newItem]
        })
      },
      1000 + Math.random() * 200,
    ) // 1000-1200ms

    return () => {
      console.log("[v0] Cleaning up spawner")
      clearInterval(spawnInterval)
    }
  }, [showMinigame, observerMode]) // Re-run when these change

  useEffect(() => {
    if (mistakes >= 3 && showMinigame && !systemOverride) {
      console.log("[v0] Reflex Game: FAILED - forcing automation with 3 workers")
      trackDecision(3, "QC Failed - System Override", "-20 Humanity, Workers → 3 (forced)")
      setSystemOverride(true)
      updateHumanityScore(-20)
      setWorkers(3) // Penalty: forced to skeleton crew

      setTimeout(() => {
        setSystemOverride(false)
        setShowMinigame(false)
        setObserverMode(true)
        updateQuotaTarget(200)
        enableAutomation(3)
        resumeGame()
      }, 4000)
    }
  }, [
    mistakes,
    showMinigame,
    systemOverride,
    updateHumanityScore,
    resumeGame,
    enableAutomation,
    updateQuotaTarget,
    setWorkers,
    trackDecision, // Added to dependency array
  ])

  const handleItemComplete = (item: DefectItem) => {
    console.log("[v0] Item completed:", item.id, "isDefect:", item.isDefect)
    if (item.isDefect) {
      setMistakes((m) => m + 1)
      addMistake()
    } else {
      updateQuota(1)
    }
    setItems((prev) => prev.filter((i) => i.id !== item.id))
  }

  const handleItemClick = (item: DefectItem) => {
    console.log("[v0] Item clicked:", item.id, "isDefect:", item.isDefect)
    if (item.isDefect) {
      updateQuota(1)
      updateHumanityScore(1)
    } else {
      setMistakes((m) => m + 1)
      addMistake()
    }
    setItems((prev) => prev.filter((i) => i.id !== item.id))
  }

  const handleDecisionChoice = (choice: string) => {
    setShowDecision(false)
    if (choice === "AI") {
      // Deploy AI Supervisor - skeleton crew
      console.log("[v0] Decision 3: AI Supervisor - workers → 3")
      trackDecision(3, "Deploy AI Supervisor", "-30 Humanity, Workers → 3")
      setWorkers(3) // Absolute: any → 3
      updateHumanityScore(-30)
      setObserverMode(true)
      updateQuotaTarget(200)
      enableAutomation(3)
      resumeGame()
    } else {
      // Manual QC - preserve current workers
      console.log("[v0] Decision 3: Manual QC - workers preserved")
      trackDecision(3, "Manual QC", "+5 Humanity, Workers preserved")
      setShowMinigame(true)
      updateHumanityScore(5)
      // Workers unchanged (stays at current level: 100, 75, or 20)
    }
  }

  if (showDecision) {
    return (
      <DecisionModal
        stage={3}
        onChoice={handleDecisionChoice}
        title="DEFECT RATE CRITICAL"
        description="Quality control failure detected. Human error compromising output."
        choices={[
          {
            label: "Deploy AI Supervisor",
            value: "AI",
            description: "Automated quality control. Zero tolerance. Maximum efficiency.",
          },
          {
            label: "Manual QC",
            value: "Manual",
            description: "Trust your instincts. Maintain human oversight.",
          },
        ]}
      />
    )
  }

  if (showMinigame) {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-black">
        <div className="relative h-full flex flex-col items-center justify-center p-4 md:p-8 z-10">
          <div className="text-center mb-6 md:mb-12 z-20">
            <h2 className="text-3xl md:text-5xl font-bold text-red-400 mb-2 md:mb-4 font-mono">
              MANUAL QUALITY CONTROL
            </h2>
            <p className="text-white/80 text-sm md:text-xl mb-3 md:mb-6">
              Click RED items before they pass. Avoid GREEN items.
            </p>
            <div className="flex gap-4 md:gap-12 justify-center text-xl md:text-3xl">
              <div className="text-red-400 font-mono">
                MISTAKES: <span className="font-bold">{mistakes}/3</span>
              </div>
              <div className="text-green-400 font-mono">
                QUOTA: <span className="font-bold">{Math.floor(gameState.quota)} / 200</span>
              </div>
            </div>
          </div>

          <div className="relative w-full max-w-4xl h-48 md:h-64 bg-gray-900 overflow-hidden rounded-lg border-y-4 border-yellow-500 z-40">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.02),rgba(255,255,255,0.02)_20px,transparent_20px,transparent_40px)]" />

            <AnimatePresence>
              {items.map((item) => (
                <motion.button
                  key={item.id}
                  className={`absolute w-16 h-16 md:w-20 md:h-20 rounded-lg flex items-center justify-center font-bold text-white text-xs md:text-sm z-50 cursor-pointer transition-transform hover:scale-110 active:scale-95 ${
                    item.isDefect
                      ? "bg-red-600 border-4 border-yellow-400 shadow-[0_0_30px_rgba(239,68,68,0.8)]"
                      : "bg-green-500 border-4 border-white shadow-[0_0_20px_rgba(34,197,94,0.6)]"
                  }`}
                  style={{
                    backgroundColor: item.isDefect ? "#dc2626" : "#22c55e",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                  initial={{ x: -100 }}
                  animate={{ x: typeof window !== "undefined" ? window.innerWidth + 100 : 1000 }}
                  transition={{ duration: 5, ease: "linear" }}
                  onAnimationComplete={() => handleItemComplete(item)}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleItemClick(item)
                  }}
                >
                  {item.isDefect ? "DEFECT" : "OK"}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          <div className="text-center mt-4 md:mt-8 text-white/60 text-sm md:text-lg z-20 px-4">
            Green items ship automatically. Red items are defects - click to catch them!
          </div>
        </div>
      </div>
    )
  }

  if (observerMode) {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-black">
        <div className="absolute inset-0">
          <Image src="/images/darkfactory_04_kis.jpg" alt="AI Vision System" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/70" />
        </div>

        <AnimatePresence>
          {scanEffect && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ y: "-100%" }}
              animate={{ y: "100%" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "linear" }}
            >
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent shadow-[0_0_20px_rgba(34,197,94,0.8)]" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative h-full flex flex-col items-center justify-center px-4 pointer-events-none">
          <div className="text-center space-y-6">
            <motion.div
              className="text-5xl font-bold text-green-400 font-mono"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              OBSERVER MODE
            </motion.div>
            <div className="text-2xl text-green-500 font-mono">AI SUPERVISOR ACTIVE</div>
            <div className="text-xl text-white/70 font-mono">SCANNING... ANALYZING... OPTIMIZING...</div>
            <div className="text-3xl text-green-400 font-mono mt-8">
              QUOTA: {Math.floor(gameState.quota)} / {gameState.quotaTarget}
            </div>
            <div className="text-lg text-green-400">+{gameState.autoProductionRate} units per second</div>
            <div className="text-sm text-white/50 font-mono mt-6">HUMAN INTERVENTION: DISABLED</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div className="absolute inset-0">
        <Image src="/images/darkfactory_04_kis.jpg" alt="AI Vision System" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <AnimatePresence>
        {scanEffect && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ y: "-100%" }}
            animate={{ y: "100%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "linear" }}
          >
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent shadow-[0_0_20px_rgba(34,197,94,0.8)]" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative h-full flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-6">
          <motion.div
            className="text-5xl font-bold text-green-400 font-mono"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            AI VISION ACTIVE
          </motion.div>
          <div className="text-xl text-white/70 font-mono">SCANNING... ANALYZING... OPTIMIZING...</div>
          <div className="text-lg text-green-400">+{gameState.autoProductionRate} units per second</div>
          <div className="text-sm text-white/50">No human error. No mercy.</div>
        </div>
      </div>
    </div>
  )
}

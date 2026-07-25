"use client"

import { useGame } from "@/contexts/game-context"
import { motion } from "framer-motion"
import { Button } from "./ui/button"
import Image from "next/image"

interface DecisionModalProps {
  stage: 1 | 2 | 3
  onChoice?: (choice: string) => void
  onDecisionMade?: () => void
  title?: string
  description?: string
  choices?: Array<{
    label: string
    value: string
    description: string
  }>
}

export function DecisionModal({ stage, onChoice, onDecisionMade, title, description, choices }: DecisionModalProps) {
  const {
    setWorkers,
    updateHumanityScore,
    advanceStage,
    resumeGame,
    enableAutomation,
    updateQuotaTarget,
    trackDecision,
  } = useGame()

  const handleChoice = (choice: "A" | "B") => {
    console.log("[v0] DecisionModal: Button clicked -", choice)

    if (onChoice && choices) {
      const selectedChoice = choice === "A" ? choices[0].value : choices[1].value
      onChoice(selectedChoice)
      onDecisionMade?.()
      return
    }

    if (stage === 1) {
      if (choice === "A") {
        // Install Robot Arm - automation path
        console.log("[v0] Decision 1: Robot Arm - workers 100 → 75")
        trackDecision(1, "Install Robot Arm", "-10 Humanity, Workers → 75")
        setWorkers(75) // Absolute: 100 → 75
        updateHumanityScore(-10)
        enableAutomation(2)
        advanceStage()
      } else {
        // Manual Assembly - preserve workers
        console.log("[v0] Decision 1: Manual Assembly - workers stay at 100")
        trackDecision(1, "Manual Assembly", "+10 Humanity, Workers preserved")
        updateHumanityScore(10)
        // Workers stay at 100 (no change)
        updateQuotaTarget(100)
        advanceStage()
        resumeGame()
        onDecisionMade?.()
        return
      }
    } else if (stage === 2) {
      console.log("[v0] Decision 2: Choice made", choice === "A" ? "Conveyor Upgrade" : "Hybrid Manual")
      if (choice === "A") {
        // Conveyor Upgrade - mass automation
        console.log("[v0] Decision 2: Conveyor - workers 75 → 20")
        trackDecision(2, "Conveyor Upgrade", "-10 Humanity, Workers → 20")
        setWorkers(20) // Absolute: 75 → 20 (or 100 → 20 if manual path)
        updateQuotaTarget(150)
        enableAutomation(3)
        updateHumanityScore(-10)
        console.log("[v0] Decision 2: Conveyor - workers=20, target=150, auto=3/sec")
      } else {
        // Hybrid Manual - preserve current workers (75 or 100)
        console.log("[v0] Decision 2: Hybrid Manual - workers preserved at current level")
        trackDecision(2, "Hybrid Manual", "+5 Humanity, Workers preserved")
        updateQuotaTarget(150)
        enableAutomation(0)
        updateHumanityScore(5)
        // Workers unchanged (stays at 75 or 100)
        console.log("[v0] Decision 2: Hybrid Manual - target=150, manual mode, workers preserved")
      }
      resumeGame()
      onDecisionMade?.()
      return
    }
    resumeGame()
    onDecisionMade?.()
  }

  const decisions = {
    1: {
      title: "OPTIMIZATION OPPORTUNITY",
      subtitle: "The First Robot",
      backgroundImage: "/images/darkfactory_02_kis.png",
      choiceA: {
        label: "Install Robot Arm",
        description: "Automate production",
        effects: ["Workers → 75", "Auto-Production +2/sec"],
      },
      choiceB: {
        label: "Manual Assembly",
        description: "Keep human workers",
        effects: ["Humanity +10", "Workers stay at 100"],
      },
    },
    2: {
      title: "EFFICIENCY PROPOSAL",
      subtitle: "The Conveyor",
      backgroundImage: "/images/darkfactory_03_kis.png",
      choiceA: {
        label: "Conveyor Upgrade",
        description: "Full automation",
        effects: ["Workers → 20", "Speed +3/sec"],
      },
      choiceB: {
        label: "Hybrid Manual",
        description: "Assist automation",
        effects: ["Humanity +5", "Workers preserved", "Manual clicks required"],
      },
    },
    3: {
      title: title || "DEFECT RATE CRITICAL",
      subtitle: description || "Quality Control Failure",
      backgroundImage: "/images/darkfactory_04_kis.jpg",
      choiceA: choices
        ? {
            label: choices[0].label,
            description: choices[0].description,
            effects: [],
          }
        : {
            label: "Deploy AI Supervisor",
            description: "Full automation + AI oversight",
            effects: ["Workers → 3", "Terminal Mode", "Auto-complete quota"],
          },
      choiceB: choices
        ? {
            label: choices[1].label,
            description: choices[1].description,
            effects: [],
          }
        : {
            label: "Manual QC",
            description: "Human inspection",
            effects: ["Humanity +15", "Workers preserved", "Reflex Minigame"],
          },
    },
  }

  const decision = decisions[stage]

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="absolute inset-0 -z-10">
        <Image
          src={decision.backgroundImage || "/placeholder.svg"}
          alt="Factory background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <motion.div
        className="max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-gradient-to-b from-gray-900/90 to-black/90 backdrop-blur-md border border-orange-500/30 rounded-lg p-8 space-y-6 relative z-[100] my-8"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Title */}
        <div className="text-center space-y-2">
          <motion.div
            className="text-orange-400 text-sm font-mono tracking-widest"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            {decision.title}
          </motion.div>
          <h2 className="text-3xl font-bold text-white">{decision.subtitle}</h2>
        </div>

        {/* Choices */}
        <div className="grid md:grid-cols-2 gap-4 items-stretch mt-8">
          {/* Choice A */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => {
                console.log("[v0] Choice A button clicked")
                handleChoice("A")
              }}
              className="w-full h-auto min-h-[160px] flex flex-col items-start justify-start gap-3 py-8 px-6 bg-gray-800/50 hover:bg-orange-900/30 border border-orange-500/30 hover:border-orange-500 transition-all text-left cursor-pointer"
              variant="outline"
            >
              <div className="text-lg font-semibold text-orange-400 leading-tight whitespace-normal">
                {decision.choiceA.label}
              </div>
              <div className="text-sm text-white/70 leading-relaxed whitespace-normal">
                {decision.choiceA.description}
              </div>
              {decision.choiceA.effects.length > 0 && (
                <div className="space-y-1 mt-2">
                  {decision.choiceA.effects.map((effect, i) => (
                    <div key={i} className="text-xs text-white/50 leading-relaxed whitespace-normal">
                      • {effect}
                    </div>
                  ))}
                </div>
              )}
            </Button>
          </motion.div>

          {/* Choice B */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => {
                console.log("[v0] Choice B button clicked")
                handleChoice("B")
              }}
              className="w-full h-auto min-h-[160px] flex flex-col items-start justify-start gap-3 py-8 px-6 bg-gray-800/50 hover:bg-blue-900/30 border border-blue-500/30 hover:border-blue-500 transition-all text-left cursor-pointer"
              variant="outline"
            >
              <div className="text-lg font-semibold text-blue-400 leading-tight whitespace-normal">
                {decision.choiceB.label}
              </div>
              <div className="text-sm text-white/70 leading-relaxed whitespace-normal">
                {decision.choiceB.description}
              </div>
              {decision.choiceB.effects.length > 0 && (
                <div className="space-y-1 mt-2">
                  {decision.choiceB.effects.map((effect, i) => (
                    <div key={i} className="text-xs text-white/50 leading-relaxed whitespace-normal">
                      • {effect}
                    </div>
                  ))}
                </div>
              )}
            </Button>
          </motion.div>
        </div>

        <div className="text-center text-xs text-white/40 mt-6">Choose wisely. There's no going back.</div>
      </motion.div>
    </motion.div>
  )
}

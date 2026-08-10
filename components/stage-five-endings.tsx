"use client"

import { useGame } from "@/contexts/game-context"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

const FIRED_WORKERS = [
  "Unit 734",
  "Worker #99",
  "Sarah J.",
  "Marcus T.",
  "Elena V.",
  "David R.",
  "Maria K.",
  "John P.",
  "Lisa M.",
  "Robert H.",
  "Anna S.",
  "Michael B.",
  "Jennifer L.",
  "William C.",
  "Patricia D.",
  "James E.",
  "Linda F.",
  "Richard G.",
  "Barbara H.",
  "Joseph I.",
  "Susan J.",
  "Thomas K.",
  "Jessica L.",
  "Charles M.",
  "Karen N.",
  "Christopher O.",
  "Nancy P.",
  "Daniel Q.",
  "Betty R.",
  "Matthew S.",
  "Helen T.",
  "Anthony U.",
  "Dorothy V.",
  "Mark W.",
  "Sandra X.",
  "Donald Y.",
  "Ashley Z.",
  "Steven A1",
  "Kimberly B1",
  "Paul C1",
  "Emily D1",
  "Andrew E1",
  "Donna F1",
  "Joshua G1",
  "Michelle H1",
  "Kenneth I1",
  "Carol J1",
  "Kevin K1",
  "Amanda L1",
  "Brian M1",
  "Melissa N1",
  "George O1",
  "Deborah P1",
  "Edward Q1",
  "Stephanie R1",
  "Ronald S1",
  "Rebecca T1",
  "Timothy U1",
  "Sharon V1",
  "Jason W1",
  "Cynthia X1",
  "Jeffrey Y1",
  "Kathleen Z1",
  "Ryan A2",
  "Amy B2",
  "Jacob C2",
  "Angela D2",
  "Gary E2",
  "Shirley F2",
  "Nicholas G2",
  "Anna H2",
  "Eric I2",
  "Brenda J2",
  "Jonathan K2",
  "Emma L2",
  "Stephen M2",
  "Pamela N2",
  "Larry O2",
  "Nicole P2",
  "Justin Q2",
  "Katherine R2",
  "Scott S2",
  "Samantha T2",
  "Brandon U2",
  "Christine V2",
  "Benjamin W2",
  "Debra X2",
  "Samuel Y2",
  "Rachel Z2",
  "Raymond A3",
  "Carolyn B3",
  "Gregory C3",
  "Janet D3",
  "Frank E3",
  "Catherine F3",
  "Alexander G3",
  "Maria H3",
  "Patrick I3",
  "Heather J3",
  "Jack K3",
  "Diane L3",
  "Dennis M3",
  "Ruth N3",
  "Jerry O3",
  "Julie P3",
]

export function StageFiveEndings() {
  const { gameState, resetGame } = useGame()
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showTermination, setShowTermination] = useState(false)
  const [terminationIndex, setTerminationIndex] = useState(0)
  const [gameFinished, setGameFinished] = useState(false)

  // Determine ending content
  const getEndingContent = () => {
    switch (gameState.ending) {
      case "automated":
        return {
          background: null,
          lines: ["EFFICIENCY: 100%", "HUMAN PRESENCE: 0", "GOODBYE."],
          textColor: "text-green-500",
          bgClass: "bg-black",
        }
      case "lastThree":
        const workerText =
          gameState.workers > 50
            ? "The Factory is Alive"
            : gameState.workers > 3
              ? "You and the survivors remain."
              : "The Last Three"

        return {
          background: "/images/darkfactory_07_kis.png",
          lines: [workerText, "The machines hum around you.", "You are the ghost in the machine."],
          textColor: "text-blue-300",
          bgClass: "bg-black/90",
        }
      case "sabotage":
        return {
          background: "/images/darkfactory_08_kis.png",
          lines: ["CRITICAL FAILURE", "SYSTEM SHUTDOWN", "CHAOS PROTOCOL ENGAGED"],
          textColor: "text-red-500",
          bgClass: "bg-black/70",
        }
      case "timeout":
        return {
          background: null,
          lines: ["SHIFT TIMEOUT", "QUOTA: UNMET", "THE FACTORY DOES NOT WAIT."],
          textColor: "text-amber-400",
          bgClass: "bg-black",
        }
      default:
        return {
          background: null,
          lines: ["ERROR: NO ENDING DEFINED"],
          textColor: "text-white",
          bgClass: "bg-black",
        }
    }
  }

  const ending = getEndingContent()

  useEffect(() => {
    if (gameState.ending === "automated" && !showTermination && !gameFinished) {
      setShowTermination(true)
      console.log("[v0] Starting termination sequence")
    }
  }, [gameState.ending, showTermination, gameFinished])

  useEffect(() => {
    if (!showTermination || gameState.ending !== "automated") return

    if (terminationIndex < FIRED_WORKERS.length) {
      console.log(`[v0] Showing worker ${terminationIndex + 1}/${FIRED_WORKERS.length}`)
      const timer = setTimeout(() => {
        setTerminationIndex((prev) => prev + 1)
      }, 200) // Show one name every 200ms
      return () => clearTimeout(timer)
    } else {
      console.log("[v0] All workers shown, transitioning to final screen")
      const timer = setTimeout(() => {
        setShowTermination(false)
        setGameFinished(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [showTermination, terminationIndex, gameState.ending])

  if (showTermination && gameState.ending === "automated") {
    return (
      <motion.div
        className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <AnimatePresence mode="wait">
          {terminationIndex < FIRED_WORKERS.length && (
            <motion.div
              key={terminationIndex}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.15 }}
            >
              <div className="text-3xl text-white/90 font-mono">{FIRED_WORKERS[terminationIndex]}</div>
              <div className="text-lg text-red-400 mt-4 tracking-widest">TERMINATED</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  if (!gameFinished && gameState.ending !== "automated") {
    // For non-automated endings, skip straight to final screen
    setTimeout(() => setGameFinished(true), 100)
  }

  if (!gameFinished) return null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="fixed inset-0 z-[100] overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        {/* Background */}
        {ending.background ? (
          <div className="absolute inset-0">
            <Image src={ending.background || "/placeholder.svg"} alt="Ending" fill className="object-cover" priority />
            <div className={`absolute inset-0 ${ending.bgClass}`} />
          </div>
        ) : (
          <div className={`absolute inset-0 ${ending.bgClass}`} />
        )}

        <div className="relative h-screen flex flex-col items-center justify-center p-4">
          <motion.div
            className="text-center font-mono space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {ending.lines.map((line, index) => (
              <motion.div
                key={index}
                className={`text-3xl md:text-4xl ${ending.textColor} font-bold`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.5 }}
              >
                {line}
              </motion.div>
            ))}

            <motion.span
              className={`inline-block w-3 h-8 ml-2 ${ending.textColor} bg-current`}
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3 }}
            className="mt-8"
          >
            <Button
              onClick={() => {
                console.log("[v0] Restarting game")
                resetGame()
              }}
              variant="outline"
              className="text-base md:text-lg py-4 px-6 border-white/30 text-white hover:bg-white/10 bg-transparent font-mono"
            >
              START NEW SHIFT
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

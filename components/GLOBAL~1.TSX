"use client"

import { useGame } from "@/contexts/game-context"
import { motion, AnimatePresence } from "framer-motion"

export function GlobalBackground() {
  const { gameState } = useGame()

  const getBackgroundImage = () => {
    switch (gameState.currentStage) {
      case 0:
        return "/images/darkfactory-01-kis.png"
      case 1:
        return "/images/darkfactory_02_kis.png"
      case 2:
        return "/images/darkfactory_03_kis.png"
      case 3:
        return "/images/darkfactory_04_kis.jpg"
      case 4:
        return "/images/darkfactory_04_kis.jpg"
      case 5:
        return null // Endings have custom backgrounds
      default:
        return "/images/darkfactory-01-kis.png"
    }
  }

  const backgroundImage = getBackgroundImage()

  if (!backgroundImage) return null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={gameState.currentStage}
        className="fixed inset-0 w-screen h-screen z-[-1]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </motion.div>
    </AnimatePresence>
  )
}

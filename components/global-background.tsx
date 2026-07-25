"use client"

import { useGame } from "@/contexts/game-context"

export function GlobalBackground() {
  const { gameState } = useGame()

  const getBackgroundImage = () => {
    switch (gameState.currentStage) {
      case 0:
        return "/images/darkfactory_01_kis.png"
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
        return "/images/darkfactory_01_kis.png"
    }
  }

  const backgroundImage = getBackgroundImage()

  if (!backgroundImage) return null

  return (
    <div
      key={gameState.currentStage}
      className="fixed inset-0 w-screen h-screen z-[-1]"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/40" />
    </div>
  )
}

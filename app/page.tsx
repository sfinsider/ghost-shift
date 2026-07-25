"use client"

import { useState } from "react"
import { useGame } from "@/contexts/game-context"
import { HUD } from "@/components/hud"
import { StageIntro } from "@/components/stage-intro"
import { StageOne } from "@/components/stage-one"
import { StageTwo } from "@/components/stage-two"
import { StageThree } from "@/components/stage-three"
import { StageFour } from "@/components/stage-four"
import { StageFiveEndings } from "@/components/stage-five-endings"
import { SplashScreen } from "@/components/splash-screen"
import { BackgroundMusic } from "@/components/background-music"
import { GlobalBackground } from "@/components/global-background"
import { AnimatePresence } from "framer-motion"

export default function Home() {
  const { gameState } = useGame()
  const [showSplash, setShowSplash] = useState(true)

  const handleDismissSplash = () => {
    setShowSplash(false)
  }

  const handleRestart = () => {
    setShowSplash(true)
  }

  return (
    <>
      <BackgroundMusic isPlaying={!showSplash} />
      {!showSplash && <GlobalBackground />}

      <AnimatePresence mode="wait">
        {showSplash ? (
          <SplashScreen key="splash" onDismiss={handleDismissSplash} />
        ) : (
          <div className="relative w-full min-h-screen">
            <HUD onRestart={handleRestart} />
            <div className="max-w-md mx-auto">
              {gameState.currentStage === 0 && <StageIntro />}
              {gameState.currentStage === 1 && <StageOne />}
              {gameState.currentStage === 2 && <StageTwo />}
              {gameState.currentStage === 3 && <StageThree />}
              {gameState.currentStage === 4 && <StageFour />}
              {gameState.currentStage === 5 && <StageFiveEndings />}
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

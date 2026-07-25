"use client"

import { useGame } from "@/contexts/game-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Image from "next/image"

export function StageIntro() {
  const { startGame } = useGame()

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/darkfactory-01-kis.png"
          alt="Factory Office"
          fill
          className="object-cover"
          priority
          quality={100}
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center px-4">
        <div className="max-w-lg w-full">
          <Card className="bg-black/60 backdrop-blur-lg border-white/20 p-8 shadow-2xl">
            <div className="space-y-6">
              {/* Title */}
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold text-white tracking-tight">GHOST SHIFT</h1>
                <div className="h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent" />
              </div>

              {/* The Memo */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-xs font-mono text-red-400 uppercase tracking-wider">Priority Directive</span>
                </div>

                <div className="bg-white/5 border border-white/10 p-4 rounded font-mono text-sm text-gray-200 leading-relaxed">
                  <p className="text-orange-400 font-semibold mb-2">FROM: Management</p>
                  <p className="mb-4">Full automation required within one shift.</p>
                  <p className="text-red-400 font-semibold">Execution mandatory.</p>
                </div>
              </div>

              {/* Start Button */}
              <div>
                <Button
                  onClick={startGame}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-mono uppercase tracking-wider text-lg py-6 shadow-lg shadow-orange-900/50 transition-all hover:shadow-xl hover:shadow-orange-900/70"
                >
                  BEGIN SHIFT
                </Button>
              </div>

              {/* Ambient Details */}
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500 font-mono">
                <span>SHIFT: NIGHT</span>
                <span>•</span>
                <span>TIME: 05:00</span>
                <span>•</span>
                <span>STATUS: ACTIVE</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

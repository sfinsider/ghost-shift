"use client"

import { useEffect } from "react"
import Image from "next/image"

interface SplashScreenProps {
  onDismiss: () => void
}

export function SplashScreen({ onDismiss }: SplashScreenProps) {
  useEffect(() => {
    const handleInteraction = (e: KeyboardEvent | MouseEvent) => {
      e.preventDefault()
      onDismiss()
    }

    window.addEventListener("keydown", handleInteraction as EventListener)
    window.addEventListener("click", handleInteraction as EventListener)

    return () => {
      window.removeEventListener("keydown", handleInteraction as EventListener)
      window.removeEventListener("click", handleInteraction as EventListener)
    }
  }, [onDismiss])

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .splash-container {
          animation: fadeIn 1s ease-out forwards;
        }
        .splash-logo {
          animation: fadeIn 2s ease-out forwards;
        }
        .splash-text {
          animation: fadeIn 2s ease-out 0.5s forwards;
          opacity: 0;
        }
        .splash-prompt {
          animation: fadeIn 1s ease-out 1.5s forwards, blink 2s ease-in-out 2.5s infinite;
          opacity: 0;
        }
      `}</style>
      <div
        className="splash-container fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-8"
      >
      {/* Logo */}
      <div
        className="splash-logo mb-12"
      >
        <Image
          src="/images/ghost-shift-logo.png"
          alt="Ghost Shift"
          width={400}
          height={200}
          className="w-[300px] md:w-[400px] h-auto"
          priority
        />
      </div>

      {/* Narrative Text */}
      <div
        className="splash-text max-w-[600px] text-center mb-16"
      >
        <p className="text-lg text-gray-400 font-sans leading-relaxed">
          Efficiency is your mandate. You have one shift to automate the workforce out of existence, but remember:
          machines do not need managers. Every worker you replace brings you closer to your own obsolescence.
        </p>
      </div>

      {/* Press Any Key */}
      <div
        className="splash-prompt absolute bottom-12 text-center"
      >
        <p
          className="text-green-500 font-mono text-xl tracking-wider"
        >
          PRESS ANY KEY TO INITIALIZE
        </p>
      </div>
    </div>
    </>
  )
}

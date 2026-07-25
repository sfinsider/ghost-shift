"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
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
    <motion.div
      className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-8"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      {/* Logo */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      >
        <Image
          src="/images/ghost-shift-logo.png"
          alt="Ghost Shift"
          width={400}
          height={200}
          className="w-[300px] md:w-[400px] h-auto"
          priority
        />
      </motion.div>

      {/* Narrative Text */}
      <motion.div
        className="max-w-[600px] text-center mb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
      >
        <p className="text-lg text-gray-400 font-sans leading-relaxed">
          Efficiency is your mandate. You have one shift to automate the workforce out of existence, but remember:
          machines do not need managers. Every worker you replace brings you closer to your own obsolescence.
        </p>
      </motion.div>

      {/* Press Any Key */}
      <motion.div
        className="absolute bottom-12 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
      >
        <motion.p
          className="text-green-500 font-mono text-xl tracking-wider"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        >
          PRESS ANY KEY TO INITIALIZE
        </motion.p>
      </motion.div>
    </motion.div>
  )
}

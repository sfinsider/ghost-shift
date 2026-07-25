"use client"

import { useEffect, useRef, useState } from "react"
import { Volume2, VolumeX } from "lucide-react"

interface BackgroundMusicProps {
  isPlaying: boolean
}

export function BackgroundMusic({ isPlaying }: BackgroundMusicProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.play().catch((error) => {
        console.log("[v0] Audio autoplay blocked:", error)
      })
    } else {
      audio.pause()
    }
  }, [isPlaying])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = isMuted ? 0 : 0.3
  }, [isMuted])

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  if (!isPlaying) return null

  return (
    <>
      <audio ref={audioRef} src="/audio/industrial-echoes-of-tomorrow.mp3" loop preload="auto" />

      <button
        onClick={toggleMute}
        className="fixed bottom-4 left-4 z-[200] p-3 bg-black/50 hover:bg-black/70 border border-white/10 rounded-lg transition-colors backdrop-blur-sm"
        title={isMuted ? "Unmute Audio" : "Mute Audio"}
      >
        {isMuted ? <VolumeX className="w-6 h-6 text-red-500" /> : <Volume2 className="w-6 h-6 text-green-500" />}
      </button>
    </>
  )
}

"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bookmark, ThumbsDown } from "lucide-react"
import ParticleCanvas from "./ParticleCanvas"

// Компонент для партикл-эффектов
const ParticleEffect = ({ isActive, type, onComplete }) => {
  const [particles, setParticles] = useState([])
  const containerRef = useRef(null)

  useEffect(() => {
    if (!isActive) return

    const particleCount = 8
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: 0,
      y: 0,
      angle: (360 / particleCount) * i,
      velocity: 2 + Math.random() * 2,
      life: 1,
      symbol: type === 'favorite' ? '★' : '✕'
    }))

    setParticles(newParticles)

    const animateParticles = () => {
      setParticles(prev => 
        prev.map(particle => ({
          ...particle,
          x: particle.x + Math.cos(particle.angle * Math.PI / 180) * particle.velocity,
          y: particle.y + Math.sin(particle.angle * Math.PI / 180) * particle.velocity,
          life: particle.life - 0.02,
          velocity: particle.velocity * 0.98
        })).filter(particle => particle.life > 0)
      )
    }

    const interval = setInterval(animateParticles, 16)
    const timeout = setTimeout(() => {
      clearInterval(interval)
      setParticles([])
      onComplete?.()
    }, 800)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [isActive, type, onComplete])

  if (!isActive || particles.length === 0) return null

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 10 }}
    >
      {particles.map(particle => (
        <div
          key={particle.id}
          className={`absolute text-xs font-bold transition-opacity duration-100 ${
            type === 'favorite' ? 'text-yellow-400' : 'text-red-400'
          }`}
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(${particle.x - 6}px, ${particle.y - 6}px)`,
            opacity: particle.life,
            fontSize: `${8 + particle.life * 4}px`
          }}
        >
          {particle.symbol}
        </div>
      ))}
    </div>
  )
}

// Анимированная кнопка избранного
const AnimatedFavoriteButton = ({ isSaved, onClick, disabled }) => {
  const [isAnimating, setIsAnimating] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const [showRipple, setShowRipple] = useState(false)

  const handleClick = () => {
    if (disabled) return

    setIsAnimating(true)
    setShowRipple(true)

    if (!isSaved) {
      setShowParticles(true)
    }

    onClick()

    setTimeout(() => {
      setIsAnimating(false)
      setShowRipple(false)
    }, 300)
  }

  return (
    <div className="relative">
      <Button
        variant={isSaved ? "default" : "outline"}
        size="sm"
        className={`
          gap-1.5 h-8 px-3 text-xs button-hover-lift glow-effect
          relative overflow-hidden transition-all duration-200
          ${isSaved ? 'bg-primary hover:bg-primary/90' : 'hover:border-primary/50 hover:bg-primary/5'}
          ${isAnimating ? 'scale-95' : ''}
        `}
        onClick={handleClick}
        disabled={disabled}
      >
        <Bookmark
          className={`
            w-3.5 h-3.5 transition-all duration-300
            ${isSaved ? 'fill-current animate-fill-bookmark' : ''}
            ${isAnimating && !isSaved ? 'animate-heartbeat' : ''}
            ${!isSaved ? 'hover:scale-110' : ''}
          `}
        />
        <span className="relative z-10 font-medium">
          {isSaved ? "В избранном" : "В избранное"}
        </span>

        {/* Эффект волны при клике */}
        {showRipple && (
          <div className="absolute inset-0 bg-primary/30 rounded animate-ripple" />
        )}

        {/* Эффект свечения для активного состояния */}
        {isSaved && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
        )}
      </Button>

      <ParticleEffect
        isActive={showParticles}
        type="favorite"
        onComplete={() => setShowParticles(false)}
      />
    </div>
  )
}

// Анимированная кнопка дизлайка
const AnimatedDislikeButton = ({ isDisliked, onClick, disabled }) => {
  const [isAnimating, setIsAnimating] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const [showRipple, setShowRipple] = useState(false)

  const handleClick = () => {
    if (disabled) return

    setIsAnimating(true)
    setShowRipple(true)

    if (!isDisliked) {
      setShowParticles(true)
    }

    onClick()

    setTimeout(() => {
      setIsAnimating(false)
      setShowRipple(false)
    }, 300)
  }

  return (
    <div className="relative">
      <Button
        variant={isDisliked ? "destructive" : "outline"}
        size="sm"
        className={`
          gap-1.5 h-8 px-3 text-xs button-hover-lift glow-effect
          relative overflow-hidden transition-all duration-200
          ${isDisliked ? 'bg-destructive hover:bg-destructive/90' : 'hover:border-destructive/50 hover:bg-destructive/5'}
          ${isAnimating ? 'scale-95' : ''}
        `}
        onClick={handleClick}
        disabled={disabled}
      >
        <ThumbsDown
          className={`
            w-3.5 h-3.5 transition-all duration-300
            ${isDisliked ? 'fill-current' : ''}
            ${isAnimating ? 'animate-shake-thumb' : ''}
            ${!isDisliked ? 'hover:scale-110 hover:rotate-12' : ''}
          `}
        />
        <span className="relative z-10 font-medium">
          {isDisliked ? "Не нравится" : "Не нравится"}
        </span>

        {/* Эффект волны при клике */}
        {showRipple && (
          <div className="absolute inset-0 bg-destructive/30 rounded animate-ripple" />
        )}

        {/* Эффект для активного состояния */}
        {isDisliked && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />
        )}
      </Button>

      <ParticleEffect
        isActive={showParticles}
        type="dislike"
        onComplete={() => setShowParticles(false)}
      />
    </div>
  )
}

// Основной компонент
export default function AnimatedActionButtons({ 
  isSaved, 
  isDisliked, 
  onSave, 
  onDislike, 
  disabled = false 
}) {
  return (
    <div className="flex items-center gap-2">
      <AnimatedFavoriteButton 
        isSaved={isSaved}
        onClick={onSave}
        disabled={disabled}
      />
      <AnimatedDislikeButton 
        isDisliked={isDisliked}
        onClick={onDislike}
        disabled={disabled}
      />
    </div>
  )
}

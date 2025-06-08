"use client"

import { useEffect, useRef, useCallback } from 'react'

// Улучшенный компонент партикл-эффектов с Canvas для лучшей производительности
const ParticleCanvas = ({ isActive, type, onComplete }) => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const particlesRef = useRef([])

  const createParticles = useCallback(() => {
    const particles = []
    const particleCount = type === 'favorite' ? 12 : 8
    const symbols = type === 'favorite' ? ['★', '♥', '✨'] : ['✕', '−', '×']
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: 0,
        y: 0,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 1,
        maxLife: 1,
        size: Math.random() * 8 + 4,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        color: type === 'favorite' ? 
          `hsl(${45 + Math.random() * 30}, 100%, ${60 + Math.random() * 20}%)` : 
          `hsl(${0 + Math.random() * 20}, 100%, ${50 + Math.random() * 20}%)`
      })
    }
    
    return particles
  }, [type])

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    
    // Очистка canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Обновление и отрисовка частиц
    particlesRef.current = particlesRef.current.filter(particle => {
      // Обновление позиции
      particle.x += particle.vx
      particle.y += particle.vy
      particle.vy += 0.1 // гравитация
      particle.vx *= 0.99 // сопротивление воздуха
      particle.life -= 0.02
      particle.rotation += particle.rotationSpeed
      
      // Отрисовка частицы
      if (particle.life > 0) {
        ctx.save()
        
        // Позиция относительно центра canvas
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        
        ctx.translate(centerX + particle.x, centerY + particle.y)
        ctx.rotate(particle.rotation * Math.PI / 180)
        
        // Настройка стиля
        ctx.fillStyle = particle.color
        ctx.globalAlpha = particle.life
        ctx.font = `${particle.size * particle.life}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        
        // Отрисовка символа
        ctx.fillText(particle.symbol, 0, 0)
        
        ctx.restore()
        
        return true
      }
      
      return false
    })
    
    // Продолжение анимации если есть частицы
    if (particlesRef.current.length > 0) {
      animationRef.current = requestAnimationFrame(animate)
    } else {
      onComplete?.()
    }
  }, [onComplete])

  useEffect(() => {
    if (!isActive) return

    const canvas = canvasRef.current
    if (!canvas) return

    // Установка размеров canvas
    const rect = canvas.parentElement.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    // Создание частиц
    particlesRef.current = createParticles()
    
    // Запуск анимации
    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      particlesRef.current = []
    }
  }, [isActive, createParticles, animate])

  if (!isActive) return null

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 10 }}
    />
  )
}

export default ParticleCanvas

import React, { useEffect, useRef } from 'react'

// 3D Particle / Geometric Field Canvas Background
export default function AnimatedBackground() {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        let animationId
        let particles = []
        const maxParticles = 80
        const connectionDist = 120

        function resize() {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        resize()
        window.addEventListener('resize', resize)

        // Particle class
        class Particle {
            constructor() {
                this.reset()
            }
            reset() {
                this.x = Math.random() * canvas.width
                this.y = Math.random() * canvas.height
                const angle = Math.random() * Math.PI * 2
                const speed = 0.15 + Math.random() * 0.45
                this.vx = Math.cos(angle) * speed
                this.vy = Math.sin(angle) * speed
                this.size = 1.2 + Math.random() * 2.5
                this.opacity = 0.25 + Math.random() * 0.55
                this.hue = 250 + Math.random() * 30 // purple-ish
            }
            update() {
                this.x += this.vx
                this.y += this.vy
                // wrap around
                if (this.x < -10) this.x = canvas.width + 10
                if (this.x > canvas.width + 10) this.x = -10
                if (this.y < -10) this.y = canvas.height + 10
                if (this.y > canvas.height + 10) this.y = -10
            }
            draw(ctx) {
                ctx.beginPath()
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
                ctx.fillStyle = `hsla(${this.hue}, 80%, 65%, ${this.opacity})`
                ctx.fill()
            }
        }

        // init particles
        for (let i = 0; i < maxParticles; i++) {
            particles.push(new Particle())
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // update & draw particles
            for (let p of particles) {
                p.update()
                p.draw(ctx)
            }

            // draw connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x
                    const dy = particles[i].y - particles[j].y
                    const dist = Math.sqrt(dx * dx + dy * dy)
                    if (dist < connectionDist) {
                        const alpha = (1 - dist / connectionDist) * 0.12
                        ctx.beginPath()
                        ctx.moveTo(particles[i].x, particles[i].y)
                        ctx.lineTo(particles[j].x, particles[j].y)
                        ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`
                        ctx.lineWidth = 0.6
                        ctx.stroke()
                    }
                }
            }

            animationId = requestAnimationFrame(animate)
        }

        animate()

        return () => {
            cancelAnimationFrame(animationId)
            window.removeEventListener('resize', resize)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: -1,
                pointerEvents: 'none',
                opacity: 0.75,
            }}
        />
    )
}

// Export a secondary background variant (video/gradient layers)
export function VideoBackground() {
    return (
        <div className="video-background">
            <div className="video-overlay" />
            <div className="video-content">
                <video
                    className="video-element"
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{ display: 'none' }}
                />
                <div className="animated-gradient-bg">
                    <div className="gradient-layer gradient-layer-1" />
                    <div className="gradient-layer gradient-layer-2" />
                    <div className="gradient-layer gradient-layer-3" />
                </div>
            </div>
        </div>
    )
}
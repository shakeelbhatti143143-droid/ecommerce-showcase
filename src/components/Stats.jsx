import React, { useEffect, useRef, useState } from 'react'

function useCounter(target, duration = 2000, trigger) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!trigger) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration, trigger])

  return count
}

function StatItem({ number, suffix, label, delay }) {
  const ref = useRef(null)
  const [triggered, setTriggered] = useState(false)
  const count = useCounter(number, 2000, triggered)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setTriggered(true) },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="stat-item card-3d" ref={ref} data-aos="zoom-in" data-aos-delay={delay}>
      <div className="stat-number">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

export default function Stats() {
  const stats = [
    { number: 10000, suffix: '+', label: 'Active Users' },
    { number: 500, suffix: '+', label: 'Online Stores' },
    { number: 98, suffix: '%', label: 'Customer Satisfaction' },
    { number: 50, suffix: 'M+', label: 'Orders Processed' },
  ]

  return (
    <section className="stats-section">
      <div className="container">
        <div className="stats-grid">
          {stats.map((s, i) => (
            <StatItem key={s.label} {...s} delay={i * 100} />
          ))}
        </div>
      </div>
    </section>
  )
}

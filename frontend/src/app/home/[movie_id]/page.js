// app/showtimes/[movie_id]/page.jsx
"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

const NAV_ITEMS = [
  { icon: '⊞', label: 'Tất cả phim', key: 'movies' },
  { icon: '🕐', label: 'Lịch chiếu', key: 'showtimes' },
  { icon: '🎟', label: 'Đặt vé', key: 'tickets' },
]

export default function ShowtimePage() {
  const { movie_id } = useParams()
  const router = useRouter()
  const [activeNav, setActiveNav] = useState('showtimes')
  const [showtimes, setShowtimes] = useState([])
  const [movie, setMovie] = useState(null)

useEffect(() => {
  fetch(`${process.env.NEXT_PUBLIC_API_URL}/home/movies/${movie_id}`)
    .then(r => r.json())
    .then(setMovie)
    .catch(err => console.error(err))

  fetch(`${process.env.NEXT_PUBLIC_API_URL}/showtimes/movies/${movie_id}`)
    .then(r => r.json())
    .then(data => {
      console.log('showtimes:', data)
      setShowtimes(data)
    })
    .catch(err => console.error(err))
}, [movie_id])

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#1a1a1a', overflow: 'hidden' }}>

      {/* Sidebar */}
      <div style={{
        width: 300, minWidth: 300,
        background: 'rgba(255,255,255,0.04)',
        borderRight: '0.5px solid rgba(255,255,255,0.08)',
        padding: '1.5rem 1rem',
        display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontSize: 30, fontWeight: 600, color: '#fff' }}>
            Cine<span style={{ color: '#4096ff' }}>Max</span>
          </span>
        </div>

        {NAV_ITEMS.map(item => (
          <div
            key={item.key}
            onClick={() => setActiveNav(item.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 12px', borderRadius: 8,
              color: activeNav === item.key ? '#4096ff' : 'rgba(255,255,255,0.5)',
              background: activeNav === item.key ? 'rgba(64,150,255,0.15)' : 'transparent',
              fontSize: 16, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <span>{item.icon}</span>
            {item.label}
          </div>
        ))}

        <div style={{ flex: 1 }} />

        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 12px', borderRadius: 8,
          color: 'rgba(255,255,255,0.5)', fontSize: 16, cursor: 'pointer',
        }}>
          ⚙ Cài đặt
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Back + Movie info */}
        <div style={{ marginBottom: 20, flexShrink: 0 }}>
          <span
            onClick={() => router.back()}
            style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer', marginBottom: 12, display: 'inline-block' }}
          >
            ← Quay lại
          </span>
          {movie && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: '#fff', fontSize: 20, fontWeight: 500 }}>{movie.movie_name}</span>
              <span style={{ fontSize: 13, background: 'rgba(64,150,255,0.2)', color: '#4096ff', padding: '2px 8px', borderRadius: 20 }}>
                {movie.movie_genre}
              </span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{movie.movie_duration}p</span>
            </div>
          )}
        </div>

        {/* Showtime list */}
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: 4 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {showtimes.map(st => {
              return (
                <div
                  key={st.showtime_id}
                  onClick={() => router.push(`/seats/${st.showtime_id}`)}
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                  border: '0.5px solid rgba(255,255,255,0.12)',
                  borderRadius: 12, padding: '16px 20px',
                  cursor: 'pointer', transition: 'background 0.15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ color: '#fff', fontSize: 16, fontWeight: 500 }}>
                    {st.start_time} - {st.end_time}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
                    {new Date(st.date).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                    {st.room?.room_name}
                  </span>
                  <span style={{ color: '#4096ff', fontSize: 13 }}>Chọn ghế →</span>
                </div>
              </div>
            )})}
          </div>
        </div>
      </div>
    </div>
  )
}
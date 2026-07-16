// app/showtimes/page.jsx
"use client"

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import fetchWithAuth from '@/lib/fetchWithAuth'

const NAV_ITEMS = [
  { icon: '⊞', label: 'Tất cả phim', key: 'movies', path: '/home' },
  { icon: '🕐', label: 'Lịch chiếu', key: 'showtimes', path: '/showtimes' },
]

export default function AllShowtimesPage() {
  const pathname = usePathname()
  const router = useRouter()
  const [showtimes, setShowtimes] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/showtimes/movies/getAll`)
      .then(r => r.json())
      .then(data => {
        setShowtimes(data)
      })
      .catch(err => console.error(err))
  }, [])

  const filtered = showtimes.filter(st =>
    st.movie?.movie_name.toLowerCase().includes(search.toLowerCase())
  )

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
            onClick={() => router.push(item.path)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 12px', borderRadius: 8,
              color: pathname.startsWith(item.path) ? '#4096ff' : 'rgba(255,255,255,0.5)',
              background: pathname.startsWith(item.path) ? 'rgba(64,150,255,0.15)' : 'transparent',
              fontSize: 16, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <span>{item.icon}</span>
            {item.label}
          </div>
        ))}

        <div style={{ flex: 1 }} />

        <div
        onClick={() => router.push('/user/profiles')} 
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 12px', borderRadius: 8,
          color: 'rgba(255,255,255,0.5)', fontSize: 16, cursor: 'pointer',
        }}>
          ⚙ Cài đặt
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexShrink: 0 }}>
          <span style={{ color: '#fff', fontSize: 20, fontWeight: 500 }}>Lịch chiếu</span>
          <input
            value={search}
            onChange={e => {
                setSearch(e.target.value)
                }}
            placeholder="Tìm kiếm phim..."
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '0.5px solid rgba(255,255,255,0.15)',
              borderRadius: 8, padding: '7px 14px',
              color: '#fff', fontSize: 13, width: 180, outline: 'none',
            }}
          />
        </div>

        <div style={{ overflowY: 'auto', flex: 1, paddingRight: 4 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(st => (
              <div
                key={st.showtime_id}
                onClick={() => router.push(`/showtimes/${st.showtime_id}`)}
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
                    {st.movie?.movie_name}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
                    {new Date(st.start_time).toLocaleDateString('vi-VN')} &nbsp;
                    {new Date(st.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    {' - '}
                    {new Date(st.end_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                    {st.room?.room_name}
                  </span>
                  <span style={{ color: '#4096ff', fontSize: 13 }}>Chọn ghế →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
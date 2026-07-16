// pages/movies.jsx
'use client'

import { useState , useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation';
import fetchWithAuth from '@/lib/fetchWithAuth'


const NAV_ITEMS = [
  { icon: '⊞', label: 'Tất cả phim', key: 'movies' , path: '/home'},
  { icon: '🕐', label: 'Lịch chiếu', key: 'showtimes', path: '/showtimes' },
]

export default function MoviesPage() {
  const router = useRouter()
  const pathname = usePathname();
  const [movies, setMovies] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
    
useEffect(() => {
  fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/home/movies`)
    .then(r => r.json())
    .then(data => {
      setMovies(data)
      setLoading(false)
    })
    .catch(err => {
      console.error(err)
      setLoading(false)
    })
}, [])

    const filtered = movies.filter(m =>
    m.movie_name.toLowerCase().includes(search.toLowerCase())
    )

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#1a1a1a', overflow: 'hidden' }}>

      {/* Sidebar */}
      <div style={{
        width: 300, minWidth: 300, maxWidth: 300,
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
          <span style={{ color: '#fff', fontSize: 20, fontWeight: 500 }}>Tất cả phim</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm kiếm..."
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '0.5px solid rgba(255,255,255,0.15)',
              borderRadius: 8, padding: '7px 14px',
              color: '#fff', fontSize: 13, width: 180, outline: 'none',
            }}
          />
        </div>

        {/* Scroll area */}
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: 4 }}>
          {loading ? (
            <div style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '2rem' }}>Đang tải...</div>
          ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
            {filtered.map(movie => (
              <div
                key={movie.movie_id}
                onClick={() => router.push(`/home/${movie.movie_id}`)}
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '0.5px solid rgba(255,255,255,0.12)',
                  borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
                  transition: 'transform 0.2s, background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {/* Poster */}
                {movie.movie_poster_url ? (
                  <img
                    src={movie.movie_poster_url}
                    alt={movie.movie_name}
                    style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <div style={{
                    width: '100%', aspectRatio: '2/3',
                    background: '#222', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.15)', fontSize: 32,
                  }}>
                    🎬
                  </div>
                )}

                {/* Info */}
                <div style={{ padding: '8px 10px 10px' }}>
                  <p style={{
                    color: '#fff', fontSize: 15, fontWeight: 500,
                    margin: '0 0 4px', whiteSpace: 'nowrap',
                    overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {movie.movie_name}
                  </p>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{
                      fontSize: 15, background: 'rgba(64,150,255,0.2)',
                      color: '#4096ff', padding: '2px 6px', borderRadius: 20,
                    }}>
                      {movie.movie_genre}
                    </span>
                    <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)' }}>
                      {movie.movie_duration}p
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </div>
    </div>
  )
}
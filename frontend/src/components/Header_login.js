'use client'
import { Button } from 'antd'
import { useRouter } from 'next/navigation'

export default function Header() {
  const router = useRouter()

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 2rem', height: 56,
      background: 'rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.15)',
      position: 'sticky', top: 0, zIndex: 10,
    }}>
      <div style={{ fontSize: 20, fontWeight: 500, color: '#fff', cursor: 'pointer' }}
        onClick={() => router.push('/')}>
        Cine<span style={{ color: '#4096ff' }}>Max</span>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Button
          style={{ background: 'transparent', borderColor: '#444', color: '#fff', borderRadius: 8 }}
          onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
        >
          <img src="https://www.google.com/favicon.ico" width={14} height={14} style={{ marginRight: 6 }} />
          Đăng nhập với Google
        </Button>
        <Button
          style={{ background: 'transparent', borderColor: '#444', color: '#fff', borderRadius: 8 }}
          onClick={() => router.push('/auth/register')}
        >
          Đăng ký
        </Button>
        <Button
          type="primary"
          style={{ borderRadius: 8 }}
          onClick={() => router.push('/auth/login')}
        >
          Đăng nhập
        </Button>
      </div>
    </header>
  )
}
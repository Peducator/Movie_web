'use client'
import { Typography } from 'antd'
import Header from '@/components/Header_login'
import Footer from '@/components/Footer'

const { Title, Text } = Typography

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

        <section style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '80px 2rem',
        position: 'relative',
        }}>
        {/* Glow phía sau text */}
        <div style={{
            position: 'absolute',
            width: 600, height: 300,
            borderRadius: '50%',
            background: '#fff',
            opacity: 0.15,
            filter: 'blur(60px)',
            pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16, display: 'block' }}>
            Đặt vé nhanh · Chọn ghế dễ
            </Text>
            <Title style={{ fontSize: 42, fontWeight: 500, lineHeight: 1.15, letterSpacing: -1, margin: '0 0 12px', color: '#fff' }}>
            Phim hay đang chờ<br />bạn khám phá
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>
            Xem lịch chiếu, chọn ghế yêu thích và đặt vé chỉ trong vài bước.
            </Text>
        </div>
        </section>

      <Footer />
    </div>
  )
}
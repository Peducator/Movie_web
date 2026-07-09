import { AntdRegistry } from '@ant-design/nextjs-registry'
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata = {
  title: "CineMax",
  description: "Đặt vé xem phim nhanh chóng",
}

const blobs = [
  { w: 400, h: 400, top: '-100px', left: '-80px', color: '#a78bfa' },
  { w: 300, h: 300, top: '5%', right: '-60px', color: '#60a5fa' },
  { w: 350, h: 350, bottom: '-80px', left: '20%', color: '#f472b6' },
  { w: 250, h: 250, bottom: '5%', right: '10%', color: '#34d399' },
  { w: 200, h: 200, top: '35%', left: '5%', color: '#fbbf24' },
  { w: 180, h: 180, top: '15%', left: '45%', color: '#f87171' },
]

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body style={{ position: 'relative', minHeight: '100vh', background: '#1a1a1a' }}>
        {blobs.map((b, i) => (
          <div key={i} style={{
            position: 'fixed',
            width: b.w, height: b.h,
            top: b.top, left: b.left, right: b.right, bottom: b.bottom,
            borderRadius: '50%',
            background: b.color,
            opacity: 0.4,
            filter: 'blur(80px)',
            pointerEvents: 'none',
            zIndex: 0,
          }} />
        ))}
        <AntdRegistry>
          <div style={{ position: 'relative', zIndex: 1 }}>
            {children}
          </div>
        </AntdRegistry>
      </body>
    </html>
  )
}
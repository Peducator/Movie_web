export default function Footer() {
  return (
    <footer style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '1.5rem 2rem',
      background: 'rgba(255,255,255,0.1)', borderTop: '1px solid rgba(255,255,255,0.15)',backdropFilter: 'blur(12px)'
    }}>
      <div style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>
        Cine<span style={{ color: '#4096ff' }}>Max</span>
      </div>
      <div style={{ fontSize: 13, color: '#666' }}>© 2026 CineMax. All rights reserved.</div>
    </footer>
  )
}
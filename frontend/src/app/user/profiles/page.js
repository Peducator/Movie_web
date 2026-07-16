'use client'
import { useEffect, useState } from 'react'
import { Typography, Button, Divider, Tag, Avatar, Tabs } from 'antd'
import { useRouter } from 'next/navigation'
import fetchWithAuth from '@/lib/fetchWithAuth'

const { Title, Text } = Typography

// Mock data
const mockUser = {
  user_name: 'Nguyễn Văn A',
  user_email: 'nguyenvana@gmail.com',
  user_phone: '0901234567',
  age: 24,
  gender: 'male',
  role: 'user',
}

const mockTickets = [
  {
    ticket_id: 1,
    ticket_status: 'confirmed',
    movie_name: 'Avengers: Secret Wars',
    showtime_date: '12/07/2026',
    showtime_time: '19:30',
    room_name: 'Phòng 1',
    seat_code: 'C3',
    seat_type: 'vip',
    transaction_amount: 220000,
    transaction_status: 'success',
  },
  {
    ticket_id: 2,
    ticket_status: 'confirmed',
    movie_name: 'Avengers: Secret Wars',
    showtime_date: '12/07/2026',
    showtime_time: '19:30',
    room_name: 'Phòng 1',
    seat_code: 'C4',
    seat_type: 'vip',
    transaction_amount: 220000,
    transaction_status: 'success',
  },
  {
    ticket_id: 3,
    ticket_status: 'cancelled',
    movie_name: 'Inside Out 3',
    showtime_date: '01/06/2026',
    showtime_time: '14:00',
    room_name: 'Phòng 2',
    seat_code: 'A5',
    seat_type: 'standard',
    transaction_amount: 75000,
    transaction_status: 'refunded',
  },
  {
    ticket_id: 4,
    ticket_status: 'confirmed',
    movie_name: 'Deadpool & Wolverine 2',
    showtime_date: '20/05/2026',
    showtime_time: '21:00',
    room_name: 'Phòng 3',
    seat_code: 'E1',
    seat_type: 'couple',
    transaction_amount: 180000,
    transaction_status: 'success',
  },
]

const TICKET_STATUS_CONFIG = {
  confirmed: { color: '#22c55e', label: 'Đã xác nhận' },
  cancelled:  { color: '#ef4444', label: 'Đã huỷ' },
  pending:    { color: '#f59e0b', label: 'Chờ xử lý' },
}

const SEAT_TYPE_LABEL = {
  standard: 'Standard',
  vip: 'VIP',
  couple: 'Couple',
}

const GENDER_LABEL = {
  male: 'Nam',
  female: 'Nữ',
  other: 'Khác',
}

const formatVND = (n) => n.toLocaleString('vi-VN') + 'đ'

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
      <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>{label}</Text>
      <Text style={{ color: '#fff', fontSize: 14 }}>{value || '—'}</Text>
    </div>
  )
}

function TicketCard({ ticket }) {
  const statusCfg = TICKET_STATUS_CONFIG[ticket.ticket_status] || {}
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.09)',
      borderRadius: 12,
      padding: '16px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 16,
      flexWrap: 'wrap',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Text style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>{ticket.movie_name}</Text>
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            color: statusCfg.color,
            background: `${statusCfg.color}18`,
            border: `1px solid ${statusCfg.color}40`,
            borderRadius: 6,
            padding: '2px 8px',
          }}>
            {statusCfg.label}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
            📅 {ticket.showtime_date} · {ticket.showtime_time}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
            🎬 {ticket.room_name}
          </Text>
        </div>
        <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
          <Tag color="blue" style={{ borderRadius: 6, margin: 0 }}>{ticket.seat_code}</Tag>
          <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
            {SEAT_TYPE_LABEL[ticket.seat_type]}
          </Text>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <Text style={{ color: '#4096ff', fontSize: 16, fontWeight: 700 }}>
          {formatVND(ticket.transaction_amount)}
        </Text>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const [tickets, setTickets] = useState([])
  const [activeTab, setActiveTab] = useState('info')
  const [user, setUser] = useState({})

  const confirmedTickets = Array.isArray(tickets) ? tickets.filter(t => t.ticket_status === 'booked') : []
  const cancelledTickets = Array.isArray(tickets) ? tickets.filter(t => t.ticket_status === 'cancelled') : []


  const handleLogout = () => {
    fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => {
      if (response.ok) {
        router.push('/')
      } else {
        console.error('Logout failed')
      }
    })
    .catch(error => console.error('Error during logout:', error))
  }
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/users/profiles`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        const data = await response.json()
        console.log(data)
        setUser(data)
      } catch (error) {
        console.error('Error fetching profile data:', error)
      }
    }

    fetchProfile()
  }, [])
  useEffect(() => {
    fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/tickets/my-tickets`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => setTickets(data))
      .catch(error => console.error('Error fetching tickets data:', error));
  }, []);

  return (
    <div style={{ minHeight: '100vh', padding: '40px 24px', color: '#fff' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <Text
            style={{ color: '#4096ff', cursor: 'pointer', fontSize: 14 }}
            onClick={() => router.push('/home')}
          >
            ← Trang chủ
          </Text>
        </div>

        {/* Avatar + tên */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16,
          padding: '28px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          marginBottom: 24,
          flexWrap: 'wrap',
        }}>
          <Avatar
            size={72}
            style={{ background: '#4096ff', fontSize: 28, fontWeight: 700, flexShrink: 0 }}
          >
            {user.user_name?.[0]?.toUpperCase()}
          </Avatar>
          <div style={{ flex: 1 }}>
            <Title level={4} style={{ color: '#fff', margin: '0 0 4px' }}>{user.user_name}</Title>
            <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>{user.user_email}</Text>
            {user.role === 'admin' && (
              <Tag color="gold" style={{ marginLeft: 10, borderRadius: 6 }}>Admin</Tag>
            )}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ textAlign: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: 700, display: 'block' }}>
                {user.total_seats || 0}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Vé đã đặt</Text>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Text style={{ color: '#4096ff', fontSize: 20, fontWeight: 700, display: 'block' }}>
                {formatVND(user.total_amount || 0)}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Đã chi tiêu</Text>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ color: '#fff' }}
          items={[
            {
              key: 'info',
              label: 'Thông tin',
              children: (
                <div style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 16,
                  padding: '8px 24px',
                }}>
                  <InfoRow label="Họ tên" value={user.user_name} />
                  <Divider style={{ borderColor: 'rgba(255,255,255,0.06)', margin: '0' }} />
                  <InfoRow label="Email" value={user.user_email} />
                  <Divider style={{ borderColor: 'rgba(255,255,255,0.06)', margin: '0' }} />
                  <InfoRow label="Số điện thoại" value={user.user_phone} />
                  <Divider style={{ borderColor: 'rgba(255,255,255,0.06)', margin: '0' }} />
                  <InfoRow label="Tuổi" value={user.age} />
                  <Divider style={{ borderColor: 'rgba(255,255,255,0.06)', margin: '0' }} />
                  <InfoRow label="Giới tính" value={GENDER_LABEL[user.gender]} />

                  <div style={{ padding: '20px 0 12px', display: 'flex', gap: 12 }}>
                    <Button
                      onClick={() => router.push('/user/update')}
                      style={{ borderRadius: 8, background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }}
                    >
                      Chỉnh sửa thông tin
                    </Button>
                    <Button
                      danger
                      style={{ borderRadius: 8 }}
                      onClick={handleLogout}
                    >
                      Đăng xuất
                    </Button>
                  </div>
                </div>
              ),
            },
            {
              key: 'tickets',
              label: `Vé của tôi (${confirmedTickets.length})`,
              children: (
                <div style={{ 
                  display: 'flex', flexDirection: 'column', gap: 12,
                  maxHeight: '60vh',
                  overflowY: 'auto',
                  paddingRight: 4
                }}>
                  {confirmedTickets.length === 0
                    ? <Text style={{ color: 'rgba(255,255,255,0.3)' }}>Chưa có vé nào.</Text>
                    : confirmedTickets.map(t => <TicketCard key={t.ticket_id} ticket={t} />)
                  }
                </div>
              ),
            },
            {
              key: 'cancelled',
              label: `Đã huỷ (${cancelledTickets.length})`,
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {cancelledTickets.length === 0
                    ? <Text style={{ color: 'rgba(255,255,255,0.3)' }}>Không có vé nào bị huỷ.</Text>
                    : cancelledTickets.map(t => <TicketCard key={t.ticket_id} ticket={t} />)
                  }
                </div>
              ),
            },
          ]}
        />

      </div>
    </div>
  )
}
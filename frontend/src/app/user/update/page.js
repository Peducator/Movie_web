'use client'
import { useState } from 'react'
import { ConfigProvider, theme, Typography, Button, Divider, Tag, Avatar, Tabs, Form, Input, Select } from 'antd'
import { useRouter } from 'next/navigation'
import fetchWithAuth from '@/lib/fetchWithAuth'
import '../../globals.css'

const { Title, Text } = Typography

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
  },
  {
    ticket_id: 2,
    ticket_status: 'confirmed',
    movie_name: 'Deadpool & Wolverine 2',
    showtime_date: '20/05/2026',
    showtime_time: '21:00',
    room_name: 'Phòng 3',
    seat_code: 'E1',
    seat_type: 'couple',
    transaction_amount: 180000,
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
  },
]

const TICKET_STATUS_CONFIG = {
  booked: { color: '#22c55e', label: 'Đã xác nhận' },
  cancelled:  { color: '#ef4444', label: 'Đã huỷ' },
  pending:    { color: '#f59e0b', label: 'Chờ xử lý' },
}

const SEAT_TYPE_LABEL = { standard: 'Standard', vip: 'VIP', couple: 'Couple' }
const GENDER_LABEL    = { male: 'Nam', female: 'Nữ', other: 'Khác' }
const formatVND = (n) => n.toLocaleString('vi-VN') + 'đ'

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
          <Text style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>{ticket.movie_name}</Text>
          <span style={{
            fontSize: 11, fontWeight: 600,
            color: statusCfg.color,
            background: `${statusCfg.color}18`,
            border: `1px solid ${statusCfg.color}40`,
            borderRadius: 6, padding: '2px 8px',
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
      <Text style={{ color: '#4096ff', fontSize: 16, fontWeight: 700, whiteSpace: 'nowrap' }}>
        {formatVND(ticket.transaction_amount)}
      </Text>
    </div>
  )
}

function EditProfileForm({ user, onCancel, onSave }) {
  const [form] = Form.useForm()

  const handleFinish = (values) => {
    onSave(values)
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 16,
      padding: '24px',
    }}>
      <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase' }}>
        Chỉnh sửa thông tin
      </Text>

      <Form
        form={form}
        layout="vertical"
        initialValues={user}
        onFinish={handleFinish}
        requiredMark={false}
        style={{ marginTop: 20 }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <Form.Item
            name="user_name"
            label={<Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>Họ tên</Text>}
            rules={[{ required: true, message: 'Nhập họ tên' }]}
          >
            <Input
              size="large"
              style={{ borderRadius: 8, background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }}
            />
          </Form.Item>

          <Form.Item
            name="user_phone"
            label={<Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>Số điện thoại</Text>}
          >
            <Input
              size="large"
              style={{ borderRadius: 8, background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }}
            />
          </Form.Item>

          <Form.Item
            name="age"
            label={<Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>Tuổi</Text>}
          >
            <Input
              size="large"
              type="number"
              style={{ borderRadius: 8, background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }}
            />
          </Form.Item>

          <Form.Item
            name="gender"
            label={<Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Giới tính</Text>}
          >
            <Select
              size="large"
              style={{ borderRadius: 8, background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }}
              options={[
                { value: 'male',   label: 'Nam' },
                { value: 'female', label: 'Nữ' },
                { value: 'other',  label: 'Khác' },
              ]}
            />
          </Form.Item>
        </div>

        <Form.Item
          name="user_email"
          label={<Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>Email</Text>}
        >
          <Input
            size="large"
            disabled
            style={{ borderRadius: 8, background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }}
          />
        </Form.Item>

        {/* <Divider style={{ borderColor: 'rgba(255,255,255,0.08)' }} />

        <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', display: 'block', marginBottom: 16 }}>
          Đổi mật khẩu (tuỳ chọn)
        </Text>

        <Form.Item
          name="current_password"
          label={<Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>Mật khẩu hiện tại</Text>}
        >
          <Input.Password
            size="large"
            style={{ borderRadius: 8, background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }}
          />
        </Form.Item>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <Form.Item
            name="new_password"
            label={<Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>Mật khẩu mới</Text>}
          >
            <Input.Password
              size="large"
              style={{ borderRadius: 8, background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }}
            />
          </Form.Item>

          <Form.Item
            name="confirm_password"
            label={<Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>Xác nhận mật khẩu mới</Text>}
            dependencies={['new_password']}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) return Promise.resolve()
                  return Promise.reject('Mật khẩu không khớp')
                },
              }),
            ]}
          >
            <Input.Password
              size="large"
              style={{ borderRadius: 8, background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }}
            />
          </Form.Item>
        </div> */}

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            style={{ borderRadius: 8 }}
          >
            Lưu thay đổi
          </Button>
          <Button
            size="large"
            style={{ borderRadius: 8, background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }}
            onClick={onCancel}
          >
            Huỷ
          </Button>
        </div>
      </Form>
    </div>
  )
}

function InfoView({ user, onEdit, onLogout }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 16,
      padding: '8px 24px',
    }}>
      {[
        { label: 'Họ tên',          value: user.user_name },
        { label: 'Email',           value: user.user_email },
        { label: 'Số điện thoại',   value: user.user_phone },
        { label: 'Tuổi',            value: user.age },
        { label: 'Giới tính',       value: GENDER_LABEL[user.gender] },
      ].map((row, i, arr) => (
        <div key={row.label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>{row.label}</Text>
            <Text style={{ color: '#fff', fontSize: 14 }}>{row.value || '—'}</Text>
          </div>
          {i < arr.length - 1 && <Divider style={{ borderColor: 'rgba(255,255,255,0.06)', margin: 0 }} />}
        </div>
      ))}

      <div style={{ padding: '20px 0 12px', display: 'flex', gap: 12 }}>
        <Button
          size="large"
          style={{ borderRadius: 8, background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }}
          onClick={onEdit}
        >
          Chỉnh sửa thông tin
        </Button>
        <Button danger size="large" style={{ borderRadius: 8 }} onClick={onLogout}>
          Đăng xuất
        </Button>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState(mockUser)
  const [editing, setEditing] = useState(false)
  const tickets = mockTickets

  const confirmedTickets = tickets.filter(t => t.ticket_status === 'confirmed')
  const cancelledTickets = tickets.filter(t => t.ticket_status === 'cancelled')
  const totalSpent = confirmedTickets.reduce((s, t) => s + t.transaction_amount, 0)

  const handleSave = (values) => {
    // TODO: gọi API PATCH /users/:id
    setUser(prev => ({ ...prev, ...values }))
    setEditing(false)
  }

  const handleLogout = () => {
    // TODO: clear token
    router.push('/auth/login')
  }

  return (
    <div style={{ minHeight: '100vh', padding: '40px 24px', color: '#fff' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <Text style={{ color: '#4096ff', cursor: 'pointer', fontSize: 14 }} onClick={() => router.push('/home')}>
            ← Trang chủ
          </Text>
        </div>

        {/* Avatar card */}
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
          <Avatar size={72} style={{ background: '#4096ff', fontSize: 28, fontWeight: 700, flexShrink: 0 }}>
            {user.user_name?.[0]?.toUpperCase()}
          </Avatar>
          <div style={{ flex: 1 }}>
            <Title level={4} style={{ color: '#fff', margin: '0 0 4px' }}>{user.user_name}</Title>
            <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>{user.user_email}</Text>
            {user.role === 'admin' && (
              <Tag color="gold" style={{ marginLeft: 10, borderRadius: 6 }}>Admin</Tag>
            )}
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ textAlign: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: 700, display: 'block' }}>
                {confirmedTickets.length}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Vé đã đặt</Text>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Text style={{ color: '#4096ff', fontSize: 20, fontWeight: 700, display: 'block' }}>
                {formatVND(totalSpent)}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Đã chi tiêu</Text>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          defaultActiveKey="info"
          onChange={() => setEditing(false)}
          items={[
            {
              key: 'info',
              label: 'Thông tin',
              children: editing
                ? <EditProfileForm user={user} onCancel={() => setEditing(false)} onSave={handleSave} />
                : <InfoView user={user} onEdit={() => setEditing(true)} onLogout={handleLogout} />,
            },
            {
              key: 'tickets',
              label: `Vé của tôi (${confirmedTickets.length})`,
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
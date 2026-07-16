'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Modal, Form, Input, Select, DatePicker, TimePicker, Button, Popconfirm, message, Tag } from 'antd'
import dayjs from 'dayjs'

const NAV_ITEMS = [
  { icon: '⊞', label: 'Quản lý phim',    key: 'movies' },
  { icon: '🕐', label: 'Lịch chiếu',      key: 'showtimes' },
  { icon: '👥', label: 'Người dùng',      key: 'users' },
]

// Mock data
const mockMovies = [
  { movie_id: 1, movie_name: 'Avengers: Secret Wars' },
  { movie_id: 2, movie_name: 'Inside Out 3' },
  { movie_id: 3, movie_name: 'Deadpool & Wolverine 2' },
]

const mockRooms = [
  { room_id: 1, room_name: 'Phòng 1' },
  { room_id: 2, room_name: 'Phòng 2' },
  { room_id: 3, room_name: 'Phòng 3' },
]

const mockShowtimes = [
  { showtime_id: 1, movie_id: 1, movie_name: 'Avengers: Secret Wars', room_id: 1, room_name: 'Phòng 1', date: '2026-07-12', start_time: '09:00', end_time: '11:30' },
  { showtime_id: 2, movie_id: 1, movie_name: 'Avengers: Secret Wars', room_id: 2, room_name: 'Phòng 2', date: '2026-07-12', start_time: '13:00', end_time: '15:30' },
  { showtime_id: 3, movie_id: 2, movie_name: 'Inside Out 3',          room_id: 1, room_name: 'Phòng 1', date: '2026-07-13', start_time: '10:00', end_time: '12:00' },
  { showtime_id: 4, movie_id: 3, movie_name: 'Deadpool & Wolverine 2',room_id: 3, room_name: 'Phòng 3', date: '2026-07-13', start_time: '20:00', end_time: '22:30' },
  { showtime_id: 5, movie_id: 1, movie_name: 'Avengers: Secret Wars', room_id: 3, room_name: 'Phòng 3', date: '2026-07-14', start_time: '17:00', end_time: '19:30' },
]

function groupByDate(showtimes) {
  return showtimes.reduce((acc, st) => {
    if (!acc[st.date]) acc[st.date] = []
    acc[st.date].push(st)
    return acc
  }, {})
}

function formatDateLabel(dateStr) {
  const d = new Date(dateStr)
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
  return `${days[d.getDay()]}, ${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`
}

const inputStyle = {
  borderRadius: 8,
  background: 'rgba(255,255,255,0.07)',
  borderColor: 'rgba(255,255,255,0.15)',
  color: '#fff',
}

export default function AdminShowtimesPage() {
  const router = useRouter()
  const [activeNav, setActiveNav] = useState('showtimes')
  const [showtimes, setShowtimes] = useState(mockShowtimes)
  const [movies, setMovies] = useState(mockMovies)
  const [rooms, setRooms] = useState(mockRooms)
  const [selectedDate, setSelectedDate] = useState(null)
  const [filterMovie, setFilterMovie] = useState(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [editingShowtime, setEditingShowtime] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()

  // TODO: fetch thật
  // useEffect(() => {
  //   fetch(`${process.env.NEXT_PUBLIC_API_URL}/showtimes`).then(r => r.json()).then(setShowtimes)
  //   fetch(`${process.env.NEXT_PUBLIC_API_URL}/movies`).then(r => r.json()).then(setMovies)
  //   fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms`).then(r => r.json()).then(setRooms)
  // }, [])

  const grouped = groupByDate(showtimes)
  const dates = Object.keys(grouped).sort()

  useEffect(() => {
    if (dates.length > 0 && !selectedDate) setSelectedDate(dates[0])
  }, [dates.length])

  // Filter
  let displayed = selectedDate ? (grouped[selectedDate] || []) : []
  if (filterMovie) displayed = displayed.filter(st => st.movie_id === filterMovie)

  // --- Handlers ---
  const openAdd = () => {
    setModalMode('add')
    setEditingShowtime(null)
    form.resetFields()
    if (selectedDate) form.setFieldValue('date', dayjs(selectedDate))
    setModalOpen(true)
  }

  const openEdit = (st) => {
    setModalMode('edit')
    setEditingShowtime(st)
    form.setFieldsValue({
      movie_id:   st.movie_id,
      room_id:    st.room_id,
      date:       dayjs(st.date),
      start_time: dayjs(st.start_time, 'HH:mm'),
      end_time:   dayjs(st.end_time,   'HH:mm'),
    })
    setModalOpen(true)
  }

  const handleSubmit = async (values) => {
    setSubmitting(true)
    const payload = {
      movie_id:   values.movie_id,
      room_id:    values.room_id,
      date:       values.date.format('YYYY-MM-DD'),
      start_time: values.start_time.format('HH:mm'),
      end_time:   values.end_time.format('HH:mm'),
    }

    try {
      const isEdit = modalMode === 'edit'
      // TODO: replace với fetch thật
      // const url = isEdit
      //   ? `${process.env.NEXT_PUBLIC_API_URL}/showtimes/${editingShowtime.showtime_id}`
      //   : `${process.env.NEXT_PUBLIC_API_URL}/showtimes`
      // const res = await fetch(url, {
      //   method: isEdit ? 'PUT' : 'POST',
      //   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      //   body: JSON.stringify(payload),
      // })
      // if (!res.ok) throw new Error()

      const movie = movies.find(m => m.movie_id === payload.movie_id)
      const room  = rooms.find(r => r.room_id  === payload.room_id)

      if (isEdit) {
        setShowtimes(prev => prev.map(st =>
          st.showtime_id === editingShowtime.showtime_id
            ? { ...st, ...payload, movie_name: movie?.movie_name, room_name: room?.room_name }
            : st
        ))
        message.success('Cập nhật suất chiếu thành công')
      } else {
        const newSt = {
          showtime_id: Date.now(),
          ...payload,
          movie_name: movie?.movie_name,
          room_name:  room?.room_name,
        }
        setShowtimes(prev => [...prev, newSt])
        setSelectedDate(payload.date)
        message.success('Thêm suất chiếu thành công')
      }

      setModalOpen(false)
    } catch {
      message.error('Có lỗi xảy ra')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (showtime_id) => {
    try {
      // TODO: fetch thật
      // await fetch(`${process.env.NEXT_PUBLIC_API_URL}/showtimes/${showtime_id}`, {
      //   method: 'DELETE',
      //   headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      // })
      setShowtimes(prev => prev.filter(st => st.showtime_id !== showtime_id))
      message.success('Đã xoá suất chiếu')
    } catch {
      message.error('Xoá thất bại')
    }
  }

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
          <div style={{ marginTop: 6, fontSize: 11, fontWeight: 600, color: '#f59e0b', letterSpacing: 2, textTransform: 'uppercase' }}>
            Admin Panel
          </div>
        </div>

        {NAV_ITEMS.map(item => (
          <div
            key={item.key}
            onClick={() => {
              setActiveNav(item.key)
              if (item.key === 'movies') router.push('/admin/movies')
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 12px', borderRadius: 8,
              color: activeNav === item.key ? '#4096ff' : 'rgba(255,255,255,0.5)',
              background: activeNav === item.key ? 'rgba(64,150,255,0.15)' : 'transparent',
              fontSize: 16, cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            <span>{item.icon}</span>
            {item.label}
          </div>
        ))}

        <div style={{ flex: 1 }} />

        <div
          onClick={() => router.push('/home')}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 12px', borderRadius: 8,
            color: 'rgba(255,255,255,0.5)', fontSize: 16, cursor: 'pointer',
          }}
        >
          ← Về trang chủ
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexShrink: 0, flexWrap: 'wrap', gap: 10 }}>
          <span style={{ color: '#fff', fontSize: 20, fontWeight: 500 }}>Quản lý lịch chiếu</span>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <Select
              allowClear
              placeholder="Lọc theo phim"
              style={{ width: 200 }}
              onChange={setFilterMovie}
              options={movies.map(m => ({ value: m.movie_id, label: m.movie_name }))}
            />
            <button
              onClick={openAdd}
              style={{
                background: '#4096ff', border: 'none', borderRadius: 8,
                padding: '7px 16px', color: '#fff', fontSize: 13,
                cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap',
              }}
            >
              + Thêm suất chiếu
            </button>
          </div>
        </div>

        {/* Date tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', flexShrink: 0 }}>
          {dates.map(date => (
            <div
              key={date}
              onClick={() => setSelectedDate(date)}
              style={{
                padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
                fontSize: 13, fontWeight: 500,
                border: selectedDate === date ? '1.5px solid #4096ff' : '1px solid rgba(255,255,255,0.12)',
                background: selectedDate === date ? 'rgba(64,150,255,0.15)' : 'rgba(255,255,255,0.04)',
                color: selectedDate === date ? '#4096ff' : 'rgba(255,255,255,0.55)',
                transition: 'all 0.15s',
              }}
            >
              {formatDateLabel(date)}
              <span style={{
                marginLeft: 6, fontSize: 11,
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 10, padding: '1px 6px',
                color: 'rgba(255,255,255,0.4)',
              }}>
                {grouped[date].length}
              </span>
            </div>
          ))}
        </div>

        {/* Showtime list */}
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: 4 }}>
          {displayed.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '3rem' }}>
              Không có suất chiếu nào.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {displayed.map(st => (
                <div
                  key={st.showtime_id}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    borderRadius: 12,
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    flexWrap: 'wrap',
                  }}
                >
                  {/* Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                    {/* Time */}
                    <div style={{ minWidth: 120 }}>
                      <span style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>{st.start_time}</span>
                      <span style={{ color: 'rgba(255,255,255,0.3)', margin: '0 6px' }}>→</span>
                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>{st.end_time}</span>
                    </div>

                    {/* Movie */}
                    <div>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                        {st.movie_name}
                      </div>
                      <Tag style={{
                        borderRadius: 8, fontSize: 12,
                        background: 'rgba(255,255,255,0.07)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: 'rgba(255,255,255,0.55)',
                      }}>
                        🎬 {st.room_name}
                      </Tag>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => openEdit(st)}
                      style={{
                        background: 'rgba(64,150,255,0.15)', border: '1px solid rgba(64,150,255,0.3)',
                        borderRadius: 8, padding: '6px 14px',
                        color: '#4096ff', fontSize: 13, cursor: 'pointer', fontWeight: 600,
                      }}
                    >
                      ✏ Sửa
                    </button>
                    <Popconfirm
                      title="Xoá suất chiếu này?"
                      description="Hành động không thể hoàn tác."
                      okText="Xoá" cancelText="Không"
                      okButtonProps={{ danger: true }}
                      onConfirm={() => handleDelete(st.showtime_id)}
                    >
                      <button style={{
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: 8, padding: '6px 14px',
                        color: '#ef4444', fontSize: 13, cursor: 'pointer', fontWeight: 600,
                      }}>
                        🗑 Xoá
                      </button>
                    </Popconfirm>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        title={
          <span style={{ color: '#fff' }}>
            {modalMode === 'add' ? '+ Thêm suất chiếu' : '✏ Cập nhật suất chiếu'}
          </span>
        }
        styles={{
          content: { background: '#1f1f1f', border: '1px solid rgba(255,255,255,0.1)' },
          header:  { background: '#1f1f1f', borderBottom: '1px solid rgba(255,255,255,0.08)' },
          mask:    { backdropFilter: 'blur(4px)' },
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false} style={{ marginTop: 16 }}>

          <Form.Item
            name="movie_id"
            label={<span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>Phim</span>}
            rules={[{ required: true, message: 'Chọn phim' }]}
          >
            <Select
              size="large"
              placeholder="Chọn phim"
              options={movies.map(m => ({ value: m.movie_id, label: m.movie_name }))}
            />
          </Form.Item>

          <Form.Item
            name="room_id"
            label={<span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>Phòng chiếu</span>}
            rules={[{ required: true, message: 'Chọn phòng' }]}
          >
            <Select
              size="large"
              placeholder="Chọn phòng"
              options={rooms.map(r => ({ value: r.room_id, label: r.room_name }))}
            />
          </Form.Item>

          <Form.Item
            name="date"
            label={<span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>Ngày chiếu</span>}
            rules={[{ required: true, message: 'Chọn ngày' }]}
          >
            <DatePicker size="large" style={{ width: '100%', borderRadius: 8 }} format="DD/MM/YYYY" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item
              name="start_time"
              label={<span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>Giờ bắt đầu</span>}
              rules={[{ required: true, message: 'Chọn giờ' }]}
            >
              <TimePicker size="large" format="HH:mm" style={{ width: '100%', borderRadius: 8 }} />
            </Form.Item>

            <Form.Item
              name="end_time"
              label={<span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>Giờ kết thúc</span>}
              rules={[{ required: true, message: 'Chọn giờ' }]}
            >
              <TimePicker size="large" format="HH:mm" style={{ width: '100%', borderRadius: 8 }} />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button
              style={{ borderRadius: 8, background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }}
              onClick={() => setModalOpen(false)}
            >
              Huỷ
            </Button>
            <Button type="primary" htmlType="submit" loading={submitting} style={{ borderRadius: 8 }}>
              {modalMode === 'add' ? 'Thêm suất' : 'Lưu thay đổi'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
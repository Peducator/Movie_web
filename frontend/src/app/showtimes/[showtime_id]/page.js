'use client'
import { useState, useEffect } from 'react'
import { Typography, Button, Tag, Divider, Modal } from 'antd'
import { useParams, useRouter } from 'next/navigation'
import fetchWithAuth from '@/lib/fetchWithAuth'

const { Title, Text } = Typography

const SEAT_PRICE = {
  standard: 75000,
  vip: 110000,
  couple: 180000,
}

const SEAT_COLOR = {
  standard: { available: '#1d4ed8', booked: 'rgba(255,255,255,0.1)', selected: '#22c55e' },
  vip:      { available: '#7c3aed', booked: 'rgba(255,255,255,0.1)', selected: '#22c55e' },
  couple:   { available: '#db2777', booked: 'rgba(255,255,255,0.1)', selected: '#22c55e' },
}

function groupByRow(seats = []) {
  return seats.reduce((acc, seat) => {
    const row = seat.seat_code[0]
    if (!acc[row]) acc[row] = []
    acc[row].push(seat)
    return acc
  }, {})
}

export default function SeatPickerPage() {
  const router = useRouter()
  const { showtime_id } = useParams()

  const [selectedIds, setSelectedIds] = useState([])
  const [bookedSeats, setBookedSeats] = useState([])
  const [infor, setinfor] = useState(null)
  const [cooldownLeft, setCooldownLeft] = useState(0)
  const [seats, setSeats] = useState([])

  const rows = groupByRow(seats)
  const movie = infor?.movie
  const showtime = infor?.showtime
  const room = infor?.room

  // Fetch thông tin phim theo showtime (đúng phòng)
  useEffect(() => {
    const fetchData = async () => {
      const r = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/seats/showtimes/${showtime_id}`)
      const data = await r.json()
      setinfor(data)
      setSeats(Array.isArray(data.seats) ? data.seats : [])
    }

    fetchData()
  }, [showtime_id])

  // Fetch ghế đã đặt
  useEffect(() => {
    fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/seats/showtimes/booked/${showtime_id}`)
      .then(r => r.json())
      .then(data => setBookedSeats(Array.isArray(data) ? data : []))
  }, [showtime_id])

  // Đếm ngược cooldown
  useEffect(() => {
    if (cooldownLeft <= 0) return
    const timer = setInterval(() => {
      setCooldownLeft(prev => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldownLeft])

  const toggleSeat = (seat) => {
    const isBooked = bookedSeats.some(b => b.seat_id === seat.seat_id)
    if (isBooked) return
    setSelectedIds(prev =>
      prev.includes(seat.seat_id)
        ? prev.filter(id => id !== seat.seat_id)
        : [...prev, seat.seat_id]
    )
  }
  const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
// → "18/07/2026, 19:00" (UTC+7)

  const selectedSeats = seats.filter(s => selectedIds.includes(s.seat_id))
  const totalPrice = selectedSeats.reduce((sum, s) => sum + SEAT_PRICE[s.seat_type], 0)

  const getSeatColor = (seat) => {
    const isBooked = bookedSeats.some(b => b.seat_id === seat.seat_id)
    if (selectedIds.includes(seat.seat_id)) return SEAT_COLOR[seat.seat_type].selected
    if (isBooked) return SEAT_COLOR[seat.seat_type].booked
    return SEAT_COLOR[seat.seat_type].available
  }

  const formatVND = (n) => n.toLocaleString('vi-VN') + 'đ'

  if (!infor) {
    return (
      <div style={{ minHeight: '100vh', padding: '40px 24px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: 'rgba(255,255,255,0.65)' }}>Đang tải dữ liệu suất chiếu...</Text>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', padding: '40px 24px', color: '#fff' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <Text
            style={{ color: '#4096ff', cursor: 'pointer', fontSize: 14 }}
            onClick={() => router.back()}
          >
            ← Quay lại
          </Text>
          <Title level={3} style={{ color: '#fff', margin: '12px 0 4px' }}>
            Cine<span style={{ color: '#4096ff' }}>Max</span> — Chọn ghế
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>
            Phim: <span style={{ color: '#fff' }}>{movie?.movie_name}</span> &nbsp;|&nbsp;
            Suất: <span style={{ color: '#fff' }}>{formatDate(showtime?.start_time)} - {formatDate(showtime?.end_time)}</span> &nbsp;|&nbsp;
            Phòng: <span style={{ color: '#fff' }}>{room?.room_name}</span>
          </Text>
        </div>

        {/* Screen */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-block',
            width: '70%',
            height: 6,
            background: 'linear-gradient(90deg, transparent, rgba(64,150,255,0.6), transparent)',
            borderRadius: 4,
            marginBottom: 6,
          }} />
          <Text style={{ display: 'block', color: 'rgba(255,255,255,0.3)', fontSize: 12, letterSpacing: 4 }}>
            MÀN HÌNH
          </Text>
        </div>

        {/* Seat grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', marginBottom: 40 }}>
          {Object.entries(rows).map(([rowLabel, rowSeats]) => (
            <div key={rowLabel} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Text style={{ color: 'rgba(255,255,255,0.3)', width: 20, textAlign: 'center', fontSize: 13 }}>
                {rowLabel}
              </Text>
              <div style={{ display: 'flex', gap: 8 }}>
                {rowSeats.map(seat => {
                  const isBooked = bookedSeats.some(b => b.seat_id === seat.seat_id)
                  return (
                    <div
                      key={seat.seat_id}
                      onClick={() => toggleSeat(seat)}
                      title={`${seat.seat_code} — ${seat.seat_type} — ${formatVND(SEAT_PRICE[seat.seat_type])}`}
                      style={{
                        width: seat.seat_type === 'couple' ? 68 : 36,
                        height: 32,
                        borderRadius: 6,
                        background: getSeatColor(seat),
                        cursor: isBooked ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        color: isBooked ? 'rgba(255,255,255,0.2)' : '#fff',
                        fontWeight: 600,
                        border: selectedIds.includes(seat.seat_id) ? '2px solid #86efac' : '2px solid transparent',
                        transition: 'all 0.15s',
                        userSelect: 'none',
                      }}
                    >
                      {seat.seat_code}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginBottom: 32, flexWrap: 'wrap' }}>
          {[
            { color: '#1d4ed8', label: `Standard — ${formatVND(SEAT_PRICE.standard)}` },
            { color: '#7c3aed', label: `VIP — ${formatVND(SEAT_PRICE.vip)}` },
            { color: '#db2777', label: `Couple — ${formatVND(SEAT_PRICE.couple)}` },
            { color: '#22c55e', label: 'Đang chọn' },
            { color: 'rgba(255,255,255,0.1)', label: 'Đã đặt', border: '1px solid rgba(255,255,255,0.15)' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 20, height: 16, borderRadius: 4,
                background: item.color,
                border: item.border || 'none',
              }} />
              <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>{item.label}</Text>
            </div>
          ))}
        </div>

        <Divider style={{ borderColor: 'rgba(255,255,255,0.08)' }} />

        {/* Summary & CTA */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 12,
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <div>
            <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, display: 'block', marginBottom: 6 }}>
              Ghế đã chọn
            </Text>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {selectedSeats.length === 0
                ? <Text style={{ color: 'rgba(255,255,255,0.25)' }}>Chưa chọn ghế nào</Text>
                : selectedSeats.map(s => (
                    <Tag key={s.seat_id} color="blue" style={{ borderRadius: 6, fontSize: 13 }}>
                      {s.seat_code}
                    </Tag>
                  ))
              }
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, display: 'block' }}>
              Tổng cộng
            </Text>
            <Text style={{ color: '#4096ff', fontSize: 22, fontWeight: 700 }}>
              {formatVND(totalPrice)}
            </Text>
          </div>

          <Button
            type="primary"
            size="large"
            disabled={selectedSeats.length === 0}
            style={{ borderRadius: 8, minWidth: 160 }}
            onClick={async () => {
              const r = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/tickets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  user_id: localStorage.getItem('user_id'),
                  showtime_id: showtime_id,
                  seat_ids: selectedIds,
                  transaction_amount: totalPrice
                })
              }).then(r => r.json())

              r.secondsLeft
                ? setCooldownLeft(r.secondsLeft)
                : router.push(`/tickets?transaction_id=${r.transaction_id}&expired_at=${r.expired_at}`)
            }}
          >
            Đặt vé ({selectedSeats.length})
          </Button>
        </div>

      </div>

      {/* Popup cooldown */}
      <Modal open={cooldownLeft > 0} footer={null} closable={false} centered>
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Text style={{ fontSize: 16 }}>Vui lòng chờ trước khi đặt vé tiếp</Text>
          <div style={{ fontSize: 48, fontWeight: 700, color: '#ef4444', margin: '16px 0' }}>
            {cooldownLeft}s
          </div>
        </div>
      </Modal>
    </div>
  )
}
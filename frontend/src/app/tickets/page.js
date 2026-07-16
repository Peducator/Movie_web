'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button, Divider, Modal, Result, Spin, Steps, Tag, Typography } from 'antd'
import { useRouter, useSearchParams } from 'next/navigation'
import '../globals.css'
import fetchWithAuth from '@/lib/fetchWithAuth'

const { Title, Text } = Typography

const SEAT_TYPE_LABEL = {
  standard: 'Standard',
  vip: 'VIP',
  couple: 'Couple',
}

const QR_PLACEHOLDER = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=CINEMAX_PAYMENT_DEMO'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
const DEFAULT_COUNTDOWN_SECONDS = 60

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString('vi-VN')}đ`
}

function formatCountdown(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0')
  const seconds = (totalSeconds % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}`
}

function getInitialCountdown(expiredAt) {
  if (!expiredAt) {
    return DEFAULT_COUNTDOWN_SECONDS
  }

  const diff = Math.floor((new Date(expiredAt).getTime() - Date.now()) / 1000)
  return Math.max(0, diff)
}

function normalizeOrder(data) {
  return {
    movie_name: data?.movie_name ?? '-',
    showtime_date: data?.showtime_date ?? '-',
    showtime_time: data?.showtime_time ?? '-',
    room_name: data?.room_name ?? '-',
    seats: Array.isArray(data?.seats) ? data.seats : [],
    transaction_id: data?.transaction_id ?? '',
    total_amount: data?.total_amount ?? 0,
  }
}

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const transactionId = searchParams.get('transaction_id')
  const expiredAt = searchParams.get('expired_at')

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [status, setStatus] = useState('pending')
  const [countdown, setCountdown] = useState(() => getInitialCountdown(expiredAt))
  const expiryHandledRef = useRef(false)

  const total = order?.seats?.reduce((sum, seat) => sum + Number(seat?.price || 0), 0) ?? 0

  const cancelTransaction = useCallback(async () => {
    if (!transactionId) {
      return
    }

    await fetchWithAuth(`${API_BASE_URL}/transactions/${transactionId}/cancel`, {
      method: 'PATCH',
      credentials: 'include',
    })
  }, [transactionId])

  const handleCancelPayment = useCallback(async () => {
    await cancelTransaction()
    router.push('/home')
  }, [cancelTransaction, router])

  const handleCheckPayment = useCallback(async () => {
    if (!transactionId) {
      setStatus('failed')
      return
    }

    setStatus('checking')

    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/transactions/${transactionId}/complete`, {
        method: 'PATCH',
      })

      setStatus(response.ok ? 'success' : 'failed')
    } catch {
      setStatus('failed')
    }
  }, [transactionId])

  const handleContinue = useCallback(() => {
    setShowConfirm(false)
  }, [])

  useEffect(() => {
    const fetchOrder = async () => {
      if (!transactionId) {
        setError('Thiếu transaction_id trong URL.')
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const response = await fetchWithAuth(`${API_BASE_URL}/transactions/${transactionId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data?.message || 'Không thể tải đơn hàng.')
        }

        setOrder(normalizeOrder(data))
      } catch (fetchError) {
        setError(fetchError?.message || 'Có lỗi xảy ra khi tải đơn hàng.')
        setOrder(null)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [transactionId])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    window.history.pushState(null, '', window.location.href)

    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href)
      setShowConfirm(true)
    }

    const handleBeforeUnload = (event) => {
      // Chỉ block, không cancel hay redirect được ở đây
      // Browser tự handle, không can thiệp được
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('popstate', handlePopState)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  useEffect(() => {
    if (status !== 'pending') {
      return undefined
    }

    if (countdown <= 0) {
      if (!expiryHandledRef.current) {
        expiryHandledRef.current = true
        void cancelTransaction().finally(() => setStatus('failed'))
      }
      return undefined
    }

    const timerId = window.setTimeout(() => {
      setCountdown((current) => Math.max(current - 1, 0))
    }, 1000)

    return () => window.clearTimeout(timerId)
  }, [cancelTransaction, countdown, status])

  if (loading) {
    return (
      <div className="tickets-centeredState">
        <Spin size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="tickets-centeredState">
        <Result
          status="error"
          title="Không tải được đơn thanh toán"
          subTitle={error}
          extra={[
            <Button key="home" type="primary" onClick={() => router.push('/home')}>
              Về trang chủ
            </Button>,
            <Button key="back" onClick={() => router.back()}>
              Quay lại
            </Button>,
          ]}
        />
      </div>
    )
  }

  const orderStep = status === 'success' ? 2 : 1
  const isExpired = status === 'failed'

  return (
    <div className="tickets-page">
      <div className="tickets-shell">
        <header className="tickets-header">
          {status !== 'success' && (
            <Text className="tickets-backLink" onClick={() => setShowConfirm(true)}>
              ← Quay lại
            </Text>
          )}
          <Title level={3} className="tickets-title">
            Cine<span className="tickets-titleAccent">Max</span> — Thanh toán
          </Title>
        </header>

        <Steps
          current={orderStep}
          className="tickets-steps"
          items={[
            { title: <Text className="tickets-stepText">Chọn ghế</Text> },
            { title: <Text className="tickets-stepText">Thanh toán</Text> },
            { title: <Text className="tickets-stepText">Hoàn tất</Text> },
          ]}
        />

        <div className="tickets-layout">
          <section className="tickets-paymentCard">
            {status === 'success' ? (
              <PaymentState
                tone="success"
                icon="✓"
                title="Thanh toán thành công!"
                description="Vé của bạn đã được xác nhận. Kiểm tra email để nhận vé."
                action={
                  <Button type="primary" block className="tickets-primaryButton" onClick={() => router.push('/home')}>
                    Về trang chủ
                  </Button>
                }
              />
            ) : isExpired ? (
              <PaymentState
                tone="danger"
                icon="✕"
                title="Hết thời gian!"
                description="Phiên thanh toán đã hết hạn. Vui lòng chọn ghế lại."
                action={
                  <Button block className="tickets-secondaryButton" onClick={() => router.back()}>
                    Chọn lại ghế
                  </Button>
                }
              />
            ) : (
              <>
                <Text className="tickets-helperText">Quét mã QR để thanh toán</Text>

                <div className="tickets-qrFrame">
                  <img src={QR_PLACEHOLDER} width={200} height={200} alt="QR code" className="tickets-qrImage" />
                  {status === 'checking' && (
                    <div className="tickets-qrOverlay">
                      <Spin size="large" />
                    </div>
                  )}
                </div>

                <div className={countdown < 60 ? 'tickets-countdown tickets-countdown--warning' : 'tickets-countdown'}>
                  <Text className={countdown < 60 ? 'tickets-countdownLabel tickets-countdownLabel--warning' : 'tickets-countdownLabel'}>
                    Hết hạn sau
                  </Text>
                  <Text className={countdown < 60 ? 'tickets-countdownValue tickets-countdownValue--warning' : 'tickets-countdownValue'}>
                    {formatCountdown(countdown)}
                  </Text>
                </div>

                <Text className="tickets-subtleText">Mở app ngân hàng → Quét QR → Thanh toán</Text>

                <Button
                  type="primary"
                  block
                  loading={status === 'checking'}
                  className="tickets-primaryButton"
                  onClick={handleCheckPayment}
                >
                  Tôi đã thanh toán xong
                </Button>
              </>
            )}
          </section>

          <section className="tickets-summaryCard">
            <Text className="tickets-sectionLabel">Chi tiết đơn hàng</Text>

            <div className="tickets-summaryRows">
              <Row label="Phim" value={order.movie_name} highlight />
              <Row label="Ngày" value={order.showtime_date} />
              <Row label="Suất chiếu" value={order.showtime_time} />
              <Row label="Phòng" value={order.room_name} />
            </div>

            <Divider className="tickets-divider" />

            <Text className="tickets-sectionSubLabel">Ghế đã chọn</Text>

            <div className="tickets-seatList">
              {order.seats.map((seat) => (
                <div key={seat.seat_id} className="tickets-seatRow">
                  <div className="tickets-seatMeta">
                    <Tag color="blue" className="tickets-seatTag">
                      {seat.seat_code}
                    </Tag>
                    <Text className="tickets-seatType">{SEAT_TYPE_LABEL[seat.seat_type] || 'Seat'}</Text>
                  </div>
                  <Text className="tickets-seatPrice">{formatCurrency(seat.price)}</Text>
                </div>
              ))}
            </div>

            <Divider className="tickets-divider" />

            <div className="tickets-totalRow">
              <Text className="tickets-totalLabel">Tổng cộng</Text>
              <Text className="tickets-totalValue">{formatCurrency(total)}</Text>
            </div>

            <Divider className="tickets-divider" />

            <Row label="Mã giao dịch" value={order.transaction_id} mono />
          </section>
        </div>
      </div>

      <Modal open={showConfirm} footer={null} closable={false} centered destroyOnHidden>
        <div className="tickets-modalBody">
          <Text className="tickets-modalText">Bạn có chắc muốn hủy thanh toán không?</Text>
          <div className="tickets-modalActions">
            <Button danger onClick={handleCancelPayment}>
              Hủy thanh toán
            </Button>
            <Button onClick={handleContinue}>Tiếp tục thanh toán</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function PaymentState({ tone, icon, title, description, action }) {
  const isSuccess = tone === 'success'

  return (
    <div className="tickets-stateWrap">
      <div className={isSuccess ? 'tickets-stateIcon tickets-stateIcon--success' : 'tickets-stateIcon tickets-stateIcon--danger'}>{icon}</div>
      <Text className={isSuccess ? 'tickets-stateTitle tickets-stateTitle--success' : 'tickets-stateTitle tickets-stateTitle--danger'}>{title}</Text>
      <Text className="tickets-stateDescription">{description}</Text>
      {action}
    </div>
  )
}

function Row({ label, value, highlight = false, mono = false }) {
  return (
    <div className="tickets-row">
      <Text className="tickets-rowLabel">{label}</Text>
      <Text className={highlight ? (mono ? 'tickets-rowValue tickets-rowValue--highlight tickets-rowValue--mono' : 'tickets-rowValue tickets-rowValue--highlight') : (mono ? 'tickets-rowValue tickets-rowValue--mono' : 'tickets-rowValue')}>
        {value}
      </Text>
    </div>
  )
}
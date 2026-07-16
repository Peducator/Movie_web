'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Modal, Form, Input, Button, Popconfirm, message } from 'antd'
import fetchWithAuth from '@/lib/fetchWithAuth'

const NAV_ITEMS = [
  { icon: '⊞', label: 'Quản lý phim', key: 'movies' },
  { icon: '🕐', label: 'Lịch chiếu', key: 'showtimes' },
  { icon: '👥', label: 'Người dùng', key: 'users' },
]

const EMPTY_FORM = {
  movie_name: '',
  movie_duration: '',
  movie_genre: '',
  movie_poster_url: '',
  movie_description: '',
}

export default function AdminMoviesPage() {
  const router = useRouter()
  const [activeNav, setActiveNav] = useState('movies')
  const [movies, setMovies] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add') // 'add' | 'edit'
  const [editingMovie, setEditingMovie] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    let active = true

    ;(async () => {
      try {
        const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/home/movies`)
        const data = await response.json()

        if (active) {
          setMovies(data)
        }
      } catch (error) {
        console.error(error)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    })()

    return () => {
      active = false
    }
  }, [])

  const fetchMovies = async () => {
    setLoading(true)

    try {
      const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/home/movies`)
      const data = await response.json()
      setMovies(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = movies.filter(m =>
    m.movie_name.toLowerCase().includes(search.toLowerCase())
  )

  // --- Handlers ---

  const openAdd = () => {
    setModalMode('add')
    setEditingMovie(null)
    form.setFieldsValue(EMPTY_FORM)
    setModalOpen(true)
  }

  const openEdit = (movie, e) => {
    e.stopPropagation()
    setModalMode('edit')
    setEditingMovie(movie)
    form.setFieldsValue({
      movie_name:        movie.movie_name,
      movie_duration:    movie.movie_duration,
      movie_genre:       movie.movie_genre,
      movie_poster_url:  movie.movie_poster_url || '',
      movie_description: movie.movie_description || '',
    })
    setModalOpen(true)
  }

  const handleSubmit = async (values) => {
    setSubmitting(true)
    try {
      const isEdit = modalMode === 'edit'
      const url = isEdit
        ? `${process.env.NEXT_PUBLIC_API_URL}/movies/${editingMovie.movie_id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/movies`

      const res = await fetchWithAuth(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ ...values, movie_duration: Number(values.movie_duration) }),
      })

      if (!res.ok) throw new Error()

      message.success(isEdit ? 'Cập nhật thành công' : 'Thêm phim thành công')
      setModalOpen(false)
      fetchMovies()
    } catch {
      message.error('Có lỗi xảy ra')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (movie_id, e) => {
    e.stopPropagation()
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/movies/${movie_id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      })
      if (!res.ok) throw new Error()
      message.success('Đã xoá phim')
      setMovies(prev => prev.filter(m => m.movie_id !== movie_id))
    } catch {
      message.error('Xoá thất bại')
    }
  }

  // --- Styles ---
  const inputStyle = {
    borderRadius: 8,
    background: 'rgba(255,255,255,0.07)',
    borderColor: 'rgba(255,255,255,0.15)',
    color: '#fff',
  }

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
          <div style={{
            marginTop: 6, fontSize: 11, fontWeight: 600,
            color: '#f59e0b', letterSpacing: 2, textTransform: 'uppercase',
          }}>
            Admin Panel
          </div>
        </div>

        {NAV_ITEMS.map(item => (
          <div
            key={item.key}
            onClick={() => setActiveNav(item.key)}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexShrink: 0 }}>
          <span style={{ color: '#fff', fontSize: 20, fontWeight: 500 }}>Quản lý phim</span>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
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
            <button
              onClick={openAdd}
              style={{
                background: '#4096ff', border: 'none', borderRadius: 8,
                padding: '7px 16px', color: '#fff', fontSize: 13,
                cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap',
              }}
            >
              + Thêm phim
            </button>
          </div>
        </div>

        {/* Grid */}
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
                    transition: 'transform 0.2s',
                    position: 'relative',
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

                  {/* Action buttons — hover overlay */}
                  <div
                    className="card-actions"
                    onClick={e => e.stopPropagation()}
                    style={{
                      position: 'absolute', top: 8, right: 8,
                      display: 'flex', flexDirection: 'column', gap: 6,
                    }}
                  >
                    <button
                      onClick={(e) => openEdit(movie, e)}
                      style={{
                        background: 'rgba(64,150,255,0.85)', border: 'none',
                        borderRadius: 6, padding: '4px 10px',
                        color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 600,
                      }}
                    >
                      ✏ Sửa
                    </button>
                    <Popconfirm
                      title="Xoá phim này?"
                      description="Hành động không thể hoàn tác."
                      okText="Xoá"
                      cancelText="Không"
                      okButtonProps={{ danger: true }}
                      onConfirm={(e) => handleDelete(movie.movie_id, e)}
                      onCancel={e => e.stopPropagation()}
                    >
                      <button
                        onClick={e => e.stopPropagation()}
                        style={{
                          background: 'rgba(239,68,68,0.85)', border: 'none',
                          borderRadius: 6, padding: '4px 10px',
                          color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 600,
                        }}
                      >
                        🗑 Xoá
                      </button>
                    </Popconfirm>
                  </div>

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
                        fontSize: 11, background: 'rgba(64,150,255,0.2)',
                        color: '#4096ff', padding: '2px 6px', borderRadius: 20,
                      }}>
                        {movie.movie_genre}
                      </span>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
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

      {/* Modal thêm / sửa */}
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        title={
          <span style={{ color: '#fff' }}>
            {modalMode === 'add' ? '+ Thêm phim mới' : '✏ Cập nhật phim'}
          </span>
        }
        styles={{
          content: { background: '#1f1f1f', border: '1px solid rgba(255,255,255,0.1)' },
          header: { background: '#1f1f1f', borderBottom: '1px solid rgba(255,255,255,0.08)' },
          mask:   { backdropFilter: 'blur(4px)' },
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="movie_name"
            label={<span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>Tên phim</span>}
            rules={[{ required: true, message: 'Nhập tên phim' }]}
          >
            <Input size="large" style={inputStyle} />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item
              name="movie_duration"
              label={<span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>Thời lượng (phút)</span>}
              rules={[{ required: true, message: 'Nhập thời lượng' }]}
            >
              <Input size="large" type="number" style={inputStyle} />
            </Form.Item>

            <Form.Item
              name="movie_genre"
              label={<span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>Thể loại</span>}
              rules={[{ required: true, message: 'Nhập thể loại' }]}
            >
              <Input size="large" style={inputStyle} />
            </Form.Item>
          </div>

          <Form.Item
            name="movie_poster_url"
            label={<span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>URL poster</span>}
          >
            <Input size="large" style={inputStyle} placeholder="https://..." />
          </Form.Item>

          <Form.Item
            name="movie_description"
            label={<span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>Mô tả</span>}
          >
            <Input.TextArea
              rows={3}
              style={{ ...inputStyle, resize: 'none' }}
            />
          </Form.Item>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button
              style={{ borderRadius: 8, background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }}
              onClick={() => setModalOpen(false)}
            >
              Huỷ
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              style={{ borderRadius: 8 }}
            >
              {modalMode === 'add' ? 'Thêm phim' : 'Lưu thay đổi'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
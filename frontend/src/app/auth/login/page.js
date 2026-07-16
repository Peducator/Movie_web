'use client'
import { Form, Input, Button, Typography, Divider } from 'antd'
import { useRouter } from 'next/navigation'

const { Title, Text } = Typography

export default function LoginPage() {
  const router = useRouter()

    const onFinish = async (values) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: values.email,
                password: values.password,
            }),
            })

            const data = await res.json()
            if (!res.ok) {
            console.error(data.message)
            return
            }
            router.push('/home')
        } catch (error) {
            console.error('Lỗi:', error)
        }
    }
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: 400,
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: '40px 36px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={3} style={{ color: '#fff', margin: 0 }}>
            Cine<span style={{ color: '#4096ff' }}>Max</span>
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
            Đăng nhập để tiếp tục
          </Text>
        </div>

        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Nhập email của bạn' }]}
          >
            <Input
              className="dark-input"
              placeholder="Email"
              size="large"
              style={{ borderRadius: 8, background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Nhập mật khẩu' }]}
          >
            <Input.Password
              className="dark-input"
              placeholder="Mật khẩu"
              size="large"
              style={{ borderRadius: 8, background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 12 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              style={{ borderRadius: 8 }}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
          hoặc
        </Divider>

        <Button
          size="large"
          block
          style={{
            borderRadius: 8,
            background: 'rgba(255,255,255,0.07)',
            borderColor: 'rgba(255,255,255,0.15)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
          onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
        >
          <img src="https://www.google.com/favicon.ico" width={16} height={16} />
          Đăng nhập với Google
        </Button>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
            Chưa có tài khoản?{' '}
            <span
              style={{ color: '#4096ff', cursor: 'pointer' }}
              onClick={() => router.push('/auth/register')}
            >
              Đăng ký ngay
            </span>
          </Text>
        </div>
      </div>
    </div>
  )
}
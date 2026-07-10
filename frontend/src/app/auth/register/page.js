'use client'
import { Form, Input, Button, Typography, Divider, Select, ConfigProvider, theme } from 'antd'
import { useRouter } from 'next/navigation'

const { Title, Text } = Typography

export default function RegisterPage() {
  const router = useRouter()

  const onFinish = async (values) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          username: values.username,
          password: values.password,
          phonenumber: values.phonenumber,
          age: parseInt(values.age),
          gender: values.gender,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        console.error(data.message)
        return
      }
      console.log('Register success:', data)
      router.push('/auth/login')
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
            Tạo tài khoản mới
          </Text>
        </div>

        <ConfigProvider
          theme={{
            algorithm: theme.darkAlgorithm,
            token: {
              colorBgContainer: 'rgba(255,255,255,0.07)',
              colorBorder: 'rgba(255,255,255,0.15)',
              colorText: '#fff',
              colorTextPlaceholder: 'rgba(255,255,255,0.3)',
            },
          }}
        >
          <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Nhập họ tên của bạn' }]}
            >
              <Input
                placeholder="Họ tên"
                size="large"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Nhập email của bạn' },
                { type: 'email', message: 'Email không hợp lệ' },
              ]}
            >
              <Input
                placeholder="Email"
                size="large"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item
              name="age"
              rules={[
                { required: true, message: 'Nhập tuổi của bạn' },
                { type: 'number', min: 1, message: 'Tuổi phải lớn hơn 0', transform: (v) => Number(v) },
              ]}
            >
              <Input
                placeholder="Tuổi"
                type="number"
                min={1}
                size="large"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item
              name="gender"
              rules={[{ required: true, message: 'Chọn giới tính' }]}
            >
              <Select
                placeholder="Giới tính"
                size="large"
                style={{ width: '100%' }}
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                ]}
              />
            </Form.Item>
            <Form.Item
              name="phonenumber"
              rules={[
                { required: true, message: 'Nhập số điện thoại' },
                { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' },
              ]}
            >
              <Input size="large" placeholder="Số điện thoại" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Nhập mật khẩu' },
                { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' },
              ]}
            >
              <Input.Password
                placeholder="Mật khẩu"
                size="large"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Xác nhận mật khẩu' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) return Promise.resolve()
                    return Promise.reject(new Error('Mật khẩu không khớp'))
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder="Xác nhận mật khẩu"
                size="large"
                style={{ borderRadius: 8 }}
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
                Đăng ký
              </Button>
            </Form.Item>
          </Form>
        </ConfigProvider>

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
          Đăng ký với Google
        </Button>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
            Đã có tài khoản?{' '}
            <span
              style={{ color: '#4096ff', cursor: 'pointer' }}
              onClick={() => router.push('/auth/login')}
            >
              Đăng nhập
            </span>
          </Text>
        </div>
      </div>
    </div>
  )
}
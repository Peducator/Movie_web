import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('accessToken')?.value; // thay 'token' bằng tên cookie của bạn

  if (!token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/home', '/showtimes'], // các trang cần bảo vệ
};
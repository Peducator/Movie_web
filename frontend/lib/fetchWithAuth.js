// src/lib/fetchWithAuth.js
const fetchWithAuth = async (url, options = {}) => {
  let response = await fetch(url, { ...options, credentials: 'include' })

  if (response.status === 401) {
    const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })

    if (!refreshRes.ok) {
      window.location.href = '/login'
      return
    }

    response = await fetch(url, { ...options, credentials: 'include' })
  }

  return response
}

export default fetchWithAuth
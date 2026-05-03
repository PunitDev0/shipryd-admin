import { BASE_URL } from './baseUrl'

/**
 * Proxy utility for making authenticated API requests.
 * Automatically adds the Authorization header with the admin token.
 */
export const apiProxy = async (endpoint, options = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const config = {
        ...options,
        headers,
    }

    // Ensure absolute URL if not provided
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`

    try {
        const response = await fetch(url, config)
        const data = await response.json()

        // Handle unauthorized globally
        if (response.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('adminToken')
            localStorage.removeItem('adminUser')
            window.location.href = '/login'
        }

        return { data, status: response.status, ok: response.ok }
    } catch (error) {
        console.error('API Proxy Error:', error)
        throw error
    }
}

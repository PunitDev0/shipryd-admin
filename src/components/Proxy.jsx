'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'


export default function Proxy({ children }) {
    const router = useRouter()
    const pathname = usePathname()
    const [isAuthorized, setIsAuthorized] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem('adminToken')
        const loginPath = '/login'

        if (!token && pathname !== loginPath) {
            // Not logged in and not on login page -> Redirect to login
            router.push(loginPath)
        } else if (token && pathname === loginPath) {
            // Logged in but on login page -> Redirect to dashboard
            router.push('/')
        } else {
            // Authorized either because token exists or it's the login page
            setIsAuthorized(true)
        }
    }, [pathname, router])

    // While checking auth, show nothing or a loader
    if (!isAuthorized && pathname !== '/login') {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
            </div>
        )
    }

    return <>{children}</>
}

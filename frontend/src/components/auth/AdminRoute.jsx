"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Loader from '../ui/Loader'
import NotFound from '@/app/not-found'
// import { Alert, AlertDescription } from '@/components/ui/alert'
// import { ShieldX } from 'lucide-react'

export default function AdminRoute({ children }) {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader />
            </div>
        )
    }

    if (!user) {
        return null
    }

    if (!user.is_superuser) {
        return <NotFound />
    }

    return children
}
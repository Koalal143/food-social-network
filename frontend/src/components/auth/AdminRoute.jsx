"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Loader from '../ui/Loader'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ShieldX } from 'lucide-react'

export default function AdminRoute({ children }) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        } else if (!loading && user && !user.is_superuser) {
            router.push('/')
        }
    }, [user, loading, router])

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
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <Alert className="max-w-md">
                    <ShieldX className="h-4 w-4" />
                    <AlertDescription>
                        У вас нет прав доступа к административной панели.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return children
}

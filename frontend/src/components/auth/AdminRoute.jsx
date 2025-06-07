import { useAuth } from '@/context/AuthContext'
import NotFound from '@/app/not-found'

export default function AdminRoute({ children }) {
    const { user, loading } = useAuth()

    if (loading) {
        return <NotFound />
    }

    if (!user) {
        return <NotFound />
    }

    if (!user.is_superuser) {
        return <NotFound />
    }

    return children
}
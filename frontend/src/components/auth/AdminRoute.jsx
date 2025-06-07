import { useAuth } from '@/context/AuthContext'
import Loader from '../ui/Loader'
import NotFound from '@/app/not-found'

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
        return <NotFound />
    }

    if (!user.is_superuser) {
        return <NotFound />
    }

    return children
}
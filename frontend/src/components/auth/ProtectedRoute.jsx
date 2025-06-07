"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { RecipeCardSkeletonGrid, RecommendationsSkeleton, ProfileSkeleton } from '../ui/skeletons'
import Container from '../layout/Container'

export default function ProtectedRoute({ children, skeleton = 'default' }) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

    if (loading) {
        // Показываем соответствующий скелетон в зависимости от страницы
        if (skeleton === 'recommendations') {
            return (
                <Container className="py-8">
                    <RecommendationsSkeleton />
                </Container>
            )
        }

        if (skeleton === 'profile') {
            return (
                <Container className="py-8">
                    <ProfileSkeleton />
                </Container>
            )
        }

        // Дефолтный скелетон для других страниц
        return (
            <Container className="py-6">
                <div className="space-y-6">
                    <RecipeCardSkeletonGrid count={6} />
                </div>
            </Container>
        )
    }

    if (!user) {
        return null
    }

    return children
}
"use client"

import { useAuth } from '@/context/AuthContext'
import { RecipeCardSkeletonGrid, RecommendationsSkeleton, ProfileSkeleton, RecipeFormSkeleton, HeaderSkeleton } from '../ui/skeletons'
import Container from '../layout/Container'
import AuthRequiredCard from './AuthRequiredCard'
import { User, ShoppingBag, Star } from 'lucide-react'

export default function ProtectedRoute({
    children,
    skeleton = 'default',
    authIcon,
    authDescription
}) {
    const { user, loading } = useAuth()

    if (loading) {
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

        if (skeleton === 'form') {
            return (
                <div className="py-8">
                    <Container>
                        <div className="max-w-3xl lg:max-w-7xl mx-auto space-y-8">
                            <HeaderSkeleton level={1} width="w-1/3" />
                            <RecipeFormSkeleton />
                        </div>
                    </Container>
                </div>
            )
        }

        return (
            <Container className="py-6">
                <div className="space-y-6">
                    <RecipeCardSkeletonGrid count={6} />
                </div>
            </Container>
        )
    }

    if (!user) {
        const getAuthConfig = () => {
            if (authIcon && authDescription) {
                return {
                    icon: authIcon,
                    description: authDescription
                }
            }

            switch (skeleton) {
                case 'recommendations':
                    return {
                        icon: Star,
                        description: 'Для получения персональных рекомендаций необходимо войти в систему'
                    }
                case 'profile':
                    return {
                        icon: User,
                        description: 'Для просмотра профиля необходимо войти в систему'
                    }
                default:
                    return {
                        icon: ShoppingBag,
                        description: 'Для доступа к этой странице необходимо войти в систему'
                    }
            }
        }

        const { icon, description } = getAuthConfig()

        return (
            <Container>
                <AuthRequiredCard
                    icon={icon}
                    description={description}
                />
            </Container>
        )
    }

    return children
}
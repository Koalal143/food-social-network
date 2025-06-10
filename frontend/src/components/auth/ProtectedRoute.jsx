"use client"

import { useAuth } from '@/context/AuthContext'
import { RecipeCardSkeletonGrid, RecommendationsSkeleton, ProfileSkeleton } from '../ui/skeletons'
import Container from '../layout/Container'
import AuthRequiredCard from './AuthRequiredCard'
import { Bot, User, ShoppingBag } from 'lucide-react'

export default function ProtectedRoute({
    children,
    skeleton = 'default',
    authIcon,
    authTitle,
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
                        icon: Bot,
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
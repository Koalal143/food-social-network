"use client";
import React, { useEffect, useState } from "react";
import Container from "@/components/layout/Container";
import RecipeCard from "../../../components/shared/RecipeCard";
import { useRecipes } from "@/context/RecipeContext";
import Loader from "@/components/ui/Loader";
import { useUser } from "@/context/UserContext";
import Image from "next/image";
import CopyLinkButton from "@/components/ui/CopyLinkButton"
import NotFound from "@/app/not-found";

export default function ProfilePage({ params }) {
    const { userId } = React.use(params);
    const { loading, getRecipesByAuthorId } = useRecipes();
    const { getUserById } = useUser();

    const [user, setUser] = useState(null);
    const [userRecipes, setUserRecipes] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const authorData = await getUserById(Number(userId));
            setUser(authorData);
            
            const recipesData = await getRecipesByAuthorId(Number(userId));
            setUserRecipes(recipesData);
        };
        fetchData();
    }, [userId]);

    if (loading) {
        return <Loader />
    }

    if (!user) {
        return <NotFound />
    }

    return (
        <Container className="py-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <Image
                        src={user.avatar}
                        alt={user.name}
                        width={120} 
                        height={120} 
                        className="w-24 h-24 rounded-full mr-4"
                    />
                    <div>
                        <h3 className="text-xl font-semibold">{user.name}</h3>
                        {user.experience && <p className="text-gray-600">Стаж в готовке: {user.experience}</p>}
                    </div>
                </div>
                <CopyLinkButton 
                    link={`${window.location.origin}/profile/${userId}`}
                    tooltipText="Скопировать ссылку на профиль"
                />
            </div>
            <h3 className="text-lg font-bold mb-4">Рецепты</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {userRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
            </div>
        </Container>
    )
}
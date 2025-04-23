"use client";
import React from "react";

import Container from "@/components/Container"
import ReceiptCard from "@/components/shared/ReceiptCard"

const user = {
  name: "Тетя Зина",
  experience: "69 лет",
  image: "/images/ava.jpg", // Замените на путь к изображению пользователя
}

const recipes = [
    {
      id: 1,
      title: "Спагетти Карбонара",
      image: "/images/carbonara.jpg",
    },
    {
      id: 2,
      title: "Тирамису",
      image: "/images/tiramisu.jpg",
    },
    {
      id: 3,
      title: "Спагетти Карбонара",
      image: "/images/carbonara.jpg",
    },
    {
      id: 4,
      title: "Тирамису",
      image: "/images/tiramisu.jpg",
    },
  ]

export default function Profile({ params }) {
    const { userId } = React.use(params);

    return (
        <Container className="py-6">
        <h2 className="text-2xl font-bold mb-6">{`Профиль ${userId}`}</h2>
        <div className="flex items-center mb-6">
            <img
            src={user.image}
            alt={user.name}
            className="w-24 h-24 rounded-full mr-4"
            />
            <div>
            <h3 className="text-xl font-semibold">{user.name}</h3>
            <p className="text-gray-600">Стаж в готовке: {user.experience}</p>
            </div>
        </div>
        <h3 className="text-lg font-bold mb-4">Рецепты</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
            <ReceiptCard key={recipe.id} recipe={recipe} />
            ))}
        </div>
        </Container>
    )
}
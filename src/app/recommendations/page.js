"use client"

import Container from "@/components/Container"
import ReceiptCard from "@/components/shared/ReceiptCard"
import { useState } from "react"
import Link from "next/link"

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
      title: "Жареные колбаски",
      image: "/images/sausage.jpg",
    },
    {
      id: 4,
      title: "Салат Цезарь",
      image: "/images/caesar_salad.jpg",
    },
  ]

export default function Recommendations() {
    const [currentIndex, setCurrentIndex] = useState(0)

    const handleDislike = () => {
        const nextIndex = currentIndex + 1
        if (nextIndex < recipes.length) {
            setCurrentIndex(nextIndex)
        } else {
            alert("Все рецепты просмотрены!")
        }
    }

    return (
        <Container className="py-6">
            <h2 className="text-2xl font-bold mb-6">Рекомендации</h2>
            {currentIndex < recipes.length ? (
                <div className="flex flex-col items-center">
                    <ReceiptCard recipe={recipes[currentIndex]} />
                    <div className="flex justify-between w-full mt-4">
                        <button
                            onClick={handleDislike}
                            className="bg-red-500 text-white px-4 py-2 rounded"
                        >
                            Не нравится
                        </button>
                        <Link href={`/recipe/${recipes[currentIndex].id}`}>
                          <button
                              className="bg-green-500 text-white px-4 py-2 rounded"
                          >
                              Нравится
                          </button>
                        </Link>
                    </div>
                </div>
            ) : (
                <p>Все рецепты просмотрены!</p>
            )}
        </Container>
    )
}
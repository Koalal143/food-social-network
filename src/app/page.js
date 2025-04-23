import Container from "@/components/Container"
import ReceiptCard from "@/components/shared/ReceiptCard"

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
  {
    id: 5,
    title: "Спагетти Карбонара",
    image: "/images/carbonara.jpg",
  },
  {
    id: 6,
    title: "Тирамису",
    image: "/images/tiramisu.jpg",
  },
  {
    id: 7,
    title: "Спагетти Карбонара",
    image: "/images/carbonara.jpg",
  },
  {
    id: 8,
    title: "Тирамису",
    image: "/images/tiramisu.jpg",
  },
]

export default function App() {
  return (
    <Container className={"py-6"}>
        <h2 className="text-2xl font-bold mb-6">Популярные рецепты</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <ReceiptCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
    </Container>
  )
}
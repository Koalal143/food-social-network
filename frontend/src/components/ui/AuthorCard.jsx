import Link from "next/link"
import Image from "next/image"

export default function AuthorCard({ author }) {
    return (
        <Link href={`/profile/${author.id}`}>
            <div className="flex rounded-lg bg-card m-4 p-4 cursor-pointer items-center mb-6">
                <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                    <Image
                        src={author.avatar}
                        alt={author.name}
                        fill
                        className="object-cover"
                    />
                </div>
                <div>
                    <p className="text-sm text-gray-600">Автор рецепта</p>
                    <p className="font-medium">{author.name}</p>
                </div>
            </div>
        </Link>
    )
}
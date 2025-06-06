import Link from "next/link"
import Image from "next/image"

export default function AuthorCard({ author }) {
  return (
    <Link href={`/profile/${author.username}`} className="block">
      <div className="flex rounded-lg bg-card p-4 cursor-pointer items-center mb-6 group shadow-sm hover:shadow-md transition-shadow">
        <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
          <Image
            src={author.profile?.avatar_url || '/images/user-dummy.svg'}
            alt={author.username}
            fill
            priority
            unoptimized={true}
            className="rounded-full object-cover bg-secondary"
          />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Автор рецепта</p>
          <p className="font-medium group-hover:text-primary transition-colors">
            {author.username}
          </p>
        </div>
      </div>
    </Link>
  )
}
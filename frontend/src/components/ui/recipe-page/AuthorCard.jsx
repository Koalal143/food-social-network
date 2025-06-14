import Link from "next/link"
import Image from "next/image"
import { ChefHat } from "lucide-react"
import { useUser } from "@/context/UserContext"
import UserRoleBadge from "@/components/ui/UserRoleBadge"

export default function AuthorCard({ author }) {
  const { getUserByUsername, users } = useUser()

  const handleMouseEnter = () => {
    // Предзагружаем данные пользователя только если их еще нет в кэше
    if (!users[author.username]) {
      getUserByUsername(author.username).catch(() => {})
    }
  }

  return (
    <Link href={`/profile/${author.username}`} className="block" prefetch={false}>
      <div
        className="group cursor-pointer transition-all duration-200 hover:shadow-md p-3 bg-background rounded-lg shadow-sm border"
        onMouseEnter={handleMouseEnter}
      >
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
              <Image
                src={author.profile?.avatar_url || '/images/user-dummy.svg'}
                alt={author.username}
                width={40}
                height={40}
                priority
                unoptimized={true}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <ChefHat className="w-3 h-3 text-primary" />
              <p className="text-xs font-medium text-muted-foreground">Автор рецепта</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {author.username}
              </p>
              <UserRoleBadge user={author} />
            </div>
            {author.profile?.about && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {author.profile.about}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
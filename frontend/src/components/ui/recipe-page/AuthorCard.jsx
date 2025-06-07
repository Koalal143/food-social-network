import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { ChefHat } from "lucide-react"

export default function AuthorCard({ author }) {
  return (
    <Link href={`/profile/${author.username}`} className="block">
      <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-0 shadow-sm bg-gradient-to-r from-card to-card/80">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 p-0.5">
                <div className="w-full h-full rounded-full overflow-hidden bg-card">
                  <Image
                    src={author.profile?.avatar_url || '/images/user-dummy.svg'}
                    alt={author.username}
                    width={52}
                    height={52}
                    priority
                    unoptimized={true}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <ChefHat className="w-4 h-4 text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Автор рецепта</p>
              </div>
              <p className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {author.username}
              </p>
              {author.profile?.about && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                  {author.profile.about}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
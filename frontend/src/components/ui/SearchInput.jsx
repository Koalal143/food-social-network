import { Search } from "lucide-react"
import { Input } from "./input"

export default function SearchInput() {
    return (
        <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Поиск рецептов..."
                className="pl-10 w-full bg-[#F5F2F2] text-black"
              />
            </div>
        </div>
    )
}
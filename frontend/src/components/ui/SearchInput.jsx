"use client"

import { Search, X } from "lucide-react"
import { Input } from "./input"
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function SearchInput() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [query, setQuery] = useState(searchParams.get('q') || '')

    useEffect(() => {
      setQuery(searchParams.get('q') || '')
    }, [searchParams])

    const handleSearch = () => {
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`)
        }
    }

    const handleClick = () => {
      router.push('/search')
    }

    const clearSearch = () => {
        setQuery('')
        router.push('/search')
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    return (
        <div className="flex-1 max-w-md mx-4" onClick={handleClick}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Поиск рецептов..."
                className="pl-10 w-full bg-background text-foreground"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            {query && (
                <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Очистить поиск"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
      </div>
    )
}
"use client"

import { Search, X } from "lucide-react"
import { Input } from "../input"
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useSearch } from "@/context/SearchContext"

export default function SearchInput({ setShowMobileSearch }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [query, setQuery] = useState(searchParams.get('q') || '')
    const { performSearch, clearSearchResults } = useSearch()

    useEffect(() => {
      setQuery(searchParams.get('q') || '')
    }, [searchParams])

    // Обработчик события истории браузера (кнопка "Назад")
    useEffect(() => {
      const handlePopState = () => {
        if (setShowMobileSearch) {
          setShowMobileSearch(false)
        }
      }

      window.addEventListener('popstate', handlePopState)

      return () => {
        window.removeEventListener('popstate', handlePopState)
      }
    }, [setShowMobileSearch])

    const handleSearch = () => {
        if (query.trim()) {
            performSearch(query.trim())
            router.push(`/search?q=${encodeURIComponent(query.trim())}`)
        }
    }

    const handleClick = () => {
      // Если нет запроса, очищаем результаты при переходе на страницу поиска
      if (!query.trim()) {
        clearSearchResults()
      }
      router.push('/search')
    }

    const clearSearch = (e) => {
        e.stopPropagation() // Предотвращаем всплытие события
        setQuery('')
        clearSearchResults()
        if (setShowMobileSearch) {
            setShowMobileSearch(false)
        }
        router.push('/search')
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch()
        } else if (e.key === 'Escape' && setShowMobileSearch) {
            setShowMobileSearch(false)
        }
    }

    return (
        <div className="w-full" onClick={handleClick}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Поиск рецептов..."
                className="pl-10 w-full bg-white border-none text-foreground"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus={!!setShowMobileSearch} // Автофокус на мобильных устройствах
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
            {!query && setShowMobileSearch && (
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        setShowMobileSearch(false)
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Закрыть поиск"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
      </div>
    )
}
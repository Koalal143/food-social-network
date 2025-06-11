"use client"

import { Search, X } from "lucide-react"
import { Input } from "../input"
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearch } from "@/context/SearchContext"

function SearchInputContent({ setShowMobileSearch }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [query, setQuery] = useState(searchParams.get('q') || '')
    const { performSearch, clearSearchResults } = useSearch()
    const isUserTypingRef = useRef(false)
    const inputRef = useRef(null)

    // Синхронизируем с URL только если пользователь не печатает
    useEffect(() => {
      if (!isUserTypingRef.current) {
        const urlQuery = searchParams.get('q') || ''
        setQuery(urlQuery)
      }
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
            isUserTypingRef.current = false
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
        isUserTypingRef.current = false
        setQuery('')
        clearSearchResults()
        if (setShowMobileSearch) {
            setShowMobileSearch(false)
        }
        router.push('/search')
    }

    const handleInputChange = (e) => {
        isUserTypingRef.current = true
        setQuery(e.target.value)

        // Сбрасываем флаг через небольшую задержку после окончания ввода
        setTimeout(() => {
            isUserTypingRef.current = false
        }, 500)
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
                ref={inputRef}
                type="search"
                placeholder="Поиск рецептов..."
                className="pl-10 w-full bg-white border-none text-foreground"
                value={query}
                onChange={handleInputChange}
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

export default function SearchInput({ setShowMobileSearch }) {
    return (
        <Suspense fallback={
            <div className="w-full">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Поиск рецептов..."
                        className="pl-10 w-full bg-white border-none text-foreground"
                        disabled
                    />
                </div>
            </div>
        }>
            <SearchInputContent setShowMobileSearch={setShowMobileSearch} />
        </Suspense>
    )
}
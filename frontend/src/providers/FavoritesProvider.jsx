"use client"

import { useState, useEffect } from "react"
import { FavoritesContext } from "@/context/FavoritesContext"
import FavoritesService from "@/services/favorites.service"

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setFavorites(FavoritesService.getFavorites())
    setLoading(false)
  }, [])

  const addFavorite = (recipe) => {
    const updatedFavorites = FavoritesService.addToFavorites(recipe)
    setFavorites(updatedFavorites)
  }

  const removeFavorite = (recipeId) => {
    const updatedFavorites = FavoritesService.removeFromFavorites(recipeId)
    setFavorites(updatedFavorites)
  }

  const isFavorite = (recipeId) => {
    return FavoritesService.isFavorite(recipeId)
  }

  return (
    <FavoritesContext.Provider 
      value={{ 
        favorites,
        loading,
        addFavorite,
        removeFavorite,
        isFavorite
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}
'use client'

import RecipeProvider from "./RecipeProvider"
import UserProvider from "./UserProvider"
import FavoritesProvider from "./FavoritesProvider"
import SearchHistoryProvider from "./SearchHistoryProvider"
import AuthProvider from "./AuthProvider"
import { SearchProvider } from "./SearchProvider"

export default function MainProvider({ children }) {
    return (
        <AuthProvider>
            <RecipeProvider>
                <UserProvider>
                    <FavoritesProvider>
                        <SearchHistoryProvider>
                            <SearchProvider>
                                {children}
                            </SearchProvider>
                        </SearchHistoryProvider>
                    </FavoritesProvider>
                </UserProvider>
            </RecipeProvider>
        </AuthProvider>
    )
}
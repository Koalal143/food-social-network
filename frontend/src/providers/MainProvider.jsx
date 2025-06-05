'use client'

import RecipeProvider from "./RecipeProvider"
import UserProvider from "./UserProvider"
import FavoritesProvider from "./FavoritesProvider"
import SearchHistoryProvider from "./SearchHistoryProvider"
import AuthProvider from "./AuthProvider"
import { SearchProvider } from "./SearchProvider"
import RecomendationsProvider from "./RecomendationsProvider"
import DislikesProvider from "./DislikesProvider"

export default function MainProvider({ children }) {
    return (
        <AuthProvider>
            <RecipeProvider>
                    <UserProvider>
                        <FavoritesProvider>
                            <DislikesProvider>
                                <SearchHistoryProvider>                        
                                    <SearchProvider>
                                        <RecomendationsProvider>
                                            {children}
                                        </RecomendationsProvider>
                                    </SearchProvider>
                                </SearchHistoryProvider>
                            </DislikesProvider>
                        </FavoritesProvider>
                    </UserProvider>
            </RecipeProvider>
        </AuthProvider>
    )
}
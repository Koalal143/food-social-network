'use client'

import RecipeProvider from "./RecipeProvider"
import UserProvider from "./UserProvider"
import FavoritesProvider from "./FavoritesProvider"
import SearchHistoryProvider from "./SearchHistoryProvider"
import AuthProvider from "./AuthProvider"
import { SearchProvider } from "./SearchProvider"
import RecomendationsProvider from "./RecomendationsProvider"
import DislikesProvider from "./DislikesProvider"
import SidebarProvider from "./SidebarProvider"

export default function MainProvider({ children }) {
    return (
        <AuthProvider>
            <SidebarProvider>
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
            </SidebarProvider>
        </AuthProvider>
    )
}
'use client'

import RecipeProvider from "./RecipeProvider"
import UserProvider from "./UserProvider"
import FavoritesProvider from "./FavoritesProvider"
import SearchHistoryProvider from "./SearchHistoryProvider"
import AuthProvider from "./AuthProvider"
import { SearchProvider } from "./SearchProvider"
// import CookieConsentProvider from "./CookieConsentProvider"

export default function MainProvider({ children }) {
    return (
        // <CookieConsentProvider>
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
        // </CookieConsentProvider>
    )
}
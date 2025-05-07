import { RecipeProvider } from "./RecipeProvider"
import { UserProvider } from "./UserProvider"
import { FavoritesProvider } from "./FavoritesProvider"
import { SearchHistoryProvider } from "./SearchHistoryProvider"
import { AuthProvider } from "@/context/AuthContext"

export default function MainProvider({ children }) {
    return (
        <AuthProvider>
            <RecipeProvider>
                <UserProvider>
                    <FavoritesProvider>
                        <SearchHistoryProvider>
                            {children}
                        </SearchHistoryProvider>
                    </FavoritesProvider>
                </UserProvider>
            </RecipeProvider>
        </AuthProvider>
    )
}
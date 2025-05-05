import { RecipeProvider } from "./RecipeProvider"
import { UserProvider } from "./UserProvider"
import { FavoritesProvider } from "./FavoritesProvider"
import { SearchHistoryProvider } from "./SearchHistoryProvider"

export default function MainProvider({ children }) {
    return (
        <RecipeProvider>
            <UserProvider>
                <FavoritesProvider>
                    <SearchHistoryProvider>
                        {children}
                    </SearchHistoryProvider>
                </FavoritesProvider>
            </UserProvider>
        </RecipeProvider>
    )
}
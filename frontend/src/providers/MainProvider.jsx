import { RecipeProvider } from "./RecipeProvider"
import { UserProvider } from "./UserProvider"
import { FavoritesProvider } from "./FavoritesProvider"

export default function MainProvider({ children }) {
    return (
        <RecipeProvider>
            <UserProvider>
                <FavoritesProvider>
                    {children}
                </FavoritesProvider>
            </UserProvider>
        </RecipeProvider>
    )
}
export default class FavoritesService {
  static getFavorites() {
    const favorites = localStorage.getItem('favoriteRecipes');
    return favorites ? JSON.parse(favorites) : [];
  }

  static addToFavorites(recipe) {
    const favorites = this.getFavorites();
    if (!favorites.some(fav => fav.id === recipe.id)) {
      const newFavorites = [...favorites, { ...recipe, dateAdded: new Date().toISOString() }];
      localStorage.setItem('favoriteRecipes', JSON.stringify(newFavorites));
      return newFavorites;
    }
    return favorites;
  }

  static removeFromFavorites(recipeId) {
    const favorites = this.getFavorites();
    const newFavorites = favorites.filter(fav => fav.id !== recipeId);
    localStorage.setItem('favoriteRecipes', JSON.stringify(newFavorites));
    return newFavorites;
  }

  static isFavorite(recipeId) {
    const favorites = this.getFavorites();
    return favorites.some(fav => fav.id === recipeId);
  }
}
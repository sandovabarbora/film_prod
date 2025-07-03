export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  favoriteGenres: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
}

export interface Film {
  id: string;
  title: string;
  originalTitle?: string;
  year: number;
  duration?: number;
  director: string;
  synopsis?: string;
  poster?: string;
  backdrop?: string;
  genres: Genre[];
  imdbId?: string;
  tmdbId?: number;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserFilm {
  id: string;
  user: User;
  film: Film;
  status: 'want_to_watch' | 'watching' | 'watched';
  rating?: number;
  isFavorite: boolean;
  watchedDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

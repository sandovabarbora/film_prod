import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageContainer, Section } from '../components/layout/Container';
import { FilmGallery } from '../components/features/FilmGallery';
import { FilmDetailModal } from '../components/features/FilmDetail';
import { api, apiEndpoints } from '../services/api';
import { Film } from '../types';

export const Films: React.FC = () => {
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: films = [], isLoading } = useQuery({
    queryKey: ['films'],
    queryFn: async () => {
      // Pro teď použijeme mock data
      // const response = await api.get(apiEndpoints.films.list);
      // return response.data.results;
      
      // Mock data
      return [
        {
          id: '1',
          title: 'The Shawshank Redemption',
          originalTitle: 'The Shawshank Redemption',
          year: 1994,
          duration: 142,
          director: 'Frank Darabont',
          synopsis: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
          poster: 'https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg',
          backdrop: 'https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg',
          genres: [
            { id: '1', name: 'Drama', slug: 'drama' }
          ],
          rating: 9.3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'The Godfather',
          originalTitle: 'The Godfather',
          year: 1972,
          duration: 175,
          director: 'Francis Ford Coppola',
          synopsis: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
          poster: 'https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg',
          genres: [
            { id: '1', name: 'Drama', slug: 'drama' },
            { id: '2', name: 'Crime', slug: 'crime' }
          ],
          rating: 9.2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        // Přidejte více filmů...
      ] as Film[];
    },
  });

  const handleFilmClick = (film: Film) => {
    setSelectedFilm(film);
    setIsModalOpen(true);
  };

  return (
    <PageContainer>
      <Section>
        <h1>Film Collection</h1>
        <p>Discover and manage your favorite films</p>
      </Section>

      <Section>
        <FilmGallery
          films={films}
          loading={isLoading}
          onFilmClick={handleFilmClick}
        />
      </Section>

      <FilmDetailModal
        film={selectedFilm}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </PageContainer>
  );
};

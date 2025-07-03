import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Film } from '../../../types';

interface FilmCardProps {
  film: Film;
  onClick?: () => void;
}

const Card = styled(motion.div)`
  position: relative;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.gray[900]};
  transition: all ${({ theme }) => theme.transitions.normal};
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
    
    .overlay {
      opacity: 1;
    }
    
    .poster {
      transform: scale(1.05);
    }
  }
`;

const PosterContainer = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 150%; // 2:3 aspect ratio
  overflow: hidden;
  background: ${({ theme }) => theme.colors.gray[700]};
`;

const Poster = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform ${({ theme }) => theme.transitions.slow};
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, 
    transparent 0%,
    transparent 50%,
    rgba(0, 0, 0, 0.9) 100%
  );
  opacity: 0;
  transition: opacity ${({ theme }) => theme.transitions.normal};
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: ${({ theme }) => theme.spacing.md};
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.sizes.h6};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.primary.light};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 600;
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.gray[300]};
`;

const Rating = styled.span`
  color: ${({ theme }) => theme.colors.accent.main};
  font-weight: 600;
  
  &::before {
    content: '★ ';
  }
`;

const PlaceholderPoster = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.colors.gray[700]} 0%,
    ${({ theme }) => theme.colors.gray[900]} 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.gray[500]};
  font-size: ${({ theme }) => theme.sizes.h3};
`;

export const FilmCard: React.FC<FilmCardProps> = ({ film, onClick }) => {
  return (
    <Card
      onClick={onClick}
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <PosterContainer>
        {film.poster ? (
          <Poster 
            className="poster" 
            src={film.poster} 
            alt={film.title}
            loading="lazy"
          />
        ) : (
          <PlaceholderPoster>🎬</PlaceholderPoster>
        )}
        <Overlay className="overlay">
          <Title>{film.title}</Title>
          <Meta>
            <span>{film.year}</span>
            {film.rating && (
              <>
                <span>•</span>
                <Rating>{film.rating.toFixed(1)}</Rating>
              </>
            )}
          </Meta>
        </Overlay>
      </PosterContainer>
    </Card>
  );
};

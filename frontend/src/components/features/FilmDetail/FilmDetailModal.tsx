import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Film } from '../../../types';

interface FilmDetailModalProps {
  film: Film | null;
  isOpen: boolean;
  onClose: () => void;
}

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const Modal = styled(motion.div)`
  background: ${({ theme }) => theme.colors.gray[900]};
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: ${({ theme }) => theme.colors.primary.light};
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  z-index: 10;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: scale(1.1);
  }
`;

const Header = styled.div<{ backdrop?: string }>`
  position: relative;
  height: 400px;
  background: ${({ backdrop }) => 
    backdrop ? `url(${backdrop})` : 'linear-gradient(to bottom, #333, #111)'};
  background-size: cover;
  background-position: center;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 200px;
    background: linear-gradient(to bottom, transparent, ${({ theme }) => theme.colors.gray[900]});
  }
`;

const Content = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  margin-top: -100px;
  position: relative;
  z-index: 1;
`;

const TitleSection = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    flex-direction: column;
  }
`;

const PosterSmall = styled.img`
  width: 200px;
  height: 300px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
`;

const Info = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.sizes.h2};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-family: ${({ theme }) => theme.fonts.display};
`;

const Meta = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.gray[300]};
  font-size: ${({ theme }) => theme.sizes.body};
`;

const Rating = styled.span`
  color: ${({ theme }) => theme.colors.accent.main};
  font-weight: 600;
  font-size: ${({ theme }) => theme.sizes.h5};
  
  &::before {
    content: '★ ';
  }
`;

const Synopsis = styled.p`
  line-height: 1.8;
  color: ${({ theme }) => theme.colors.gray[300]};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const DetailRow = styled.div`
  display: flex;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  
  strong {
    width: 120px;
    color: ${({ theme }) => theme.colors.gray[500]};
  }
`;

const Genres = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const Genre = styled.span`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.accent.main}20;
  color: ${({ theme }) => theme.colors.accent.main};
  border-radius: 16px;
  font-size: ${({ theme }) => theme.sizes.small};
`;

export const FilmDetailModal: React.FC<FilmDetailModalProps> = ({ 
  film, 
  isOpen, 
  onClose 
}) => {
  if (!film) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <Modal
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <CloseButton onClick={onClose}>✕</CloseButton>
            
            <Header backdrop={film.backdrop || film.poster} />
            
            <Content>
              <TitleSection>
                {film.poster && (
                  <PosterSmall src={film.poster} alt={film.title} />
                )}
                
                <Info>
                  <Title>{film.title}</Title>
                  {film.originalTitle && film.originalTitle !== film.title && (
                    <p style={{ marginBottom: '1rem', color: '#999' }}>
                      {film.originalTitle}
                    </p>
                  )}
                  
                  <Meta>
                    <span>{film.year}</span>
                    {film.duration && (
                      <>
                        <span>•</span>
                        <span>{film.duration} min</span>
                      </>
                    )}
                    {film.rating && (
                      <>
                        <span>•</span>
                        <Rating>{film.rating.toFixed(1)}</Rating>
                      </>
                    )}
                  </Meta>
                  
                  {film.synopsis && (
                    <Synopsis>{film.synopsis}</Synopsis>
                  )}
                  
                  <DetailRow>
                    <strong>Director:</strong>
                    <span>{film.director}</span>
                  </DetailRow>
                  
                  {film.genres && film.genres.length > 0 && (
                    <Genres>
                      {film.genres.map(genre => (
                        <Genre key={genre.id}>{genre.name}</Genre>
                      ))}
                    </Genres>
                  )}
                </Info>
              </TitleSection>
            </Content>
          </Modal>
        </Overlay>
      )}
    </AnimatePresence>
  );
};

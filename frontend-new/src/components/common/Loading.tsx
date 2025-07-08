// src/components/common/Loading.tsx
import React from 'react';
import styled, { keyframes } from 'styled-components';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'spinner' | 'dots' | 'bars';
  message?: string;
  fullscreen?: boolean;
}

export function Loading({ 
  size = 'medium', 
  variant = 'spinner', 
  message,
  fullscreen = false 
}: LoadingProps) {
  const LoadingComponent = fullscreen ? FullscreenWrapper : InlineWrapper;

  return (
    <LoadingComponent>
      <LoadingContent>
        {variant === 'spinner' && <Spinner size={size} />}
        {variant === 'dots' && <DotsLoader />}
        {variant === 'bars' && <BarsLoader />}
        {message && <LoadingMessage>{message}</LoadingMessage>}
      </LoadingContent>
    </LoadingComponent>
  );
}

// Page-level loading overlay
export function PageLoading({ message = 'Načítání...' }: { message?: string }) {
  return (
    <Loading 
      variant="spinner" 
      size="large" 
      message={message} 
      fullscreen 
    />
  );
}

// Inline loading for buttons
export function ButtonLoading() {
  return <Spinner size="small" />;
}

// Table/list loading
export function TableLoading() {
  return (
    <TableLoadingContainer>
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonRow key={i}>
          <SkeletonCell width="30%" />
          <SkeletonCell width="50%" />
          <SkeletonCell width="20%" />
        </SkeletonRow>
      ))}
    </TableLoadingContainer>
  );
}

// Styled components
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
  40%, 43% { transform: translateY(-30px); }
  70% { transform: translateY(-15px); }
`;

const stretch = keyframes`
  0%, 40%, 100% { transform: scaleY(0.4); }
  20% { transform: scaleY(1.0); }
`;

const FullscreenWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const InlineWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const LoadingContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const Spinner = styled.div<{ size: string }>`
  border: 3px solid ${props => props.theme.colors.background};
  border-top: 3px solid ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;

  ${props => {
    switch (props.size) {
      case 'small': return 'width: 20px; height: 20px;';
      case 'large': return 'width: 60px; height: 60px;';
      default: return 'width: 40px; height: 40px;';
    }
  }}
`;

const DotsLoader = styled.div`
  display: flex;
  gap: 4px;

  &::before,
  &::after,
  & {
    content: '';
    width: 12px;
    height: 12px;
    background: ${props => props.theme.colors.primary};
    border-radius: 50%;
    animation: ${bounce} 1.4s ease-in-out infinite both;
  }

  &::before { animation-delay: -0.32s; }
  &::after { animation-delay: -0.16s; }
`;

const BarsLoader = styled.div`
  display: flex;
  gap: 4px;
  align-items: end;
  height: 40px;

  &::before,
  &::after,
  & {
    content: '';
    width: 6px;
    height: 40px;
    background: ${props => props.theme.colors.primary};
    animation: ${stretch} 1.2s infinite ease-in-out;
  }

  &::before { animation-delay: -1.1s; }
  &::after { animation-delay: -1.0s; }
`;

const LoadingMessage = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.875rem;
  margin: 0;
`;

// Skeleton loading components
const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const TableLoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 1rem;
`;

const SkeletonRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const SkeletonCell = styled.div<{ width: string }>`
  height: 20px;
  width: ${props => props.width};
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 4px;
`;

export default Loading;

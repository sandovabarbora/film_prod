// src/styles/GlobalStyles.ts - Cinema-Grade Global Styles
import { createGlobalStyle } from 'styled-components';
import type { Theme } from './theme';

export const GlobalStyles = createGlobalStyle<{ theme: Theme }>`
  /* CSS Reset & Cinema Base */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 16px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    scroll-behavior: smooth;
  }

  body {
    font-family: ${({ theme }) => theme.typography.fontFamily.body};
    background: ${({ theme }) => theme.colors.background.primary};
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    line-height: ${({ theme }) => theme.typography.lineHeight.normal};
    font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
    overflow-x: hidden;
    
    /* Cinema background with subtle pattern */
    background-image: 
      radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
      url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f8fafc' fill-opacity='0.01'%3E%3Ccircle cx='60' cy='60' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }

  /* Cinema Selection */
  ::selection {
    background: ${({ theme }) => theme.colors.text.accent}40;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  ::-moz-selection {
    background: ${({ theme }) => theme.colors.text.accent}40;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  /* Cinema Scrollbars */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background.secondary};
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.gradients.primary};
    border-radius: 10px;
    border: 2px solid ${({ theme }) => theme.colors.background.secondary};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.text.accent};
  }

  /* Cinema Glass Effects */
  .glass-light {
    background: ${({ theme }) => theme.colors.glass.surface};
    backdrop-filter: ${({ theme }) => theme.cinema.backdrop.light};
    border: 1px solid ${({ theme }) => theme.colors.glass.border};
  }

  .glass-medium {
    background: ${({ theme }) => theme.colors.glass.surfaceHover};
    backdrop-filter: ${({ theme }) => theme.cinema.backdrop.medium};
    border: 1px solid ${({ theme }) => theme.colors.glass.borderHover};
  }

  .glass-heavy {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: ${({ theme }) => theme.cinema.backdrop.heavy};
    border: 1px solid rgba(255, 255, 255, 0.25);
  }

  /* Interactive Cinema Elements */
  .interactive {
    cursor: pointer;
    transition: ${({ theme }) => theme.transitions.cinema};
    
    &:hover {
      transform: translateY(-2px) scale(1.02);
    }
    
    &:active {
      transform: translateY(0) scale(0.98);
    }
  }

  /* Gradient Text Effects */
  .gradient-text {
    background: ${({ theme }) => theme.colors.gradients.primary};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: ${({ theme }) => theme.animation.gradientShift};
  }

  .gradient-cinema {
    background: ${({ theme }) => theme.colors.gradients.cinema};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .gradient-golden {
    background: ${({ theme }) => theme.colors.gradients.golden};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Cinema Animations */
  .fade-in {
    opacity: 0;
    transform: translateY(40px);
    animation: ${({ theme }) => theme.animation.fadeIn};
  }

  .slide-up {
    opacity: 0;
    transform: translateY(60px);
    animation: ${({ theme }) => theme.animation.slideUp};
  }

  .scale-in {
    opacity: 0;
    transform: scale(0.9);
    animation: ${({ theme }) => theme.animation.scaleIn};
  }

  .float {
    animation: ${({ theme }) => theme.animation.float};
  }

  .glow {
    animation: ${({ theme }) => theme.animation.glow};
  }

  /* Animation Delays */
  .delay-100 { animation-delay: 100ms; }
  .delay-200 { animation-delay: 200ms; }
  .delay-300 { animation-delay: 300ms; }
  .delay-500 { animation-delay: 500ms; }

  /* Cinema Keyframes */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(40px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(60px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes gradientShift {
    0%, 100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes glow {
    from {
      box-shadow: ${({ theme }) => theme.shadows.glow};
    }
    to {
      box-shadow: ${({ theme }) => theme.shadows.glowHover};
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.8;
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes ping {
    75%, 100% {
      transform: scale(2);
      opacity: 0;
    }
  }

  /* Cinema Typography Utilities */
  .text-display {
    font-family: ${({ theme }) => theme.typography.fontFamily.display};
    font-weight: ${({ theme }) => theme.typography.fontWeight.light};
    line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  }

  .text-body {
    font-family: ${({ theme }) => theme.typography.fontFamily.body};
    font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
    line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  }

  .text-mono {
    font-family: ${({ theme }) => theme.typography.fontFamily.mono};
    font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
    letter-spacing: 0.025em;
  }

  .text-accent {
    font-family: ${({ theme }) => theme.typography.fontFamily.accent};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  }

  /* Cinema Focus States */
  *:focus {
    outline: none;
  }

  *:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.text.accent};
    outline-offset: 2px;
    border-radius: ${({ theme }) => theme.borderRadius.md};
  }

  /* Cinema Status Colors */
  .status-prep { color: ${({ theme }) => theme.colors.status.prep}; }
  .status-shoot { color: ${({ theme }) => theme.colors.status.shoot}; }
  .status-post { color: ${({ theme }) => theme.colors.status.post}; }
  .status-wrap { color: ${({ theme }) => theme.colors.status.wrap}; }
  .status-archived { color: ${({ theme }) => theme.colors.status.archived}; }

  /* Cinema Button Base */
  .btn-base {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: ${({ theme }) => theme.spacing[2]};
    padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[6]};
    border-radius: ${({ theme }) => theme.borderRadius['2xl']};
    font-family: ${({ theme }) => theme.typography.fontFamily.body};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    line-height: ${({ theme }) => theme.typography.lineHeight.none};
    border: none;
    cursor: pointer;
    transition: ${({ theme }) => theme.transitions.cinema};
    position: relative;
    overflow: hidden;
    
    &:hover {
      transform: translateY(-2px);
    }
    
    &:active {
      transform: translateY(0);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
  }

  /* Cinema Card Base */
  .card-base {
    background: ${({ theme }) => theme.colors.glass.surface};
    backdrop-filter: ${({ theme }) => theme.cinema.backdrop.light};
    border: 1px solid ${({ theme }) => theme.colors.glass.border};
    border-radius: ${({ theme }) => theme.borderRadius['2xl']};
    padding: ${({ theme }) => theme.spacing[6]};
    transition: ${({ theme }) => theme.transitions.cinema};
    
    &:hover {
      background: ${({ theme }) => theme.colors.glass.surfaceHover};
      border-color: ${({ theme }) => theme.colors.glass.borderHover};
      transform: translateY(-4px);
      box-shadow: ${({ theme }) => theme.shadows.cinema};
    }
  }

  /* Responsive Cinema Design */
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    body {
      font-size: ${({ theme }) => theme.typography.fontSize.sm};
    }
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    .fade-in, .slide-up, .scale-in {
      animation-duration: 0.4s;
    }
  }

  /* Accessibility Improvements */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
    
    html {
      scroll-behavior: auto;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .glass-light, .glass-medium, .glass-heavy {
      background: ${({ theme }) => theme.colors.background.surface};
      backdrop-filter: none;
      border: 2px solid ${({ theme }) => theme.colors.text.accent};
    }
  }
`;

import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    font-family: ${({ theme }) => theme.fonts.body};
    color: ${({ theme }) => theme.colors.primary.light};
    background-color: ${({ theme }) => theme.colors.primary.dark};
    line-height: 1.6;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${({ theme }) => theme.fonts.display};
    font-weight: 400;
    text-transform: uppercase;
    letter-spacing: 1px;
    line-height: 1.2;
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  h1 { font-size: ${({ theme }) => theme.sizes.h1}; }
  h2 { font-size: ${({ theme }) => theme.sizes.h2}; }
  h3 { font-size: ${({ theme }) => theme.sizes.h3}; }
  h4 { font-size: ${({ theme }) => theme.sizes.h4}; }
  h5 { font-size: ${({ theme }) => theme.sizes.h5}; }
  h6 { font-size: ${({ theme }) => theme.sizes.h6}; }

  p {
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  a {
    color: ${({ theme }) => theme.colors.accent.main};
    text-decoration: none;
    transition: color ${({ theme }) => theme.transitions.fast};

    &:hover {
      color: ${({ theme }) => theme.colors.accent.muted};
    }
  }

  button {
    cursor: pointer;
    font-family: inherit;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  ::selection {
    background-color: ${({ theme }) => theme.colors.accent.main};
    color: ${({ theme }) => theme.colors.primary.light};
  }
`;

// src/styles/styled.d.ts
import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      primaryDark: string;
      danger: string;
      success: string;
      warning: string;
      
      text: {
        primary: string;
        secondary: string;
        muted: string;
      };
      
      gray: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        850: string;
        900: string;
      };
      
      accent: {
        main: string;
        muted: string;
      };
    };
    
    fonts: {
      display: string;
      body: string;
    };
    
    sizes: {
      h1: string;
      h2: string;
      h3: string;
      h4: string;
      h5: string;
      h6: string;
    };
    
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
    
    transitions: {
      fast: string;
      normal: string;
      slow: string;
    };
    
    breakpoints: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
    };
    
    shadows: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  }
}
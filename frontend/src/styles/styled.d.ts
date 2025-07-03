import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: {
        dark: string;
        light: string;
      };
      accent: {
        main: string;
        muted: string;
      };
      gray: {
        100: string;
        300: string;
        400: string;
        500: string;
        700: string;
        800: string;
        850: string;
        900: string;
        [key: string]: string; // Index signature pro dynamický přístup
      };
      status: {
        success: string;
        warning: string;
        error: string;
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
      body: string;
      small: string;
    };
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
      xxxl: string;
    };
    breakpoints: {
      mobile: string;
      tablet: string;
      desktop: string;
      wide: string;
    };
    transitions: {
      fast: string;
      normal: string;
      slow: string;
    };
    shadows: {
      small: string;
      medium: string;
      large: string;
      xl: string;
    };
  }
}

// UI Theme
// TODO: Add theme configuration here

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  spacing: {
    small: string;
    medium: string;
    large: string;
  };
}

// Default theme
export const defaultTheme: Theme = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    background: '#ffffff',
    text: '#212529',
  },
  spacing: {
    small: '8px',
    medium: '16px',  
    large: '24px',
  },
};

// Placeholder export to make this a valid module
export const theme = { defaultTheme };

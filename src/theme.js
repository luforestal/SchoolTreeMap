import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#2d5016', // Forest green
      light: '#4a7c2c',
      dark: '#1a3009',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#6b8e23', // Olive green
      light: '#8ba84e',
      dark: '#4a6316',
      contrastText: '#ffffff',
    },
    success: {
      main: '#52a447',
      light: '#7bc96f',
      dark: '#3d7a33',
    },
    info: {
      main: '#5c8a5f',
      light: '#87b28a',
      dark: '#3d5f40',
    },
    background: {
      default: '#f4f7f4',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a3009',
      secondary: '#4a6316',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
})

export default theme

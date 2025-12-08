import React from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import TreeMap from './components/TreeMap'
import HomePage from './components/HomePage'
import theme from './theme'

function App() {
  // Check if we have a school parameter in URL
  const urlParams = new URLSearchParams(window.location.search)
  const schoolId = urlParams.get('school')
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ width: '100%', height: '100vh' }}>
        {schoolId ? <TreeMap /> : <HomePage />}
      </div>
    </ThemeProvider>
  )
}

export default App

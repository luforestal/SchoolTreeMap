import React from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import TreeMap from './components/TreeMap'
import HomePage from './components/HomePage'
import CookieConsent from './components/ConsentBanner'
import theme from './theme'

function App() {
  // Check if we have a school parameter in URL
  const urlParams = new URLSearchParams(window.location.search)
  const schoolId = urlParams.get('school')
  
  const handleCookieAccept = () => {
    // Load Google Analytics dynamically after consent
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-QQ52P9CTV8'
    document.head.appendChild(script)
    
    script.onload = () => {
      window.dataLayer = window.dataLayer || []
      function gtag(){window.dataLayer.push(arguments)}
      window.gtag = gtag
      gtag('js', new Date())
      gtag('config', 'G-QQ52P9CTV8', {
        anonymize_ip: true,
        cookie_flags: 'SameSite=None;Secure'
      })
    }
  }

  const handleCookieDecline = () => {
    console.log('User declined cookies')
  }
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ width: '100%', height: '100vh' }}>
        {schoolId ? <TreeMap /> : <HomePage />}
      </div>
      <CookieConsent 
        onAccept={handleCookieAccept}
        onDecline={handleCookieDecline}
      />
    </ThemeProvider>
  )
}

export default App

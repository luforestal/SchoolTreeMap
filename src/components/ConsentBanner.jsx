import { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Stack, Link } from '@mui/material';
import CookieIcon from '@mui/icons-material/Cookie';

const CookieConsent = ({ onAccept, onDecline }) => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Small delay to avoid jarring appearance on page load
      setTimeout(() => setShowBanner(true), 1000);
    } else if (consent === 'accepted' && onAccept && !window.gtag) {
      // If previously accepted but GA not loaded yet, initialize analytics
      onAccept();
    }
  }, [onAccept]);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowBanner(false);
    if (onAccept) {
      onAccept();
    }
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setShowBanner(false);
    if (onDecline) {
      onDecline();
    }
  };

  if (!showBanner) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        p: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          maxWidth: '900px',
          margin: '0 auto',
          p: 3,
          backgroundColor: 'background.paper',
          borderRadius: 2,
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <CookieIcon sx={{ color: 'primary.main', mt: 0.5 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom>
                Cookie Notice
              </Typography>
              <Typography variant="body2" color="text.secondary">
                We use cookies and similar technologies to help personalize content and provide 
                a better experience. We use Google Analytics to understand how you use our site 
                and improve your experience. By clicking "Accept", you consent to our use of cookies.{' '}
                <Link 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    // You can link to a privacy policy page here
                  }}
                  sx={{ color: 'primary.main' }}
                >
                  Learn more
                </Link>
              </Typography>
            </Box>
          </Stack>
          
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            justifyContent="flex-end"
          >
            <Button
              variant="outlined"
              onClick={handleDecline}
              sx={{ minWidth: '120px' }}
            >
              Decline
            </Button>
            <Button
              variant="contained"
              onClick={handleAccept}
              sx={{ minWidth: '120px' }}
            >
              Accept
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default CookieConsent;

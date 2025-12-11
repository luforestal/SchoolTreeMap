import React, { useState, useEffect } from 'react'
import { loadSchools } from '../utils/schoolLoader'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Button,
  AppBar,
  Toolbar,
  Divider,
} from '@mui/material'
import {
  Map as MapIcon,
  Photo as PhotoIcon,
  BarChart as ChartIcon,
  Search as SearchIcon,
  Nature as NatureIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material'

const HomePage = () => {
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)
  const [carouselIndex, setCarouselIndex] = useState(0)

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const schoolsList = await loadSchools()
        setSchools(schoolsList)
        setLoading(false)
      } catch (error) {
        console.error('Error loading schools:', error)
        setLoading(false)
      }
    }
    fetchSchools()
  }, [])

  const handleSchoolSelect = (schoolId) => {
    if (schoolId) {
      window.location.href = `?school=${schoolId}`
    }
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  const baseFeatures = [
    { icon: MapIcon, title: 'Interactive Maps', description: 'Explore tree locations on detailed campus maps' },
    { icon: PhotoIcon, title: 'Tree Photos', description: 'View high-quality photos of each tree' },
    { icon: ChartIcon, title: 'Tree Data', description: 'Access detailed information about species, size, and health' },
    { icon: SearchIcon, title: 'Search & Filter', description: 'Find trees by code, genus, or species' },
  ]

  // Create infinite scroll by tripling the features
  const features = [...baseFeatures, ...baseFeatures, ...baseFeatures]
  const cardsToShow = 3

  const handlePrevious = () => {
    setCarouselIndex((prev) => {
      const newIndex = prev - 1
      if (newIndex < 0) {
        return features.length - baseFeatures.length - 1
      }
      return newIndex
    })
  }

  const handleNext = () => {
    setCarouselIndex((prev) => {
      const newIndex = prev + 1
      if (newIndex >= features.length - baseFeatures.length) {
        return 0
      }
      return newIndex
    })
  }

  const renderHeader = () => (
    <AppBar position="static" sx={{ bgcolor: '#2d5016' }}>
      <Toolbar sx={{ cursor: 'pointer' }} onClick={handleGoHome}>
        <NatureIcon sx={{ mr: 2, fontSize: 32 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
          School Tree Inventory Maps
        </Typography>
      </Toolbar>
    </AppBar>
  )

  const renderHero = () => (
    <Box textAlign="center" mb={6}>
      <Typography variant="h3" sx={{ color: '#2d5016', mb: 2, fontWeight: 700 }}>
        🌳 Interactive Tree Mapping
      </Typography>
      <Typography variant="h6" sx={{ color: '#4a7c2c', mb: 4, fontWeight: 400 }}>
        Explore and manage tree inventories for educational institutions
      </Typography>
      
      <Card 
        sx={{ 
          maxWidth: 500, 
          mx: 'auto', 
          mb: 5, 
          boxShadow: 3,
          borderRadius: 2
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <FormControl fullWidth>
            <InputLabel id="school-select-label">Select a School</InputLabel>
            <Select
              labelId="school-select-label"
              id="school-select"
              onChange={(e) => handleSchoolSelect(e.target.value)}
              defaultValue=""
              label="Select a School"
            >
              <MenuItem value="" disabled>Choose a school...</MenuItem>
              {schools.map(school => (
                <MenuItem key={school.id} value={school.id}>
                  {school.schoolName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>
    </Box>
  )

  const renderFeatures = () => (
    <Box mb={8}>
      <Typography variant="h4" sx={{ color: '#2d5016', mb: 3, fontWeight: 600, textAlign: 'center' }}>
        Platform Features
      </Typography>
      <Box sx={{ position: 'relative', maxWidth: 1100, mx: 'auto' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            overflow: 'hidden',
            px: 6,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              transition: 'transform 0.4s ease-in-out',
              transform: `translateX(calc(-${carouselIndex * (100 / cardsToShow)}%))`,
              gap: 2,
            }}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Box
                  key={index}
                  sx={{
                    minWidth: `calc(${100 / cardsToShow}% - 16px)`,
                    maxWidth: 224,
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <Card
                    sx={{
                      width: '100%',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      boxShadow: 2,
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        textAlign: 'center',
                        p: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minHeight: 240,
                      }}
                    >
                      <Box
                        sx={{
                          bgcolor: '#e8f5e9',
                          borderRadius: '50%',
                          width: 80,
                          height: 80,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                        }}
                      >
                        <Icon sx={{ fontSize: 40, color: 'primary.main' }} />
                      </Box>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              )
            })}
          </Box>
        </Box>
        
        {/* Navigation Buttons */}
        <Button
          onClick={handlePrevious}
          sx={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            minWidth: 'auto',
            width: 48,
            height: 48,
            borderRadius: '50%',
            bgcolor: 'white',
            boxShadow: 2,
            zIndex: 1,
            '&:hover': {
              bgcolor: 'white',
              boxShadow: 4,
            },
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: 32, color: '#2d5016' }} />
        </Button>
        <Button
          onClick={handleNext}
          sx={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            minWidth: 'auto',
            width: 48,
            height: 48,
            borderRadius: '50%',
            bgcolor: 'white',
            boxShadow: 2,
            zIndex: 1,
            '&:hover': {
              bgcolor: 'white',
              boxShadow: 4,
            },
          }}
        >
          <ChevronRightIcon sx={{ fontSize: 32, color: '#2d5016' }} />
        </Button>
        
        {/* Indicators */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 3 }}>
          {baseFeatures.map((_, index) => (
            <Box
              key={index}
              onClick={() => setCarouselIndex(index)}
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: (carouselIndex % baseFeatures.length) === index ? '#2d5016' : '#ccc',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  )

  const renderSchools = () => (
    <Box>
      <Typography variant="h4" sx={{ color: '#2d5016', mb: 3, fontWeight: 600, textAlign: 'center' }}>
        Our Schools
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress sx={{ color: 'primary.main' }} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {schools.map(school => (
            <Grid item xs={12} sm={6} md={4} key={school.id}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'all 0.3s',
                  boxShadow: 2,
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardActionArea 
                  onClick={() => handleSchoolSelect(school.id)} 
                  sx={{ 
                    height: '100%',
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    justifyContent: 'space-between',
                    minHeight: 180
                  }}
                >
                  <Box>
                    <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                      {school.schoolName}
                    </Typography>
                    {school.address && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {school.address}
                      </Typography>
                    )}
                  </Box>
                  <Button variant="contained" fullWidth sx={{ mt: 2 }}>
                    View Map →
                  </Button>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )

  const renderFooter = () => (
    <Box
      component="footer"
      sx={{
        bgcolor: '#2d5016',
        color: 'white',
        py: 3,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              School Tree Inventory Maps
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Interactive mapping platform for educational tree inventories
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                © {new Date().getFullYear()} School Tree Inventory Maps
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Preserving and documenting our natural heritage
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )

  return (
    <>
      {renderHeader()}

      {/* Main Content */}
      <Box
        sx={{
          minHeight: 'calc(100vh - 64px - 120px)',
          background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
          py: 6,
        }}
      >
        <Container maxWidth="lg">
          {renderHero()}
          {renderFeatures()}
          {renderSchools()}
        </Container>
      </Box>

      {renderFooter()}
    </>
  )
}

export default HomePage

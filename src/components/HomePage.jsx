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
} from '@mui/material'
import {
  Map as MapIcon,
  Photo as PhotoIcon,
  BarChart as ChartIcon,
  Search as SearchIcon,
} from '@mui/icons-material'

const HomePage = () => {
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)

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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #2d5016 0%, #4a7c2c 100%)',
        py: 8,
      }}
    >
      <Container maxWidth="lg">
        <Box textAlign="center" mb={6}>
          <Typography variant="h2" sx={{ color: 'white', mb: 2, fontWeight: 700 }}>
            🌳 School Tree Inventory Maps
          </Typography>
          <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.9)', mb: 5 }}>
            Interactive tree mapping for educational institutions
          </Typography>
          
          <Card sx={{ maxWidth: 500, mx: 'auto', mb: 6, p: 2 }}>
            <CardContent>
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

          <Grid container spacing={3} mb={6}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <MapIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>Interactive Maps</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Explore tree locations on detailed campus maps
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <PhotoIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>Tree Photos</Typography>
                  <Typography variant="body2" color="text.secondary">
                    View high-quality photos of each tree
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <ChartIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>Tree Data</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Access detailed information about species, size, and health
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <SearchIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>Search & Filter</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Find trees by code, genus, or species
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box>
            <Typography variant="h4" sx={{ color: 'white', mb: 4, fontWeight: 600 }}>
              Our Schools
            </Typography>
            {loading ? (
              <CircularProgress sx={{ color: 'white' }} />
            ) : (
              <Grid container spacing={3}>
                {schools.map(school => (
                  <Grid item xs={12} sm={6} md={4} key={school.id}>
                    <Card
                      sx={{
                        height: '100%',
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: 6,
                        },
                      }}
                    >
                      <CardActionArea onClick={() => handleSchoolSelect(school.id)} sx={{ height: '100%', p: 3 }}>
                        <Typography variant="h6" color="secondary" gutterBottom>
                          {school.schoolName}
                        </Typography>
                        {school.address && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {school.address}
                          </Typography>
                        )}
                        <Button variant="contained" fullWidth>
                          View Map →
                        </Button>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default HomePage

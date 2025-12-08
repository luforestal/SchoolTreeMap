import React, { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import './TreeMap.css'
import { loadTreeData } from '../utils/treeDataLoader'
import { getSchoolIdFromURL, getSchoolConfig, loadSchoolBoundary } from '../utils/schoolLoader'
import {
  Box,
  Drawer,
  Typography,
  Button,
  ButtonGroup,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Fab,
} from '@mui/material'
import {
  Close as CloseIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  Home as HomeIcon,
  Help as HelpIcon,
} from '@mui/icons-material'

const TreeMap = () => {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [currentStyle, setCurrentStyle] = useState('cartodb')
  const [treeData, setTreeData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTree, setSelectedTree] = useState(null)
  const [useSidebar, setUseSidebar] = useState(true)
  const markersRef = useRef([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showInstructionsModal, setShowInstructionsModal] = useState(true)
  const [schoolConfig, setSchoolConfig] = useState(null)
  const [boundary, setBoundary] = useState(null)
  const [visibleTreeCount, setVisibleTreeCount] = useState(20)
  const [imageLoading, setImageLoading] = useState(false)

  // Load school configuration and data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Get school from URL parameter
        const schoolId = getSchoolIdFromURL()
        const config = await getSchoolConfig(schoolId)
        setSchoolConfig(config)
        
        // Load boundary
        const boundaryGeoJSON = await loadSchoolBoundary(config.boundaryUrl)
        setBoundary(boundaryGeoJSON)
        
        // Load tree data
        const { trees } = await loadTreeData(
          config.dataUrl,
          {
            photosUrl: config.photosUrl
          }
        )
        setTreeData(trees)
        setLoading(false)
      } catch (err) {
        console.error('Failed to load tree data:', err)
        setError(err.message)
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  useEffect(() => {
    if (map.current || treeData.length === 0) return // Initialize map only once and when data is loaded

    // Calculate center from tree data
    const lats = treeData.map(t => t.lat)
    const lons = treeData.map(t => t.lon)
    const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length
    const centerLon = lons.reduce((a, b) => a + b, 0) / lons.length

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'cartodb': {
            type: 'raster',
            tiles: ['https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© CartoDB'
          }
        },
        layers: [
          {
            id: 'cartodb-layer',
            type: 'raster',
            source: 'cartodb',
            minzoom: 0,
            maxzoom: 22
          }
        ]
      },
      center: [centerLon, centerLat],
      zoom: 18
    })

    map.current.on('load', () => {
      // Add boundary layer
      if (boundary) {
        map.current.addSource('boundary', {
          type: 'geojson',
          data: boundary
        })

        map.current.addLayer({
          id: 'boundary-line',
          type: 'line',
          source: 'boundary',
          paint: {
            'line-color': '#000000',
            'line-width': 1
          }
        })
      }

      // Add tree markers
      treeData.forEach((tree, index) => {
        // Create tree marker container
        const markerContainer = document.createElement('div')
        markerContainer.className = 'tree-marker-container'
        markerContainer.setAttribute('data-tree-code', tree.treeCode)
        
        // Add canopy circle if dimensions available
        if (tree.crownRadius) {
          const canopyEl = document.createElement('div')
          canopyEl.className = 'tree-canopy'
          canopyEl.style.width = `${tree.crownRadius * 2}px`
          canopyEl.style.height = `${tree.crownRadius * 2}px`
          markerContainer.appendChild(canopyEl)
        }

        // Create tree marker
        const markerEl = document.createElement('div')
        markerEl.className = 'tree-marker'
        markerEl.style.backgroundColor = tree.color
        markerEl.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 14 14">
            ${getPolygonPath(tree.shape)}
          </svg>
        `
        markerContainer.appendChild(markerEl)

        // Create popup (only used in popup mode)
        const photoUrl = tree.treeCode && tree.photosBaseUrl
          ? `${tree.photosBaseUrl}/${tree.treeCode}.jpg`
          : null
        const popupContent = `
          <div class="tree-popup">
            <div><strong>Tree code:</strong> ${tree.treeCode}</div>
            <div><strong>Genus:</strong> ${tree.genus}</div>
            <div><strong>Species:</strong> ${tree.species}</div>
            <div><strong>DBH (cm):</strong> ${tree.dbh || 'N/A'}</div>
            <div><strong>Height (m):</strong> ${tree.height || 'N/A'}</div>
            ${photoUrl ? `<img src="${photoUrl}" alt="Tree photo" class="tree-photo" loading="lazy" />` : '<div class="no-photo">No photo available</div>'}
          </div>
        `

        const popup = new maplibregl.Popup({ offset: 15 })
          .setHTML(popupContent)

        const marker = new maplibregl.Marker({
          element: markerContainer,
          anchor: 'center'
        })
          .setLngLat([tree.lon, tree.lat])

        // Add click handler for sidebar mode
        markerContainer.addEventListener('click', () => {
          // Remove active class from all markers
          document.querySelectorAll('.tree-marker-container').forEach(m => m.classList.remove('active'))
          // Add active class to clicked marker
          markerContainer.classList.add('active')
          
          setSelectedTree(tree)
          // Fly to the tree location
          if (map.current) {
            map.current.flyTo({
              center: [tree.lon, tree.lat],
              zoom: 19,
              duration: 1000
            })
          }
        })

        // Only attach popup in popup mode
        if (!useSidebar) {
          marker.setPopup(popup)
        }

        marker.addTo(map.current)
        markersRef.current.push(marker)
      })
    })

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right')

  }, [treeData, useSidebar])

  const getPolygonPath = (shape) => {
    const { sides, rotation } = shape
    const radius = 6
    const angleStep = (2 * Math.PI) / sides
    const startAngle = (rotation * Math.PI) / 180

    let path = 'M '
    for (let i = 0; i <= sides; i++) {
      const angle = startAngle + i * angleStep
      const x = 7 + radius * Math.cos(angle)
      const y = 7 + radius * Math.sin(angle)
      path += `${x},${y} `
    }
    return `<path d="${path}Z" fill="currentColor" />`
  }

  const changeBaseMap = (style) => {
    setCurrentStyle(style)
    
    let styleConfig = {
      version: 8,
      sources: {},
      layers: []
    }

    switch(style) {
      case 'osm':
        styleConfig.sources['osm'] = {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors'
        }
        styleConfig.layers.push({
          id: 'osm-layer',
          type: 'raster',
          source: 'osm'
        })
        break
      case 'cartodb':
        styleConfig.sources['cartodb'] = {
          type: 'raster',
          tiles: ['https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '© CartoDB'
        }
        styleConfig.layers.push({
          id: 'cartodb-layer',
          type: 'raster',
          source: 'cartodb'
        })
        break
      case 'satellite':
        styleConfig.sources['satellite'] = {
          type: 'raster',
          tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
          tileSize: 256,
          attribution: 'Esri World Imagery'
        }
        styleConfig.layers.push({
          id: 'satellite-layer',
          type: 'raster',
          source: 'satellite'
        })
        break
    }

    if (map.current) {
      map.current.setStyle(styleConfig)
      
      // Re-add boundary and markers after style change
      map.current.once('styledata', () => {
        if (boundary && !map.current.getSource('boundary')) {
          map.current.addSource('boundary', {
            type: 'geojson',
            data: boundary
          })
          map.current.addLayer({
            id: 'boundary-line',
            type: 'line',
            source: 'boundary',
            paint: {
              'line-color': '#000000',
              'line-width': 1
            }
          })
        }
      })
    }
  }

  const handleTreeSelect = (tree) => {
    setSelectedTree(tree)
    // Only set loading state if tree has a photo
    if (tree.treeCode && tree.photosBaseUrl) {
      setImageLoading(true)
    } else {
      setImageLoading(false)
    }
    
    // Remove active class from all markers
    document.querySelectorAll('.tree-marker-container').forEach(m => m.classList.remove('active'))
    // Add active class to selected tree marker
    const selectedMarker = document.querySelector(`[data-tree-code="${tree.treeCode}"]`)
    if (selectedMarker) {
      selectedMarker.classList.add('active')
    }
    
    if (map.current) {
      map.current.flyTo({
        center: [tree.lon, tree.lat],
        zoom: 19,
        duration: 1000
      })
    }
  }

  const handleNextTree = () => {
    if (!selectedTree || treeData.length === 0) return
    const currentIndex = treeData.findIndex(t => t.treeCode === selectedTree.treeCode)
    const nextIndex = (currentIndex + 1) % treeData.length
    handleTreeSelect(treeData[nextIndex])
  }

  const handlePrevTree = () => {
    if (!selectedTree || treeData.length === 0) return
    const currentIndex = treeData.findIndex(t => t.treeCode === selectedTree.treeCode)
    const prevIndex = (currentIndex - 1 + treeData.length) % treeData.length
    handleTreeSelect(treeData[prevIndex])
  }

  const filteredTrees = treeData.filter(tree => 
    tree.treeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tree.genus.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tree.species.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Reset visible count when search changes
  React.useEffect(() => {
    setVisibleTreeCount(20)
  }, [searchQuery])

  const handleLoadMore = () => {
    setVisibleTreeCount(prev => prev + 20)
  }

  return (
    <Box sx={{ display: 'flex', width: '100%', height: '100%', position: 'relative' }}>
      {/* Instructions Modal */}
      <Dialog 
        open={showInstructionsModal} 
        onClose={() => setShowInstructionsModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          🗺️ How to Use This Map
          <IconButton onClick={() => setShowInstructionsModal(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <List>
            <ListItem>• Click on any tree marker on the map to view details</ListItem>
            <ListItem>• View detailed information and photos in the sidebar</ListItem>
            <ListItem>• Use the navigation arrows to browse through trees</ListItem>
            <ListItem>• Search for specific trees by code, genus, or species</ListItem>
            <ListItem>• Switch base maps using the buttons on the left</ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setShowInstructionsModal(false)}>
            Got it!
          </Button>
        </DialogActions>
      </Dialog>

      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircularProgress />
              <Typography>Loading tree data...</Typography>
            </CardContent>
          </Card>
        </Box>
      )}
      
      {error && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <Alert severity="error" sx={{ maxWidth: 400 }}>
            Error loading data: {error}
          </Alert>
        </Box>
      )}
      
      {/* Floating Action Buttons */}
      <Fab
        size="medium"
        sx={{ position: 'absolute', bottom: 90, left: 20, zIndex: 5 }}
        color="default"
        onClick={() => window.location.href = window.location.pathname}
        title="Back to home"
      >
        <HomeIcon fontSize="small" />
      </Fab>
      
      <Fab
        size="medium"
        sx={{ position: 'absolute', bottom: 20, left: 20, zIndex: 5 }}
        color="default"
        onClick={() => setShowInstructionsModal(true)}
        title="How to use this map"
      >
        <HelpIcon fontSize="small" />
      </Fab>
      
      {/* Map Controls */}
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 1,
          background: 'white',
          borderRadius: 1,
          boxShadow: 2,
        }}
      >
        <ButtonGroup variant="outlined" size="small">
          <Button 
            variant={currentStyle === 'osm' ? 'contained' : 'outlined'}
            onClick={() => changeBaseMap('osm')}
          >
            OSM
          </Button>
          <Button 
            variant={currentStyle === 'cartodb' ? 'contained' : 'outlined'}
            onClick={() => changeBaseMap('cartodb')}
          >
            CartoDB
          </Button>
          <Button 
            variant={currentStyle === 'satellite' ? 'contained' : 'outlined'}
            onClick={() => changeBaseMap('satellite')}
          >
            Satellite
          </Button>
        </ButtonGroup>
      </Box>
      
      <div ref={mapContainer} style={{ flex: 1, width: '100%', height: '100%' }} />
      
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        anchor="right"
        sx={{
          width: 400,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 400,
            boxSizing: 'border-box',
            position: 'absolute',
          },
        }}
      >
        {/* Sidebar Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #2d5016 0%, #4a7c2c 100%)',
            color: 'white',
            p: 2.5,
            boxShadow: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            🌳 {schoolConfig?.schoolName || 'Loading...'}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Tree Inventory Map
          </Typography>
        </Box>
        
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: '#f8f8f8',
          }}
        >
          <Typography variant="h6">
            {selectedTree && 'Tree Details'}
          </Typography>
          {selectedTree && (
            <IconButton onClick={() => setSelectedTree(null)} size="small">
              <CloseIcon />
            </IconButton>
          )}
        </Box>
        
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {!selectedTree ? (
            /* School Info when no tree selected */
            <Box>
              <Card sx={{ mb: 2, borderRadius: 1 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                    📊 Inventory Overview
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Total Trees:</Typography>
                    <Typography variant="h6" color="text.primary">{treeData.length}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Unique Genera:</Typography>
                    <Typography variant="h6" color="text.primary">
                      {new Set(treeData.map(t => t.genus)).size}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                🔍 Browse Trees
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by code, genus, or species..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Box
                sx={{
                  maxHeight: 300,
                  overflow: 'auto',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <List dense>
                  {filteredTrees.slice(0, visibleTreeCount).map(tree => (
                    <ListItemButton key={tree.treeCode} onClick={() => handleTreeSelect(tree)}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: 0.5,
                          bgcolor: tree.color,
                          mr: 1.5,
                          flexShrink: 0,
                        }}
                      />
                      <ListItemText
                        primary={tree.treeCode}
                        secondary={`${tree.genus} ${tree.species}`}
                        primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                        secondaryTypographyProps={{ fontSize: '0.75rem', fontStyle: 'italic' }}
                      />
                    </ListItemButton>
                  ))}
                  {filteredTrees.length > visibleTreeCount && (
                    <ListItem>
                      <Button 
                        fullWidth 
                        size="small" 
                        onClick={handleLoadMore}
                        sx={{ color: 'text.secondary' }}
                      >
                        +{filteredTrees.length - visibleTreeCount} more trees... (click to load)
                      </Button>
                    </ListItem>
                  )}
                  {filteredTrees.length === 0 && searchQuery && (
                    <ListItem>
                      <ListItemText
                        primary="No trees found"
                        primaryTypographyProps={{ color: 'text.secondary', textAlign: 'center' }}
                      />
                    </ListItem>
                  )}
                </List>
              </Box>
            </Box>
          ) : (
            /* Tree Details when selected */
            <Box>
              {/* Navigation */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                  p: 1.5,
                  bgcolor: '#f8f9fa',
                  borderRadius: 1,
                }}
              >
                <Button
                  size="small"
                  startIcon={<PrevIcon />}
                  onClick={handlePrevTree}
                  variant="outlined"
                >
                  Previous
                </Button>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {treeData.findIndex(t => t.treeCode === selectedTree.treeCode) + 1} of {treeData.length}
                </Typography>
                <Button
                  size="small"
                  endIcon={<NextIcon />}
                  onClick={handleNextTree}
                  variant="outlined"
                >
                  Next
                </Button>
              </Box>

              {/* Photo Section - Now at the top */}
              <Box sx={{ mb: 2 }} key={selectedTree.treeCode}>
                {selectedTree.treeCode && selectedTree.photosBaseUrl ? (
                  <>
                    {imageLoading && (
                      <Box
                        sx={{
                          width: '100%',
                          height: 250,
                          bgcolor: '#f0f0f0',
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CircularProgress size={40} />
                      </Box>
                    )}
                    <img 
                      src={`${selectedTree.photosBaseUrl}/${selectedTree.treeCode}.jpg`}
                      alt={`Tree ${selectedTree.treeCode}`}
                      style={{
                        width: '100%',
                        borderRadius: 8,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        display: imageLoading ? 'none' : 'block',
                      }}
                      onLoad={() => setImageLoading(false)}
                      onError={() => {
                        setImageLoading(false)
                      }}
                    />
                    {!imageLoading && (
                      <Card sx={{ display: 'none', bgcolor: '#f9f9f9' }}>
                        <CardContent>
                          <Typography variant="body2" color="text.secondary" fontStyle="italic" textAlign="center">
                            Photo not available
                          </Typography>
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : (
                  <Card sx={{ bgcolor: '#f9f9f9' }}>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary" fontStyle="italic" textAlign="center">
                        No photo available
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Box>

              {/* Tree Data Card */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>Tree Code:</Typography>
                    <Typography variant="body2">{selectedTree.treeCode}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>Genus:</Typography>
                    <Typography variant="body2">{selectedTree.genus}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>Species:</Typography>
                    <Typography variant="body2">{selectedTree.species}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>DBH (cm):</Typography>
                    <Typography variant="body2">{selectedTree.dbh || 'N/A'}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>Height (m):</Typography>
                    <Typography variant="body2">{selectedTree.height || 'N/A'}</Typography>
                  </Box>
                  {(selectedTree.crownNS || selectedTree.crownEW) && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>Crown Size:</Typography>
                        <Typography variant="body2">
                          {selectedTree.crownNS && `NS: ${selectedTree.crownNS}m`}
                          {selectedTree.crownNS && selectedTree.crownEW && ' / '}
                          {selectedTree.crownEW && `EW: ${selectedTree.crownEW}m`}
                        </Typography>
                      </Box>
                    </>
                  )}
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>Coordinates:</Typography>
                    <Typography variant="body2" sx={{ textAlign: 'right' }}>
                      {selectedTree.lat.toFixed(6)}, {selectedTree.lon.toFixed(6)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}
        </Box>
      </Drawer>
    </Box>
  )
}

export default TreeMap

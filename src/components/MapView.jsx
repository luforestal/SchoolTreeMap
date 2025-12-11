import React, { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Box, ButtonGroup, Button } from '@mui/material'

const MapView = ({ 
  treeData, 
  boundary, 
  currentStyle, 
  onStyleChange, 
  onTreeSelect 
}) => {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const markersRef = useRef([])

  // Initialize map
  useEffect(() => {
    if (map.current || treeData.length === 0) return

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
      treeData.forEach((tree) => {
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

        // Add click handler
        markerContainer.addEventListener('click', () => {
          document.querySelectorAll('.tree-marker-container').forEach(m => m.classList.remove('active'))
          markerContainer.classList.add('active')
          
          onTreeSelect(tree)
          
          if (map.current) {
            map.current.flyTo({
              center: [tree.lon, tree.lat],
              zoom: 19,
              duration: 1000
            })
          }
        })

        const marker = new maplibregl.Marker({
          element: markerContainer,
          anchor: 'center'
        })
          .setLngLat([tree.lon, tree.lat])
          .addTo(map.current)

        markersRef.current.push(marker)
      })
    })

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right')

  }, [treeData, boundary, onTreeSelect])

  // Handle style changes
  useEffect(() => {
    if (!map.current) return

    let styleConfig = {
      version: 8,
      sources: {},
      layers: []
    }

    switch(currentStyle) {
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

    map.current.setStyle(styleConfig)
    
    // Re-add boundary after style change
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
  }, [currentStyle, boundary])

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

  return (
    <>
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
            onClick={() => onStyleChange('osm')}
          >
            OSM
          </Button>
          <Button 
            variant={currentStyle === 'cartodb' ? 'contained' : 'outlined'}
            onClick={() => onStyleChange('cartodb')}
          >
            CartoDB
          </Button>
          <Button 
            variant={currentStyle === 'satellite' ? 'contained' : 'outlined'}
            onClick={() => onStyleChange('satellite')}
          >
            Satellite
          </Button>
        </ButtonGroup>
      </Box>

      <div ref={mapContainer} style={{ flex: 1, width: '100%', height: '100%' }} />
    </>
  )
}

export default MapView

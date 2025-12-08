import React, { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import './TreeMap.css'
import { loadTreeData } from '../utils/treeDataLoader'
import { boundaryData } from '../data/boundary'

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

  // Load tree data from CSV
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const { trees } = await loadTreeData('/tree_data.csv', {
          username: 'luforestal',
          repo: 'WilletMap',
          branch: 'main'
        })
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
      if (boundaryData) {
        map.current.addSource('boundary', {
          type: 'geojson',
          data: boundaryData
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
        const popupContent = `
          <div class="tree-popup">
            <div><strong>Tree code:</strong> ${tree.treeCode}</div>
            <div><strong>Genus:</strong> ${tree.genus}</div>
            <div><strong>Species:</strong> ${tree.species}</div>
            <div><strong>DBH (cm):</strong> ${tree.dbh || 'N/A'}</div>
            <div><strong>Height (m):</strong> ${tree.height || 'N/A'}</div>
            ${tree.photoUrl ? `<img src="${tree.photoUrl}" alt="Tree photo" class="tree-photo" />` : '<div class="no-photo">No photo available</div>'}
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
        if (boundaryData && !map.current.getSource('boundary')) {
          map.current.addSource('boundary', {
            type: 'geojson',
            data: boundaryData
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

  return (
    <div className="tree-map-container">
      {/* Instructions Modal */}
      {showInstructionsModal && (
        <div className="modal-overlay" onClick={() => setShowInstructionsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🗺️ How to Use This Map</h2>
              <button 
                className="modal-close" 
                onClick={() => setShowInstructionsModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <ul className="instructions-list">
                <li>Click on any tree marker on the map to view details</li>
                <li>View detailed information and photos in the sidebar</li>
                <li>Use the navigation arrows to browse through trees</li>
                <li>Search for specific trees by code, genus, or species</li>
                <li>Switch base maps using the buttons on the left</li>
              </ul>
            </div>
            <div className="modal-footer">
              <button 
                className="modal-button"
                onClick={() => setShowInstructionsModal(false)}
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">Loading tree data...</div>
        </div>
      )}
      {error && (
        <div className="error-overlay">
          <div className="error-message">
            Error loading data: {error}
          </div>
        </div>
      )}
      <div className="map-controls">
        <button 
          className={currentStyle === 'osm' ? 'active' : ''} 
          onClick={() => changeBaseMap('osm')}
        >
          OSM
        </button>
        <button 
          className={currentStyle === 'cartodb' ? 'active' : ''} 
          onClick={() => changeBaseMap('cartodb')}
        >
          CartoDB
        </button>
        <button 
          className={currentStyle === 'satellite' ? 'active' : ''} 
          onClick={() => changeBaseMap('satellite')}
        >
          Satellite
        </button>
      </div>
      <div ref={mapContainer} className="map-container" />
      
      {/* Sidebar - Always visible */}
      <div className="tree-sidebar">
        {/* Sidebar Header */}
        <div className="sidebar-app-header">
          <h1 className="sidebar-app-title">🌳 Willet Elementary</h1>
          <p className="sidebar-app-subtitle">Tree Inventory Map</p>
        </div>
        
        <div className="sidebar-header">
          <h3>{selectedTree ? 'Tree Details' : 'Welcome'}</h3>
          {selectedTree && (
            <button 
              className="clear-button" 
              onClick={() => setSelectedTree(null)}
              aria-label="Clear selection"
            >
              ✕
            </button>
          )}
        </div>
        
        <div className="sidebar-content">
          {!selectedTree ? (
            /* School Info when no tree selected */
            <div className="welcome-section">
              <div className="welcome-content">
                <div className="info-box">
                  <h4>📊 Inventory Overview</h4>
                  <div className="stat-row">
                    <span className="stat-label">Total Trees:</span>
                    <span className="stat-value">{treeData.length}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Unique Genera:</span>
                    <span className="stat-value">
                      {new Set(treeData.map(t => t.genus)).size}
                    </span>
                  </div>
                </div>

                <div className="info-box">
                  <button 
                    className="help-button"
                    onClick={() => setShowInstructionsModal(true)}
                  >
                    ❓ How to Use This Map
                  </button>
                </div>

                <div className="search-section">
                  <h4>🔍 Browse Trees</h4>
                  <input
                    type="text"
                    className="tree-search"
                    placeholder="Search by code, genus, or species..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="tree-list">
                    {filteredTrees.slice(0, 20).map(tree => (
                      <div
                        key={tree.treeCode}
                        className="tree-list-item"
                        onClick={() => handleTreeSelect(tree)}
                      >
                        <div className="tree-list-marker" style={{backgroundColor: tree.color}}></div>
                        <div className="tree-list-info">
                          <strong>{tree.treeCode}</strong>
                          <span className="tree-list-species">{tree.genus} {tree.species}</span>
                        </div>
                      </div>
                    ))}
                    {filteredTrees.length > 20 && (
                      <div className="tree-list-more">
                        +{filteredTrees.length - 20} more trees...
                      </div>
                    )}
                    {filteredTrees.length === 0 && searchQuery && (
                      <div className="tree-list-empty">No trees found</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Tree Details when selected */
            <>
              {/* Navigation */}
              <div className="tree-navigation">
                <button 
                  className="nav-button" 
                  onClick={handlePrevTree}
                  title="Previous tree"
                >
                  ← Previous
                </button>
                <span className="tree-counter">
                  {treeData.findIndex(t => t.treeCode === selectedTree.treeCode) + 1} of {treeData.length}
                </span>
                <button 
                  className="nav-button" 
                  onClick={handleNextTree}
                  title="Next tree"
                >
                  Next →
                </button>
              </div>

              <div className="tree-info-section">
              <div className="info-row">
                <span className="info-label">Tree Code:</span>
                <span className="info-value">{selectedTree.treeCode}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Genus:</span>
                <span className="info-value">{selectedTree.genus}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Species:</span>
                <span className="info-value">{selectedTree.species}</span>
              </div>
              <div className="info-row">
                <span className="info-label">DBH (cm):</span>
                <span className="info-value">{selectedTree.dbh || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Height (m):</span>
                <span className="info-value">{selectedTree.height || 'N/A'}</span>
              </div>
              {(selectedTree.crownNS || selectedTree.crownEW) && (
                <div className="info-row">
                  <span className="info-label">Crown Size:</span>
                  <span className="info-value">
                    {selectedTree.crownNS && `NS: ${selectedTree.crownNS}m`}
                    {selectedTree.crownNS && selectedTree.crownEW && ' / '}
                    {selectedTree.crownEW && `EW: ${selectedTree.crownEW}m`}
                  </span>
                </div>
              )}
              <div className="info-row">
                <span className="info-label">Coordinates:</span>
                <span className="info-value">
                  {selectedTree.lat.toFixed(6)}, {selectedTree.lon.toFixed(6)}
                </span>
              </div>
            </div>
            
            {selectedTree.photoUrl ? (
              <div className="tree-photo-section">
                <img 
                  src={selectedTree.photoUrl} 
                  alt={`Tree ${selectedTree.treeCode}`} 
                  className="sidebar-tree-photo"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'block'
                  }}
                />
                <div className="photo-error" style={{display: 'none'}}>
                  Photo not available
                </div>
              </div>
            ) : (
              <div className="no-photo-section">
                <div className="no-photo-message">No photo available</div>
              </div>
            )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default TreeMap

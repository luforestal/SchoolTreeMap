import React, { useEffect, useState } from 'react'
import './TreeMap.css'
import { loadTreeData } from '../utils/treeDataLoader'
import { getSchoolIdFromURL, getSchoolConfig, loadSchoolBoundary } from '../utils/schoolLoader'
import {
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Fab,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import {
  Home as HomeIcon,
  Help as HelpIcon,
  List as ListIcon,
} from '@mui/icons-material'
import MapView from './MapView'
import TreeSidebar from './TreeSidebar'
import TreeDetails from './TreeDetails'
import SchoolOverview from './SchoolOverview'
import InstructionsModal from './InstructionsModal'

const TreeMap = () => {
  const [currentStyle, setCurrentStyle] = useState('cartodb')
  const [treeData, setTreeData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTree, setSelectedTree] = useState(null)
  const [showInstructionsModal, setShowInstructionsModal] = useState(true)
  const [schoolConfig, setSchoolConfig] = useState(null)
  const [boundary, setBoundary] = useState(null)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const mapRef = React.useRef(null)
  
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // Load school configuration and data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        const schoolId = getSchoolIdFromURL()
        const config = await getSchoolConfig(schoolId)
        setSchoolConfig(config)
        
        const boundaryGeoJSON = await loadSchoolBoundary(config.boundaryUrl)
        setBoundary(boundaryGeoJSON)
        
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

  const handleTreeSelect = (tree) => {
    setSelectedTree(tree)
    
    // Remove active class from all markers
    document.querySelectorAll('.tree-marker-container').forEach(m => m.classList.remove('active'))
    // Add active class to selected tree marker
    const selectedMarker = document.querySelector(`[data-tree-code="${tree.treeCode}"]`)
    if (selectedMarker) {
      selectedMarker.classList.add('active')
    }
    
    // Center map on selected tree
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [tree.lon, tree.lat],
        zoom: 19,
        duration: 1000
      })
    }
    
    // Open bottom sheet on mobile when tree is selected
    if (isMobile) {
      setMobileDrawerOpen(true)
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

  return (
    <Box sx={{ display: 'flex', width: '100%', height: '100%', position: 'relative' }}>
      {/* Instructions Modal */}
      <InstructionsModal 
        open={showInstructionsModal} 
        onClose={() => setShowInstructionsModal(false)} 
      />

      {/* Loading State */}
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
              <Box>Loading tree data...</Box>
            </CardContent>
          </Card>
        </Box>
      )}
      
      {/* Error State */}
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
      
      {/* Mobile: Show List Button */}
      {isMobile && (
        <Fab
          size="medium"
          sx={{ 
            position: 'absolute', 
            bottom: 20, 
            right: 20, 
            zIndex: 5,
            bgcolor: '#2d5016',
            color: 'white',
            '&:hover': {
              bgcolor: '#1e3610',
            }
          }}
          onClick={() => setMobileDrawerOpen(true)}
          title="View tree list"
        >
          <ListIcon fontSize="small" />
        </Fab>
      )}
      
      {/* Map View */}
      <MapView
        treeData={treeData}
        boundary={boundary}
        currentStyle={currentStyle}
        onStyleChange={setCurrentStyle}
        onTreeSelect={handleTreeSelect}
        mapRef={mapRef}
      />
      
      {/* Sidebar */}
      <TreeSidebar
        schoolConfig={schoolConfig}
        selectedTree={selectedTree}
        onClose={() => setSelectedTree(null)}
        mobileOpen={mobileDrawerOpen}
        onMobileOpen={() => setMobileDrawerOpen(true)}
        onMobileClose={() => setMobileDrawerOpen(false)}
      >
        {selectedTree ? (
          <TreeDetails
            tree={selectedTree}
            treeCount={treeData.length}
            currentIndex={treeData.findIndex(t => t.treeCode === selectedTree.treeCode)}
            onNext={handleNextTree}
            onPrev={handlePrevTree}
          />
        ) : (
          <SchoolOverview
            treeData={treeData}
            onTreeSelect={handleTreeSelect}
          />
        )}
      </TreeSidebar>
    </Box>
  )
}

export default TreeMap

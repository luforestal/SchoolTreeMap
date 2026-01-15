import React from 'react'
import { Drawer, Box, Typography, IconButton, useMediaQuery, useTheme, SwipeableDrawer } from '@mui/material'
import { Close as CloseIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material'

const SIDEBAR_WIDTH = 400

// Desktop Sidebar Component
const DesktopSidebar = ({ schoolConfig, selectedTree, onClose, children }) => (
  <Drawer
    variant="permanent"
    anchor="right"
    sx={{
      width: SIDEBAR_WIDTH,
      flexShrink: 0,
      '& .MuiDrawer-paper': {
        width: SIDEBAR_WIDTH,
        boxSizing: 'border-box',
        position: 'absolute',
      },
    }}
  >
    <SidebarHeader schoolConfig={schoolConfig} />
    <SidebarSubheader selectedTree={selectedTree} onClose={onClose} />
    <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
      {children}
    </Box>
  </Drawer>
)

// Mobile Bottom Sheet Component
const MobileBottomSheet = ({ schoolConfig, selectedTree, onClose, children, open, onOpen }) => {
  const drawerBleeding = 80 // Height of the visible portion when minimized
  
  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={onOpen}
      swipeAreaWidth={drawerBleeding}
      disableSwipeToOpen={false}
      ModalProps={{
        keepMounted: true,
      }}
      sx={{
        '& .MuiDrawer-paper': {
          height: `calc(85% - ${drawerBleeding}px)`,
          overflow: 'visible',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        },
      }}
    >
      {/* Puller Handle */}
      <Box
        sx={{
          position: 'absolute',
          top: -drawerBleeding,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          visibility: 'visible',
          right: 0,
          left: 0,
          backgroundColor: 'white',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
        }}
      >
        {/* Drag handle */}
        <Box
          sx={{
            width: 40,
            height: 5,
            backgroundColor: '#ddd',
            borderRadius: 3,
            position: 'absolute',
            top: 8,
            left: 'calc(50% - 20px)',
          }}
        />
        
        {/* Mini Header */}
        <Box
          sx={{
            p: 2,
            pt: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2d5016' }}>
              🌳 {selectedTree ? selectedTree.treeCode : (schoolConfig?.schoolName || 'Tree Map')}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {selectedTree ? selectedTree.species : 'Swipe up for details'}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onOpen}>
            <ExpandLessIcon />
          </IconButton>
        </Box>
      </Box>
      
      {/* Content */}
      <Box sx={{ overflow: 'auto', height: '100%', p: 2 }}>
        {children}
      </Box>
    </SwipeableDrawer>
  )
}

// Shared Header Component
const SidebarHeader = ({ schoolConfig }) => (
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
)

// Shared Subheader Component
const SidebarSubheader = ({ selectedTree, onClose }) => (
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
      {selectedTree ? 'Tree Details' : 'Overview'}
    </Typography>
    {selectedTree && (
      <IconButton onClick={onClose} size="small">
        <CloseIcon />
      </IconButton>
    )}
  </Box>
)

const TreeSidebar = ({ 
  schoolConfig, 
  selectedTree, 
  onClose, 
  children,
  mobileOpen,
  onMobileOpen,
  onMobileClose,
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  if (isMobile) {
    return (
      <MobileBottomSheet
        schoolConfig={schoolConfig}
        selectedTree={selectedTree}
        onClose={onMobileClose || onClose}
        onOpen={onMobileOpen || (() => {})}
        open={mobileOpen}
      >
        {children}
      </MobileBottomSheet>
    )
  }

  return (
    <DesktopSidebar
      schoolConfig={schoolConfig}
      selectedTree={selectedTree}
      onClose={onClose}
    >
      {children}
    </DesktopSidebar>
  )
}

export default TreeSidebar

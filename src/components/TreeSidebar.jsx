import React from 'react'
import { Drawer, Box, Typography, IconButton } from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'

const TreeSidebar = ({ 
  schoolConfig, 
  selectedTree, 
  onClose, 
  children 
}) => {
  return (
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
      
      {/* Sidebar Subheader */}
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
      
      {/* Sidebar Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {children}
      </Box>
    </Drawer>
  )
}

export default TreeSidebar

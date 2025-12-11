import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  List,
  ListItem,
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'

const InstructionsModal = ({ open, onClose }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        🗺️ How to Use This Map
        <IconButton onClick={onClose} size="small">
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
        <Button variant="contained" onClick={onClose}>
          Got it!
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default InstructionsModal

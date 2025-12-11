import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Button,
  Divider,
} from '@mui/material'

const SchoolOverview = ({ 
  treeData, 
  onTreeSelect 
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [visibleTreeCount, setVisibleTreeCount] = useState(20)

  const filteredTrees = treeData.filter(tree => 
    tree.treeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tree.genus.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tree.species.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Reset visible count when search changes
  useEffect(() => {
    setVisibleTreeCount(20)
  }, [searchQuery])

  const handleLoadMore = () => {
    setVisibleTreeCount(prev => prev + 20)
  }

  return (
    <Box>
      {/* Statistics Card */}
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

      {/* Tree Browser */}
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
            <ListItemButton key={tree.treeCode} onClick={() => onTreeSelect(tree)}>
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
  )
}

export default SchoolOverview

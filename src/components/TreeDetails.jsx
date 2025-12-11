import React, { useState } from 'react'
import { Box, Button, Card, CardContent, Typography, Divider, CircularProgress } from '@mui/material'
import { NavigateBefore as PrevIcon, NavigateNext as NextIcon } from '@mui/icons-material'

const TreeDetails = ({ 
  tree, 
  treeCount, 
  currentIndex, 
  onNext, 
  onPrev 
}) => {
  const [imageLoading, setImageLoading] = useState(!!tree.photoUrl)

  return (
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
          onClick={onPrev}
          variant="outlined"
        >
          Previous
        </Button>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {currentIndex + 1} of {treeCount}
        </Typography>
        <Button
          size="small"
          endIcon={<NextIcon />}
          onClick={onNext}
          variant="outlined"
        >
          Next
        </Button>
      </Box>

      {/* Photo Section */}
      <Box sx={{ mb: 2 }} key={tree.treeCode}>
        {tree.photoUrl ? (
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
              src={tree.photoUrl}
              alt={`Tree ${tree.treeCode}`}
              style={{
                width: '100%',
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                display: imageLoading ? 'none' : 'block',
              }}
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />
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
            <Typography variant="body2">{tree.treeCode}</Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>Genus:</Typography>
            <Typography variant="body2">{tree.genus}</Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>Species:</Typography>
            <Typography variant="body2">{tree.species}</Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>DBH (cm):</Typography>
            <Typography variant="body2">{tree.dbh || 'N/A'}</Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>Height (m):</Typography>
            <Typography variant="body2">{tree.height || 'N/A'}</Typography>
          </Box>
          {(tree.crownNS || tree.crownEW) && (
            <>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>Crown Size:</Typography>
                <Typography variant="body2">
                  {tree.crownNS && `NS: ${tree.crownNS}m`}
                  {tree.crownNS && tree.crownEW && ' / '}
                  {tree.crownEW && `EW: ${tree.crownEW}m`}
                </Typography>
              </Box>
            </>
          )}
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>Coordinates:</Typography>
            <Typography variant="body2" sx={{ textAlign: 'right' }}>
              {tree.lat.toFixed(6)}, {tree.lon.toFixed(6)}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default TreeDetails

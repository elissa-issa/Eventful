import { Box, Card } from '@mui/material'
import { COLORS } from '../../constants/colors'

function VendorCard({ imageSrc, imageAlt, imageSx }) {
  return (
    <Card
      elevation={0}
      sx={{
        width: '100%',
        minWidth: 280,
        maxWidth: 320,
        height: 96,
        px: 2,
        borderRadius: 2,
        border: `1px solid ${COLORS.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.surface,
      }}
    >
      <Box
        component="img"
        src={imageSrc}
        alt={imageAlt}
        sx={{
          width: '100%',
          maxWidth: 250,
          maxHeight: 64,
          objectFit: 'contain',
          display: 'block',
          ...imageSx,
        }}
      />
    </Card>
  )
}

export default VendorCard

import { Box, Card } from '@mui/material'
import { COLORS } from '../../constants/colors'

function VendorCard({ imageSrc, imageAlt }) {
  return (
    <Card
      elevation={0}
      sx={{
        width: '100%',
        minWidth: 250,
        maxWidth: 280,
        height: 86,
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
          maxWidth: 220,
          maxHeight: 56,
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </Card>
  )
}

export default VendorCard

import { Box, Card } from '@mui/material'
import { COLORS } from '../../constants/colors'

function VendorCard({ imageSrc, imageAlt, imageSx, onClick }) {
  return (
    <Card
      elevation={0}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(event) => {
        if (onClick && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault()
          onClick()
        }
      }}
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
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 160ms ease, transform 160ms ease',
        '&:hover': onClick
          ? {
              borderColor: COLORS.primary,
              transform: 'translateY(-2px)',
            }
          : undefined,
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

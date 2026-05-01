import AddRoundedIcon from '@mui/icons-material/AddRounded'
import { Box, Typography } from '@mui/material'
import { COLORS } from '../../constants/colors'

function CreateCollectionCard({
  label = 'Create New Collection',
  height = 260,
  onClick,
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        width: '100%',
        height,
        minHeight: height,
        flexShrink: 0,
        border: 0,
        borderRadius: 2,
        backgroundColor: '#e5e5e5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2.25,
        cursor: 'pointer',
        transition: 'transform 180ms ease, background-color 180ms ease',
        '&:hover': {
          backgroundColor: '#dfdfdf',
          transform: 'translateY(-3px)',
        },
      }}
    >
      <Box
        sx={{
          width: 66,
          height: 66,
          borderRadius: '50%',
          border: `3px solid ${COLORS.primaryMuted}`,
          color: COLORS.primary,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <AddRoundedIcon sx={{ fontSize: 44 }} />
      </Box>

      <Typography
        sx={{
          color: COLORS.primary,
          fontWeight: 800,
          fontSize: { xs: '0.95rem', sm: '1rem' },
          textTransform: 'uppercase',
          textAlign: 'center',
        }}
      >
        {label}
      </Typography>
    </Box>
  )
}

export default CreateCollectionCard

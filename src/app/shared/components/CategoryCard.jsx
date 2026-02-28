import { Box, Button, Card, Stack, Typography } from '@mui/material'
import { COLORS } from '../../constants/colors'

function CategoryCard({
  title,
  description,
  buttonLabel,
  onButtonClick,
  imageSrc,
  imageAlt,
}) {
  return (
    <Card
      elevation={0}
      sx={{
        width: '100%',
        minWidth: { xs: 300, sm: 440 },
        maxWidth: 480,
        borderRadius: 1.5,
        overflow: 'hidden',
      }}
    >
      <Stack direction="row" sx={{ minHeight: 190 }}>
        <Box
          sx={{
            width: '40%',
            minWidth: 150,
            backgroundColor: COLORS.primary,
            color: COLORS.surface,
            p: 2.5,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                textTransform: 'uppercase',
                fontSize: '1rem',
                mb: 1.5,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: COLORS.primarySoft,
                lineHeight: 1.5,
                fontSize: '0.85rem',
              }}
            >
              {description}
            </Typography>
          </Box>

          <Button
            disableElevation
            variant="contained"
            onClick={onButtonClick}
            sx={{
              alignSelf: 'flex-start',
              mt: 2,
              borderRadius: 0.5,
              backgroundColor: COLORS.accent,
              textTransform: 'none',
              fontWeight: 700,
              px: 2.5,
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: COLORS.accentHover,
                boxShadow: 'none',
              },
            }}
          >
            {buttonLabel}
          </Button>
        </Box>

        <Box
          component="img"
          src={imageSrc}
          alt={imageAlt}
          sx={{
            width: '60%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </Stack>
    </Card>
  )
}

export default CategoryCard

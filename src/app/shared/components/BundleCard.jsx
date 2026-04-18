import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded'
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded'
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import { COLORS } from '../../constants/colors'

function BundleCard({
  imageSrc,
  imageAlt,
  title,
  isFavorite = false,
  onFavoriteToggle,
  leftText,
  rightText,
  primaryButtonLabel,
  onPrimaryButtonClick,
  secondaryButtonLabel,
  onSecondaryButtonClick,
  maxWidth = 320,
  imageHeight = 230,
  cardBorderRadius = 1.5,
  contentPaddingX = 0,
  contentPaddingTop = 0,
  contentPaddingBottom = 16,
}) {
  return (
    <Card
      elevation={0}
      sx={{
        width: '100%',
        maxWidth,
        borderRadius: cardBorderRadius,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ position: 'relative', height: imageHeight }}>
        <Box
          component="img"
          src={imageSrc}
          alt={imageAlt}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            borderRadius: cardBorderRadius,
          }}
        />
        <IconButton
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          onClick={onFavoriteToggle}
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 36,
            height: 36,
            backgroundColor: COLORS.surface,
            color: isFavorite ? COLORS.accent : COLORS.favorite,
            '&:hover': {
              backgroundColor: COLORS.surface,
            },
          }}
        >
          {isFavorite ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
        </IconButton>
      </Box>

      <CardContent
        sx={{
          px: contentPaddingX,
          pt: contentPaddingTop,
          pb: `${contentPaddingBottom}px`,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: COLORS.primary,
            fontWeight: 800,
            fontSize: '1.2rem',
            textTransform: 'uppercase',
            lineHeight: 1.1,
            mb: 0.75,
          }}
        >
          {title}
        </Typography>

        <Stack
          direction="row"
          justifyContent="space-between"
          useFlexGap
          sx={{ mb: 2, gap: 2 }}
        >
          <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
            {leftText}
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.textLight }}>
            {rightText}
          </Typography>
        </Stack>

        <Stack direction="row" useFlexGap sx={{ gap: 1.5 }}>
          <Button
            fullWidth
            disableElevation
            variant="contained"
            onClick={onPrimaryButtonClick}
            sx={{
              borderRadius: 0.5,
              backgroundColor: COLORS.accent,
              textTransform: 'none',
              fontWeight: 700,
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: COLORS.accentHover,
                boxShadow: 'none',
              },
            }}
          >
            {primaryButtonLabel}
          </Button>

          <Button
            fullWidth
            disableElevation
            variant="contained"
            onClick={onSecondaryButtonClick}
            sx={{
              borderRadius: 0.5,
              backgroundColor: COLORS.primary,
              textTransform: 'none',
              fontWeight: 700,
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: COLORS.primaryHover,
                boxShadow: 'none',
              },
            }}
          >
            {secondaryButtonLabel}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default BundleCard

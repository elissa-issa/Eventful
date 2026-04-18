import StarRoundedIcon from '@mui/icons-material/StarRounded'
import { Avatar, Box, Button, Divider, Rating, Stack, Typography } from '@mui/material'
import { COLORS } from '../../constants/colors'

function ReviewsSection({
  title = 'Reviews',
  averageRating = 4.5,
  reviewCount = 120,
  reviews = [],
  onAddReviewClick,
  onViewAllClick,
  addReviewLabel = '+ Add Review',
  viewAllLabel = 'View All',
}) {
  const visibleReviews = reviews.slice(0, 2)

  return (
    <Box
      sx={{
        mt: 3,
        border: `2px solid ${COLORS.primary}`,
        borderRadius: 2,
        px: { xs: 2, md: 2.5 },
        py: { xs: 2, md: 2.25 },
        backgroundColor: COLORS.surface,
      }}
    >
      <Stack spacing={2}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ gap: 2 }}
        >
          <Typography
            variant="h4"
            sx={{
              color: COLORS.primary,
              fontWeight: 800,
              fontSize: { xs: '1.8rem', md: '2rem' },
            }}
          >
            {title}
          </Typography>

          <Rating
            value={averageRating}
            precision={0.5}
            readOnly
            icon={<StarRoundedIcon fontSize="inherit" />}
            emptyIcon={<StarRoundedIcon fontSize="inherit" />}
            sx={{
              color: COLORS.accent,
              '& .MuiSvgIcon-root': {
                fontSize: 30,
              },
            }}
          />
        </Stack>

        <Divider sx={{ borderColor: COLORS.borderStrong }} />

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ gap: 2 }}
        >
          <Typography sx={{ color: COLORS.accent, fontSize: '1.05rem', fontWeight: 500 }}>
            All Reviews ({reviewCount})
          </Typography>

          <Button
            variant="text"
            onClick={onAddReviewClick}
            sx={{
              minWidth: 0,
              p: 0,
              color: COLORS.accent,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              '&:hover': {
                backgroundColor: 'transparent',
                textDecoration: 'underline',
              },
            }}
          >
            {addReviewLabel}
          </Button>
        </Stack>

        <Stack spacing={2}>
          {visibleReviews.map((review) => (
            <Box
              key={review.id}
              sx={{
                border: `1px solid ${COLORS.border}`,
                borderRadius: 2,
                px: 1.75,
                py: 1.5,
                boxShadow: `0 1px 4px ${COLORS.shadow}`,
              }}
            >
              <Stack spacing={1.2}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ gap: 2 }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.2}>
                    <Avatar
                      src={review.avatarSrc}
                      alt={review.author}
                      sx={{ width: 34, height: 34 }}
                    />
                    <Typography
                      sx={{ color: COLORS.primaryDark, fontSize: '0.95rem', fontWeight: 600 }}
                    >
                      {review.author}
                    </Typography>
                    <Typography sx={{ color: COLORS.textLight, fontSize: '1rem' }}>•</Typography>
                    <Typography sx={{ color: COLORS.textMuted, fontSize: '0.95rem' }}>
                      {review.dateLabel}
                    </Typography>
                  </Stack>

                  <Rating
                    value={review.rating}
                    precision={0.5}
                    readOnly
                    icon={<StarRoundedIcon fontSize="inherit" />}
                    emptyIcon={<StarRoundedIcon fontSize="inherit" />}
                    sx={{
                      color: COLORS.accent,
                      '& .MuiSvgIcon-root': {
                        fontSize: 26,
                      },
                    }}
                  />
                </Stack>

                <Typography
                  sx={{
                    color: COLORS.primaryDark,
                    fontSize: '0.97rem',
                    lineHeight: 1.55,
                  }}
                >
                  {review.content}
                </Typography>
              </Stack>
            </Box>
          ))}
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Divider sx={{ flex: 1, borderColor: COLORS.accent }} />
          <Button
            variant="text"
            onClick={onViewAllClick}
            sx={{
              minWidth: 0,
              p: 0,
              color: COLORS.accent,
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: 'transparent',
                textDecoration: 'underline',
              },
            }}
          >
            {viewAllLabel}
          </Button>
          <Divider sx={{ flex: 1, borderColor: COLORS.accent }} />
        </Stack>
      </Stack>
    </Box>
  )
}

export default ReviewsSection

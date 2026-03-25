import { useMemo, useState } from 'react'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import {
  Avatar,
  Box,
  Button,
  Dialog,
  Divider,
  IconButton,
  Rating,
  Stack,
  Typography,
} from '@mui/material'
import { COLORS } from '../../constants/colors'

const INITIAL_VISIBLE_REVIEWS = 10
const LOAD_MORE_COUNT = 5

function ReviewsDrawer({
  open,
  onClose,
  title = 'Reviews',
  averageRating = 4.5,
  reviewCount = 120,
  reviews = [],
  onAddReviewClick,
  addReviewLabel = '+ Add Review',
  loadMoreLabel = 'Load More',
}) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_REVIEWS)

  const visibleReviews = useMemo(
    () => reviews.slice(0, visibleCount),
    [reviews, visibleCount],
  )
  const hasMoreReviews = visibleCount < reviews.length

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: '100%',
          maxWidth: 760,
          maxHeight: 'min(88vh, 760px)',
          borderRadius: 2.5,
          overflow: 'hidden',
          backgroundColor: COLORS.surface,
        },
      }}
    >
      <Stack
        sx={{
          height: '100%',
          minHeight: 0,
          px: { xs: 2, sm: 3 },
          py: 2,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ gap: 2, mb: 1.5 }}
        >
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Typography
              variant="h4"
              sx={{
                color: COLORS.primary,
                fontWeight: 800,
                fontSize: { xs: '1.7rem', md: '1.9rem' },
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
                  fontSize: 26,
                },
              }}
            />
          </Stack>

          <IconButton
            aria-label="Close reviews drawer"
            onClick={onClose}
            sx={{ color: COLORS.primary, p: 0.25 }}
          >
            <CloseRoundedIcon sx={{ fontSize: 32 }} />
          </IconButton>
        </Stack>

        <Divider sx={{ borderColor: COLORS.borderStrong, mb: 1.5 }} />

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ gap: 2, mb: 1.75 }}
        >
          <Typography sx={{ color: COLORS.accent, fontSize: '1.02rem', fontWeight: 500 }}>
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
              fontSize: '0.98rem',
              '&:hover': {
                backgroundColor: 'transparent',
                textDecoration: 'underline',
              },
            }}
          >
            {addReviewLabel}
          </Button>
        </Stack>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            pr: 1,
            pb: 0.75,
          }}
        >
          <Stack spacing={1.5}>
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
                <Stack spacing={1.1}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ gap: 2 }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.1}>
                      <Avatar
                        src={review.avatarSrc}
                        alt={review.author}
                        sx={{ width: 32, height: 32 }}
                      />
                      <Typography
                        sx={{ color: COLORS.primaryDark, fontSize: '0.94rem', fontWeight: 600 }}
                      >
                        {review.author}
                      </Typography>
                      <Typography sx={{ color: COLORS.textLight, fontSize: '0.92rem' }}>
                        •
                      </Typography>
                      <Typography sx={{ color: COLORS.textMuted, fontSize: '0.93rem' }}>
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
                          fontSize: 22,
                        },
                      }}
                    />
                  </Stack>

                  <Typography
                    sx={{
                      color: COLORS.primaryDark,
                      fontSize: '0.94rem',
                      lineHeight: 1.5,
                    }}
                  >
                    {review.content}
                  </Typography>
                </Stack>
              </Box>
            ))}
          </Stack>

          {hasMoreReviews ? (
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ pt: 2, pb: 0.5 }}>
              <Divider sx={{ flex: 1, borderColor: COLORS.accent }} />
              <Button
                variant="text"
                onClick={() =>
                  setVisibleCount((current) =>
                    Math.min(current + LOAD_MORE_COUNT, reviews.length),
                  )
                }
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
                {loadMoreLabel}
              </Button>
              <Divider sx={{ flex: 1, borderColor: COLORS.accent }} />
            </Stack>
          ) : null}
        </Box>
      </Stack>
    </Dialog>
  )
}

export default ReviewsDrawer

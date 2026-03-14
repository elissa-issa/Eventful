import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import {
  Button,
  Drawer,
  IconButton,
  Rating,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { COLORS } from '../../constants/colors'

function AddReviewDrawer({
  open,
  onClose,
  title = 'Add Review',
  rateLabel = 'Rate',
  reviewValue = '',
  onReviewChange,
  reviewPlaceholder = 'Enter your review',
  ratingValue = 0,
  onRatingChange,
  addPictureText = 'Add Picture',
  onAddPictureClick,
  postReviewText = 'Post Review',
  onPostReviewClick,
}) {
  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: '100%',
          maxWidth: 520,
          mx: 'auto',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          overflow: 'hidden',
        },
      }}
    >
      <Stack sx={{ bgcolor: COLORS.surface }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            px: 2.5,
            py: 1.75,
            borderBottom: `1px solid ${COLORS.border}`,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              color: COLORS.primary,
              fontWeight: 800,
              fontSize: '1rem',
            }}
          >
            {title}
          </Typography>

          <IconButton
            aria-label="Close add review drawer"
            onClick={onClose}
            sx={{ color: COLORS.primary, p: 0.25 }}
          >
            <CloseRoundedIcon sx={{ fontSize: 34 }} />
          </IconButton>
        </Stack>

        <Stack spacing={2.25} sx={{ px: 2.5, py: 1.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography
              variant="subtitle1"
              sx={{
                color: COLORS.primary,
                fontWeight: 800,
                fontSize: '0.95rem',
              }}
            >
              {rateLabel}
            </Typography>

            <Rating
              value={ratingValue}
              onChange={(_, newValue) => onRatingChange?.(newValue ?? 0)}
              icon={<StarRoundedIcon fontSize="inherit" />}
              emptyIcon={<StarRoundedIcon fontSize="inherit" />}
              sx={{
                color: '#b6b6b6',
                '& .MuiRating-iconFilled': {
                  color: '#f4b400',
                },
                '& .MuiSvgIcon-root': {
                  fontSize: 28,
                },
              }}
            />
          </Stack>

          <TextField
            multiline
            minRows={4}
            value={reviewValue}
            onChange={(event) => onReviewChange?.(event.target.value)}
            placeholder={reviewPlaceholder}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                alignItems: 'flex-start',
                borderRadius: 1,
                backgroundColor: '#fafafa',
              },
              '& .MuiOutlinedInput-input': {
                fontSize: '0.9rem',
                color: COLORS.textMuted,
              },
            }}
          />

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            sx={{ pb: 1 }}
          >
            <Button
              disableElevation
              variant="contained"
              onClick={onAddPictureClick}
              sx={{
                minWidth: 160,
                borderRadius: 1,
                backgroundColor: COLORS.primary,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.95rem',
                py: 1,
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: COLORS.primaryHover,
                  boxShadow: 'none',
                },
              }}
            >
              {addPictureText}
            </Button>

            <Button
              disableElevation
              variant="contained"
              onClick={onPostReviewClick}
              sx={{
                minWidth: 160,
                borderRadius: 1,
                backgroundColor: COLORS.accent,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.95rem',
                py: 1,
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: COLORS.accentHover,
                  boxShadow: 'none',
                },
              }}
            >
              {postReviewText}
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Drawer>
  )
}

export default AddReviewDrawer

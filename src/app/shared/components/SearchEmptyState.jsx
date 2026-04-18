import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import { Box, Stack, Typography } from '@mui/material'
import { COLORS } from '../../constants/colors'

function SearchEmptyState({ query }) {
  return (
    <Box
      sx={{
        width: '100%',
        minHeight: 420,
        px: 3,
        py: { xs: 6, md: 8 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Stack spacing={2} alignItems="center" sx={{ textAlign: 'center', maxWidth: 380 }}>
        <Box
          sx={{
            width: 160,
            height: 160,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SearchRoundedIcon
            sx={{
              fontSize: 206,
              color: COLORS.primary,
            }}
          />
        </Box>

        <Stack spacing={0.75}>
          <Typography
            sx={{
              color: COLORS.primary,
              fontSize: { xs: '1.8rem', md: '2rem' },
              fontWeight: 800,
              lineHeight: 1.1,
            }}
          >
            No Results Found!
          </Typography>
          <Typography sx={{ color: COLORS.textMuted, fontSize: '1rem', lineHeight: 1.5 }}>
            We&apos;re sorry we couldn&apos;t find a match for &quot;{query}&quot;.
          </Typography>
          <Typography sx={{ color: COLORS.textLight, fontSize: '0.95rem' }}>
            Please try another word.
          </Typography>
        </Stack>
      </Stack>
    </Box>
  )
}

export default SearchEmptyState

import { Box, Button, Stack } from '@mui/material'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { COLORS } from '../../constants/colors'
import { serviceNavItems } from './navItems'

function ServicesSubnav() {
  const location = useLocation()
  const activeHash = location.hash || '#menus'

  return (
    <Box
      sx={{
        width: '100vw',
        position: 'relative',
        left: '50%',
        transform: 'translateX(-50%)',
        borderTop: `1px solid ${COLORS.borderStrong}`,
        backgroundColor: COLORS.surface,
      }}
    >
      <Box
        sx={{
          maxWidth: 1040,
          mx: 'auto',
          px: { xs: 2, sm: 3 },
          py: 1.25,
        }}
      >
        <Stack
          direction="row"
          justifyContent="center"
          useFlexGap
          sx={{
            gap: 1,
            flexWrap: 'wrap',
            px: { xs: 1, sm: 2 },
            py: 0.75,
            borderRadius: 1.5,
            backgroundColor: COLORS.primary,
          }}
        >
          {[...serviceNavItems]
            .sort((leftItem, rightItem) => {
              const order = ['#bundles', '#venues', '#menus', '#decorations', '#entertainment']

              return order.indexOf(leftItem.hash) - order.indexOf(rightItem.hash)
            })
            .map((item) => {
            const isActive = activeHash === item.hash

            return (
              <Button
                key={item.hash}
                component={RouterLink}
                to={{ pathname: '/services', hash: item.hash }}
                disableElevation
                sx={{
                  minWidth: 110,
                  px: 2,
                  py: 0.8,
                  borderRadius: 1,
                  color: COLORS.surface,
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.14)',
                  },
                }}
              >
                {item.label}
              </Button>
            )
            })}
        </Stack>
      </Box>
    </Box>
  )
}

export default ServicesSubnav

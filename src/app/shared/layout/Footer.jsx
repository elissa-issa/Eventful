import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined'
import InstagramIcon from '@mui/icons-material/Instagram'
import { Box, Container, IconButton, Link, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { COLORS } from '../../constants/colors'

const footerLinks = [
  { label: 'Services', path: '/services' },
  { label: 'Home', path: '/home' },
  { label: 'Bundles', path: '/services#bundles' },
  { label: 'Customize', path: '/customize' },
  { label: 'Venues', path: '/services#venues' },
  { label: 'Contact Us', path: '/contact-us' },
  { label: 'Menus', path: '/services#menus' },
  { label: 'Vendors', path: '/vendors' },
  { label: 'Decorations', path: '/services#decorations' },
  { label: 'Inspiration', path: '/inspiration' },
  { label: 'Entertainment', path: '/services#entertainment' },
]

function Footer() {
  return (
    <Box component="footer" sx={{ mt: 'auto', backgroundColor: COLORS.footer, color: COLORS.surface }}>
      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 5 } }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          spacing={{ xs: 4, md: 6 }}
        >
          <Box sx={{ maxWidth: 280 }}>
            <Typography variant="h3" sx={{ fontWeight: 900, lineHeight: 1, mb: 1.5 }}>
              EVENTFUL
            </Typography>
            <Typography variant="body2" sx={{ color: COLORS.footerText, lineHeight: 1.6 }}>
              To help you plan all your special occasions and events with just one click
            </Typography>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 4, sm: 8 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                Nav Links
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(110px, 1fr))',
                  gap: 1,
                }}
              >
                {footerLinks.map((linkItem) => (
                  <Link
                    key={`${linkItem.label}-${linkItem.path}`}
                    component={RouterLink}
                    to={linkItem.path}
                    underline="none"
                    sx={{
                      color: COLORS.footerText,
                      fontSize: '0.9rem',
                      '&:hover': {
                        color: COLORS.surface,
                      },
                    }}
                  >
                    {linkItem.label}
                  </Link>
                ))}
              </Box>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                Follow Us
              </Typography>
              <Stack direction="row" spacing={1}>
                <IconButton sx={{ color: COLORS.surface }}>
                  <EmailOutlinedIcon />
                </IconButton>
                <IconButton sx={{ color: COLORS.surface }}>
                  <FacebookOutlinedIcon />
                </IconButton>
                <IconButton sx={{ color: COLORS.surface }}>
                  <InstagramIcon />
                </IconButton>
              </Stack>
            </Box>
          </Stack>
        </Stack>

        <Box sx={{ mt: 4, pt: 2, borderTop: `1px solid ${COLORS.footerBorder}` }}>
          <Typography variant="caption" sx={{ color: COLORS.footerMuted }}>
            @2025 Eventful Inc. Terms. Privacy. Your Privacy Choices. I, A-Z Index
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}

export default Footer

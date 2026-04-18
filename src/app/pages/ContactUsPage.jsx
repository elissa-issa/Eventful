
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined'
import { Box, Stack, Typography } from '@mui/material'
import { COLORS } from '../constants/colors'
import ContactUsForm from '../shared/components/ContactUsForm'
import ContactInfoCard from '../shared/components/ContactInfoCard'

const CONTACT_ITEMS = [
  {
    icon: LocalPhoneOutlinedIcon,
    title: 'Call us:',
    description: '+961 123 456789',
  },
  {
    icon: EmailOutlinedIcon,
    title: 'Email us:',
    description: 'support@eventful.com',
  },
  {
    icon: AccessTimeOutlinedIcon,
    title: 'Our Working Hours:',
    description:
      'Monday - Friday: 9:00 AM - 5:00 PM\nSaturday: 10:00 AM - 3:00 PM\nSunday: Closed',
  },
]

function ContactUsPage() {
  return (
    <Box sx={{ py: { xs: 4, md: 6 } }}>
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          color: COLORS.primary,
          fontWeight: 800,
          fontSize: { xs: '2rem', md: '2.25rem' },
        }}
      >
        Get in Touch
      </Typography>

      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={{ xs: 3, md: 5, lg: 6 }}
        alignItems={{ xs: 'stretch', lg: 'flex-start' }}
      >
        <Box sx={{ flex: 1.15 }}>
          <ContactUsForm />
        </Box>

        <Stack
          spacing={3}
          sx={{
            flex: 0.85,
            width: '100%',
            pt: { xs: 0, lg: 0.5 },
          }}
        >
          {CONTACT_ITEMS.map((item) => (
            <ContactInfoCard
              key={item.title}
              icon={item.icon}
              title={item.title}
              description={item.description}
            />
          ))}
        </Stack>
      </Stack>
    </Box>
  )
}

export default ContactUsPage

import { COLORS } from './colors'

export const profileFields = [
  { label: 'First Name', value: 'John', size: { xs: 12, md: 6 } },
  { label: 'Last Name', value: 'Doe', size: { xs: 12, md: 6 } },
  { label: 'Username', value: 'JohnDoe123', size: { xs: 12, md: 6 } },
  { label: 'Email', value: 'johndoe1@gmail.com', size: { xs: 12, md: 6 } },
  { label: 'Password', value: '..............', size: { xs: 12, md: 6 } },
  { label: 'Phone Number', value: '+961 03/986542', size: { xs: 12, md: 6 } },
]

export const profileOrders = [
  {
    id: 1,
    item: 'Prom Night',
    status: 'Delivered',
    total: '$2000',
    statusColor: '#2ecc55',
  },
  {
    id: 2,
    item: 'Prom Night',
    status: 'Pending',
    total: '$2000',
    statusColor: '#b7b7b7',
  },
]

export const profileLocations = [
  { id: 1, label: 'Home Baabda' },
  { id: 2, label: 'Home Bhamdoun' },
]

export const profileFieldStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 1.5,
    backgroundColor: COLORS.surface,
  },
  '& .MuiInputBase-input.Mui-disabled': {
    WebkitTextFillColor: '#1f1f1f',
  },
}

export const profileSectionTitleStyles = {
  color: COLORS.primary,
  fontWeight: 800,
  fontSize: { xs: '2rem', md: '2.2rem' },
}

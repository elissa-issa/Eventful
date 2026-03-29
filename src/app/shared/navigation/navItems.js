import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices'
import TuneIcon from '@mui/icons-material/Tune'
import ContactMailIcon from '@mui/icons-material/ContactMail'
import StorefrontIcon from '@mui/icons-material/Storefront'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'

export const serviceNavItems = [
  { label: 'Venues', hash: '#venues' },
  { label: 'Menus', hash: '#menus' },
  { label: 'Decorations', hash: '#decorations' },
  { label: 'Entertainment', hash: '#entertainment' },
  { label: 'Bundles', hash: '#bundles' },
]

export const navItems = [
  {
    label: 'Services',
    path: '/services',
    icon: MiscellaneousServicesIcon,
    children: serviceNavItems,
  },
  { label: 'Customize', path: '/customize', icon: TuneIcon },
  { label: 'Contact Us', path: '/contact-us', icon: ContactMailIcon },
  { label: 'Vendors', path: '/vendors', icon: StorefrontIcon },
  { label: 'Inspiration', path: '/inspiration', icon: AutoAwesomeIcon },
]

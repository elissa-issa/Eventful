import { createTheme } from '@mui/material/styles'
import { COLORS } from '../constants/colors'
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: COLORS.primary,
    },
    secondary: {
      main: COLORS.primaryDark,
    },
    background: {
      default: COLORS.surface,
      paper: COLORS.surface,
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 12,
  },
})
export default theme

import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AuthProvider } from './app/auth/AuthContext'
import AppRoutes from './app/routes/AppRoutes'
import ScrollManager from './app/routes/ScrollManager'
import theme from './app/theme/theme'
import { ToastProvider } from './app/toast/ToastContext'
import './App.css'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <ScrollManager />
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

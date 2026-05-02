import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import { Button } from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { COLORS } from '../../constants/colors'
import { isPremiumUser } from '../../utils/premium'

function FloatingAiPlannerButton() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated || !isPremiumUser(user)) {
    return null
  }

  const handleClick = () => {
    if (location.pathname === '/inspiration') {
      document.getElementById('ai-planner')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })

      if (location.hash !== '#ai-planner') {
        navigate('/inspiration#ai-planner', { replace: true })
      }

      return
    }

    navigate('/inspiration#ai-planner')
  }

  return (
    <Button
      variant="contained"
      startIcon={<AutoAwesomeRoundedIcon />}
      onClick={handleClick}
      sx={{
        position: 'fixed',
        right: { xs: 16, sm: 24 },
        bottom: { xs: 16, sm: 24 },
        zIndex: 1200,
        borderRadius: 999,
        px: { xs: 1.8, sm: 2.3 },
        py: 1.1,
        minHeight: 46,
        backgroundColor: COLORS.accent,
        color: COLORS.surface,
        textTransform: 'none',
        fontWeight: 800,
        boxShadow: '0 10px 24px rgba(15, 45, 75, 0.22)',
        '&:hover': {
          backgroundColor: COLORS.accentHover,
          boxShadow: '0 14px 30px rgba(15, 45, 75, 0.28)',
          transform: 'translateY(-2px)',
        },
        transition: 'transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease',
      }}
    >
      AI Planner
    </Button>
  )
}

export default FloatingAiPlannerButton

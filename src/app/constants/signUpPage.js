import { COLORS } from './colors'
import loginBackgroundImage from '../../assets/loginBG.svg'

export const signUpBackgroundImage = loginBackgroundImage

export const signUpTextFieldStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.45)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.65)',
    },
    '&.Mui-focused fieldset': {
      borderColor: COLORS.surface,
    },
  },
  '& .MuiInputBase-input::placeholder': {
    color: 'rgba(28, 53, 85, 0.7)',
    opacity: 1,
  },
}

import { Box, Button, Dialog, DialogActions, DialogContent, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import { COLORS } from '../../constants/colors'
import { upgradeToPremium } from '../../services/auth'
import { useToast } from '../../toast/useToast'
import PaymentMethodOptionCard from './PaymentMethodOptionCard'

const CARD_PAYMENT_FIELDS = [
  { id: 'cardHolderName', label: 'Card Holder Name', placeholder: 'e.g. Taline Mrehb' },
  { id: 'cardNumber', label: 'Card Number', placeholder: 'e.g. 4567 8901 2345 6789' },
  { id: 'expiryDate', label: 'Expiry Date', placeholder: 'e.g. 09/27' },
  { id: 'cvc', label: 'CVC', placeholder: 'e.g. 123' },
]

const initialCardValues = {
  cardHolderName: '',
  cardNumber: '',
  expiryDate: '',
  cvc: '',
}

function PremiumPaymentDialog({ open, onClose, onSuccess }) {
  const { replaceAuth } = useAuth()
  const { showToast } = useToast()
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [cardPaymentValues, setCardPaymentValues] = useState(initialCardValues)
  const [paymentErrors, setPaymentErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCardPaymentChange = (fieldId, value) => {
    setCardPaymentValues((current) => ({ ...current, [fieldId]: value }))
    setPaymentErrors((current) => ({
      ...current,
      [fieldId]: value.trim() ? '' : current[fieldId],
    }))
  }

  const validatePayment = () => {
    const errors = {}

    if (paymentMethod === 'card') {
      CARD_PAYMENT_FIELDS.forEach((field) => {
        if (!cardPaymentValues[field.id]?.trim()) {
          errors[field.id] = `${field.label} is required`
        }
      })
    }

    setPaymentErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose?.()
    }
  }

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method)
    if (method !== 'card') {
      setPaymentErrors({})
    }
  }

  const handleSubmit = async () => {
    if (!validatePayment()) {
      return
    }

    setIsSubmitting(true)

    try {
      const payload =
        paymentMethod === 'card'
          ? {
              paymentMethod,
              cardDetails: {
                cardHolderName: cardPaymentValues.cardHolderName,
                cardNumber: cardPaymentValues.cardNumber,
                expiryDate: cardPaymentValues.expiryDate,
                cvc: cardPaymentValues.cvc,
              },
            }
          : { paymentMethod }

      const result = await upgradeToPremium(payload)
      replaceAuth(result.data)
      showToast('Premium plan activated successfully')
      onSuccess?.()
      onClose?.()
    } catch (error) {
      showToast(error.message || 'Could not activate premium plan', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 24px 60px rgba(15, 45, 75, 0.22)',
        },
      }}
    >
      <DialogContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack spacing={2.2}>
          <Stack spacing={0.6}>
            <Typography sx={{ color: COLORS.primaryDark, fontWeight: 800, fontSize: '1.65rem' }}>
              Upgrade to Premium
            </Typography>
            <Typography sx={{ color: COLORS.textLight, fontWeight: 600 }}>
              Complete your payment to unlock premium features.
            </Typography>
          </Stack>

          <Box
            sx={{
              borderRadius: 1.5,
              border: `1px solid ${COLORS.borderStrong}`,
              backgroundColor: '#fff8f3',
              px: 1.6,
              py: 1.3,
            }}
          >
            <Typography sx={{ color: COLORS.accent, fontWeight: 900, fontSize: '1.35rem' }}>
              $9.99 / month
            </Typography>
          </Box>

          <Stack spacing={1.45}>
            <Typography
              sx={{
                color: COLORS.primary,
                fontSize: '1.05rem',
                fontWeight: 800,
                lineHeight: 1.1,
                textTransform: 'uppercase',
              }}
            >
              Payment Method
            </Typography>

            <PaymentMethodOptionCard
              title="Credit / Debit Card"
              selected={paymentMethod === 'card'}
              fields={CARD_PAYMENT_FIELDS}
              values={cardPaymentValues}
              errors={paymentErrors}
              onSelect={() => handlePaymentMethodSelect('card')}
              onFieldChange={handleCardPaymentChange}
            />

            <PaymentMethodOptionCard
              title="OMT"
              selected={paymentMethod === 'omt'}
              description="Confirm now and follow the payment reference details shared with you."
              onSelect={() => handlePaymentMethodSelect('omt')}
            />

            <PaymentMethodOptionCard
              title="Wish Money"
              selected={paymentMethod === 'wish-money'}
              description="Confirm now to activate premium with Wish Money payment handling."
              onSelect={() => handlePaymentMethodSelect('wish-money')}
            />
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: { xs: 2.5, sm: 3 }, pb: 2.5, pt: 0 }}>
        <Button
          onClick={handleClose}
          disabled={isSubmitting}
          sx={{
            color: COLORS.primary,
            textTransform: 'none',
            fontWeight: 800,
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting}
          sx={{
            borderRadius: 999,
            px: 2.5,
            textTransform: 'none',
            fontWeight: 800,
            backgroundColor: COLORS.accent,
            '&:hover': { backgroundColor: COLORS.accentHover },
          }}
        >
          {isSubmitting ? 'Processing...' : 'Pay & Upgrade'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PremiumPaymentDialog

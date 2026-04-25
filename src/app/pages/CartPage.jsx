import { useEffect, useMemo, useState } from 'react'
import { Box, Container, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { COLORS } from '../constants/colors'
import { addFavorite } from '../services/favorites'
import { checkoutOrder } from '../services/orders'
import { getCart, removeCartItem, updateCartItem } from '../services/cart'
import { useToast } from '../toast/useToast'
import { formatCartItemDetails } from '../utils/servicePayload'
import AlertDialog from '../shared/components/AlertDialog'
import CartItemRow from '../shared/components/CartItemRow'
import CheckoutProgressStepper from '../shared/components/CheckoutProgressStepper'
import DeliveryAddressCard from '../shared/components/DeliveryAddressCard'
import OrderSummaryCard from '../shared/components/OrderSummaryCard'
import PaymentMethodOptionCard from '../shared/components/PaymentMethodOptionCard'
import SavedLocationsDialog from '../shared/components/SavedLocationsDialog'

const CARD_PAYMENT_FIELDS = [
  { id: 'cardHolderName', label: 'Card Holder Name', placeholder: 'e.g. Taline Mrehb' },
  { id: 'cardNumber', label: 'Card Number', placeholder: 'e.g. 4567 8901 2345 6789' },
  { id: 'expiryDate', label: 'Expiry Date', placeholder: 'e.g. 09/27' },
  { id: 'cvc', label: 'CVC', placeholder: 'e.g. 123' },
]

function formatPrice(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

function CartPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [cart, setCart] = useState(null)
  const [selectedItems, setSelectedItems] = useState({})
  const [checkoutStep, setCheckoutStep] = useState(0)
  const [isSavedLocationsOpen, setIsSavedLocationsOpen] = useState(false)
  const [isPaymentSuccessOpen, setIsPaymentSuccessOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [isLoadingCart, setIsLoadingCart] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [cardPaymentValues, setCardPaymentValues] = useState({
    cardHolderName: '',
    cardNumber: '',
    expiryDate: '',
    cvc: '',
  })

  const cartItems = cart?.items || []
  const isDeliveryStep = checkoutStep === 1
  const isPaymentStep = checkoutStep === 2
  const selectedCartItems = cartItems.filter(
    (item) => selectedItems[`${item.serviceType}:${item.serviceId}`] !== false
  )
  const totalPrice = useMemo(
    () =>
      selectedCartItems.reduce(
        (total, item) => total + (item.service?.priceValue || 0) * item.quantity,
        0
      ),
    [selectedCartItems]
  )

  const loadCart = async () => {
    setIsLoadingCart(true)
    setErrorMessage('')

    try {
      const result = await getCart()
      const nextCart = result.data
      setCart(nextCart)
      setSelectedItems((current) => {
        const nextSelectedItems = { ...current }

        ;(nextCart.items || []).forEach((item) => {
          const key = `${item.serviceType}:${item.serviceId}`

          if (nextSelectedItems[key] === undefined) {
            nextSelectedItems[key] = true
          }
        })

        return nextSelectedItems
      })
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsLoadingCart(false)
    }
  }

  useEffect(() => {
    loadCart()
  }, [])

  const handleCardPaymentChange = (fieldId, value) => {
    setCardPaymentValues((current) => ({
      ...current,
      [fieldId]: value,
    }))
  }

  const handleItemCheckChange = (item) => (_, isChecked) => {
    setSelectedItems((current) => ({
      ...current,
      [`${item.serviceType}:${item.serviceId}`]: isChecked,
    }))
  }

  const handleRemoveItem = async (item) => {
    try {
      await removeCartItem({
        serviceId: item.serviceId,
        serviceType: item.serviceType,
      })
      await loadCart()
      showToast('Removed from cart')
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const handleFavoriteItem = async (item) => {
    try {
      await addFavorite({
        serviceId: item.serviceId,
        serviceType: item.serviceType,
      })
      showToast('Added to favorites')
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const handleIncreaseQuantity = async (item) => {
    try {
      await updateCartItem({
        serviceId: item.serviceId,
        serviceType: item.serviceType,
        quantity: item.quantity + 1,
        selectedDate: item.selectedDate,
        customOptions: item.customOptions,
      })
      await loadCart()
      showToast('Cart updated')
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const handleCheckout = async () => {
    try {
      await checkoutOrder({
        paymentMethod,
        status: paymentMethod === 'card' ? 'paid' : 'pending',
      })
      await loadCart()
      setIsPaymentSuccessOpen(true)
      showToast('Order created successfully')
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 180px)',
        backgroundColor: COLORS.surface,
        py: { xs: 3.5, md: 4.5 },
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={{ xs: 3, md: 3.5 }}>
          <CheckoutProgressStepper activeStep={isPaymentSuccessOpen ? 3 : checkoutStep} />

          {errorMessage ? (
            <Typography sx={{ color: '#d32f2f', fontWeight: 700 }}>{errorMessage}</Typography>
          ) : null}

          {!isPaymentStep ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.7fr) 290px' },
                gap: { xs: 2.5, lg: 2 },
                alignItems: 'start',
              }}
            >
              {checkoutStep === 0 ? (
                <Box
                  sx={{
                    borderRadius: 1.5,
                    border: `1px solid ${COLORS.primary}`,
                    backgroundColor: COLORS.surface,
                    px: { xs: 1.5, sm: 2.2 },
                    py: { xs: 1.8, sm: 2.1 },
                  }}
                >
                  {isLoadingCart ? (
                    <Typography sx={{ color: COLORS.primary, fontWeight: 700 }}>
                      Loading cart...
                    </Typography>
                  ) : cartItems.length === 0 ? (
                    <Stack spacing={1.5}>
                      <Typography sx={{ color: COLORS.primary, fontWeight: 800, fontSize: '1.3rem' }}>
                        Your cart is empty
                      </Typography>
                      <Typography sx={{ color: COLORS.textLight }}>
                        Add services from the services page and they will appear here.
                      </Typography>
                    </Stack>
                  ) : (
                    <Stack spacing={2.5}>
                      {cartItems.map((item) => {
                        const key = `${item.serviceType}:${item.serviceId}`
                        const itemTotal = (item.service?.priceValue || 0) * item.quantity

                        return (
                          <CartItemRow
                            key={key}
                            checked={selectedItems[key] !== false}
                            imageSrc={item.service?.imageSrc}
                            imageAlt={item.service?.imageAlt}
                            title={item.service?.title || 'Service'}
                            details={formatCartItemDetails(item)}
                            price={formatPrice(itemTotal)}
                            modifyLabel="+ Qty"
                            onCheckedChange={handleItemCheckChange(item)}
                            onModify={() => handleIncreaseQuantity(item)}
                            onFavorite={() => handleFavoriteItem(item)}
                            onDelete={() => handleRemoveItem(item)}
                          />
                        )
                      })}
                    </Stack>
                  )}
                </Box>
              ) : null}

              {isDeliveryStep ? (
                <DeliveryAddressCard onSavedLocationsClick={() => setIsSavedLocationsOpen(true)} />
              ) : null}

              <OrderSummaryCard
                title="Current Cart"
                retailPrice={formatPrice(totalPrice)}
                promotions="$0.00"
                totalPrice={formatPrice(totalPrice)}
                savedText="saved $0"
                rewardedText={`Rewarded ${Math.round(totalPrice / 10)} points`}
                checkoutLabel={isDeliveryStep ? 'Continue' : 'Checkout Now!'}
                onCheckout={() => setCheckoutStep((current) => (current < 2 ? current + 1 : current))}
                secondaryActionLabel={isDeliveryStep ? 'Back to cart' : undefined}
                onSecondaryAction={isDeliveryStep ? () => setCheckoutStep(0) : undefined}
              />
            </Box>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.7fr) 290px' },
                gap: { xs: 2.5, lg: 2 },
                alignItems: 'start',
              }}
            >
              <Box
                sx={{
                  borderRadius: 1.5,
                  border: `1px solid ${COLORS.primary}`,
                  backgroundColor: COLORS.surface,
                  px: { xs: 1.4, sm: 1.7 },
                  py: { xs: 1.4, sm: 1.55 },
                }}
              >
                <Stack spacing={1.45}>
                  <Typography
                    sx={{
                      color: COLORS.primary,
                      fontSize: { xs: '1.2rem', sm: '1.05rem' },
                      fontWeight: 800,
                      lineHeight: 1.1,
                      textTransform: 'uppercase',
                    }}
                  >
                    Payment Method
                  </Typography>

                  <PaymentMethodOptionCard
                    title="Credit / Debit Card (Visa / MasterCard)"
                    selected={paymentMethod === 'card'}
                    fields={CARD_PAYMENT_FIELDS}
                    values={cardPaymentValues}
                    onSelect={() => setPaymentMethod('card')}
                    onFieldChange={handleCardPaymentChange}
                  />

                  <PaymentMethodOptionCard
                    title="Cash on delivery"
                    selected={paymentMethod === 'cash'}
                    description="You will receive a confirmation email once your payment method is verified."
                    onSelect={() => setPaymentMethod('cash')}
                  />

                  <PaymentMethodOptionCard
                    title="OMT"
                    selected={paymentMethod === 'omt'}
                    description="You will receive your reference number and payment details via SMS and email after confirming your order."
                    onSelect={() => setPaymentMethod('omt')}
                  />

                  <PaymentMethodOptionCard
                    title="Wish Money"
                    selected={paymentMethod === 'wish-money'}
                    description="You'll receive confirmation once your transaction is complete."
                    onSelect={() => setPaymentMethod('wish-money')}
                  />
                </Stack>
              </Box>

              <OrderSummaryCard
                title="Current Cart"
                retailPrice={formatPrice(totalPrice)}
                promotions="$0.00"
                totalPrice={formatPrice(totalPrice)}
                savedText="saved $0"
                rewardedText={`Rewarded ${Math.round(totalPrice / 10)} points`}
                checkoutLabel="Pay Now"
                onCheckout={handleCheckout}
                secondaryActionLabel="Back to Delivery Address"
                onSecondaryAction={() => setCheckoutStep(1)}
              />
            </Box>
          )}
        </Stack>
      </Container>

      <SavedLocationsDialog
        open={isSavedLocationsOpen}
        onClose={() => setIsSavedLocationsOpen(false)}
      />

      <AlertDialog
        open={isPaymentSuccessOpen}
        onClose={() => setIsPaymentSuccessOpen(false)}
        useCheckIcon
        iconBackgroundColor="#3dbb74"
        title="Payment Successful"
        titleColor="#3dbb74"
        description="The order confirmation has been created."
        descriptionColor="#666666"
        primaryButtonText="Go Back To Home"
        primaryButtonColor={COLORS.accent}
        onPrimaryButtonClick={() => {
          setIsPaymentSuccessOpen(false)
          navigate('/home')
        }}
      />
    </Box>
  )
}

export default CartPage

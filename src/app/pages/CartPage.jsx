import { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Button, Container, Stack, Typography } from '@mui/material'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { COLORS } from '../constants/colors'
import { getFavoriteKey, useFavoriteActions } from '../hooks/useFavoriteActions'
import { checkoutCart, getCart, removeCartItemById, updateCartItemById } from '../services/cart'
import { getCollections } from '../services/collections'
import {
  createSavedLocation,
  deleteSavedLocation,
  getSavedLocations,
  updateSavedLocation,
} from '../services/savedLocations'
import { useToast } from '../toast/useToast'
import { getCartItemPricing, getCartPricing } from '../utils/cartPricing'
import { formatCartItemDetails } from '../utils/servicePayload'
import AlertDialog from '../shared/components/AlertDialog'
import AddLocationDialog from '../shared/components/AddLocationDialog'
import CartItemRow from '../shared/components/CartItemRow'
import CheckoutProgressStepper from '../shared/components/CheckoutProgressStepper'
import DeliveryAddressCard from '../shared/components/DeliveryAddressCard'
import OrderSummaryCard from '../shared/components/OrderSummaryCard'
import PaymentMethodOptionCard from '../shared/components/PaymentMethodOptionCard'
import SavedLocationsDialog from '../shared/components/SavedLocationsDialog'
import {
  emptyLocationValues,
  getLocationValidationError,
  normalizeLocationValues,
} from '../shared/utils/locationForm'

const CARD_PAYMENT_FIELDS = [
  { id: 'cardHolderName', label: 'Card Holder Name', placeholder: 'e.g. Taline Mrehb' },
  { id: 'cardNumber', label: 'Card Number', placeholder: 'e.g. 4567 8901 2345 6789' },
  { id: 'expiryDate', label: 'Expiry Date', placeholder: 'e.g. 09/27' },
  { id: 'cvc', label: 'CVC', placeholder: 'e.g. 123' },
]

function formatPrice(value) {
  const numericValue = Number(value || 0)

  return Math.abs(numericValue - Math.round(numericValue)) < 0.001
    ? `$${Math.round(numericValue)}`
    : `$${numericValue.toFixed(2)}`
}

function hasScheduledDateAndTime(item) {
  const customOptions = item.customOptions || item.selectedOptions || {}

  return Boolean(item.selectedDate || customOptions.selectedDate) && Boolean(customOptions.selectedTime)
}

function CartPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { token } = useAuth()
  const { showToast } = useToast()
  const { favoriteItems, toggleFavoriteItem } = useFavoriteActions()
  const collectionId = searchParams.get('collectionId') || searchParams.get('collection')
  const [cart, setCart] = useState(null)
  const [collections, setCollections] = useState([])
  const [selectedItems, setSelectedItems] = useState({})
  const [checkoutStep, setCheckoutStep] = useState(0)
  const [isSavedLocationsOpen, setIsSavedLocationsOpen] = useState(false)
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false)
  const [isPaymentSuccessOpen, setIsPaymentSuccessOpen] = useState(false)
  const [deliveryAddress, setDeliveryAddress] = useState(emptyLocationValues)
  const [deliveryAddressErrors, setDeliveryAddressErrors] = useState({})
  const [savedLocations, setSavedLocations] = useState([])
  const [locationsLoading, setLocationsLoading] = useState(false)
  const [locationsError, setLocationsError] = useState('')
  const [locationFormValues, setLocationFormValues] = useState(emptyLocationValues)
  const [editingLocation, setEditingLocation] = useState(null)
  const [pendingDeleteLocation, setPendingDeleteLocation] = useState(null)
  const [locationFormError, setLocationFormError] = useState('')
  const [locationSaving, setLocationSaving] = useState(false)
  const [locationDeleting, setLocationDeleting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [isLoadingCart, setIsLoadingCart] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [cardPaymentValues, setCardPaymentValues] = useState({
    cardHolderName: '',
    cardNumber: '',
    expiryDate: '',
    cvc: '',
  })
  const [paymentErrors, setPaymentErrors] = useState({})

  const cartItems = cart?.items || []
  const collectionTitle = cart?.collection?.name || cart?.collection?.title || 'Selected Services'
  const isDeliveryStep = checkoutStep === 1
  const isPaymentStep = checkoutStep === 2
  const selectedCartItems = cartItems.filter(
    (item) => selectedItems[item._id || `${item.serviceType}:${item.serviceId}`] !== false,
  )
  const totalPrice = useMemo(
    () => getCartPricing(selectedCartItems),
    [selectedCartItems],
  )
  const summary = {
    retailPrice: formatPrice(totalPrice.retailTotal),
    promotions: formatPrice(totalPrice.promotionTotal),
    totalPrice: formatPrice(totalPrice.total),
    savedText: totalPrice.promotionTotal > 0 ? `saved ${formatPrice(totalPrice.promotionTotal)}` : '',
    // rewardedText: totalPrice.total > 0 ? `Rewarded ${Math.floor(totalPrice.total / 62.5)} points` : '',
  }

  const loadCart = useCallback(async () => {
    setIsLoadingCart(true)
    setErrorMessage('')

    try {
      const result = await getCart(collectionId)
      const nextCart = result.data
      setCart(nextCart)
      setSelectedItems((current) => {
        const nextSelectedItems = { ...current }

        ;(nextCart.items || []).forEach((item) => {
          const key = item._id || `${item.serviceType}:${item.serviceId}`

          if (nextSelectedItems[key] === undefined) {
            nextSelectedItems[key] = true
          }
        })

        return nextSelectedItems
      })

      if (!collectionId && !(nextCart.items || []).length) {
        const collectionsResult = await getCollections()
        setCollections(collectionsResult.data || [])
      }
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsLoadingCart(false)
    }
  }, [collectionId])

  useEffect(() => {
    loadCart()
  }, [loadCart])

  const loadSavedLocations = useCallback(async () => {
    if (!token) {
      return
    }

    setLocationsLoading(true)
    setLocationsError('')

    try {
      const result = await getSavedLocations(token)
      setSavedLocations(result.data || [])
    } catch (error) {
      setLocationsError(error.message || 'Could not load saved locations')
    } finally {
      setLocationsLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (isSavedLocationsOpen) {
      loadSavedLocations()
    }
  }, [isSavedLocationsOpen, loadSavedLocations])

  const handleCardPaymentChange = (fieldId, value) => {
    setCardPaymentValues((current) => ({ ...current, [fieldId]: value }))
    setPaymentErrors((current) => ({
      ...current,
      [fieldId]: value.trim() ? '' : current[fieldId],
    }))
  }

  const handleDeliveryAddressChange = (fieldId, value) => {
    setDeliveryAddress((current) => ({ ...current, [fieldId]: value }))
    setDeliveryAddressErrors((current) => ({
      ...current,
      [fieldId]: value.trim() ? '' : current[fieldId],
    }))
  }

  const validateDeliveryAddress = () => {
    const errors = {}

    if (!deliveryAddress.locationName?.trim()) {
      errors.locationName = 'Location name is required'
    }

    if (!deliveryAddress.city?.trim()) {
      errors.city = 'City is required'
    }

    if (!deliveryAddress.streetAddress?.trim()) {
      errors.streetAddress = 'Street address is required'
    }

    if (!deliveryAddress.mobileNumber?.trim()) {
      errors.mobileNumber = 'Mobile number is required'
    }

    if (!deliveryAddress.zipPostalCode?.trim()) {
      errors.zipPostalCode = 'ZIP / Postal code is required'
    }

    setDeliveryAddressErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validatePaymentMethod = () => {
    const errors = {}

    if (paymentMethod === 'card') {
      if (!cardPaymentValues.cardHolderName?.trim()) {
        errors.cardHolderName = 'Card holder name is required'
      }

      if (!cardPaymentValues.cardNumber?.trim()) {
        errors.cardNumber = 'Card number is required'
      }

      if (!cardPaymentValues.expiryDate?.trim()) {
        errors.expiryDate = 'Expiry date is required'
      }

      if (!cardPaymentValues.cvc?.trim()) {
        errors.cvc = 'CVC is required'
      }
    }

    setPaymentErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleItemCheckChange = (item) => (_, isChecked) => {
    setSelectedItems((current) => ({
      ...current,
      [item._id || `${item.serviceType}:${item.serviceId}`]: isChecked,
    }))
  }

  const handleRemoveItem = async (item) => {
    try {
      await removeCartItemById(item._id)
      await loadCart()
      showToast('Removed from cart')
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const handleFavoriteItem = async (item) => {
    try {
      const isFavorite = await toggleFavoriteItem({
        serviceId: item.serviceId,
        serviceType: item.serviceType,
      })
      showToast(isFavorite ? 'Added to favorites' : 'Removed from favorites')
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const handleQuantityChange = async (item, nextQuantity) => {
    if (nextQuantity < 1) {
      return
    }

    try {
      await updateCartItemById(item._id, {
        quantity: nextQuantity,
        selectedDate: item.selectedDate,
        customOptions: item.customOptions,
      })
      await loadCart()
      showToast('Cart updated')
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const handleEditCartItem = (item) => {
    const serviceItemId = item.service?.itemId || item.service?.id || item.itemId || item.serviceId

    if (!item.serviceType || !serviceItemId) {
      showToast('Could not open this item', 'error')
      return
    }

    const customOptions = item.customOptions || {}
    const params = new URLSearchParams({
      cartItemId: item._id,
      quantity: String(item.quantity || 1),
      returnTo: `${location.pathname}${location.search}`,
    })
    const selectedDate = item.selectedDate || customOptions.selectedDate

    if (selectedDate) {
      params.set('selectedDate', selectedDate)
    }

    if (customOptions.selectedTime) {
      params.set('selectedTime', customOptions.selectedTime)
    }

    navigate(`/services/${item.serviceType}/${serviceItemId}?${params.toString()}`)
  }

  const handleCheckout = async () => {
    if (!validatePaymentMethod()) {
      return
    }

    try {
      await checkoutCart({
        collectionId,
        paymentMethod,
        status: paymentMethod === 'card' ? 'paid' : 'pending',
      })
      setCart((current) => (current ? { ...current, items: [] } : current))
      setSelectedItems({})
      setIsPaymentSuccessOpen(true)
      showToast('Order created successfully')
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const openAddLocationDialog = () => {
    setEditingLocation(null)
    setLocationFormValues(emptyLocationValues)
    setLocationFormError('')
    setIsLocationDialogOpen(true)
  }

  const openEditLocationDialog = (location) => {
    setEditingLocation(location)
    setLocationFormValues(normalizeLocationValues(location))
    setLocationFormError('')
    setIsLocationDialogOpen(true)
  }

  const closeLocationDialog = () => {
    setIsLocationDialogOpen(false)
    setEditingLocation(null)
    setLocationFormValues(emptyLocationValues)
    setLocationFormError('')
  }

  const handleLocationSubmit = async (event) => {
    event.preventDefault()
    const validationError = getLocationValidationError(locationFormValues)

    if (validationError) {
      setLocationFormError(validationError)
      return
    }

    setLocationSaving(true)
    setLocationFormError('')

    try {
      if (editingLocation) {
        await updateSavedLocation(editingLocation.id, locationFormValues, token)
      } else {
        await createSavedLocation(locationFormValues, token)
      }

      closeLocationDialog()
      await loadSavedLocations()
    } catch (error) {
      setLocationFormError(error.message || 'Could not save location')
    } finally {
      setLocationSaving(false)
    }
  }

  const handleDeleteLocation = async () => {
    if (!pendingDeleteLocation) {
      return
    }

    setLocationDeleting(true)
    try {
      await deleteSavedLocation(pendingDeleteLocation.id, token)
      setPendingDeleteLocation(null)
      await loadSavedLocations()
    } catch (error) {
      setLocationsError(error.message || 'Could not delete location')
    } finally {
      setLocationDeleting(false)
    }
  }

  const handleSummaryCheckout = () => {
    if (!canContinue) {
      return
    }

    if (checkoutStep === 0) {
      const missingScheduleItem = selectedCartItems.find((item) => !hasScheduledDateAndTime(item))

      if (missingScheduleItem) {
        const itemTitle = missingScheduleItem.service?.title || 'Every selected item'
        showToast(`${itemTitle} needs a date and time before checkout`, 'error')
        return
      }
    }

    if (isDeliveryStep && !validateDeliveryAddress()) {
      return
    }

    setCheckoutStep((current) => (current < 2 ? current + 1 : current))
  }

  const canContinue = cartItems.length > 0 && selectedCartItems.length > 0

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

          {!collectionId && !isLoadingCart && cartItems.length === 0 ? (
            <Stack spacing={2}>
              <Typography sx={{ color: COLORS.primary, fontWeight: 800, fontSize: '1.3rem' }}>
                Choose a collection to view your cart
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap">
                {collections.map((collection) => (
                  <Button
                    key={collection.id}
                    variant="contained"
                    onClick={() => navigate(`/cart?collectionId=${collection.id}`)}
                    sx={{
                      borderRadius: 1,
                      textTransform: 'none',
                      fontWeight: 800,
                      backgroundColor: COLORS.primary,
                      '&:hover': { backgroundColor: COLORS.primaryHover },
                    }}
                  >
                    {collection.name || collection.title}
                  </Button>
                ))}
                <Button onClick={() => navigate('/services')} sx={{ color: COLORS.primary }}>
                  Browse services
                </Button>
              </Stack>
            </Stack>
          ) : null}

          {collectionId || cartItems.length > 0 ? (
            !isPaymentStep ? (
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
                          This collection is empty
                        </Typography>
                        <Typography sx={{ color: COLORS.textLight }}>
                          Add services from the services page and they will appear here.
                        </Typography>
                      </Stack>
                    ) : (
                      <Stack spacing={2.5}>
                        {cartItems.map((item) => {
                          const key = item._id || `${item.serviceType}:${item.serviceId}`
                          const itemPricing = getCartItemPricing(item)
                          const favoriteKey = getFavoriteKey(item.serviceType, item.serviceId)

                          return (
                            <CartItemRow
                              key={key}
                              checked={selectedItems[key] !== false}
                              imageSrc={item.service?.imageSrc}
                              imageAlt={item.service?.imageAlt}
                              title={item.service?.title || 'Service'}
                              details={formatCartItemDetails(item)}
                              price={formatPrice(itemPricing.total)}
                              showQuantityStepper
                              isFavorite={Boolean(favoriteItems[favoriteKey])}
                              quantity={item.quantity}
                              onCheckedChange={handleItemCheckChange(item)}
                              onItemClick={() => handleEditCartItem(item)}
                              onQuantityDecrease={() => handleQuantityChange(item, item.quantity - 1)}
                              onQuantityIncrease={() => handleQuantityChange(item, item.quantity + 1)}
                              onQuantityChange={(nextQuantity) => handleQuantityChange(item, nextQuantity)}
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
                  <DeliveryAddressCard
                    values={deliveryAddress}
                    errors={deliveryAddressErrors}
                    onFieldChange={handleDeliveryAddressChange}
                    onSavedLocationsClick={() => setIsSavedLocationsOpen(true)}
                  />
                ) : null}

                <OrderSummaryCard
                  title={collectionTitle}
                  retailPrice={summary.retailPrice}
                  promotions={summary.promotions}
                  totalPrice={summary.totalPrice}
                  savedText={summary.savedText}
                  rewardedText={summary.rewardedText}
                  checkoutLabel={isDeliveryStep ? 'Continue' : 'Checkout Now!'}
                  onCheckout={handleSummaryCheckout}
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
                      errors={paymentErrors}
                      onSelect={() => setPaymentMethod('card')}
                      onFieldChange={handleCardPaymentChange}
                    />

                    <PaymentMethodOptionCard
                      title="Cash on delivery"
                      selected={paymentMethod === 'cash'}
                      description="You will receive a confirmation email once your payment method is verified."
                      onSelect={() => {
                        setPaymentMethod('cash')
                        setPaymentErrors({})
                      }}
                    />

                    <PaymentMethodOptionCard
                      title="OMT"
                      selected={paymentMethod === 'omt'}
                      description="You will receive your reference number and payment details via SMS and email after confirming your order."
                      onSelect={() => {
                        setPaymentMethod('omt')
                        setPaymentErrors({})
                      }}
                    />

                    <PaymentMethodOptionCard
                      title="Wish Money"
                      selected={paymentMethod === 'wish-money'}
                      description="You'll receive confirmation once your transaction is complete."
                      onSelect={() => {
                        setPaymentMethod('wish-money')
                        setPaymentErrors({})
                      }}
                    />
                  </Stack>
                </Box>

                <OrderSummaryCard
                  title={collectionTitle}
                  retailPrice={summary.retailPrice}
                  promotions={summary.promotions}
                  totalPrice={summary.totalPrice}
                  savedText={summary.savedText}
                  rewardedText={summary.rewardedText}
                  checkoutLabel="Pay Now"
                  onCheckout={handleCheckout}
                  secondaryActionLabel="Back to Delivery Address"
                  onSecondaryAction={() => setCheckoutStep(1)}
                />
              </Box>
            )
          ) : null}
        </Stack>
      </Container>

      <SavedLocationsDialog
        open={isSavedLocationsOpen}
        onClose={() => setIsSavedLocationsOpen(false)}
        locations={savedLocations}
        loading={locationsLoading}
        error={locationsError}
        onAdd={openAddLocationDialog}
        onEdit={openEditLocationDialog}
        onDelete={setPendingDeleteLocation}
        onSelect={(location) => {
          setDeliveryAddress(normalizeLocationValues(location))
          setDeliveryAddressErrors({})
          setIsSavedLocationsOpen(false)
        }}
      />

      <AddLocationDialog
        open={isLocationDialogOpen}
        onClose={closeLocationDialog}
        title={editingLocation ? 'Edit Location' : 'Add New Location'}
        values={locationFormValues}
        onChange={(fieldId, value) =>
          setLocationFormValues((current) => ({ ...current, [fieldId]: value }))
        }
        onSubmit={handleLocationSubmit}
        submitLabel={editingLocation ? 'Update Location' : 'Add Location'}
        loading={locationSaving}
        error={locationFormError}
      />

      <AlertDialog
        open={Boolean(pendingDeleteLocation)}
        onClose={() => {
          if (!locationDeleting) {
            setPendingDeleteLocation(null)
          }
        }}
        title="Delete location?"
        titleColor="#d93a2e"
        description={
          pendingDeleteLocation
            ? `Do you want to delete ${pendingDeleteLocation.locationName}?`
            : ''
        }
        primaryButtonText={locationDeleting ? 'Deleting...' : 'Delete'}
        primaryButtonColor="#f44336"
        onPrimaryButtonClick={handleDeleteLocation}
        secondaryActionText="Cancel"
        secondaryActionColor={COLORS.primary}
        onSecondaryActionClick={() => setPendingDeleteLocation(null)}
        disableBackdropClick={locationDeleting}
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

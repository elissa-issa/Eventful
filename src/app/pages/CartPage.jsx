import { useCallback, useEffect, useState } from 'react'
import { Box, Checkbox, Container, Stack, Typography } from '@mui/material'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { COLORS } from '../constants/colors'
import { getCollectionById, MY_COLLECTIONS } from '../constants/myCollections'
import { DECORATION_ITEMS } from '../constants/decorationItems'
import { MENU_ITEMS } from '../constants/menuItems'
import { VENUE_ITEMS } from '../constants/venueItems'
import AlertDialog from '../shared/components/AlertDialog'
import AddLocationDialog from '../shared/components/AddLocationDialog'
import CartItemRow from '../shared/components/CartItemRow'
import CheckoutProgressStepper from '../shared/components/CheckoutProgressStepper'
import DeliveryAddressCard from '../shared/components/DeliveryAddressCard'
import {
  emptyLocationValues,
  getLocationValidationError,
  normalizeLocationValues,
} from '../shared/utils/locationForm'
import OrderSummaryCard from '../shared/components/OrderSummaryCard'
import PaymentMethodOptionCard from '../shared/components/PaymentMethodOptionCard'
import SavedLocationsDialog from '../shared/components/SavedLocationsDialog'
import {
  createSavedLocation,
  deleteSavedLocation,
  getSavedLocations,
  updateSavedLocation,
} from '../services/savedLocations'

const INITIAL_CART_SELECTIONS = {
  venues: {
    outdoorVenue: true,
  },
  menues: {
    birthdayCake: true,
  },
  decorations: {
    flowerBouquet: true,
    vanillaCandles: true,
  },
}

const CARD_PAYMENT_FIELDS = [
  { id: 'cardHolderName', label: 'Card Holder Name', placeholder: 'e.g. Taline Mrehb' },
  { id: 'cardNumber', label: 'Card Number', placeholder: 'e.g. 4567 8901 2345 6789' },
  { id: 'expiryDate', label: 'Expiry Date', placeholder: 'e.g. 09/27' },
  { id: 'cvc', label: 'CVC', placeholder: 'e.g. 123' },
]

function CartPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { token } = useAuth()
  const featuredVenue = VENUE_ITEMS.find((item) => item.id === 'outdoor-jbeil-2') ?? VENUE_ITEMS[0]
  const birthdayCake = MENU_ITEMS.find((item) => item.id === 'birthday-cake-2') ?? MENU_ITEMS[0]
  const flowerBouquet =
    DECORATION_ITEMS.find((item) => item.id === 'flowers-bouquet-2') ?? DECORATION_ITEMS[0]
  const vanillaCandles = {
    imageSrc:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Candles.jpg',
    imageAlt: 'Vanilla candles decoration',
    title: 'Vanilla Candles',
  }

  const [cartSelections, setCartSelections] = useState(INITIAL_CART_SELECTIONS)
  const [checkoutStep, setCheckoutStep] = useState(0)
  const [isSavedLocationsOpen, setIsSavedLocationsOpen] = useState(false)
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false)
  const [isPaymentSuccessOpen, setIsPaymentSuccessOpen] = useState(false)
  const [deliveryAddress, setDeliveryAddress] = useState(emptyLocationValues)
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
  const [cardPaymentValues, setCardPaymentValues] = useState({
    cardHolderName: '',
    cardNumber: '',
    expiryDate: '',
    cvc: '',
  })
  const selectedCollection =
    getCollectionById(searchParams.get('collection')) ?? MY_COLLECTIONS[0]

  const sectionCheckboxSx = {
    p: 0,
    color: COLORS.primary,
    '&.Mui-checked': {
      color: COLORS.primary,
    },
  }

  const sectionTitleSx = {
    color: COLORS.primary,
    fontSize: { xs: '1rem', sm: '1.08rem' },
    fontWeight: 700,
  }

  const getSectionValues = (sectionKey) => Object.values(cartSelections[sectionKey])
  const isSectionChecked = (sectionKey) => getSectionValues(sectionKey).every(Boolean)

  const handleItemCheckChange = (sectionKey, itemKey) => (_, isChecked) => {
    setCartSelections((current) => ({
      ...current,
      [sectionKey]: {
        ...current[sectionKey],
        [itemKey]: isChecked,
      },
    }))
  }

  const handleSectionCheckChange = (sectionKey) => (_, isChecked) => {
    setCartSelections((current) => ({
      ...current,
      [sectionKey]: Object.keys(current[sectionKey]).reduce(
        (nextSection, itemKey) => ({
          ...nextSection,
          [itemKey]: isChecked,
        }),
        {}
      ),
    }))
  }
  const isCartStep = checkoutStep === 0
  const isDeliveryStep = checkoutStep === 1
  const isPaymentStep = checkoutStep === 2
  const handleCardPaymentChange = (fieldId, value) => {
    setCardPaymentValues((current) => ({
      ...current,
      [fieldId]: value,
    }))
  }

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

  const handleDeliveryAddressChange = (fieldId, value) => {
    setDeliveryAddress((current) => ({
      ...current,
      [fieldId]: value,
    }))
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

  const handleLocationFormChange = (fieldId, value) => {
    setLocationFormValues((current) => ({
      ...current,
      [fieldId]: value,
    }))
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

  const handleSelectLocation = (location) => {
    setDeliveryAddress(normalizeLocationValues(location))
    setIsSavedLocationsOpen(false)
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

          {!isPaymentStep ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.7fr) 290px' },
                gap: { xs: 2.5, lg: 2 },
                alignItems: 'start',
              }}
            >
              {isCartStep ? (
                <Box
                  sx={{
                    borderRadius: 1.5,
                    border: `1px solid ${COLORS.primary}`,
                    backgroundColor: COLORS.surface,
                    px: { xs: 1.5, sm: 2.2 },
                    py: { xs: 1.8, sm: 2.1 },
                  }}
                >
                  <Stack spacing={2.5}>
                    <Stack spacing={2.1}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Checkbox
                          checked={isSectionChecked('venues')}
                          onChange={handleSectionCheckChange('venues')}
                          sx={sectionCheckboxSx}
                        />
                        <Typography sx={sectionTitleSx}>Venues</Typography>
                      </Stack>

                      <CartItemRow
                        checked={cartSelections.venues.outdoorVenue}
                        imageSrc={featuredVenue.imageSrc}
                        imageAlt={featuredVenue.imageAlt}
                        title="Outdoor venue in jbeil"
                        details={['Date: 20 Jun, 2026', 'Time: 5pm to 10pm', 'Guests: 350']}
                        price="$2500"
                        onCheckedChange={handleItemCheckChange('venues', 'outdoorVenue')}
                      />
                    </Stack>

                    <Stack spacing={2.1}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Checkbox
                          checked={isSectionChecked('menues')}
                          onChange={handleSectionCheckChange('menues')}
                          sx={sectionCheckboxSx}
                        />
                        <Typography sx={sectionTitleSx}>Menues</Typography>
                      </Stack>

                      <CartItemRow
                        checked={cartSelections.menues.birthdayCake}
                        imageSrc={birthdayCake.imageSrc}
                        imageAlt={birthdayCake.imageAlt}
                        title="Birthday Cake"
                        details={['Date: 20 Jun, 2026', 'Time: 7pm', 'Guests: 50 persons']}
                        price="$200"
                        onCheckedChange={handleItemCheckChange('menues', 'birthdayCake')}
                      />
                    </Stack>

                    <Stack spacing={2.1}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Checkbox
                          checked={isSectionChecked('decorations')}
                          onChange={handleSectionCheckChange('decorations')}
                          sx={sectionCheckboxSx}
                        />
                        <Typography sx={sectionTitleSx}>Decorations</Typography>
                      </Stack>

                      <Stack spacing={2}>
                        <CartItemRow
                          checked={cartSelections.decorations.flowerBouquet}
                          imageSrc={flowerBouquet.imageSrc}
                          imageAlt={flowerBouquet.imageAlt}
                          title="Flowers Bouquet"
                          details={['Date: 20 Jun, 2026', 'Time: 5pm', 'Quantity: 10 pcs']}
                          price="$320"
                          onCheckedChange={handleItemCheckChange('decorations', 'flowerBouquet')}
                        />

                        <CartItemRow
                          checked={cartSelections.decorations.vanillaCandles}
                          imageSrc={vanillaCandles.imageSrc}
                          imageAlt={vanillaCandles.imageAlt}
                          title={vanillaCandles.title}
                          details={['Date: 19 Jun, 2026', 'Time: 4pm', 'Quantity: 20 pcs']}
                          price="$100"
                          onCheckedChange={handleItemCheckChange('decorations', 'vanillaCandles')}
                        />
                      </Stack>
                    </Stack>
                  </Stack>
                </Box>
              ) : null}

              {isDeliveryStep ? (
                <DeliveryAddressCard
                  values={deliveryAddress}
                  onFieldChange={handleDeliveryAddressChange}
                  onSavedLocationsClick={() => setIsSavedLocationsOpen(true)}
                />
              ) : null}

              <OrderSummaryCard
                title={selectedCollection.title}
                retailPrice={selectedCollection.summary.retailPrice}
                promotions={selectedCollection.summary.promotions}
                totalPrice={selectedCollection.summary.totalPrice}
                savedText={selectedCollection.summary.savedText}
                rewardedText={selectedCollection.summary.rewardedText}
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
                title={selectedCollection.title}
                retailPrice={selectedCollection.summary.retailPrice}
                promotions={selectedCollection.summary.promotions}
                totalPrice={selectedCollection.summary.totalPrice}
                savedText={selectedCollection.summary.savedText}
                rewardedText={selectedCollection.summary.rewardedText}
                checkoutLabel="Pay Now"
                onCheckout={() => setIsPaymentSuccessOpen(true)}
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
        locations={savedLocations}
        loading={locationsLoading}
        error={locationsError}
        onAdd={openAddLocationDialog}
        onEdit={openEditLocationDialog}
        onDelete={setPendingDeleteLocation}
        onSelect={handleSelectLocation}
      />

      <AddLocationDialog
        open={isLocationDialogOpen}
        onClose={closeLocationDialog}
        title={editingLocation ? 'Edit Location' : 'Add New Location'}
        values={locationFormValues}
        onChange={handleLocationFormChange}
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
        description="The order confirmation has been sent to name@example.com"
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

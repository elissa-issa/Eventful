import { Box } from '@mui/material'
import { useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { COLORS } from '../constants/colors'
import { useFavoriteActions, getFavoriteKey } from '../hooks/useFavoriteActions'
import { useServicesData } from '../hooks/useServicesData'
import { addCartItem } from '../services/cart'
import { addItemToCustomizedPlan } from '../services/customizedPlans'
import { useToast } from '../toast/useToast'
import { getCollectionItemPayload, getServicePayload } from '../utils/servicePayload'
import AddReviewDrawer from '../shared/components/AddReviewDrawer'
import AlertDialog from '../shared/components/AlertDialog'
import BundlePlanItems from '../shared/components/BundlePlanItems'
import ReviewsSection from '../shared/components/ReviewsSection'
import ReviewsDrawer from '../shared/components/ReviewsDrawer'
import ServiceItemGalleryDialog from '../shared/components/ServiceItemGalleryDialog'

function ServiceItemPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const { itemsBySection } = useServicesData()
  const { favoriteItems, toggleFavoriteItem } = useFavoriteActions()
  const { section, itemId } = useParams()
  const planId = searchParams.get('planId')
  const isPlanMode = Boolean(planId)
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false)
  const [isAddReviewDrawerOpen, setIsAddReviewDrawerOpen] = useState(false)
  const [isReviewsDrawerOpen, setIsReviewsDrawerOpen] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(0)
  const [selectedBundleImageSrc, setSelectedBundleImageSrc] = useState(null)

  const activeItems = useMemo(
    () => itemsBySection[section] || [],
    [itemsBySection, section]
  )
  const isBundleSection = section === 'bundles'
  const selectedItem = activeItems.find((item) => item.id === itemId)

  const galleryImages = useMemo(() => {
    if (!selectedItem) {
      return []
    }

    const planImages = selectedItem.planItems
      ? selectedItem.planItems.map((item) => ({
          src: item.imageSrc,
          alt: item.imageAlt,
        }))
      : []

    const galleryCandidates =
      Array.isArray(selectedItem.galleryImages) && selectedItem.galleryImages.length > 0
        ? selectedItem.galleryImages
        : [
            {
              src: selectedItem.imageSrc,
              alt: selectedItem.imageAlt,
            },
            ...planImages,
          ]

    return galleryCandidates.filter(
      (image, index, collection) =>
        image?.src &&
        collection.findIndex((candidate) => candidate.src === image.src) === index
    )
  }, [selectedItem])
  const activeBundleImageSrc =
    isBundleSection &&
    selectedBundleImageSrc &&
    galleryImages.some((image) => image.src === selectedBundleImageSrc)
      ? selectedBundleImageSrc
      : undefined
  const pricingConfig = useMemo(() => {
    if (!selectedItem) {
      return undefined
    }

    const percentDiscountMatch = selectedItem.discountLabel?.match(/(\d+)% off for (\d+)\+/i)
    const freeUnitsDiscountMatch = selectedItem.discountLabel?.match(/buy (\d+) get (\d+) for free/i)

    if (section === 'menus') {
      return {
        baseAmount: selectedItem.priceValue ?? 0,
        calculationType: 'per_unit',
        unitLabel: 'people',
        defaultQuantity: 1,
        discount: percentDiscountMatch
          ? {
              type: 'percentage',
              value: Number(percentDiscountMatch[1]),
              minQuantity: Number(percentDiscountMatch[2]),
              label: selectedItem.discountLabel,
            }
          : undefined,
      }
    }

    if (section === 'decorations') {
      return {
        baseAmount: selectedItem.priceValue ?? 0,
        calculationType: 'per_unit',
        unitLabel: 'items',
        defaultQuantity: 1,
        discount: freeUnitsDiscountMatch
          ? {
              type: 'free_units',
              buyQuantity: Number(freeUnitsDiscountMatch[1]),
              freeQuantity: Number(freeUnitsDiscountMatch[2]),
              minQuantity:
                Number(freeUnitsDiscountMatch[1]) + Number(freeUnitsDiscountMatch[2]),
              label: selectedItem.discountLabel,
            }
          : undefined,
      }
    }

    if (section === 'venues') {
      return {
        baseAmount: selectedItem.priceValue ?? 0,
        calculationType: 'flat',
        unitLabel: 'booking',
        defaultQuantity: 1,
      }
    }

    if (section === 'entertainment') {
      return {
        baseAmount: selectedItem.priceValue ?? 0,
        calculationType: 'flat',
        unitLabel: 'booking',
        defaultQuantity: 1,
      }
    }

    if (section === 'bundles') {
      return {
        baseAmount: selectedItem.priceValue ?? 0,
        calculationType: 'flat',
        unitLabel: 'plan',
        defaultQuantity: 1,
      }
    }

    return undefined
  }, [section, selectedItem])

  const sampleReviews = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        id: `review-${index + 1}`,
        author: index % 2 === 0 ? 'Charbel' : 'Maya',
        dateLabel: index % 3 === 0 ? '22 Jul' : index % 3 === 1 ? '18 Jul' : '11 Jul',
        rating: index % 4 === 0 ? 4.5 : 5,
        avatarSrc:
          index % 2 === 0
            ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80'
            : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
        content:
          'The plate offered a tasty mix of meat, tawouk, and kafta, perfectly complemented by fresh vegetable sides. The flavors blended well together, creating a satisfying and well-balanced meal that was both filling and enjoyable.',
      })),
    [],
  )

  const handleProtectedAction = async (action) => {
    if (!isAuthenticated) {
      setIsSignInDialogOpen(true)
      return true
    }

    if (action) {
      try {
        await action()
      } catch (error) {
        showToast(error.message, 'error')
      }
    }

    return false
  }

  const handleFavoriteToggle = () => {
    if (!selectedItem) {
      return
    }

    const payload = getServicePayload(selectedItem, section)

    if (!payload.serviceId) {
      return
    }

    handleProtectedAction(async () => {
      const isFavorite = await toggleFavoriteItem(payload)
      showToast(isFavorite ? 'Added to favorites' : 'Removed from favorites')
    })
  }

  const getBundleComponentPayloads = () => {
    if (!selectedItem?.components) {
      return []
    }

    const { venue, menus = [], entertainment = [], decorations = [] } = selectedItem.components

    return [
      venue ? getCollectionItemPayload(venue, 'venues') : null,
      ...menus.map((item) => getCollectionItemPayload(item, 'menus')),
      ...entertainment.map((item) => getCollectionItemPayload(item, 'entertainment')),
      ...decorations.map((item) => getCollectionItemPayload(item, 'decorations')),
    ].filter(Boolean)
  }

  const handleAddToPlan = async ({ quantity = 1, selectedDate, customOptions } = {}) => {
    if (!selectedItem || !planId) {
      return
    }

    const itemPayloads =
      section === 'bundles'
        ? getBundleComponentPayloads()
        : [
            getCollectionItemPayload(selectedItem, section, {
              quantity,
              selectedOptions: {
                ...(customOptions || {}),
                ...(selectedDate ? { selectedDate } : {}),
              },
            }),
          ]

    if (!itemPayloads.length) {
      showToast('This template has no services to add', 'error')
      return
    }

    await Promise.all(itemPayloads.map((payload) => addItemToCustomizedPlan(planId, payload)))
    showToast(section === 'bundles' ? 'Template added to plan' : 'Item added to plan')
    navigate(`/customize?planId=${planId}`)
  }
  const handleAddToCart = ({ event, quantity = 1, selectedDate, customOptions } = {}) => {
    if (!selectedItem) {
      return
    }

    const payload = getServicePayload(selectedItem, section)

    if (!payload.serviceId) {
      return
    }

    handleProtectedAction(async () => {
      if (isPlanMode) {
        await handleAddToPlan({ quantity, selectedDate, customOptions })
        return
      }

      await addCartItem({
        ...payload,
        quantity,
        selectedDate,
        customOptions,
      })
      showToast('Added to cart')
      openCollectionPicker(event, selectedItem, section, { quantity, selectedDate, customOptions })
    })
  }

  const handleOpenAddReviewDrawer = () => {
    if (handleProtectedAction()) {
      return
    }

    setIsAddReviewDrawerOpen(true)
  }

  const handleCloseAddReviewDrawer = () => {
    setIsAddReviewDrawerOpen(false)
  }

  const handlePostReview = () => {
    setIsAddReviewDrawerOpen(false)
    setReviewText('')
    setReviewRating(0)
  }

  const handleOpenReviewsDrawer = () => {
    setIsReviewsDrawerOpen(true)
  }

  const handleCloseReviewsDrawer = () => {
    setIsReviewsDrawerOpen(false)
  }

  if (!selectedItem) {
    return <Navigate to="/services" replace />
  }

  return (
    <>
      <Box sx={{ minHeight: 'calc(100vh - 180px)' }}>
        <ServiceItemGalleryDialog
          key={selectedItem.id}
          title={selectedItem.title}
          images={galleryImages}
          discountLabel={selectedItem.discountLabel}
          isFavorite={Boolean(
            favoriteItems[
              getFavoriteKey(section, getServicePayload(selectedItem, section).serviceId)
            ]
          )}
          vendorName={selectedItem.vendorName}
          vendorLocation={selectedItem.vendorLocation}
          vendorLogoSrc={selectedItem.vendorLogoSrc}
          vendorLogoAlt={selectedItem.vendorLogoAlt}
          ratingValue={selectedItem.ratingValue}
          reviewCount={selectedItem.reviewCount}
          description={selectedItem.detailsDescription || selectedItem.description}
          priceText={selectedItem.priceText}
          detailBadgeText={selectedItem.detailBadgeText}
          supportingInfoText={selectedItem.supportingInfoText || selectedItem.guestText}
          showPeopleSelector={selectedItem.showPeopleSelector}
          peopleLabel={selectedItem.peopleLabel}
          datePlaceholder={selectedItem.datePlaceholder}
          timePlaceholder={selectedItem.timePlaceholder}
          actionButtonText={isPlanMode ? 'Add to Plan' : selectedItem.actionButtonText}
          pricing={pricingConfig}
          selectedImageSrc={activeBundleImageSrc}
          onSelectedImageChange={isBundleSection ? setSelectedBundleImageSrc : undefined}
          onAddToCart={handleAddToCart}
          onFavoriteToggle={handleFavoriteToggle}
          onBack={() =>
            navigate(
              isPlanMode
                ? `/services?planId=${planId}#${section}`
                : `/services#${section}`
            )
          }
          belowGalleryContent={
            isBundleSection ? (
              <BundlePlanItems
                items={selectedItem.planItems}
                selectedImageSrc={activeBundleImageSrc || selectedItem.imageSrc}
                onItemSelect={setSelectedBundleImageSrc}
              />
            ) : null
          }
          leftBottomContent={
            isBundleSection ? null : (
              <ReviewsSection
                averageRating={selectedItem.ratingValue ?? 4.5}
                reviewCount={selectedItem.reviewCount ?? 120}
                reviews={sampleReviews}
                onAddReviewClick={handleOpenAddReviewDrawer}
                onViewAllClick={handleOpenReviewsDrawer}
              />
            )
          }
        />
      </Box>

      {isBundleSection ? null : (
        <AddReviewDrawer
          open={isAddReviewDrawerOpen}
          onClose={handleCloseAddReviewDrawer}
          reviewValue={reviewText}
          onReviewChange={setReviewText}
          ratingValue={reviewRating}
          onRatingChange={setReviewRating}
          onAddPictureClick={() => console.log(`Add review picture clicked: ${selectedItem.id}`)}
          onPostReviewClick={handlePostReview}
        />
      )}

      {isReviewsDrawerOpen && !isBundleSection ? (
        <ReviewsDrawer
          open={isReviewsDrawerOpen}
          onClose={handleCloseReviewsDrawer}
          averageRating={selectedItem.ratingValue ?? 4.5}
          reviewCount={selectedItem.reviewCount ?? 120}
          reviews={sampleReviews}
          onAddReviewClick={handleOpenAddReviewDrawer}
        />
      ) : null}

      <AlertDialog
        open={isSignInDialogOpen}
        onClose={() => setIsSignInDialogOpen(false)}
        title="Sign in to continue"
        titleColor={COLORS.primary}
        description="To be able to add items to your cart or favorites please sign in now"
        primaryButtonText="Sign in"
        primaryButtonColor={COLORS.accent}
        onPrimaryButtonClick={() =>
          navigate('/login', {
            state: {
              from: `${location.pathname}${location.search}${location.hash}`,
            },
          })
        }
        secondaryActionText="Back to guest mode"
        secondaryActionColor={COLORS.primary}
        onSecondaryActionClick={() => setIsSignInDialogOpen(false)}
      />
    </>
  )
}

export default ServiceItemPage

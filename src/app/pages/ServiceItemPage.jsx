import { Box } from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { COLORS } from '../constants/colors'
import { useFavoriteActions, getFavoriteKey } from '../hooks/useFavoriteActions'
import { useServicesData } from '../hooks/useServicesData'
import { addItemToCustomizedPlan } from '../services/customizedPlans'
import {
  checkReviewEligibility,
  createServiceReview,
  getServiceReviews,
} from '../services/reviews'
import { useToast } from '../toast/useToast'
import { getCollectionItemPayload, getServicePayload } from '../utils/servicePayload'
import AddReviewDrawer from '../shared/components/AddReviewDrawer'
import AlertDialog from '../shared/components/AlertDialog'
import BundlePlanItems from '../shared/components/BundlePlanItems'
import ReviewsSection from '../shared/components/ReviewsSection'
import ReviewsDrawer from '../shared/components/ReviewsDrawer'
import ServiceItemGalleryDialog from '../shared/components/ServiceItemGalleryDialog'
import { useCollectionCartAction } from '../hooks/useCollectionCartAction'

function ServiceItemPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const { itemsBySection } = useServicesData()
  const { favoriteItems, toggleFavoriteItem } = useFavoriteActions()
   const { collectionPickerDialog, openCollectionPicker } = useCollectionCartAction()
  const { section, itemId } = useParams()
  const planId = searchParams.get('planId')
  const isPlanMode = Boolean(planId)
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false)
  const [isAddReviewDrawerOpen, setIsAddReviewDrawerOpen] = useState(false)
  const [isReviewsDrawerOpen, setIsReviewsDrawerOpen] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(0)
  const [reviews, setReviews] = useState([])
  const [averageRating, setAverageRating] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)
  const [isReviewsLoading, setIsReviewsLoading] = useState(false)
  const [reviewsError, setReviewsError] = useState('')
  const [isSavingReview, setIsSavingReview] = useState(false)
  const [reviewFormError, setReviewFormError] = useState('')
  const [canReview, setCanReview] = useState(false)
  const [isCheckingReviewEligibility, setIsCheckingReviewEligibility] = useState(false)
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

  const formatReviewDate = (value) => {
    if (!value) {
      return ''
    }

    return new Intl.DateTimeFormat(undefined, {
      day: '2-digit',
      month: 'short',
    }).format(new Date(value))
  }

  const normalizeReview = (review) => ({
    id: review.id,
    author: review.userName || 'Eventful user',
    avatarSrc: review.userAvatar || '',
    dateLabel: formatReviewDate(review.createdAt),
    rating: review.rating,
    content: review.comment,
  })

  const applyReviewsPayload = (payload = {}) => {
    setReviews((payload.reviews || []).map(normalizeReview))
    setAverageRating(payload.averageRating || 0)
    setReviewCount(payload.reviewCount || 0)
  }

  const loadReviews = useCallback(async () => {
    if (!section || !itemId || isBundleSection) {
      return
    }

    setIsReviewsLoading(true)
    setReviewsError('')

    try {
      const result = await getServiceReviews(section, itemId)
      applyReviewsPayload(result.data)
    } catch (error) {
      setReviewsError(error.message || 'Could not load reviews')
    } finally {
      setIsReviewsLoading(false)
    }
  }, [section, itemId, isBundleSection])

  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  const loadReviewEligibility = useCallback(async () => {
    if (!isAuthenticated || !section || !itemId || isBundleSection) {
      setCanReview(false)
      return
    }

    setIsCheckingReviewEligibility(true)

    try {
      const result = await checkReviewEligibility(section, itemId)
      setCanReview(Boolean(result.data?.canReview))
    } catch {
      setCanReview(false)
    } finally {
      setIsCheckingReviewEligibility(false)
    }
  }, [isAuthenticated, section, itemId, isBundleSection])

  useEffect(() => {
    loadReviewEligibility()
  }, [loadReviewEligibility])

  const displayAverageRating = reviewCount > 0
    ? averageRating
    : selectedItem?.ratingValue ?? 0
  const canShowAddReview = canReview && !isCheckingReviewEligibility

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

      openCollectionPicker(event, selectedItem, section, { quantity, selectedDate, customOptions })
    })
  }

  const handleOpenAddReviewDrawer = () => {
    if (!isAuthenticated) {
      setIsSignInDialogOpen(true)
      return
    }

    if (!canReview) {
      return
    }

    setReviewFormError('')
    setIsAddReviewDrawerOpen(true)
  }

  const handleCloseAddReviewDrawer = () => {
    setIsAddReviewDrawerOpen(false)
    setReviewFormError('')
  }

  const handlePostReview = async () => {
    const comment = reviewText.trim()

    if (!reviewRating) {
      setReviewFormError('Please choose a rating')
      return
    }

    if (!comment) {
      setReviewFormError('Please enter your review')
      return
    }

    setIsSavingReview(true)
    setReviewFormError('')

    try {
      const result = await createServiceReview(section, itemId, {
        rating: reviewRating,
        comment,
      })
      applyReviewsPayload(result.data)
      setIsAddReviewDrawerOpen(false)
      setReviewText('')
      setReviewRating(0)
      setCanReview(false)
      showToast('Review added successfully', 'success')
    } catch (error) {
      setReviewFormError(error.message || 'Could not add review')
    } finally {
      setIsSavingReview(false)
    }
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
          ratingValue={displayAverageRating}
          reviewCount={reviewCount}
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
                averageRating={displayAverageRating}
                reviewCount={reviewCount}
                reviews={reviews}
                isLoading={isReviewsLoading}
                error={reviewsError}
                onAddReviewClick={canShowAddReview ? handleOpenAddReviewDrawer : undefined}
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
          isSubmitting={isSavingReview}
          error={reviewFormError}
        />
      )}

      {isReviewsDrawerOpen && !isBundleSection ? (
        <ReviewsDrawer
          open={isReviewsDrawerOpen}
          onClose={handleCloseReviewsDrawer}
          averageRating={displayAverageRating}
          reviewCount={reviewCount}
          reviews={reviews}
          isLoading={isReviewsLoading}
          error={reviewsError}
          onAddReviewClick={canShowAddReview ? handleOpenAddReviewDrawer : undefined}
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
      {collectionPickerDialog}
    </>
  )
}

export default ServiceItemPage

import { Box } from '@mui/material'
import { useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { BUNDLE_CARDS } from '../constants/bundleCards'
import { DECORATION_ITEMS } from '../constants/decorationItems'
import { ENTERTAINMENT_ITEMS } from '../constants/entertainmentItems'
import { MENU_ITEMS } from '../constants/menuItems'
import { VENUE_ITEMS } from '../constants/venueItems'
import { COLORS } from '../constants/colors'
import AddReviewDrawer from '../shared/components/AddReviewDrawer'
import AlertDialog from '../shared/components/AlertDialog'
import ReviewsSection from '../shared/components/ReviewsSection'
import ServiceItemGalleryDialog from '../shared/components/ServiceItemGalleryDialog'

const itemsBySection = {
  bundles: BUNDLE_CARDS,
  menus: MENU_ITEMS,
  venues: VENUE_ITEMS,
  decorations: DECORATION_ITEMS,
  entertainment: ENTERTAINMENT_ITEMS,
}

function ServiceItemPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { section, itemId } = useParams()
  const [favoriteItems, setFavoriteItems] = useState({})
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false)
  const [isAddReviewDrawerOpen, setIsAddReviewDrawerOpen] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(0)

  const activeItems = useMemo(() => itemsBySection[section] || [], [section])
  const selectedItem = activeItems.find((item) => item.id === itemId)

  const galleryImages = useMemo(() => {
    if (!selectedItem) {
      return []
    }

    const galleryCandidates = [
      {
        src: selectedItem.imageSrc,
        alt: selectedItem.imageAlt,
      },
      ...activeItems
        .filter((item) => item.id !== selectedItem.id)
        .map((item) => ({
          src: item.imageSrc,
          alt: item.imageAlt,
        })),
    ]

    return galleryCandidates.filter(
      (image, index, collection) =>
        collection.findIndex((candidate) => candidate.src === image.src) === index
    )
  }, [activeItems, selectedItem])

  const sampleReviews = useMemo(
    () => [
      {
        id: 'review-1',
        author: 'Charbel',
        dateLabel: '22 Jul',
        rating: 4.5,
        avatarSrc:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
        content:
          'The plate offered a tasty mix of meat, tawouk, and kafta, perfectly complemented by fresh vegetable sides. The flavors blended well together, creating a satisfying and well-balanced meal that was both filling and enjoyable.',
      },
      {
        id: 'review-2',
        author: 'Charbel',
        dateLabel: '22 Jul',
        rating: 4.5,
        avatarSrc:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
        content:
          'The plate offered a tasty mix of meat, tawouk, and kafta, perfectly complemented by fresh vegetable sides. The flavors blended well together, creating a satisfying and well-balanced meal that was both filling and enjoyable.',
      },
    ],
    []
  )

  const handleProtectedAction = () => {
    if (!isAuthenticated) {
      setIsSignInDialogOpen(true)
      return true
    }

    return false
  }

  const handleFavoriteToggle = () => {
    if (!selectedItem) {
      return
    }

    if (handleProtectedAction()) {
      return
    }

    setFavoriteItems((current) => ({
      ...current,
      [selectedItem.id]: !current[selectedItem.id],
    }))
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

  if (!selectedItem) {
    return <Navigate to="/services" replace />
  }

  return (
    <>
      <Box sx={{ minHeight: 'calc(100vh - 180px)' }}>
        <ServiceItemGalleryDialog
          title={selectedItem.title}
          images={galleryImages}
          discountLabel={selectedItem.discountLabel}
          isFavorite={Boolean(favoriteItems[selectedItem.id])}
          vendorName={selectedItem.vendorName}
          vendorLocation={selectedItem.vendorLocation}
          vendorLogoSrc={selectedItem.vendorLogoSrc}
          vendorLogoAlt={selectedItem.vendorLogoAlt}
          ratingValue={selectedItem.ratingValue}
          reviewCount={selectedItem.reviewCount}
          description={selectedItem.detailsDescription || selectedItem.description}
          priceText={selectedItem.priceText}
          onAddToCart={handleProtectedAction}
          onFavoriteToggle={handleFavoriteToggle}
          onBack={() => navigate(`/services#${section}`)}
          leftBottomContent={
            <ReviewsSection
              averageRating={selectedItem.ratingValue ?? 4.5}
              reviewCount={selectedItem.reviewCount ?? 120}
              reviews={sampleReviews}
              onAddReviewClick={handleOpenAddReviewDrawer}
              onViewAllClick={() => console.log(`View all reviews clicked: ${selectedItem.id}`)}
            />
          }
        />
      </Box>

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

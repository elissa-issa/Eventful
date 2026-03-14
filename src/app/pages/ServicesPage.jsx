import { useState } from 'react'
import { Box } from '@mui/material'
import { useLocation } from 'react-router-dom'
import { BUNDLE_CARDS } from '../constants/bundleCards'
import { DECORATION_ITEMS } from '../constants/decorationItems'
import { ENTERTAINMENT_ITEMS } from '../constants/entertainmentItems'
import { MENU_ITEMS } from '../constants/menuItems'
import { VENUE_ITEMS } from '../constants/venueItems'
import { COLORS } from '../constants/colors'
import AlertDialog from '../shared/components/AlertDialog'
import BundleCard from '../shared/components/BundleCard'
import ServiceCard from '../shared/components/ServiceCard'
import ServicesSubnav from '../shared/navigation/ServicesSubnav'

function ServicesPage() {
  const isLoggedIn = false
  const location = useLocation()
  const [favoriteItems, setFavoriteItems] = useState({})
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false)

  const activeSection = location.hash.replace('#', '') || 'menus'

  const handleProtectedAction = () => {
    if (!isLoggedIn) {
      setIsSignInDialogOpen(true)
      return true
    }

    return false
  }

  const handleFavoriteToggle = (itemId) => {
    if (handleProtectedAction()) {
      return
    }

    setFavoriteItems((current) => ({
      ...current,
      [itemId]: !current[itemId],
    }))
  }

  const itemsBySection = {
    bundles: BUNDLE_CARDS,
    menus: MENU_ITEMS,
    venues: VENUE_ITEMS,
    decorations: DECORATION_ITEMS,
    entertainment: ENTERTAINMENT_ITEMS,
  }

  const activeItems = itemsBySection[activeSection] || []
  const isBundleSection = activeSection === 'bundles'

  return (
    <>
      <ServicesSubnav />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(3, minmax(0, 1fr))',
          },
          gap: 2.25,
          pt: 2.5,
        }}
      >
        {isBundleSection
          ? activeItems.map((item, index) => {
              const itemKey = `${item.id}-${index}`

              return (
                <BundleCard
                  key={itemKey}
                  imageSrc={item.imageSrc}
                  imageAlt={item.imageAlt}
                  title={item.title}
                  isFavorite={Boolean(favoriteItems[itemKey])}
                  onFavoriteToggle={() => handleFavoriteToggle(itemKey)}
                  leftText={item.leftText}
                  rightText={item.rightText}
                  primaryButtonLabel={item.primaryButtonLabel}
                  onPrimaryButtonClick={() => console.log(`View plan clicked: ${itemKey}`)}
                  secondaryButtonLabel={item.secondaryButtonLabel}
                  onSecondaryButtonClick={handleProtectedAction}
                  maxWidth={400}
                  imageHeight={312}
                  cardBorderRadius={2}
                  contentPaddingX={0.5}
                  contentPaddingTop={1.8}
                  contentPaddingBottom={12.8}
                />
              )
            })
          : activeItems.map((item) => (
              <ServiceCard
                key={item.id}
                imageSrc={item.imageSrc}
                imageAlt={item.imageAlt}
                title={item.title}
                description={item.description}
                guestText={item.guestText}
                priceText={item.priceText}
                discountLabel={item.discountLabel}
                vendorLogoSrc={item.vendorLogoSrc}
                vendorLogoAlt={item.vendorLogoAlt}
                isFavorite={Boolean(favoriteItems[item.id])}
                onFavoriteToggle={() => handleFavoriteToggle(item.id)}
                onViewButtonClick={() => console.log(`View item clicked: ${item.id}`)}
                onCartButtonClick={handleProtectedAction}
              />
            ))}
      </Box>

      <AlertDialog
        open={isSignInDialogOpen}
        onClose={() => setIsSignInDialogOpen(false)}
        title="Sign in to continue"
        titleColor={COLORS.primary}
        description="To be able to add items to your cart or favorites please sign in now"
        primaryButtonText="Sign in"
        primaryButtonColor={COLORS.accent}
        onPrimaryButtonClick={() => setIsSignInDialogOpen(false)}
        secondaryActionText="Back to guest mode"
        secondaryActionColor={COLORS.primary}
        onSecondaryActionClick={() => setIsSignInDialogOpen(false)}
      />
    </>
  )
}

export default ServicesPage

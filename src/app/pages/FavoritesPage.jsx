import { Stack, Typography } from '@mui/material'
import { COLORS } from '../constants/colors'
import { FAVORITE_ITEMS } from '../constants/favoriteItems'
import FavoriteItemCard from '../shared/components/FavoriteItemCard'

function FavoritesPage() {
  return (
    <Stack spacing={2.2} sx={{ py: { xs: 3, md: 4 } }}>
      <Typography variant="h4" sx={{ color: COLORS.primary, fontWeight: 800 }}>
        My Favorites
      </Typography>

      {FAVORITE_ITEMS.map((item) => (
        <FavoriteItemCard
          key={item.id}
          imageSrc={item.imageSrc}
          imageAlt={item.imageAlt}
          title={item.title}
          subtitle={item.subtitle}
          vendorLogoSrc={item.vendorLogoSrc}
          vendorLogoAlt={item.vendorLogoAlt}
          description={item.description}
          detailText={item.detailText}
          priceText={item.priceText}
        />
      ))}
    </Stack>
  )
}

export default FavoritesPage

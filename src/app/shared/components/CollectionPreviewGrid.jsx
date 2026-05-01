import { Box, Typography } from '@mui/material'
import CollectionsBookmarkRoundedIcon from '@mui/icons-material/CollectionsBookmarkRounded'
import { COLORS } from '../../constants/colors'

function getPreviewImage(item) {
  return (
    item?.image ||
    item?.imageUrl ||
    item?.coverImage ||
    item?.imageSnapshot ||
    item?.imageSrc ||
    item?.service?.image ||
    item?.service?.imageUrl ||
    item?.service?.coverImage ||
    item?.service?.imageSnapshot ||
    item?.service?.imageSrc ||
    ''
  )
}

function getPreviewAlt(item) {
  return (
    item?.imageAlt ||
    item?.titleSnapshot ||
    item?.title ||
    item?.service?.imageAlt ||
    item?.service?.title ||
    'Collection item'
  )
}

function PreviewImage({ item, overlayCount = 0 }) {
  const image = getPreviewImage(item)

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minWidth: 0,
        overflow: 'hidden',
        backgroundColor: '#e5e5e5',
      }}
    >
      {image ? (
        <Box
          component="img"
          src={image}
          alt={getPreviewAlt(item)}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            filter: overlayCount > 0 ? 'brightness(0.55)' : 'none',
          }}
        />
      ) : null}

      {overlayCount > 0 ? (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            color: COLORS.surface,
            fontWeight: 900,
            fontSize: '2rem',
          }}
        >
          +{overlayCount}
        </Box>
      ) : null}
    </Box>
  )
}

function EmptyPreview() {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'grid',
        placeItems: 'center',
        color: COLORS.textLight,
        backgroundColor: '#e5e5e5',
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <CollectionsBookmarkRoundedIcon sx={{ fontSize: 42, mb: 0.8 }} />
        <Typography sx={{ fontWeight: 700 }}>No items yet</Typography>
      </Box>
    </Box>
  )
}

function CollectionPreviewGrid({ items = [], height = 260 }) {
  const visibleItems = items.slice(0, 4)
  const extraCount = Math.max(items.length - 4, 0)

  return (
    <Box
      sx={{
        width: '100%',
        height,
        borderRadius: 2,
        overflow: 'hidden',
        backgroundColor: '#e5e5e5',
      }}
    >
      {items.length === 0 ? <EmptyPreview /> : null}

      {items.length === 1 ? <PreviewImage item={visibleItems[0]} /> : null}

      {items.length === 2 ? (
        <Box sx={{ height: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
          <PreviewImage item={visibleItems[0]} />
          <PreviewImage item={visibleItems[1]} />
        </Box>
      ) : null}

      {items.length === 3 ? (
        <Box sx={{ height: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
          <PreviewImage item={visibleItems[0]} />
          <Box sx={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 1, minHeight: 0 }}>
            <PreviewImage item={visibleItems[1]} />
            <PreviewImage item={visibleItems[2]} />
          </Box>
        </Box>
      ) : null}

      {items.length >= 4 ? (
        <Box
          sx={{
            height: '100%',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '1fr 1fr',
            gap: 1,
          }}
        >
          {visibleItems.map((item, index) => (
            <PreviewImage
              key={item.id || item._id || `${item.section || 'item'}-${item.itemId || index}`}
              item={item}
              overlayCount={index === 3 ? extraCount : 0}
            />
          ))}
        </Box>
      ) : null}
    </Box>
  )
}

export default CollectionPreviewGrid

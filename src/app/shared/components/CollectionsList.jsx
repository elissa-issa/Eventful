import { Box, Button, Stack, Typography } from '@mui/material'
import { COLORS } from '../../constants/colors'
import CollectionPreviewGrid from './CollectionPreviewGrid'

function CollectionCard({
  collection,
  onView,
  onDelete,
  titleSuffix,
  viewLabel = 'View collection',
  selected = false,
  spacing = 1.35,
}) {
  const previewItems = collection.items || collection.previewItems || []
  const itemCount = collection.items?.length ?? collection.totalItems ?? 0
  const itemCountText = itemCount === 1 ? '1 item' : `${itemCount} items`
  const title = collection.name || collection.title || 'Untitled Collection'

  return (
    <Stack
      spacing={spacing}
      sx={{
        height: '100%',
        outline: selected ? '3px solid #1496ff' : '3px solid transparent',
        outlineOffset: 5,
      }}
    >
      <CollectionPreviewGrid items={previewItems} height={260} />

      <Box sx={{ minHeight: 52 }}>
        <Typography
          sx={{
            color: COLORS.primary,
            fontWeight: 800,
            fontSize: { xs: '1rem', sm: '1.05rem' },
            textTransform: 'uppercase',
            lineHeight: 1.15,
          }}
        >
          {titleSuffix ? title.replace(/Collection$/i, titleSuffix) : title}
        </Typography>
        <Typography sx={{ mt: 0.45, color: COLORS.textLight, fontSize: '0.9rem', fontWeight: 600 }}>
          {itemCountText}
        </Typography>
      </Box>

      <Stack direction="row" spacing={2} sx={{ mt: 'auto' }}>
        <Button
          variant="contained"
          onClick={onView}
          sx={{
            flex: 1,
            minHeight: 42,
            borderRadius: 1,
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
            backgroundColor: COLORS.primary,
            '&:hover': {
              backgroundColor: COLORS.primaryHover,
            },
          }}
        >
          {viewLabel}
        </Button>

        <Button
          variant="contained"
          onClick={onDelete}
          sx={{
            flex: 1,
            minHeight: 42,
            borderRadius: 1,
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
            backgroundColor: '#f44336',
            '&:hover': {
              backgroundColor: '#da362a',
            },
          }}
        >
          Delete
        </Button>
      </Stack>
    </Stack>
  )
}

function CollectionsList({
  collections,
  onViewCollection,
  onDeleteCollection,
  getCollectionSelected,
  cardSpacing,
  titleSuffix,
  viewLabel,
  sx,
}) {
  return (
    <Box
      sx={[
        {
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
          },
          gap: { xs: 3, sm: 4 },
          alignItems: 'stretch',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {collections.map((collection, index) => (
        <CollectionCard
          key={collection.id}
          collection={collection}
          selected={getCollectionSelected?.(collection, index) || false}
          spacing={cardSpacing}
          titleSuffix={titleSuffix}
          viewLabel={viewLabel}
          onView={() => onViewCollection(collection.id)}
          onDelete={() => onDeleteCollection(collection.id)}
        />
      ))}
    </Box>
  )
}

export default CollectionsList

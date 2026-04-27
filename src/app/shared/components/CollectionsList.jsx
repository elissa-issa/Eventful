import { useMemo } from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import { COLORS } from '../../constants/colors'

function CollectionPreviewTile({ item, extraCount = 0 }) {
  return (
    <Box
      sx={{
        position: 'relative',
        aspectRatio: '1 / 1',
        borderRadius: 1,
        overflow: 'hidden',
        backgroundColor: COLORS.border,
      }}
    >
      <Box
        component="img"
        src={item.imageSrc}
        alt={item.imageAlt}
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          filter: extraCount > 0 ? 'brightness(0.58)' : 'none',
        }}
      />

      {extraCount > 0 ? (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            color: COLORS.surface,
            fontWeight: 900,
            fontSize: { xs: '1.85rem', sm: '2.1rem' },
          }}
        >
          +{extraCount}
        </Box>
      ) : null}
    </Box>
  )
}

function CollectionCard({
  collection,
  onView,
  onDelete,
  titleSuffix,
  viewLabel = 'View collection',
  selected = false,
  spacing = 1.65,
}) {
  const extraCount = Math.max(collection.totalItems - collection.previewItems.length, 0)
  const previewItems = useMemo(
    () =>
      collection.previewItems.slice(0, 4).map((item, index, array) => ({
        ...item,
        extraCount: index === array.length - 1 ? extraCount : 0,
      })),
    [collection.previewItems, extraCount],
  )

  return (
    <Stack
      spacing={spacing}
      sx={{
        outline: selected ? '3px solid #1496ff' : '3px solid transparent',
        outlineOffset: 5,
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 1.75,
        }}
      >
        {previewItems.map((item) => (
          <CollectionPreviewTile key={item.id} item={item} extraCount={item.extraCount} />
        ))}
      </Box>

      <Typography
        sx={{
          color: COLORS.primary,
          fontWeight: 800,
          fontSize: { xs: '1rem', sm: '1.05rem' },
          textTransform: 'uppercase',
        }}
      >
        {titleSuffix ? collection.title.replace(/Collection$/i, titleSuffix) : collection.title}
      </Typography>

      <Stack direction="row" spacing={2}>
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

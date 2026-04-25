import { useMemo, useState } from 'react'
import { Box, Container, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { MY_COLLECTIONS } from '../constants/myCollections'
import { COLORS } from '../constants/colors'
import CollectionsList from '../shared/components/CollectionsList'
import CreateCollectionCard from '../shared/components/CreateCollectionCard'

function MyCollectionsPage() {
  const navigate = useNavigate()
  const [collections, setCollections] = useState(MY_COLLECTIONS)

  const hasCollections = useMemo(() => collections.length > 0, [collections])

  const handleDeleteCollection = (collectionId) => {
    setCollections((current) => current.filter((collection) => collection.id !== collectionId))
  }

  const handleViewCollection = (collectionId) => {
    navigate(`/cart?collection=${collectionId}`)
  }

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 180px)',
        backgroundColor: COLORS.surface,
        py: { xs: 3.5, md: 4.5 },
      }}
    >
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Typography
            sx={{
              color: COLORS.primary,
              fontWeight: 800,
              fontSize: { xs: '2rem', md: '2.25rem' },
            }}
          >
            My Collections
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(3, minmax(0, 1fr))',
              },
              gap: { xs: 3, sm: 4 },
              alignItems: 'stretch',
            }}
          >
            {hasCollections ? (
              <CollectionsList
                collections={collections}
                onViewCollection={handleViewCollection}
                onDeleteCollection={handleDeleteCollection}
                sx={{ display: 'contents' }}
              />
            ) : (
              <Box
                sx={{
                  minHeight: 306,
                  borderRadius: 3,
                  border: `1px dashed ${COLORS.borderStrong}`,
                  display: 'grid',
                  placeItems: 'center',
                  px: 3,
                }}
              >
                <Typography
                  sx={{
                    color: COLORS.textLight,
                    textAlign: 'center',
                    fontWeight: 600,
                  }}
                >
                  You do not have any collections yet. Create a new one to start building your
                  event.
                </Typography>
              </Box>
            )}

            <CreateCollectionCard onClick={() => navigate('/services')} />
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}

export default MyCollectionsPage

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Container, Stack, TextField, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { COLORS } from '../constants/colors'
import { createCollection, deleteCollection, getCollections } from '../services/collections'
import { useToast } from '../toast/useToast'
import CollectionsList from '../shared/components/CollectionsList'
import CreateCollectionCard from '../shared/components/CreateCollectionCard'

function MyCollectionsPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [collections, setCollections] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [newCollectionName, setNewCollectionName] = useState('')

  const hasCollections = useMemo(() => collections.length > 0, [collections])

  const loadCollections = useCallback(
    async () => {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const result = await getCollections()
        setCollections(result.data || [])
      } catch (error) {
        setErrorMessage(error.message || 'Could not load collections')
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    loadCollections()
  }, [loadCollections])

  const handleDeleteCollection = async (collectionId) => {
    try {
      await deleteCollection(collectionId)
      setCollections((current) => current.filter((collection) => collection.id !== collectionId))
      showToast('Collection deleted')
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const handleCreateCollection = async () => {
    const name = newCollectionName.trim()

    if (!name) {
      showToast('Collection name is required', 'error')
      return
    }

    try {
      const result = await createCollection({ name })
      setCollections((current) => [result.data, ...current])
      setNewCollectionName('')
      showToast('Collection created')
    } catch (error) {
      showToast(error.message, 'error')
    }
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

          {isLoading ? (
            <Typography sx={{ color: COLORS.primary, fontWeight: 700 }}>
              Loading collections...
            </Typography>
          ) : null}

          {errorMessage ? (
            <Typography sx={{ color: '#d32f2f', fontWeight: 700 }}>{errorMessage}</Typography>
          ) : null}

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
            {!isLoading && hasCollections ? (
              <CollectionsList
                collections={collections}
                onViewCollection={(collectionId) => navigate(`/cart?collectionId=${collectionId}`)}
                onDeleteCollection={handleDeleteCollection}
                sx={{ display: 'contents' }}
              />
            ) : null}

            {!isLoading && !hasCollections ? (
              <Box
                sx={{
                  minHeight: 306,
                  borderRadius: 2,
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
            ) : null}

            <Stack spacing={1.5}>
              <TextField
                size="small"
                label="Collection name"
                value={newCollectionName}
                onChange={(event) => setNewCollectionName(event.target.value)}
              />
              <CreateCollectionCard onClick={handleCreateCollection} />
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}

export default MyCollectionsPage

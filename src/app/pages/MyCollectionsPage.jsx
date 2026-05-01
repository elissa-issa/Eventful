import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { COLORS } from '../constants/colors'
import { deleteCollection, getCollections } from '../services/collections'
import { useToast } from '../toast/useToast'
import CollectionsList from '../shared/components/CollectionsList'
import CreateCollectionCard from '../shared/components/CreateCollectionCard'

function MyCollectionsPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [collections, setCollections] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [collectionToDelete, setCollectionToDelete] = useState(null)
  const [isDeletingCollection, setIsDeletingCollection] = useState(false)

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

  const handleAskDelete = (collectionId) => {
    const collection = collections.find((item) => item.id === collectionId)
    setCollectionToDelete(collection || { id: collectionId })
  }

  const handleCancelDelete = () => {
    if (!isDeletingCollection) {
      setCollectionToDelete(null)
    }
  }

  const handleConfirmDelete = async () => {
    if (!collectionToDelete) {
      return
    }

    try {
      setIsDeletingCollection(true)
      await deleteCollection(collectionToDelete.id)
      setCollections((current) =>
        current.filter((collection) => collection.id !== collectionToDelete.id),
      )
      setCollectionToDelete(null)
      showToast('Collection deleted successfully', 'success')
    } catch (error) {
      showToast(error.message || 'Could not delete collection', 'error')
    } finally {
      setIsDeletingCollection(false)
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
              alignItems: 'start',
            }}
          >
            {!isLoading && hasCollections ? (
              <CollectionsList
                collections={collections}
                onViewCollection={(collectionId) => navigate(`/cart?collectionId=${collectionId}`)}
                onDeleteCollection={handleAskDelete}
                sx={{ display: 'contents' }}
              />
            ) : null}

            <CreateCollectionCard onClick={() => navigate('/services')} />
          </Box>
        </Stack>
      </Container>

      <Dialog open={Boolean(collectionToDelete)} onClose={handleCancelDelete} fullWidth maxWidth="xs">
        <DialogTitle sx={{ color: COLORS.primary, fontWeight: 800 }}>
          Delete collection?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: COLORS.textLight }}>
            Are you sure you want to delete this collection?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={handleCancelDelete}
            disabled={isDeletingCollection}
            sx={{ color: COLORS.primary, textTransform: 'none', fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmDelete}
            disabled={isDeletingCollection}
            sx={{
              backgroundColor: '#f44336',
              textTransform: 'none',
              fontWeight: 700,
              '&:hover': { backgroundColor: '#da362a' },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default MyCollectionsPage

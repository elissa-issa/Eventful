import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { COLORS } from '../../constants/colors'
import {
  addItemToCollection,
  createCollection,
  getCollections,
} from '../../services/collections'

function CollectionPickerDialog({ open, itemPayload, onClose, onAdded }) {
  const [collections, setCollections] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [newCollectionName, setNewCollectionName] = useState('')

  useEffect(() => {
    if (!open) {
      return undefined
    }

    let isMounted = true
    setIsLoading(true)
    setErrorMessage('')

    getCollections()
      .then((result) => {
        if (isMounted) {
          setCollections(result.data || [])
        }
      })
      .catch((error) => {
        if (isMounted) {
          setErrorMessage(error.message || 'Could not load collections')
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [open])

  const handleCreateCollection = async () => {
    const name = newCollectionName.trim()

    if (!name) {
      setErrorMessage('Collection name is required')
      return
    }

    setIsSaving(true)
    setErrorMessage('')

    try {
      const result = await createCollection({ name })
      const collection = result.data
      setCollections((current) => [collection, ...current])
      setNewCollectionName('')
    } catch (error) {
      setErrorMessage(error.message || 'Could not create collection')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSelectCollection = async (collectionId) => {
    if (!itemPayload) {
      return
    }

    setIsSaving(true)
    setErrorMessage('')

    try {
      await addItemToCollection(collectionId, itemPayload)
      onAdded?.(collectionId)
    } catch (error) {
      setErrorMessage(error.message || 'Could not add item to collection')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={isSaving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ color: COLORS.primary, fontWeight: 800 }}>
        Choose a collection
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          {isLoading ? (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <CircularProgress size={20} />
              <Typography sx={{ color: COLORS.primary, fontWeight: 700 }}>
                Loading collections...
              </Typography>
            </Stack>
          ) : null}

          {errorMessage ? (
            <Typography sx={{ color: '#d32f2f', fontWeight: 700 }}>{errorMessage}</Typography>
          ) : null}

          {!isLoading && collections.length === 0 ? (
            <Typography sx={{ color: COLORS.textLight }}>
              Create a collection first, then choose it to add this item.
            </Typography>
          ) : null}

          {!isLoading && collections.length > 0 ? (
            <Stack spacing={1}>
              {collections.map((collection) => (
                <Button
                  key={collection.id}
                  variant="outlined"
                  disabled={isSaving}
                  onClick={() => handleSelectCollection(collection.id)}
                  sx={{
                    justifyContent: 'space-between',
                    minHeight: 48,
                    borderRadius: 1,
                    textTransform: 'none',
                    color: COLORS.primary,
                    borderColor: COLORS.borderStrong,
                    fontWeight: 700,
                  }}
                >
                  <span>{collection.name || collection.title}</span>
                  <span>{collection.totalItems || 0} items</span>
                </Button>
              ))}
            </Stack>
          ) : null}

          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="New collection name"
              value={newCollectionName}
              disabled={isSaving}
              onChange={(event) => setNewCollectionName(event.target.value)}
            />
            <Button
              variant="contained"
              disabled={isSaving}
              onClick={handleCreateCollection}
              sx={{
                borderRadius: 1,
                textTransform: 'none',
                fontWeight: 800,
                backgroundColor: COLORS.primary,
                '&:hover': { backgroundColor: COLORS.primaryHover },
              }}
            >
              Create
            </Button>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving} sx={{ color: COLORS.primary }}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CollectionPickerDialog

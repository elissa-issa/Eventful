import { useEffect, useState } from 'react'
import {
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  Popover,
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

function CollectionPickerDialog({ anchorEl, itemPayload, onClose, onAdded }) {
  const open = Boolean(anchorEl)
  const [collections, setCollections] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')

  useEffect(() => {
    if (!open) {
      return undefined
    }

    let isMounted = true
    setIsLoading(true)
    setErrorMessage('')
    setIsCreating(false)
    setNewCollectionName('')

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

    if (!itemPayload) {
      return
    }

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
      setIsCreating(false)
      await addItemToCollection(collection.id, itemPayload)
      onAdded?.(collection.id)
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
    <>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={isSaving ? undefined : onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1.2,
              width: 240,
              maxWidth: 'calc(100vw - 24px)',
              borderRadius: 1.2,
              boxShadow: '0 6px 14px rgba(0, 0, 0, 0.24)',
              border: `1px solid ${COLORS.border}`,
              overflow: 'hidden',
            },
          },
        }}
      >
        <Stack spacing={0.25} sx={{ px: 1.6, py: 1.2, backgroundColor: COLORS.surface }}>
          {isLoading ? (
            <Stack direction="row" spacing={1.2} alignItems="center" sx={{ py: 0.8 }}>
              <CircularProgress size={16} />
              <Typography sx={{ color: COLORS.primary, fontSize: '0.9rem', fontWeight: 700 }}>
                Loading collections...
              </Typography>
            </Stack>
          ) : null}

          {errorMessage ? (
            <Typography sx={{ color: '#d32f2f', fontSize: '0.82rem', fontWeight: 700, py: 0.4 }}>
              {errorMessage}
            </Typography>
          ) : null}

          {!isLoading && collections.map((collection) => (
            <Button
              key={collection.id}
              disabled={isSaving}
              onClick={() => handleSelectCollection(collection.id)}
              sx={{
                justifyContent: 'flex-start',
                minHeight: 32,
                px: 0,
                py: 0.35,
                color: '#2b78cc',
                textTransform: 'none',
                fontSize: '0.95rem',
                fontWeight: 500,
                lineHeight: 1.2,
                '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' },
              }}
            >
              {collection.name || collection.title}
            </Button>
          ))}

          {!isLoading ? (
            <Button
              disabled={isSaving}
              onClick={() => setIsCreating(true)}
              sx={{
                justifyContent: 'flex-start',
                minHeight: 32,
                px: 0,
                py: 0.35,
                color: COLORS.textLight,
                textTransform: 'none',
                fontSize: '0.95rem',
                fontWeight: 600,
                lineHeight: 1.2,
                '&:hover': { backgroundColor: 'transparent', color: COLORS.primary },
              }}
            >
              + add new collection
            </Button>
          ) : null}
        </Stack>
      </Popover>

      <Dialog
        open={isCreating}
        onClose={() => {
          if (!isSaving) {
            setIsCreating(false)
          }
        }}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={2.2}>
            <Typography
              sx={{
                color: COLORS.primary,
                fontWeight: 800,
                fontSize: '1.65rem',
                lineHeight: 1.1,
              }}
            >
              Name Your Collection
            </Typography>
            <TextField
              autoFocus
              fullWidth
              placeholder="Collection name"
              value={newCollectionName}
              disabled={isSaving}
              onChange={(event) => setNewCollectionName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleCreateCollection()
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                },
              }}
            />
            {errorMessage ? (
              <Typography sx={{ color: '#d32f2f', fontSize: '0.86rem', fontWeight: 700 }}>
                {errorMessage}
              </Typography>
            ) : null}
            <Stack direction="row" spacing={1.2} justifyContent="flex-end">
              <Button
                disabled={isSaving}
                onClick={() => setIsCreating(false)}
                sx={{
                  color: COLORS.primary,
                  textTransform: 'none',
                  fontWeight: 700,
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                disabled={isSaving}
                onClick={handleCreateCollection}
                sx={{
                  backgroundColor: COLORS.accent,
                  textTransform: 'none',
                  fontWeight: 800,
                  '&:hover': { backgroundColor: COLORS.accentHover },
                }}
              >
                {isSaving ? 'Creating...' : 'Create Collection'}
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CollectionPickerDialog

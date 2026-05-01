import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../toast/useToast'
import { getCollectionItemPayload } from '../utils/servicePayload'
import CollectionPickerDialog from '../shared/components/CollectionPickerDialog'

export function useCollectionCartAction() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [pendingItemPayload, setPendingItemPayload] = useState(null)

  const openCollectionPicker = (item, section, options = {}) => {
    const payload = getCollectionItemPayload(item, section, options)

    if (!payload.itemId) {
      return
    }

    setPendingItemPayload(payload)
  }

  const closeCollectionPicker = () => {
    setPendingItemPayload(null)
  }

  const collectionPickerDialog = (
    <CollectionPickerDialog
      open={Boolean(pendingItemPayload)}
      itemPayload={pendingItemPayload}
      onClose={closeCollectionPicker}
      onAdded={(collectionId) => {
        closeCollectionPicker()
        showToast('Added to collection')
        navigate(`/cart?collectionId=${collectionId}`)
      }}
    />
  )

  return {
    collectionPickerDialog,
    openCollectionPicker,
  }
}

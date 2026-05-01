import { useState } from 'react'
import { useToast } from '../toast/useToast'
import { getCollectionItemPayload } from '../utils/servicePayload'
import CollectionPickerDialog from '../shared/components/CollectionPickerDialog'

export function useCollectionCartAction() {
  const { showToast } = useToast()
  const [pendingItemPayload, setPendingItemPayload] = useState(null)
  const [anchorEl, setAnchorEl] = useState(null)

  const openCollectionPicker = (event, item, section, options = {}) => {
    const payload = getCollectionItemPayload(item, section, options)

    if (!payload.itemId) {
      return
    }

    setAnchorEl(event?.currentTarget || null)
    setPendingItemPayload(payload)
  }

  const closeCollectionPicker = () => {
    setAnchorEl(null)
    setPendingItemPayload(null)
  }

  const collectionPickerDialog = (
    <CollectionPickerDialog
      anchorEl={anchorEl}
      itemPayload={pendingItemPayload}
      onClose={closeCollectionPicker}
      onAdded={() => {
        closeCollectionPicker()
        showToast('Added successfully to collection', 'success')
      }}
    />
  )

  return {
    collectionPickerDialog,
    openCollectionPicker,
  }
}

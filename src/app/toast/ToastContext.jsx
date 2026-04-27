import { useCallback, useMemo, useState } from 'react'
import { Alert, Snackbar } from '@mui/material'
import ToastContext from './toastContextValue'

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'success',
  })

  const showToast = useCallback((message, severity = 'success') => {
    setToast({
      open: true,
      message,
      severity,
    })
  }, [])

  const handleClose = (_event, reason) => {
    if (reason === 'clickaway') {
      return
    }

    setToast((current) => ({
      ...current,
      open: false,
    }))
  }

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={2800}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleClose}
          severity={toast.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  )
}

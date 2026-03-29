import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded'
import { Box, Button, InputAdornment, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import AlertDialog from '../shared/components/AlertDialog'
import { COLORS } from '../constants/colors'
import { VENDOR_DIRECTORY } from '../constants/vendorDirectory'
import VendorDirectoryCard from '../shared/components/VendorDirectoryCard'
import VendorFeatureCard from '../shared/components/VendorFeatureCard'

const SERVICE_TYPES = ['All', 'Venues', 'Menus', 'Decorations', 'Entertainment', 'Bundles']

function VendorsPage() {
  const [searchValue, setSearchValue] = useState('')
  const [selectedServiceType, setSelectedServiceType] = useState('All')
  const [selectedVendor, setSelectedVendor] = useState('All Vendors')
  const [isPremiumDialogOpen, setIsPremiumDialogOpen] = useState(false)

  const vendorOptions = useMemo(() => {
    const filteredByService =
      selectedServiceType === 'All'
        ? VENDOR_DIRECTORY
        : VENDOR_DIRECTORY.filter((vendor) => vendor.serviceType === selectedServiceType)

    const names = [...new Set(filteredByService.map((vendor) => vendor.name))].sort((a, b) =>
      a.localeCompare(b)
    )

    return ['All Vendors', ...names]
  }, [selectedServiceType])

  const filteredVendors = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase()

    return VENDOR_DIRECTORY.filter((vendor) => {
      const serviceMatches =
        selectedServiceType === 'All' || vendor.serviceType === selectedServiceType
      const vendorMatches = selectedVendor === 'All Vendors' || vendor.name === selectedVendor
      const searchMatches =
        normalizedSearch.length === 0 ||
        [vendor.name, vendor.title, vendor.location, vendor.serviceType, vendor.description]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch)

      return serviceMatches && vendorMatches && searchMatches
    })
  }, [searchValue, selectedServiceType, selectedVendor])

  const featuredVendor = filteredVendors[0] || null
  const secondaryVendor = filteredVendors[1] || null
  const additionalVendors = filteredVendors.slice(2)

  const handleOpenPremiumDialog = () => {
    setIsPremiumDialogOpen(true)
  }

  const handleClosePremiumDialog = () => {
    setIsPremiumDialogOpen(false)
  }

  return (
    <Stack spacing={4.5} sx={{ pt: 3.5, pb: 2 }}>
      <Stack spacing={1.2} sx={{ textAlign: 'center', alignItems: 'center' }}>
        <Typography
          sx={{
            color: COLORS.primaryDark,
            fontWeight: 800,
            fontSize: { xs: '2.2rem', md: '3.2rem' },
            lineHeight: 1.04,
          }}
        >
          Discover Lebanon&apos;s <Box component="span" sx={{ color: COLORS.primary }}>Finest</Box>
        </Typography>
        <Typography
          sx={{
            color: COLORS.textLight,
            fontSize: { xs: '1rem', md: '1.06rem' },
            lineHeight: 1.5,
            maxWidth: 680,
          }}
        >
          Connect with premium vendors for an unforgettable event. From historic venues to
          world-class catering and standout entertainment.
        </Typography>
      </Stack>

      <Box
        sx={{
          p: 1,
          borderRadius: 999,
          backgroundColor: COLORS.surface,
          boxShadow: '0 18px 34px rgba(15, 45, 75, 0.08)',
          border: `1px solid ${COLORS.borderStrong}`,
        }}
      >
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1} alignItems={{ xs: 'stretch', lg: 'center' }}>
          <TextField
            fullWidth
            placeholder="Search vendors, services, or location"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            size="small"
            sx={{
              flex: 1.4,
              '& .MuiOutlinedInput-root': {
                borderRadius: '999px',
                backgroundColor: '#f6f6f8',
                color: COLORS.textMuted,
                '& fieldset': {
                  border: 'none',
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ color: COLORS.textLight, fontSize: 18 }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            select
            value={selectedServiceType}
            onChange={(event) => {
              setSelectedServiceType(event.target.value)
              setSelectedVendor('All Vendors')
            }}
            size="small"
            sx={{
              minWidth: { xs: '100%', lg: 170 },
              '& .MuiOutlinedInput-root': {
                borderRadius: '999px',
                backgroundColor: '#f6f6f8',
                color: COLORS.textMuted,
                '& fieldset': {
                  border: 'none',
                },
              },
            }}
          >
            {SERVICE_TYPES.map((serviceType) => (
              <MenuItem key={serviceType} value={serviceType}>
                {serviceType}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            value={selectedVendor}
            onChange={(event) => setSelectedVendor(event.target.value)}
            size="small"
            sx={{
              minWidth: { xs: '100%', lg: 210 },
              '& .MuiOutlinedInput-root': {
                borderRadius: '999px',
                backgroundColor: '#f6f6f8',
                color: COLORS.textMuted,
                '& fieldset': {
                  border: 'none',
                },
              },
            }}
          >
            {vendorOptions.map((vendorName) => (
              <MenuItem key={vendorName} value={vendorName}>
                {vendorName}
              </MenuItem>
            ))}
          </TextField>

          <Button
            variant="contained"
            disableElevation
            sx={{
              minWidth: 140,
              height: 40,
              borderRadius: '999px',
              textTransform: 'none',
              fontWeight: 700,
              backgroundColor: COLORS.accent,
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: COLORS.accentHover,
                boxShadow: 'none',
              },
            }}
          >
            Search
          </Button>
        </Stack>
      </Box>

      {featuredVendor ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: secondaryVendor ? '1.8fr 1fr' : '1fr' },
            gap: 2,
          }}
        >
          <VendorFeatureCard vendor={featuredVendor} large />
          {secondaryVendor ? <VendorFeatureCard vendor={secondaryVendor} /> : null}
        </Box>
      ) : (
        <Box
          sx={{
            minHeight: 220,
            borderRadius: 3,
            border: `1px solid ${COLORS.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            px: 3,
          }}
        >
          <Stack spacing={1}>
            <Typography sx={{ color: COLORS.primary, fontWeight: 800, fontSize: '1.8rem' }}>
              No vendors found
            </Typography>
            <Typography sx={{ color: COLORS.textLight, maxWidth: 420 }}>
              Try another search term or choose a different service type to explore more vendors.
            </Typography>
          </Stack>
        </Box>
      )}

      {additionalVendors.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(3, minmax(0, 1fr))',
            },
            gap: 2,
          }}
        >
          {additionalVendors.map((vendor) => (
            <VendorDirectoryCard
              key={vendor.id}
              imageSrc={vendor.imageSrc}
              imageAlt={vendor.imageAlt}
              title={vendor.title}
              description={vendor.description}
              location={vendor.location}
              serviceType={vendor.serviceType}
              logoText={vendor.logoText}
              onContactButtonClick={handleOpenPremiumDialog}
            />
          ))}
        </Box>
      ) : null}

      <AlertDialog
        open={isPremiumDialogOpen}
        onClose={handleClosePremiumDialog}
        icon={<WorkspacePremiumRoundedIcon />}
        iconBackgroundColor="rgba(234, 122, 36, 0.14)"
        iconColor={COLORS.accent}
        title="Upgrade to Premium"
        titleColor={COLORS.primaryDark}
        description="Contacting vendors directly is available on the premium plan. Upgrade to unlock direct vendor access."
        primaryButtonText="Upgrade Now"
        primaryButtonColor={COLORS.accent}
        onPrimaryButtonClick={handleClosePremiumDialog}
        secondaryActionText="Maybe later"
        secondaryActionColor={COLORS.primary}
        onSecondaryActionClick={handleClosePremiumDialog}
      />
    </Stack>
  )
}

export default VendorsPage

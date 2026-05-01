import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded'
import { Box, Button, InputAdornment, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AlertDialog from '../shared/components/AlertDialog'
import { COLORS } from '../constants/colors'
import { useCollectionCartAction } from '../hooks/useCollectionCartAction'
import { useFavoriteActions, getFavoriteKey } from '../hooks/useFavoriteActions'
import { useServicesData } from '../hooks/useServicesData'
import { getServicePayload } from '../utils/servicePayload'
import BundleCard from '../shared/components/BundleCard'
import PremiumPlansDialog from '../shared/components/PremiumPlansDialog'
import ServiceCard from '../shared/components/ServiceCard'
import VendorDirectoryCard from '../shared/components/VendorDirectoryCard'
import VendorFeatureCard from '../shared/components/VendorFeatureCard'

const SERVICE_TYPES = ['All', 'Venues', 'Menus', 'Decorations', 'Entertainment', 'Bundles']
const SERVICE_SECTIONS = [
  { id: 'venues', label: 'Venues' },
  { id: 'menus', label: 'Menus' },
  { id: 'decorations', label: 'Decorations' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'bundles', label: 'Bundles' },
]

const normalizeVendorKey = (name) => name?.trim().toLowerCase()
const normalizeItemValue = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')

const getVendorItemKeys = (item, section) => {
  const titleKey = normalizeItemValue(item.title)
  const imageKey = normalizeItemValue(item.imageSrc)
  const descriptionKey = normalizeItemValue(item.description)
  const idKey = normalizeItemValue(item.id || item._id)

  return [
    idKey ? `${section}:id:${idKey}` : '',
    titleKey ? `title:${titleKey}` : '',
    titleKey && imageKey ? `title-image:${titleKey}:${imageKey}` : '',
    titleKey && descriptionKey
      ? `title-description:${titleKey}:${descriptionKey}`
      : '',
  ].filter(Boolean)
}

const getVendorDescription = (vendor) => {
  if (vendor.items.length === 1) {
    return vendor.items[0].description || `Explore ${vendor.name}'s event services.`
  }

  const serviceTitles = vendor.items
    .slice(0, 2)
    .map((item) => item.title)
    .filter(Boolean)
    .join(', ')

  return serviceTitles
    ? `Offering ${serviceTitles} and more for polished event planning.`
    : `Explore ${vendor.name}'s event services.`
}

const buildVendorDirectory = (itemsBySection) => {
  const vendorsByName = new Map()

  SERVICE_SECTIONS.forEach(({ id, label }) => {
    ;(itemsBySection[id] || []).forEach((item) => {
      if (!item.vendorName) {
        return
      }

      const key = normalizeVendorKey(item.vendorName)
      const itemKeys = getVendorItemKeys(item, id)
      const existingVendor = vendorsByName.get(key)
      const serviceEntry = {
        ...item,
        section: id,
        serviceType: label,
        vendorItemKeys: itemKeys,
      }

      if (existingVendor) {
        if (itemKeys.some((itemKey) => existingVendor.itemKeys.has(itemKey))) {
          return
        }

        existingVendor.items.push(serviceEntry)
        itemKeys.forEach((itemKey) => existingVendor.itemKeys.add(itemKey))
        existingVendor.serviceTypes = Array.from(
          new Set([...existingVendor.serviceTypes, label])
        )

        if (!existingVendor.logoSrc && item.vendorLogoSrc) {
          existingVendor.logoSrc = item.vendorLogoSrc
          existingVendor.logoAlt = item.vendorLogoAlt
        }

        return
      }

      vendorsByName.set(key, {
        id: key.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        name: item.vendorName,
        title: item.vendorName,
        location: item.vendorLocation || item.location || '',
        logoSrc: item.vendorLogoSrc,
        logoAlt: item.vendorLogoAlt,
        imageSrc: item.imageSrc,
        imageAlt: item.imageAlt || `${item.vendorName} service`,
        primarySection: id,
        serviceTypes: [label],
        itemKeys: new Set(itemKeys),
        items: [serviceEntry],
      })
    })
  })

  return Array.from(vendorsByName.values()).map((vendor) => ({
    ...vendor,
    itemKeys: undefined,
    serviceType: vendor.serviceTypes.join(', '),
    description: getVendorDescription(vendor),
    ctaLabel: 'View Items',
  }))
}

function VendorsPage() {
  const navigate = useNavigate()
  const { itemsBySection } = useServicesData()
  const { collectionPickerDialog, openCollectionPicker } = useCollectionCartAction()
  const { favoriteItems, toggleFavoriteItem } = useFavoriteActions()
  const [searchValue, setSearchValue] = useState('')
  const [selectedServiceType, setSelectedServiceType] = useState('All')
  const [selectedVendor, setSelectedVendor] = useState('All Vendors')
  const [activeVendorId, setActiveVendorId] = useState('')
  const [isPremiumDialogOpen, setIsPremiumDialogOpen] = useState(false)
  const [isPlansDialogOpen, setIsPlansDialogOpen] = useState(false)
  const vendors = useMemo(() => buildVendorDirectory(itemsBySection), [itemsBySection])
  const activeVendor = useMemo(
    () => vendors.find((vendor) => vendor.id === activeVendorId) || null,
    [activeVendorId, vendors]
  )

  const vendorOptions = useMemo(() => {
    const filteredByService =
      selectedServiceType === 'All'
        ? vendors
        : vendors.filter((vendor) => vendor.serviceTypes.includes(selectedServiceType))

    const names = [...new Set(filteredByService.map((vendor) => vendor.name))].sort((a, b) =>
      a.localeCompare(b)
    )

    return ['All Vendors', ...names]
  }, [selectedServiceType, vendors])

  const filteredVendors = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase()

    return vendors.filter((vendor) => {
      const serviceMatches =
        selectedServiceType === 'All' || vendor.serviceTypes.includes(selectedServiceType)
      const vendorMatches = selectedVendor === 'All Vendors' || vendor.name === selectedVendor
      const searchMatches =
        normalizedSearch.length === 0 ||
        [
          vendor.name,
          vendor.title,
          vendor.location,
          vendor.serviceType,
          vendor.description,
          ...vendor.items.map((item) => item.title),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch)

      return serviceMatches && vendorMatches && searchMatches
    })
  }, [searchValue, selectedServiceType, selectedVendor, vendors])

  const featuredVendor = filteredVendors[0] || null
  const secondaryVendor = filteredVendors[1] || null
  const additionalVendors = activeVendor ? [] : filteredVendors.slice(2)
  const vendorItems = activeVendor?.items || []

  const handleOpenPremiumDialog = () => {
    setIsPremiumDialogOpen(true)
  }

  const handleClosePremiumDialog = () => {
    setIsPremiumDialogOpen(false)
  }

  const handleViewVendorItems = (vendor) => {
    setActiveVendorId(vendor.id)
  }

  const handleFavoriteToggle = async (item, section) => {
    const payload = getServicePayload(item, section)

    if (payload.serviceId) {
      await toggleFavoriteItem(payload)
    }
  }

  const handleAddToCart = (event, item, section) => {
    openCollectionPicker(event, item, section)
  }

  const getDetailPath = (section, itemId) => `/services/${section}/${itemId}`

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
            onChange={(event) => {
              setSearchValue(event.target.value)
              setActiveVendorId('')
            }}
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
              setActiveVendorId('')
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
            onChange={(event) => {
              setSelectedVendor(event.target.value)
              setActiveVendorId('')
            }}
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
          <VendorFeatureCard
            vendor={featuredVendor}
            large
            onViewItemsClick={() => handleViewVendorItems(featuredVendor)}
          />
          {secondaryVendor ? (
            <VendorFeatureCard
              vendor={secondaryVendor}
              onViewItemsClick={() => handleViewVendorItems(secondaryVendor)}
            />
          ) : null}
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

      {activeVendor ? (
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5}>
            <Typography
              sx={{
                color: COLORS.primaryDark,
                fontWeight: 800,
                fontSize: { xs: '1.8rem', md: '2.2rem' },
                lineHeight: 1.1,
              }}
            >
              Services by {activeVendor.name}
            </Typography>
            <Button
              variant="text"
              onClick={() => setActiveVendorId('')}
              sx={{ color: COLORS.primary, fontWeight: 800, textTransform: 'none' }}
            >
              Back to all vendors
            </Button>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(3, minmax(0, 1fr))',
              },
              gap: 2.25,
            }}
          >
            {vendorItems.map((item, index) => {
              const itemSection = item.section
              const favoriteKey = item.id || `${itemSection}-${index}`
              const serviceId = getServicePayload(item, itemSection).serviceId
              const backendFavoriteKey = serviceId
                ? getFavoriteKey(itemSection, serviceId)
                : favoriteKey

              if (itemSection === 'bundles') {
                return (
                  <BundleCard
                    key={`${itemSection}:${favoriteKey}`}
                    imageSrc={item.imageSrc}
                    imageAlt={item.imageAlt}
                    title={item.title}
                    isFavorite={Boolean(favoriteItems[backendFavoriteKey])}
                    onFavoriteToggle={() => handleFavoriteToggle(item, itemSection)}
                    leftText={item.leftText}
                    rightText={item.rightText}
                    primaryButtonLabel={item.primaryButtonLabel}
                    onPrimaryButtonClick={() => navigate(getDetailPath(itemSection, item.id))}
                    secondaryButtonLabel={item.secondaryButtonLabel}
                    onSecondaryButtonClick={(event) => handleAddToCart(event, item, itemSection)}
                    maxWidth={400}
                    imageHeight={312}
                    cardBorderRadius={2}
                    contentPaddingX={0.5}
                    contentPaddingTop={1.8}
                    contentPaddingBottom={12.8}
                  />
                )
              }

              return (
                <ServiceCard
                  key={`${itemSection}:${favoriteKey}`}
                  imageSrc={item.imageSrc}
                  imageAlt={item.imageAlt}
                  title={item.title}
                  description={item.description}
                  guestText={item.guestText}
                  priceText={item.priceText}
                  discountLabel={item.discountLabel}
                  vendorLogoSrc={item.vendorLogoSrc}
                  vendorLogoAlt={item.vendorLogoAlt}
                  isFavorite={Boolean(favoriteItems[backendFavoriteKey])}
                  onFavoriteToggle={() => handleFavoriteToggle(item, itemSection)}
                  onViewButtonClick={() => navigate(getDetailPath(itemSection, item.id))}
                  onCartButtonClick={(event) => handleAddToCart(event, item, itemSection)}
                />
              )
            })}
          </Box>
        </Stack>
      ) : additionalVendors.length > 0 ? (
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
              vendorLogoSrc={vendor.logoSrc}
              vendorLogoAlt={vendor.logoAlt}
              onContactButtonClick={handleOpenPremiumDialog}
              onItemsButtonClick={() => handleViewVendorItems(vendor)}
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
        onPrimaryButtonClick={() => {
          handleClosePremiumDialog()
          setIsPlansDialogOpen(true)
        }}
        secondaryActionText="Maybe later"
        secondaryActionColor={COLORS.primary}
        onSecondaryActionClick={handleClosePremiumDialog}
      />
      <PremiumPlansDialog
        open={isPlansDialogOpen}
        onClose={() => setIsPlansDialogOpen(false)}
      />
      {collectionPickerDialog}
    </Stack>
  )
}

export default VendorsPage

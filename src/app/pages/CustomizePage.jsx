import { useState } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { COLORS } from '../constants/colors'
import { MY_COLLECTIONS } from '../constants/myCollections'
import CollectionsList from '../shared/components/CollectionsList'
import CreateCollectionCard from '../shared/components/CreateCollectionCard'

function CustomizePage() {
  const navigate = useNavigate()
  const [plans, setPlans] = useState(MY_COLLECTIONS)

  const handleDeletePlan = (planId) => {
    setPlans((currentPlans) => currentPlans.filter((plan) => plan.id !== planId))
  }

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 180px)',
        py: { xs: 3.5, md: 4 },
      }}
    >
      <Stack spacing={2.8}>
        <Typography
          sx={{
            color: COLORS.primary,
            fontWeight: 800,
            fontSize: { xs: '2rem', md: '2.25rem' },
            lineHeight: 1.1,
          }}
        >
          My Customized Plans
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(3, minmax(0, 1fr))',
            },
            gap: { xs: 4, md: 5, lg: 6 },
            alignItems: 'stretch',
          }}
        >
          <CollectionsList
            collections={plans}
            onViewCollection={(planId) => navigate(`/cart?collection=${planId}`)}
            onDeleteCollection={handleDeletePlan}
            getCollectionSelected={() => false}
            cardSpacing={1.05}
            viewLabel="View Plan"
            sx={{ display: 'contents' }}
          />

          <CreateCollectionCard
            label="Create New Plan"
            minHeight={{ xs: 320, sm: 347 }}
            onClick={() => navigate('/services')}
          />
        </Box>
      </Stack>
    </Box>
  )
}

export default CustomizePage

import { DECORATION_ITEMS } from './decorationItems'
import { ENTERTAINMENT_ITEMS } from './entertainmentItems'
import { MENU_ITEMS } from './menuItems'
import { VENUE_ITEMS } from './venueItems'

const weddingVenue = VENUE_ITEMS.find((item) => item.id === 'outdoor-jbeil-2') ?? VENUE_ITEMS[0]
const weddingMenu =
  MENU_ITEMS.find((item) => item.id === 'lebanese-grill-2') ?? MENU_ITEMS[0]
const weddingDessert =
  MENU_ITEMS.find((item) => item.id === 'birthday-cake-2') ?? MENU_ITEMS[0]
const weddingEntertainment =
  ENTERTAINMENT_ITEMS.find((item) => item.id === 'dj-rodge-2') ?? ENTERTAINMENT_ITEMS[0]

const birthdayCake =
  MENU_ITEMS.find((item) => item.id === 'birthday-cake-2') ?? MENU_ITEMS[0]
const birthdayFlowers =
  DECORATION_ITEMS.find((item) => item.id === 'flowers-bouquet-2') ?? DECORATION_ITEMS[0]
const birthdayBalloons =
  DECORATION_ITEMS.find((item) => item.id === 'balloons-2') ?? DECORATION_ITEMS[0]
const birthdayLights =
  DECORATION_ITEMS.find((item) => item.id === 'led-lights-2') ?? DECORATION_ITEMS[0]

export const MY_COLLECTIONS = [
  {
    id: 'wedding-collection',
    title: 'Wedding Collection',
    totalItems: 10,
    previewItems: [
      {
        id: weddingDessert.id,
        imageSrc: weddingDessert.imageSrc,
        imageAlt: weddingDessert.imageAlt,
      },
      {
        id: weddingMenu.id,
        imageSrc: weddingMenu.imageSrc,
        imageAlt: weddingMenu.imageAlt,
      },
      {
        id: weddingVenue.id,
        imageSrc: weddingVenue.imageSrc,
        imageAlt: weddingVenue.imageAlt,
      },
      {
        id: weddingEntertainment.id,
        imageSrc: weddingEntertainment.imageSrc,
        imageAlt: weddingEntertainment.imageAlt,
      },
    ],
    summary: {
      retailPrice: '$2550',
      promotions: '$50',
      totalPrice: '$2000',
      savedText: 'saved 50$',
      rewardedText: 'Rewarded 32 points',
    },
  },
  {
    id: 'birthday-collection',
    title: 'Birthday Collection',
    totalItems: 8,
    previewItems: [
      {
        id: birthdayCake.id,
        imageSrc: birthdayCake.imageSrc,
        imageAlt: birthdayCake.imageAlt,
      },
      {
        id: birthdayFlowers.id,
        imageSrc: birthdayFlowers.imageSrc,
        imageAlt: birthdayFlowers.imageAlt,
      },
      {
        id: birthdayBalloons.id,
        imageSrc: birthdayBalloons.imageSrc,
        imageAlt: birthdayBalloons.imageAlt,
      },
      {
        id: birthdayLights.id,
        imageSrc: birthdayLights.imageSrc,
        imageAlt: birthdayLights.imageAlt,
      },
    ],
    summary: {
      retailPrice: '$980',
      promotions: '$25',
      totalPrice: '$820',
      savedText: 'saved 25$',
      rewardedText: 'Rewarded 14 points',
    },
  },
]

export const getCollectionById = (collectionId) =>
  MY_COLLECTIONS.find((collection) => collection.id === collectionId)

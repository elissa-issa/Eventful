const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { connectToDatabase } = require('../config/database');
const Bundle = require('../models/Bundle');
const Decoration = require('../models/Decoration');
const Entertainment = require('../models/Entertainment');
const Menu = require('../models/Menu');
const Review = require('../models/Review');
const User = require('../models/User');
const Venue = require('../models/Venue');
const { hashPassword } = require('../helpers/passwordHelper');

const REVIEWERS = [
  {
    firstName: 'Maya',
    lastName: 'Haddad',
    email: 'maya.reviewer@eventful.demo',
    avatarSrc: '',
  },
  {
    firstName: 'Karim',
    lastName: 'Nasser',
    email: 'karim.reviewer@eventful.demo',
    avatarSrc: '',
  },
  {
    firstName: 'Lina',
    lastName: 'Saab',
    email: 'lina.reviewer@eventful.demo',
    avatarSrc: '',
  },
];

const COMMENTS = [
  'Everything was well organized and matched what we expected. The team was responsive and the service looked great on the day of the event.',
  'Beautiful presentation and smooth coordination from start to finish. I would happily book this again for another celebration.',
  'The quality was excellent and the details felt thoughtful. It made planning much easier and the guests really enjoyed it.',
  'Very reliable service with a polished setup. Communication was clear and the final result felt worth the price.',
  'A strong option for a special event. The setup arrived on time, looked professional, and helped the whole day feel more complete.',
];

const SERVICE_TARGETS = [
  { serviceType: 'bundles', Model: Bundle },
  { serviceType: 'menus', Model: Menu },
  { serviceType: 'venues', Model: Venue },
  { serviceType: 'decorations', Model: Decoration },
  { serviceType: 'entertainment', Model: Entertainment },
];

function loadEnvFile() {
  const envFilePath = path.join(__dirname, '..', '..', '.env');

  if (!fs.existsSync(envFilePath)) {
    return;
  }

  const fileContent = fs.readFileSync(envFilePath, 'utf8');
  const lines = fileContent.split(/\r?\n/);

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      return;
    }

    const separatorIndex = trimmedLine.indexOf('=');

    if (separatorIndex === -1) {
      return;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine.slice(separatorIndex + 1).trim();

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  });
}

function getReviewLimit() {
  const requestedLimit = Number(process.env.REVIEWS_PER_ITEM || REVIEWERS.length);

  if (!Number.isInteger(requestedLimit) || requestedLimit < 1) {
    return REVIEWERS.length;
  }

  return Math.min(requestedLimit, REVIEWERS.length);
}

function getRating(serviceIndex, reviewerIndex) {
  const ratings = [5, 4, 5, 4, 5];
  return ratings[(serviceIndex + reviewerIndex) % ratings.length];
}

function getComment(service, serviceIndex, reviewerIndex) {
  const title = service.title || 'this service';
  const comment = COMMENTS[(serviceIndex + reviewerIndex) % COMMENTS.length];
  return `${comment} ${title} was a great fit for the event.`;
}

async function ensureReviewers() {
  const passwordHash = await hashPassword('EventfulReviews123!');
  const reviewers = [];

  for (const reviewer of REVIEWERS) {
    const user = await User.findOneAndUpdate(
      { email: reviewer.email },
      {
        $set: {
          firstName: reviewer.firstName,
          lastName: reviewer.lastName,
          avatarSrc: reviewer.avatarSrc,
        },
        $setOnInsert: {
          birthday: null,
          passwordHash,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    );

    reviewers.push(user);
  }

  return reviewers;
}

async function seedReviews() {
  loadEnvFile();
  await connectToDatabase();

  const reviewers = await ensureReviewers();
  const reviewsPerItem = getReviewLimit();
  let serviceCount = 0;
  let reviewCount = 0;

  for (const { serviceType, Model } of SERVICE_TARGETS) {
    const services = await Model.find({}).sort({ itemId: 1 });
    serviceCount += services.length;

    for (const [serviceIndex, service] of services.entries()) {
      const itemId = service.itemId || service.id;

      for (let reviewerIndex = 0; reviewerIndex < reviewsPerItem; reviewerIndex += 1) {
        const reviewer = reviewers[reviewerIndex];
        const userNameSnapshot = `${reviewer.firstName} ${reviewer.lastName}`.trim();

        await Review.findOneAndUpdate(
          {
            user: reviewer._id,
            serviceType,
            itemId,
          },
          {
            $set: {
              rating: getRating(serviceIndex, reviewerIndex),
              comment: getComment(service, serviceIndex, reviewerIndex),
              userNameSnapshot,
              userAvatarSnapshot: reviewer.avatarSrc || '',
            },
          },
          {
            new: true,
            upsert: true,
            runValidators: true,
          },
        );

        reviewCount += 1;
      }
    }

    console.log(`Seeded reviews for ${services.length} ${serviceType}`);
  }

  console.log(`Review seed completed: ${reviewCount} reviews across ${serviceCount} services`);
}

seedReviews()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Review seed failed', error);
    await mongoose.disconnect();
    process.exit(1);
  });

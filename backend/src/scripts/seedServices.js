const fs = require('fs');
const path = require('path');
const vm = require('vm');
const mongoose = require('mongoose');
const { connectToDatabase } = require('../config/database');
const Bundle = require('../models/Bundle');
const Decoration = require('../models/Decoration');
const Entertainment = require('../models/Entertainment');
const Menu = require('../models/Menu');
const Venue = require('../models/Venue');

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

function loadFrontendConstant(relativeFilePath, exportName) {
  const filePath = path.join(__dirname, '..', '..', '..', relativeFilePath);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const executableContent = fileContent.replace(
    `export const ${exportName}`,
    `const ${exportName}`,
  );
  const context = {};

  vm.createContext(context);
  vm.runInContext(`${executableContent}\nresult = ${exportName};`, context, {
    filename: filePath,
  });

  return context.result;
}

function prepareServiceItems(items) {
  return items.map(({ id, ...item }) => ({
    ...item,
    itemId: id,
  }));
}

async function replaceCollection(Model, items) {
  let count = 0;

  for (const item of prepareServiceItems(items)) {
    await Model.findOneAndUpdate(
      { itemId: item.itemId },
      { $set: item },
      { upsert: true, returnDocument: 'after' },
    );

    count += 1;
  }

  return count;
}

async function getServiceObjectIds(Model, itemIds, fieldName) {
  const services = await Model.find({ itemId: { $in: itemIds } });
  const servicesByItemId = new Map(
    services.map((service) => [service.itemId, service._id]),
  );
  const missingItemIds = itemIds.filter((itemId) => !servicesByItemId.has(itemId));

  if (missingItemIds.length) {
    throw new Error(
      `Could not seed bundle ${fieldName}; missing item IDs: ${missingItemIds.join(', ')}`,
    );
  }

  return itemIds.map((itemId) => servicesByItemId.get(itemId));
}

async function getServiceObjectId(Model, itemId, fieldName) {
  const [objectId] = await getServiceObjectIds(Model, [itemId], fieldName);

  return objectId;
}

const BUNDLE_COMPONENTS_BY_ITEM_ID = {
  'birthday-party': {
    venue: 'garden-jbeil',
    menus: ['birthday-cake', 'kids-party-menu'],
    entertainment: ['face-painting', 'kids-magician'],
    decorations: ['balloon-arch', 'photo-backdrop'],
  },
  'prom-night': {
    venue: 'ballroom-verdun',
    menus: ['formal-plated-dinner'],
    entertainment: ['dj-rodge', 'photo-booth'],
    decorations: ['led-string-lights', 'neon-sign'],
  },
  'christmas-dinner': {
    venue: 'heritage-tripoli-hall',
    menus: ['formal-plated-dinner', 'dessert-minis'],
    entertainment: ['live-jazz-band'],
    decorations: ['candle-set', 'greenery-garland'],
  },
  'birthday-party-2': {
    venue: 'showroom-beirut',
    menus: ['birthday-cake', 'kids-party-menu'],
    entertainment: ['face-painting', 'puppet-show'],
    decorations: ['balloon-arch', 'dessert-table-props'],
  },
  'prom-night-2': {
    venue: 'rooftop-achrafieh',
    menus: ['sushi-party', 'dessert-minis'],
    entertainment: ['dj-rodge', 'led-dance-show'],
    decorations: ['led-string-lights', 'neon-sign'],
  },
  'christmas-dinner-2': {
    venue: 'conference-downtown',
    menus: ['formal-plated-dinner', 'dessert-minis'],
    entertainment: ['live-jazz-band', 'saxophonist'],
    decorations: ['candle-set', 'draped-ceiling'],
  },
};

async function prepareBundleItems(items) {
  return Promise.all(
    prepareServiceItems(items).map(async (bundle) => {
      const components = BUNDLE_COMPONENTS_BY_ITEM_ID[bundle.itemId];

      if (!components) {
        return bundle;
      }

      return {
        ...bundle,
        venue: await getServiceObjectId(Venue, components.venue, 'venue'),
        menus: await getServiceObjectIds(Menu, components.menus, 'menus'),
        entertainment: await getServiceObjectIds(
          Entertainment,
          components.entertainment,
          'entertainment',
        ),
        decorations: await getServiceObjectIds(
          Decoration,
          components.decorations,
          'decorations',
        ),
      };
    }),
  );
}

async function replacePreparedCollection(Model, items) {
  let count = 0;

  for (const item of items) {
    await Model.findOneAndUpdate(
      { itemId: item.itemId },
      { $set: item },
      { upsert: true, returnDocument: 'after', runValidators: true },
    );

    count += 1;
  }

  return count;
}

async function seedServices() {
  loadEnvFile();
  await connectToDatabase();

  const seedTargets = [
    {
      name: 'menus',
      Model: Menu,
      items: loadFrontendConstant(
        'src/app/constants/menuItems.js',
        'MENU_ITEMS',
      ),
    },
    {
      name: 'venues',
      Model: Venue,
      items: loadFrontendConstant(
        'src/app/constants/entertainmentItems.js',
        'ENTERTAINMENT_ITEMS',
      ),
    },
    {
      name: 'decorations',
      Model: Decoration,
      items: loadFrontendConstant(
        'src/app/constants/decorationItems.js',
        'DECORATION_ITEMS',
      ),
    },
    {
      name: 'entertainment',
      Model: Entertainment,
      items: loadFrontendConstant(
        'src/app/constants/entertainmentItems.js',
        'ENTERTAINMENT_ITEMS',
      ),
    },
  ];

  for (const seedTarget of seedTargets) {
    const count = await replaceCollection(seedTarget.Model, seedTarget.items);
    console.log(`Seeded ${count} ${seedTarget.name}`);
  }

  const bundleItems = await prepareBundleItems(
    loadFrontendConstant('src/app/constants/bundleCards.js', 'BUNDLE_CARDS'),
  );
  const bundleCount = await replacePreparedCollection(Bundle, bundleItems);
  console.log(`Seeded ${bundleCount} bundles`);
}

seedServices()
  .then(async () => {
    await mongoose.disconnect();
    console.log('Service seed completed');
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Service seed failed', error);
    await mongoose.disconnect();
    process.exit(1);
  });

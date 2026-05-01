const fs = require('fs');
const path = require('path');
const vm = require('vm');
const mongoose = require('mongoose');
const { connectToDatabase } = require('../config/database');
const Entertainment = require('../models/Entertainment');

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

async function seedServices() {
  loadEnvFile();
  await connectToDatabase();

  const seedTargets = [
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

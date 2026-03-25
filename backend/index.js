const fs = require('fs');
const path = require('path');
const { app } = require('./src/app');
const { connectToDatabase } = require('./src/config/database');

function loadEnvFile() {
  const envFilePath = path.join(__dirname, '.env');

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

loadEnvFile();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectToDatabase();

    app.listen(PORT, () => {
      console.log(`Backend listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start backend', error);
    process.exit(1);
  }
}

startServer();

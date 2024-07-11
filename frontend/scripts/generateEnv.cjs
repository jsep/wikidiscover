const fs = require('fs');
const path = require('path');

const envFilePath = path.join(__dirname, '../.env');
const envContent = `VITE_API_URL=${process.env.VITE_API_URL || ''}\n`;

fs.writeFileSync(envFilePath, envContent, 'utf8');
console.log(`.env file generated at ${envFilePath}`);

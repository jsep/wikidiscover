const fs = require('fs');
const path = require('path');

const envFilePath = path.join(__dirname, '../.env');
const envVars = ['TRANSLATE_API_URL', 'REDIS_URL'];

const envContent = envVars
  .map((envVar) => {
    return `${envVar}=${process.env[envVar] || ''}`;
  })
  .join('\n');

fs.writeFileSync(envFilePath, envContent, 'utf8');
console.log(`.env file generated at ${envFilePath}`);

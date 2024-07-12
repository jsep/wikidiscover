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
console.log(envContent);

const flyTomlPath = path.join(__dirname, '../fly.toml');
const flyTomlContent = fs.readFileSync(flyTomlPath, 'utf8');

const updatedFlyTomlContent = `${flyTomlContent}\n[env]\n${envVars.map((envVar) => `  ${envVar}=${process.env[envVar] || ''}`).join('\n')}`;
fs.writeFileSync(flyTomlPath, updatedFlyTomlContent, 'utf8');

console.log(`fly.toml file updated at ${flyTomlPath}`);

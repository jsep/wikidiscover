const fs = require('fs');
const path = require('path');

const envFilePath = path.join(__dirname, '../.env');
const envVars = ['TRANSLATE_API_URL', 'REDIS_URL'];

const envContentFile = envVars
  .map((envVar) => {
    return `${envVar}=${process.env[envVar] || ''}`;
  })
  .join('\n');

fs.writeFileSync(envFilePath, envContentFile, 'utf8');
console.log(`.env file generated at ${envFilePath}`);
console.log(envContentFile);

const flyTomlPath = path.join(__dirname, '../fly.toml');
let flyTomlContent = fs.readFileSync(flyTomlPath, 'utf8');

// Remove existing [env] section
flyTomlContent = flyTomlContent.replace(/\[env\][\s\S]*?(?=\n\[|$)/, '');

const updatedFlyTomlContent = `${flyTomlContent}\n[env]\n${envVars.map((envVar) => `  ${envVar}="${process.env[envVar] || ''}"`).join('\n')}`;
fs.writeFileSync(flyTomlPath, updatedFlyTomlContent, 'utf8');

flyTomlContent = fs.readFileSync(flyTomlPath, 'utf8');
console.log(`fly.toml file updated at ${flyTomlPath}`, flyTomlContent);

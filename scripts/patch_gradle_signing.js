const fs = require('fs');
const path = require('path');

console.log('--- Starting Gradle Release Signing Configuration ---');

const keystoreBase64 = process.env.CM_KEYSTORE;
if (!keystoreBase64) {
  console.warn('WARNING: Environment variable CM_KEYSTORE is not set. Looking for existing release.keystore...');
} else {
  const targetKeystorePath = path.join(__dirname, '../android/app/release.keystore');
  const cleanBase64 = keystoreBase64.replace(/[\r\n\s]/g, '');
  const buffer = Buffer.from(cleanBase64, 'base64');
  fs.writeFileSync(targetKeystorePath, buffer);
  console.log(`Successfully decoded release.keystore (${buffer.length} bytes)`);

  if (buffer.length < 100) {
    console.error('FATAL ERROR: Decoded release.keystore file is empty or invalid!');
    process.exit(1);
  }
}

const gradlePath = path.join(__dirname, '../android/app/build.gradle');
if (!fs.existsSync(gradlePath)) {
  console.error(`FATAL ERROR: Gradle file not found at ${gradlePath}`);
  process.exit(1);
}

let content = fs.readFileSync(gradlePath, 'utf8');

// Replace signingConfig signingConfigs.debug with release in release buildType block
content = content.replace(/signingConfig\s+signingConfigs\.debug/g, (match, offset) => {
  const precedingText = content.substring(Math.max(0, offset - 200), offset);
  if (precedingText.includes('release {')) {
    return 'signingConfig signingConfigs.release';
  }
  return match;
});

const storePassword = process.env.CM_KEYSTORE_PASSWORD || 'fe96dccc4e9b6ef3c3f92db3023c018b';
const keyAlias = process.env.CM_KEY_ALIAS || 'b6b4220e3e8711bef7c3279dd073f932';
const keyPassword = process.env.CM_KEY_PASSWORD || '832d709f39706c53cbcdb0f30c498ee4';

console.log(`Configuring release signing with keyAlias: ${keyAlias}`);

// Always enforce release signingConfig in signingConfigs block
const releaseSigningBlock = `    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            storeFile file('release.keystore')
            storeType 'jks'
            storePassword '${storePassword}'
            keyAlias '${keyAlias}'
            keyPassword '${keyPassword}'
        }
    }`;

content = content.replace(/signingConfigs\s*\{[\s\S]*?\n    \}/, releaseSigningBlock);

fs.writeFileSync(gradlePath, content, 'utf8');
console.log('Successfully patched android/app/build.gradle for release signing!');

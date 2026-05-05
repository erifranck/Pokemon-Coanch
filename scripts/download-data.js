import fs from 'fs';
import path from 'path';
import https from 'https';

const SHOWDOWN_URL_BASE = 'https://play.pokemonshowdown.com/data/';
const FILES_TO_DOWNLOAD = ['pokedex.js', 'moves.js', 'formats-data.js', 'items.js', 'abilities.js', 'learnsets.js'];
const RAW_DIR = path.join(process.cwd(), 'scripts', 'raw_data');

if (!fs.existsSync(RAW_DIR)) {
  fs.mkdirSync(RAW_DIR, { recursive: true });
}

const downloadFile = (filename) => {
  return new Promise((resolve, reject) => {
    const url = `${SHOWDOWN_URL_BASE}${filename}`;
    const dest = path.join(RAW_DIR, filename);
    const file = fs.createWriteStream(dest);
    
    console.log(`Downloading ${filename}...`);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${filename}: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Successfully downloaded ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

const run = async () => {
  try {
    for (const file of FILES_TO_DOWNLOAD) {
      await downloadFile(file);
    }
    console.log('All files downloaded successfully.');
  } catch (err) {
    console.error('Error downloading files:', err);
    process.exit(1);
  }
};

run();

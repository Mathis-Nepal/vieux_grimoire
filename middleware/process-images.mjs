import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Détermine le nom de fichier et le répertoire courant
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const processImage = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const filePath = path.join(__dirname, '../images', req.file.filename);
  const outputFilePath = path.join(__dirname, '../images', 'processed-' + req.file.filename);

  sharp.cache(false)

  sharp(filePath)
    .toFormat('webp')
    .resize(500, 500) // Redimensionnez l'image selon vos besoins
    .toFile(outputFilePath, (err, info) => {
      if (err) {
        return next(err);
      }

      // Supprimez le fichier original si vous ne voulez pas le conserver
      fs.unlink(filePath, (err) => {
        if (err) {
          return next(err);
        }

        // Remplacez le fichier original par le fichier traité
        req.file.filename = 'processed-' + req.file.filename;
        req.file.path = outputFilePath;

        next();
      });
    });
};

export default processImage;

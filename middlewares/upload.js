const fs = require('fs');
const path = require('path');
const multer = require('multer');

const imageMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];

const ensureDirectory = (directory) => {
  fs.mkdirSync(directory, { recursive: true });
};

const createStorage = (folder) =>
  multer.diskStorage({
    destination: (req, file, callback) => {
      const uploadDirectory = path.join(__dirname, '..', 'public', 'uploads', folder);
      ensureDirectory(uploadDirectory);
      callback(null, uploadDirectory);
    },
    filename: (req, file, callback) => {
      const extension = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, extension).replace(/\s+/g, '-').toLowerCase();
      callback(null, `${Date.now()}-${baseName}${extension}`);
    }
  });

const imageFileFilter = (req, file, callback) => {
  if (!imageMimeTypes.includes(file.mimetype)) {
    return callback(new Error('Faqat rasm fayllarini yuklash mumkin.'));
  }
  return callback(null, true);
};

const commonOptions = (folder) => ({
  storage: createStorage(folder),
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadAvatar = multer(commonOptions('avatars'));
const uploadListingImages = multer(commonOptions('listings'));
const uploadProofImages = multer(commonOptions('proofs'));
const uploadBlogImage = multer(commonOptions('blog'));

module.exports = {
  uploadAvatar,
  uploadListingImages,
  uploadProofImages,
  uploadBlogImage
};

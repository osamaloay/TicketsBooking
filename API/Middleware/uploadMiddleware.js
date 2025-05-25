const { upload } = require('../config/cloudinary');

const uploadImage = (fieldName) => {
    return upload.single(fieldName);
};

module.exports = { uploadImage };
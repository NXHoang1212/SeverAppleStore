const multer = require('multer');
const { S3Client, PutObjectCommand, DeleteObjectsCommand, } = require('@aws-sdk/client-s3')

const storage = multer.memoryStorage();
const uploadMulter = multer({ storage: storage }).array('images');
const uploadMulterSingle = multer({ storage: storage }).single('images');
const uploadAvatar = multer({ storage: storage }).single('photoUrl');
const uploadMulterMedia = multer({ storage: storage }).array('media', 5);

require('dotenv').config();

const s3 = new S3Client({
    region: process.env.AWS_BUCKET_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
    }
});
console.log("🚀 ~ file: UploadFormAWS.js ~ line 15 ~ s3", s3.config.credentials({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
}))

const uploadFileAWS = async (file) => {
    const folderName = 'product/';
    const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: folderName + file.originalname,
        Body: file.buffer,
        ContentType: file.mimetype,
    };
    try {
        const command = new PutObjectCommand(uploadParams);
        await s3.send(command);
        const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${folderName}${file.originalname}`;
        return { Location: imageUrl };
    } catch (error) {
        console.error("🚀 ~ uploadFileAWS ~ error", error)
        throw new Error(error);
    }
};

const deleteFileAWS = async (key) => {
    const folderName = 'product/';
    const deleteParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Delete: {
            Objects: [
                {
                    Key: folderName + key
                }
            ]
        }
    };
    try {
        const command = new DeleteObjectsCommand(deleteParams);
        await s3.send(command);
    } catch (error) {
        console.error("🚀 ~ deleteFileAWS ~ error", error)
        throw new Error(error);
    }
};


module.exports = { s3, uploadMulter, uploadMulterMedia, uploadMulterSingle, uploadAvatar, uploadFileAWS, deleteFileAWS };

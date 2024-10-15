const { PutObjectCommand, DeleteObjectsCommand } = require('@aws-sdk/client-s3')
const { s3 } = require('./UploadFormAws');


class UploadOtherAws {
    static async uploadAvatarAws(file) {
        const folderName = 'avataruser/';
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

    static async uploadCategoryAws(file) {
        const folderName = 'category/';
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
    }

    static async deleteCategoryAws(key) {
        const folderName = 'category/';
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
    }

    static async uploadBannerAws(file) {
        const folderName = 'banner/';
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
    }

    static async deleteBannerAws(key) {
        const folderName = 'banner/';
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
    }

    static async uploadVoucherAws(file) {
        const folderName = 'voucher/';
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
    }

    static async deleteVoucherAws(key) {
        const folderName = 'voucher/';
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
    }

    static async uploadEvaluateAws(file) {
        const folderName = 'evaluate/';
        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: folderName + file.originalname,
            Body: file.buffer,
            ContentType: file.mimetype, // Đảm bảo rằng mimetype đúng cho video, ví dụ: video/mp4
        };
        try {
            const command = new PutObjectCommand(uploadParams);
            await s3.send(command);
            const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${folderName}${file.originalname}`;
            return { Location: fileUrl };
        } catch (error) {
            console.error("🚀 ~ uploadEvaluateAws ~ error", error);
            throw new Error(error);
        }
    }

    static async deleteEvaluateAws(key) {
        const folderName = 'evaluate/';
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
    }

    static async uploadSocketChatAws(file) {
        const folderName = 'ChatSocket/';
        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: folderName + file.originalname,
            Body: file.buffer,
            ContentType: file.mimetype, // Đảm bảo rằng mimetype đúng cho video, ví dụ: video/mp4
        };
        try {
            const command = new PutObjectCommand(uploadParams);
            await s3.send(command);
            const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${folderName}${file.originalname}`;
            return { Location: fileUrl };
        } catch (error) {
            console.error("🚀 ~ uploadEvaluateAws ~ error", error);
            throw new Error(error);
        }
    }
}


module.exports = UploadOtherAws;
const bannerModel = require('../model/Banner.Model')
const { uploadBannerAws, deleteBannerAws } = require('../middleware/UploadOtherAws')

class BannerService {
    static async createBanner(req, res) {
        try {
            const { title } = req.body;
            const images = req.file;
            const data = await uploadBannerAws(images);
            const newBanner = new bannerModel({
                title,
                images: data.Location
            });
            const result = await newBanner.save();
            return {
                status: 201,
                message: 'Banner đã được tạo thành công',
                data: result
            }
        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null
            }
        }
    }

    static async getAllBanner(req, res) {
        try {
            const banners = await bannerModel.find();
            return {
                status: 200,
                message: 'Danh sách banner',
                data: banners
            }
        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null
            }
        }
    }

    static async updateBanner(id, req) {
        try {
            const { title } = req.body;
            const images = req.file;
            if (images) {
                const data = await uploadBannerAws(images);
                await bannerModel.findByIdAndUpdate(id, { title, images: data.Location }, { new: true });
            } else {
                await bannerModel.findByIdAndUpdate(id,
                    { title },
                    { new: true }
                );
            }
            const banner = await bannerModel.findById(id);
            return {
                status: 200,
                message: 'Banner đã được cập nhật',
                data: banner
            }
        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null
            }
        }
    }

    static async deleteBanner(id) {
        try {
            const banner = await bannerModel.findById(id);
            if (!banner) {
                return {
                    status: 404,
                    message: 'Không tìm thấy danh mục',
                    data: null
                }
            }
            await deleteBannerAws(banner.images.split('/').pop());
            await bannerModel.findByIdAndDelete(id);
            return {
                status: 200,
                message: 'Danh mục đã được xóa',
                data: null
            }
        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null
            }
        }
    }
}

module.exports = BannerService;
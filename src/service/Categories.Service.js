const categoryModel = require('../model/Cateogories.Model');
const { uploadCategoryAws, deleteCategoryAws } = require('../middleware/UploadOtherAws')

class CategoriesService {
    static async createCategory(req, res) {
        try {
            const { name } = req.body;
            const images = req.file;
            const data = await uploadCategoryAws(images);
            const newCategory = new categoryModel({
                name,
                images: data.Location
            });
            const result = await newCategory.save();
            return {
                status: 201,
                message: 'Danh mục đã được tạo thành công',
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

    static async getAllCategory(req, res) {
        try {
            const categories = await categoryModel.find();
            return {
                status: 200,
                message: 'Danh sách danh mục',
                data: categories
            }
        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null
            }
        }
    }

    static async getCategoryById(id) {
        try {
            const category = await categoryModel.findById(id);
            if (!category) {
                return {
                    status: 404,
                    message: 'Không tìm thấy danh mục',
                    data: null
                }
            }
            return {
                status: 200,
                message: 'Chi tiết danh mục',
                data: category
            }
        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null
            }
        }
    }

    static async updateCategory(id, req) {
        try {
            const { name } = req.body;
            const images = req.file;
            if (images) {
                const data = await uploadCategoryAws(images);
                await categoryModel.findByIdAndUpdate(id, { name, images: data.Location }, { new: true });
            } else {
                await categoryModel.findByIdAndUpdate(id
                    , { name }, { new: true });
            }
            const category = await categoryModel.findById(id);
            return {
                status: 200,
                message: 'Danh mục đã được cập nhật',
                data: category
            }
        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null
            }
        }
    }

    static async deleteCategory(id) {
        try {
            const category = await categoryModel.findById(id);
            if (!category) {
                return {
                    status: 404,
                    message: 'Không tìm thấy danh mục',
                    data: null
                }
            }
            await deleteCategoryAws(category.images.split('/').pop());
            await categoryModel.findByIdAndDelete(id);
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

module.exports = CategoriesService;
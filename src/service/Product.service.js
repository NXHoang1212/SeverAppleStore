const productModel = require('../model/Product.Model');
const { uploadFileAWS, deleteFileAWS } = require('../middleware/UploadFormAws');

class ProductService {
    static async createProduct(req, res) {
        try {
            const { name, model, storage, priceColor, description, category, brand, stock, specifications, discount, status, condition } = req.body;
            const images = req.files;
            const imagesUrl = [];
            for (const image of images) {
                const data = await uploadFileAWS(image);
                imagesUrl.push(data.Location);
            }
            const newProduct = new productModel({
                name,
                model,
                storage,
                priceColor: JSON.parse(priceColor),
                images: imagesUrl,
                description,
                category,
                brand,
                stock,
                specifications: JSON.parse(specifications),
                discount: JSON.parse(discount),
                status,
                condition
            });
            const result = await newProduct.save();
            return {
                status: 201,
                message: 'Sản phẩm đã được tạo thành công',
                data: result,
            }
        } catch (error) {
            console.log("🚀 ~ ProductService ~ createProduct ~ error:", error)
            return {
                status: 500,
                message: error.message,
                data: null
            }
        }
    }

    static async getAllProduct(queryParams) {
        try {
            const { name, model, storage, priceColor, category, brand } = queryParams;
            let query = {};
            if (name) {
                query = { ...query, name: name };
            }
            if (model) {
                query = { ...query, model: model };
            }
            if (storage) {
                query = { ...query, storage: storage };
            }
            if (priceColor) {
                query = { ...query, priceColor: priceColor };
            }
            if (category) {
                query = { ...query, category: category };
            }
            if (brand) {
                query = { ...query, brand: brand };
            }
            const products = await productModel.find(query).populate('category', '_id name images')
            if (products.length === 0) {
                return {
                    status: 404,
                    message: 'Không tìm thấy sản phẩm',
                    data: null
                }
            }
            const count = await productModel.countDocuments(query);
            return {
                status: 200,
                message: 'Danh sách sản phẩm',
                data: {
                    products,
                }
            }
        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null
            }
        }
    }

    static async getProductPagination(queryParams) {
        try {
            const { page, limit } = queryParams;
            const products = await productModel.find().populate('category', '_id name images').limit(limit * 1).skip((page - 1) * limit);
            if (products.length === 0) {
                return {
                    status: 404,
                    message: 'Không tìm thấy sản phẩm',
                    data: null
                }
            }
            const count = await productModel.countDocuments();
            return {
                status: 200,
                message: 'Danh sách sản phẩm',
                data: {
                    products,
                    currentPage: page,
                    totalPages: Math.ceil(count / limit)
                }
            }
        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null
            }
        }
    }

    static async getProductById(id) {
        try {
            const product = await productModel.findById(id).populate('category', '_id name images');
            if (!product) {
                return {
                    status: 404,
                    message: 'Không tìm thấy sản phẩm',
                    data: null
                }
            }
            return {
                status: 200,
                message: 'Chi tiết sản phẩm',
                data: { products: product }
            }
        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null
            }
        }
    }

    static async updateProduct(id, req) {
        try {
            const { name, model, storage, priceColor, description, category, brand, stock, specifications, discount, status } = req.body;
            const images = req.files;
            const imagesUrl = [];
            if (images && images.length > 0) {
                for (const image of images) {
                    const data = await uploadFileAWS(image);
                    imagesUrl.push(data.Location);
                }
            }
            const product = await productModel.findById(id);
            if (!product) {
                return {
                    status: 404,
                    message: 'Không tìm thấy sản phẩm',
                    data: null
                };
            }
            const updatedData = {
                name,
                model,
                storage,
                priceColor: JSON.parse(priceColor),
                description,
                category,
                brand,
                stock,
                specifications: JSON.parse(specifications),
                discount: JSON.parse(discount),
                status
            };
            if (imagesUrl.length > 0) {
                updatedData.images = imagesUrl;
            } else {
                updatedData.images = product.images;
            }
            const result = await productModel.findByIdAndUpdate(id, updatedData, { new: true });

            return {
                status: 200,
                message: 'Sản phẩm đã được cập nhật',
                data: result
            };
        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null
            };
        }
    }

    static async deleteProduct(id) {
        try {
            const product = await productModel.findById(id);
            if (!product) {
                return {
                    status: 404,
                    message: 'Không tìm thấy sản phẩm',
                    data: null
                };
            }
            for (const image of product.images) {
                const key = image.split('/').pop();
                await deleteFileAWS(key);
            }
            await productModel.findByIdAndDelete(id);
            return {
                status: 200,
                message: 'Sản phẩm đã được xóa',
                data: null
            };
        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null
            };
        }
    }

}
module.exports = ProductService;
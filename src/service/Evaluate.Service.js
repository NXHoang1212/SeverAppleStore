const evaluateModel = require('../model/Evaluate.Model')
const { uploadEvaluateAws, deleteEvaluateAws } = require('../middleware/UploadOtherAws')


class EvaluateService {

    static async createEvaluate(req, res) {
        try {
            const { order_id, user_id } = req.body

            const evaluate = new evaluateModel({
                order_id: order_id,
                user_id: user_id,
            });

            const result = await evaluate.save();

            return {
                status: 200,
                message: 'Đánh giá sản phẩm thành công',
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

    static async getEvaluateByOrderId(order_id) {
        try {
            const evaluates = await evaluateModel.find({ order_id: { $in: order_id } });

            if (!evaluates) {
                throw new Error('Không tìm thấy đánh giá');
            }

            return {
                status: 200,
                message: 'Lấy danh sách đánh giá thành công',
                data: evaluates
            }
        } catch (error) {
            console.log("🚀 ~ EvaluateService ~ getEvaluateByOrderId ~ error:", error)

            return {
                status: 500,
                message: error.message,
                data: null
            }
        }
    }

    static async getEvaluateByUserId(user_id) {
        try {
            const evaluates = await evaluateModel.find({ user_id: user_id }).populate('order_id').populate('user_id')

            if (!evaluates) {
                throw new Error('Không tìm thấy đánh giá');
            }

            return {
                status: 200,
                message: 'Lấy danh sách đánh giá thành công',
                data: evaluates
            }
        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null
            }
        }
    }

    static async getEvaluateAll() {
        try {
            const evaluates = await evaluateModel.find().populate('order_id').populate('user_id')

            if (!evaluates) {
                throw new Error('Không tìm thấy đánh giá');
            }

            return {
                status: 200,
                message: 'Lấy danh sách đánh giá thành công',
                data: evaluates
            }
        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null
            }
        }
    }

    static async updateEvaluate(req, id) {
        try {
            const { rating, detail, comment, status, updated_at } = req.body;

            const media = req.files || [];

            const currentEvaluate = await evaluateModel.findById(id);

            if (!currentEvaluate) {
                throw new Error("Đánh giá không tồn tại");
            }

            const updatedData = {
                rating: rating,
                detail: detail,
                comment: comment,
                status: status,
            };

            if (media.length > 0) {
                if (!Array.isArray(media)) {
                    throw new Error("Media is not an array");
                }

                const mediaUrls = [];
                for (const file of media) {
                    const { Location } = await uploadEvaluateAws(file);
                    mediaUrls.push(Location);
                }
                updatedData.media = mediaUrls;
            } else {
                updatedData.media = currentEvaluate.media || [];
            }

            await evaluateModel.findByIdAndUpdate(id, updatedData, { new: true });

            const evaluate = await evaluateModel.findById(id);

            return {
                status: 200,
                message: 'Đánh giá đã được cập nhật',
                data: evaluate
            };

        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null,
            };
        }
    }

    static async detailEvaluate(id) {
        try {
            const evaluate = await evaluateModel.findById(id).populate('order_id').populate('user_id')

            if (!evaluate) {
                throw new Error('Không tìm thấy đánh giá');
            }

            return {
                status: 200,
                message: 'Lấy chi tiết đánh giá thành công',
                data: evaluate
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

module.exports = EvaluateService
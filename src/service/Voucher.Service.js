const voucherModal = require('../model/Voucher.Model')
const { uploadVoucherAws, deleteVoucherAws } = require('../middleware/UploadOtherAws')

class VoucherService {
    static async createVoucher(
        name, code, discount, description, maxDiscountAmount, minOrderAmount,
        expirationDate, usageLimit, paymentMethod, usersApplicable, images, condition
    ) {
        try {
            const data = await uploadVoucherAws(images);
            const newVoucher = new voucherModal({
                name,
                code,
                discount,
                description,
                condition,
                maxDiscountAmount,
                minOrderAmount,
                usageLimit,
                paymentMethod,
                usersApplicable,
                expirationDate,
                images: data.Location,
            });
            const result = await newVoucher.save();
            return {
                status: 201,
                message: 'Voucher created successfully',
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

    static async getVoucherList(usersApplicable, userId) {
        try {
            const query = {
                $or: [
                    { usersApplicable: { $in: usersApplicable } },
                    { usersApplicable: { $size: 0 } }
                ]
            };

            if (userId) {
                query.$expr = {
                    $not: {
                        $in: [userId, "$userUsed"]
                    }
                };
            }

            const vouchers = await voucherModal.find(query);
            return {
                status: 200,
                message: 'Voucher list',
                data: vouchers
            };
        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null
            }
        }
    }


    static async getVoucherById(id) {
        try {
            const result = await voucherModal.findById(id);
            return {
                status: 200,
                message: 'Voucher detail',
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
    static async useVoucher(id, userId, paymentMethod) {
        try {
            const voucher = await voucherModal.findById(id);
            if (!voucher) {
                return {
                    status: 404,
                    message: 'Voucher not found',
                    data: null
                };
            }
            // Kiểm tra nếu mã giảm giá này áp dụng cho người dùng cụ thể
            if (voucher.usersApplicable.length > 0 && !voucher.usersApplicable.includes(userId)) {
                return {
                    status: 400,
                    message: 'You are not applicable for this voucher',
                    data: null
                };
            }
            // Kiểm tra trạng thái mã giảm giá
            if (voucher.status !== 'active') {
                return {
                    status: 400,
                    message: 'Voucher is not active',
                    data: null
                };
            }
            // Kiểm tra ngày hết hạn của mã giảm giá
            if (voucher.expirationDate < new Date()) {
                return {
                    status: 400,
                    message: 'Voucher is expired',
                    data: null
                };
            }
            if (voucher.paymentMethod !== 'Nhận hàng tại nhà' && voucher.paymentMethod !== paymentMethod) {
                return {
                    status: 400,
                    message: 'This voucher cannot be used with the selected payment method',
                    data: null
                };
            }
            // Kiểm tra nếu người dùng đã sử dụng mã giảm giá này
            if (voucher.userUsed.includes(userId)) {
                return {
                    status: 400,
                    message: 'User has already used this voucher',
                    data: null
                };
            }
            // Giảm giá trị của usageLimit và cập nhật danh sách userUsed
            voucher.usageLimit -= 1;
            voucher.userUsed.push(userId);
            // Nếu usageLimit bằng 0, thay đổi trạng thái mã giảm giá thành 'used'
            if (voucher.usageLimit <= 0) {
                voucher.status = 'used';
            }
            await voucher.save();
            return {
                status: 200,
                message: 'Voucher used successfully',
                data: voucher
            };
        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null
            };
        }
    }

    static async deleteVoucher(id) {
        try {
            const voucher = await voucherModal.findById(id);
            if (!voucher) {
                return {
                    status: 404,
                    message: 'Voucher not found',
                    data: null
                };
            }
            await deleteVoucherAws(voucher.images.split('/').pop());
            await voucher.remove();
            return {
                status: 200,
                message: 'Voucher deleted successfully',
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

    static async updateVoucher(id, req) {
        try {
            const { name, code, discount, description, maxDiscountAmount, minOrderAmount, expirationDate, usageLimit, paymentMethod, usersApplicable, condition } = req.body;
            const images = req.file;
            const voucher = await voucherModal.findById(id);
            if (!voucher) {
                return {
                    status: 404,
                    message: 'Voucher not found',
                    data: null
                };
            }
            if (images) {
                const data = await uploadVoucherAws(images);
                await voucherModal.findByIdAndUpdate(id, {
                    name, code, discount, description, maxDiscountAmount, minOrderAmount, expirationDate, usageLimit, paymentMethod, usersApplicable, condition, images: data.Location
                }, { new: true });
            } else {
                await voucherModal.findByIdAndUpdate(id, {
                    name, code, discount, description, maxDiscountAmount, minOrderAmount, expirationDate, usageLimit, paymentMethod, usersApplicable, condition
                }, { new: true });
            }
            const result = await voucherModal.findById(id);
            return {
                status: 200,
                message: 'Voucher updated successfully',
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

    static async resetVoucherUsage(id, userId) {
        try {
            const voucher = await voucherModal.findById(id);
            if (!voucher) {
                return {
                    status: 404,
                    message: 'Voucher not found',
                    data: null
                };
            }
            const userIndex = voucher.userUsed.findIndex(user => user.toString() === userId);
            if (userIndex === -1) {
                return {
                    status: 400,
                    message: 'User has not used this voucher',
                    data: null
                };
            }
            voucher.usageLimit += 1;
            voucher.userUsed.splice(userIndex, 1); // Xóa người dùng khỏi mảng userUsed

            // Nếu usageLimit > 0, thay đổi trạng thái mã giảm giá thành 'active'
            if (voucher.usageLimit > 0 && voucher.status !== 'active') {
                voucher.status = 'active';
            }

            await voucher.save();

            return {
                status: 200,
                message: 'Voucher usage reset successfully',
                data: voucher
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

module.exports = VoucherService;

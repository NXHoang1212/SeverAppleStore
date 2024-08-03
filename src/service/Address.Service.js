const addressModel = require('../model/Address.Model')

class AddressService {
    static async createAddress(req, res) {
        try {
            const { user_id, houseNumber, ward, district, province, phone, name, addressType, isDefault } = req.body;
            if (isDefault) {
                await addressModel.updateMany({ user_id, isDefault: true }, { isDefault: false });
            }
            const newAddress = new addressModel({
                user_id,
                houseNumber,
                ward,
                district,
                province,
                phone,
                name,
                addressType,
                isDefault
            });
            const result = await newAddress.save();
            return {
                status: 201,
                message: 'Địa chỉ đã được tạo thành công',
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

    static async getAddressUserid(req, res) {
        try {
            const { user_id } = req.params;
            const address = await addressModel.find({ user_id }).populate('user_id', 'fullname phone');
            return {
                status: 200,
                message: 'Danh sách địa chỉ',
                data: address
            }
        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null
            }
        }
    }

    static async getAddressById(id) {
        try {
            const address = await addressModel.findById(id);
            if (!address) {
                return {
                    status: 404,
                    message: 'Không tìm thấy địa chỉ',
                    data: null
                }
            }
            return {
                status: 200,
                message: 'Chi tiết địa chỉ',
                data: address
            }
        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null
            }
        }
    }

    static async updateAddress(id, data) {
        try {
            const address = await addressModel.findById(id);
            if (data.isDefault) {
                await addressModel.updateMany({ user_id: address.user_id, isDefault: true }, { isDefault: false });
            }
            if (!address) {
                return {
                    status: 404,
                    message: 'Không tìm thấy địa chỉ',
                    data: null
                }
            }
            const result = await addressModel.findByIdAndUpdate
                (id, data, { new: true });
            return {
                status: 200,
                message: 'Địa chỉ đã được cập nhật',
                data: result
            }
        }
        catch (error) {
            console.log("🚀 ~ AddressService ~ updateAddress ~ error:", error.message)
            return {
                status: 500,
                message: error.message,
                data: null
            }
        }
    }

    static async deleteAddress(id) {
        try {
            const address = await addressModel.findById(id);
            if (!address) {
                return {
                    status: 404,
                    message: 'Không tìm thấy địa chỉ',
                    data: null
                }
            }
            await addressModel.findByIdAndDelete(id);
            return {
                status: 200,
                message: 'Địa chỉ đã được xóa',
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

module.exports = AddressService;
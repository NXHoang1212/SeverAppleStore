const addressService = require('../service/Address.Service')

class AddressController {
    static async createAddress(req, res) {
        try {
            const result = await addressService.createAddress(req, res);
            res.status(result.status).json(result);
        } catch (error) {
            res.status(500).json(error.message);
        }
    }

    static async getAddressUserid(req, res) {
        try {
            const result = await addressService.getAddressUserid(req, res);
            res.status(result.status).json(result);
        } catch (error) {
            res.status(500).json(error.message);
        }
    }

    static async getAddressById(req, res) {
        try {
            const result = await addressService.getAddressById(req.params.id);
            res.status(result.status).json(result);
        } catch (error) {
            res.status(500).json(error.message);
        }
    }

    static async updateAddress(req, res) {
        try {
            const result = await addressService.updateAddress(req.params.id, req.body);
            res.status(result.status).json(result);
        } catch (error) {
            res.status(500).json(error.message);
        }
    }

    static async deleteAddress(req, res) {
        try {
            const result = await addressService.deleteAddress(req.params.id);
            res.status(result.status).json(result);
        } catch (error) {
            res.status(500).json(error.message);
        }
    }
}  

module.exports = AddressController;

const evaluateService = require('../service/Evaluate.Service')

class EvaluateController {

    static async createEvaluate(req, res) {
        try {
            const result = await evaluateService.createEvaluate(req, res);
            res.status(result.status).json(result);
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: error.message,
                data: null
            });
        }
    }

    static async getEvaluateByOrderId(req, res) {
        try {
            const result = await evaluateService.getEvaluateByOrderId(req.params.order_id.split(','));
            res.status(result.status).json(result);
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: error.message,
                data: null
            });
        }
    }

    static async getEvaluateByUserId(req, res) {
        try {
            const result = await evaluateService.getEvaluateByUserId(req.params.user_id);
            res.status(result.status).json(result);
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: error.message,
                data: null
            });
        }
    }

    static async getEvaluateAll(req, res) {
        try {
            const result = await evaluateService.getEvaluateAll();
            res.status(result.status).json(result);
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: error.message,
                data: null
            });
        }
    }

    static async updateEvaluate(req, res) {
        try {
            const result = await evaluateService.updateEvaluate(req, req.params.id);
            res.status(result.status).json(result);
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: error.message,
                data: null
            });
        }
    }

    static async detailEvaluate(req, res) {
        try {
            const result = await evaluateService.detailEvaluate(req.params.id)
            res.status(result.status).json(result);
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: error.message,
                data: null
            });
        }
    }
}

module.exports = EvaluateController
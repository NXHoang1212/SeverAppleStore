const messageService = require('../service/Message.Service')

class MessageController {

    static async uploadMessage(req, res, next) {
        try {
            const result = await messageService.uploadMessage(req);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

}


module.exports = MessageController;
const { uploadSocketChatAws } = require('../middleware/UploadOtherAws')

class MessageService {

    static async uploadMessage(req) {
        try {
            const result = await uploadSocketChatAws(req.file);
            console.log("🚀 ~ MessageService ~ uploadMessage ~ result:", result)
            return result;
        } catch (error) {
            throw new Error(error);
        }
    }
    
}

module.exports = MessageService;
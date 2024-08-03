module.exports = {
    sendSuccess: (res, message, data) => {
        return res.status(200).json({
            status: 200,
            message: message,
            data: data
        });
    },
    sendCreated: (res, message, data) => {
        return res.status(201).json({
            status: 201,
            message: message,
            data: data
        });
    },
    sendError: (res, message) => {
        return res.status(500).json({
            status: 500,
            message: message,
            data: null
        });
    }

};


const ErrorMiddleware = (error, req, res, next) => {
    console.error('Error stack:', error.stack);
    res.status(error.status || 500);
    const errorDetails = {
        message: error.message,
        error: req.app.get('env') === 'development' ? {
            stack: error.stack,
            status: error.status
        } : {}
    };
    res.json(errorDetails);
};

module.exports = ErrorMiddleware;

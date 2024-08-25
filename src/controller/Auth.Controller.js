const AuthService = require('../service/Auth.Service');
const response = require('../utils/ResponseUtil');

class AuthController {
    async register(req, res) {
        try {
            const { fullname, email, phone, password, confirm_password } = req.body;
            const result = await AuthService.register(fullname, email, phone, password, confirm_password);
            if (result.status === 201) {
                response.sendCreated(res, result.message, result.data);
            } else {
                response.sendError(res, result.message);
            }
        } catch (error) {
            console.log("🚀 ~ AuthController ~ register ~ error:", error)
            return response.sendError(res, error);
        }
    }

    async login(req, res) {
        try {
            const { email, phone, password } = req.body;
            const result = await AuthService.login(email, phone, password);
            if (result.status === 200) {
                response.sendSuccess(res, result.message, result.data);
            } else {
                response.sendError(res, result.message);
            }
        } catch (error) {
            return response.sendError(res, error);
        }
    }

    async loginProvider(req, res) {
        try {
            const { photoUrl, provider } = req.body;
            const result = await AuthService.loginProvider(photoUrl, provider);
            if (result.status === 200) {
                response.sendSuccess(res, result.message, result.data);
            } else {
                response.sendError(res, result.message);
            }
        } catch (error) {
            return response.sendError(res, error);
        }
    }

    async getUserById(req, res) {
        try {
            const { id } = req.params;
            const result = await AuthService.getUserById(id);
            if (result.status === 200) {
                response.sendSuccess(res, result.message, result.data);
            } else {
                response.sendError(res, result.message);
            }
        } catch (error) {
            return response.sendError(res, error);
        }
    }

    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const { fullname, phone, date_of_birth, gender } = req.body;
            const result = await AuthService.updateUserById(id, fullname, phone, date_of_birth, gender);
            if (result.status === 200) {
                response.sendSuccess(res, result.message, result.data);
            } else {
                response.sendError(res, result.message);
            }
        } catch (error) {
            return response.sendError(res, error);
        }
    }

    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const result = await AuthService.deleteUserById(id);
            if (result.status === 200) {
                response.sendSuccess(res, result.message, result.data);
            } else {
                response.sendError(res, result.message);
            }
        } catch (error) {
            return response.sendError(res, error);
        }
    }

    async resetPassword(req, res) {
        try {
            const { id } = req.params;
            const { oldPassword, newPassword, confirmPassword } = req.body;
            const resultReset = await AuthService.handlePassword(id, oldPassword, 'reset', newPassword, confirmPassword);
            if (resultReset.status === 200) {
                response.sendSuccess(res, resultReset.message, resultReset.data);
            } else {
                response.sendError(res, resultReset.message);
            }
        } catch (error) {
            return response.sendError(res, error);
        }
    }

    async authenticatePassword(req, res) {
        try {
            const { id } = req.params;
            const { password } = req.body;
            const resultAuthenticate = await AuthService.handlePassword(id, password, 'authenticate');
            if (resultAuthenticate.status === 200) {
                response.sendSuccess(res, resultAuthenticate.message, resultAuthenticate.data);
            } else {
                response.sendError(res, resultAuthenticate.message);
            }
        } catch (error) {
            return response.sendError(res, error);
        }
    }

    async sendMailPassword(req, res) {
        try {
            const { email } = req.body;
            const result = await AuthService.sendMailPassword(email);
            if (result.status === 200) {
                response.sendSuccess(res, result.message, result.data);
            } else {
                response.sendError(res, result.message);
            }
        } catch (error) {
            return response.sendError(res, error);
        }
    }

    async verifyMailOtp(req, res) {
        try {
            const { otp } = req.body;
            const result = await AuthService.verifyMailOtp(otp);
            if (result.status === 200) {
                response.sendSuccess(res, result.message, result.data);
            } else {
                response.sendError(res, result.message);
            }
        } catch (error) {
            return response.sendError(res, error);
        }
    }

    async resetPasswordFromMail(req, res) {
        try {
            const { email, newPassword, confirmPassword } = req.body;
            const result = await AuthService.resetPasswordFromEmail(email, newPassword, confirmPassword);
            if (result.status === 200) {
                response.sendSuccess(res, result.message, result.data);
            } else {
                response.sendError(res, result.message);
            }
        } catch (error) {
            return response.sendError(res, error);
        }
    }

    async uploadAvatar(req, res) {
        try {
            const { id } = req.params;
            const { file } = req;
            const result = await AuthService.uploadAvatar(id, file);
            if (result.status === 200) {
                response.sendSuccess(res, result.message, result.data);
            } else {
                response.sendError(res, result.message);
            }
        } catch (error) {
            return response.sendError(res, error);
        }
    }

    async updateFcmToken(req, res) {
        try {
            const { id } = req.params;
            const { fcmToken } = req.body;
            const result = await AuthService.updateFcmToken(id, fcmToken);
            if (result.status === 200) {
                response.sendSuccess(res, result.message, result.data);
            } else {
                response.sendError(res, result.message);
            }
        } catch (error) {
            return response.sendError(res, error);
        }
    }

    async removeFcmToken(req, res) {
        try {
            const { id } = req.params;
            const { fcmToken } = req.body;
            const result = await AuthService.removeFcmToken(id, fcmToken);
            if (result.status === 200) {
                response.sendSuccess(res, result.message, result.data);
            } else {
                response.sendError(res, result.message);
            }
        } catch (error) {
            return response.sendError(res, error);
        }
    }

    async getAllUser(req, res) {
        try {
            const result = await AuthService.getAllUser();
            if (result.status === 200) {
                response.sendSuccess(res, result.message, result.data);
            } else {
                response.sendError(res, result.message);
            }
        } catch (error) {
            return response.sendError(res, error);
        }
    }
}

module.exports = new AuthController();
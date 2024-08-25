const UserModel = require('../model/Auth.Model');
const bcrypt = require('bcryptjs');;
const jwt = require('jsonwebtoken');
const mailer = require('nodemailer')
const otp = require('../utils/GenerateOtp')
const { uploadAvatarAws } = require('../middleware/UploadOtherAws');

class AuthService {
    async register(fullname, email, phone, password, confirm_password) {
        try {
            const salt = await bcrypt.genSaltSync(10);
            const hashPassword = await bcrypt.hashSync(password, salt);
            const user = new UserModel({
                fullname: fullname,
                email: email,
                phone: phone,
                password: hashPassword,
                confirm_password: confirm_password,
            });
            if (password !== confirm_password) {
                return {
                    status: 400,
                    message: "Mật khẩu không trùng khớp",
                    data: null
                }
            } else if (!confirm_password) {
                return {
                    status: 400,
                    message: "Vui lòng nhập lại mật khẩu",
                    data: null
                }
            } else if (await UserModel.findOne({ email: email })) {
                return {
                    status: 400,
                    message: "Email đã tồn tại",
                    data: null
                }
            } else if (await UserModel.findOne({ phone: phone })) {
                return {
                    status: 400,
                    message: "Số điện thoại đã tồn tại",
                    data: null
                }
            }
            const saveUser = await user.save();
            return {
                status: 201,
                message: "Người dùng đăng ký thành công",
                data: saveUser
            }
        } catch (error) {
            console.log("🚀 ~ AuthService ~ register ~ error:", error)
            return {
                status: 401,
                message: error.message,
                data: null
            }
        }
    }

    async login(email, phone, password) {
        try {
            let user = await UserModel.findOne({ email: email }) || await UserModel.findOne({ phone: phone });
            //nếu không tìm thấy user thì tạo user admin mặc định để đăng nhập vào hệ thống còn không có thì sẽ là user thông thường 
            if (!user) {
                const adminEmail = "hoangxuan@gmail.com";
                const adminPassword = "012345678";
                if (email === adminEmail && password === adminPassword) {
                    //nếu tk admin không tồn tại thì tạo tk admin mặc định còn nếu có thì cho đăng nhập vào hệ thống
                    const salt = await bcrypt.genSaltSync(10);
                    const hashPassword = await bcrypt.hashSync(adminPassword, salt);
                    const newUser = new UserModel({
                        email: adminEmail,
                        password: hashPassword,
                        role: "admin"
                    });
                    const saveUser = await newUser.save();
                    return {
                        status: 200,
                        message: "Đăng nhập thành công",
                        data: saveUser
                    }
                } else {
                    throw new Error("Email or phone not found");
                }
            } else {
                if (email && !user.email) {
                    throw new Error("Email is incorrect");
                }
                if (phone && !user.phone) {
                    throw new Error("Phone is incorrect");
                }
                const isPasswordMatch = await bcrypt.compare(password, user.password);
                if (!isPasswordMatch) {
                    throw new Error("Password is incorrect");
                }

            }
            const token = jwt.sign({ user }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
            return {
                status: 200,
                message: "Đăng nhập thành công",
                data: user,
            };
        } catch (error) {
            console.log("🚀 ~ AuthService ~ login ~ error:", error);
            return {
                status: 400,
                message: error.message,
                data: null
            };
        }
    }

    async loginProvider(photoUrl, provider) {
        try {
            const user = await UserModel.findOne({ provider: provider });
            if (!user) {
                const newUser = new UserModel({
                    photoUrl: photoUrl,
                    provider: provider
                });
                const saveUser = await newUser.save();
                return {
                    status: 200,
                    message: "Đăng nhập bằng provider thành công",
                    data: saveUser
                }
            }
            return {
                status: 200,
                message: "Đăng nhập bằng provider thành công",
                data: user
            }
        } catch (error) {
            console.log("🚀 ~ AuthService ~ loginProvider ~ error:", error)
            return {
                status: 400,
                message: error.message,
                data: null
            }
        }
    }

    async getUserById(id) {
        try {
            const user = await UserModel.findById(id);
            if (!user) {
                throw new Error("Không tìm thấy người dùng");
            }
            return {
                status: 200,
                message: "Tìm người dùng thành công",
                data: user
            }
        } catch (error) {
            return {
                status: 400,
                message: error.message,
                data: null
            }
        }
    }

    async updateUserById(id, fullname, phone, date_of_birth, gender) {
        try {
            const user = await UserModel.findById(id);
            if (!user) {
                throw new Error("Không tìm thấy người dùng");
            }
            const updateUser = await UserModel.findByIdAndUpdate
                (id, {
                    fullname: fullname,
                    phone: phone,
                    date_of_birth: date_of_birth,
                    gender: gender
                }, { new: true });
            return {
                status: 200,
                message: "Cập nhật người dùng thành công",
                data: updateUser
            }

        } catch (error) {
            console.log("🚀 ~ AuthService ~ updateUserById ~ error:", error)
            return {
                status: 400,
                message: error.message,
                data: null
            }
        }
    }

    async deleteUserById(id) {
        try {
            const user = await UserModel.findById(id);
            if (!user) {
                throw new Error("Không tìm thấy người dùng");
            }
            const deleteUser = await UserModel.findByIdAndDelete(id);
            return {
                status: 200,
                message: "Xóa người dùng thành công",
                data: deleteUser
            }
        } catch (error) {
            return {
                status: 400,
                message: error.message,
                data: null
            }
        }
    }

    async handlePassword(id, password, action, newPassword = null, confirmPassword = null) {
        try {
            const user = await UserModel.findById(id);
            if (!user) {
                throw new Error("Không tìm thấy người dùng");
            }
            const isPasswordMatch = await bcrypt.compare(password, user.password);
            if (!isPasswordMatch) {
                throw new Error("Mật khẩu không đúng");
            }
            if (action === 'reset') {
                if (newPassword !== confirmPassword) {
                    throw new Error("Mật khẩu mới không trùng khớp");
                }
                const salt = await bcrypt.genSaltSync(10);
                const hashPassword = await bcrypt.hashSync(newPassword, salt);
                const updatePassword = await UserModel.findByIdAndUpdate(
                    id,
                    { password: hashPassword },
                    { new: true }
                );
                return {
                    status: 200,
                    message: "Cập nhật mật khẩu thành công",
                    data: updatePassword
                };
            } else if (action === 'authenticate') {
                return {
                    status: 200,
                    message: "Xác thực mật khẩu thành công",
                    data: user
                };
            } else {
                throw new Error("Hành động không hợp lệ");
            }
        } catch (error) {
            return {
                status: 400,
                message: error.message,
                data: null
            };
        }
    }

    async sendMailPassword(email) {
        try {
            const user = await UserModel.findOne({ email: email });
            const sendOtp = otp.generateOTP();
            const saveOtp = await UserModel.findByIdAndUpdate(
                user._id,
                { otp: sendOtp },
                { new: true }
            );
            if (!user) {
                throw new Error("Không tìm thấy người dùng");
            }
            const transporter = mailer.createTransport({
                pool: true,
                host: process.env.MAIL_HOST,
                port: process.env.MAIL_PORT,
                secure: true,
                auth: {
                    user: process.env.MAIL_USER,
                    pass: process.env.MAIL_PASSWORD
                }
            });
            const mailOptions = {
                from: process.env.MAIL_USER,
                to: email,
                subject: 'Reset password OTP',
                html: `<h1>Your OTP is: ${sendOtp}</h1>`
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    throw new Error("Gửi mail thất bại");
                } else {
                    return {
                        status: 200,
                        message: "Gửi mail thành công",
                        data: info.response
                    }
                }
            });
            return {
                status: 200,
                message: "Gửi mail thành công",
                data: saveOtp
            }
        } catch (error) {
            return {
                status: 400,
                message: error.message,
                data: null
            }
        }
    }

    async verifyMailOtp(otp) {
        try {
            const user = await UserModel.findOne({ otp: otp });
            if (!user) {
                throw new Error("Mã OTP không đúng");
            }
            const updateOtp = await UserModel.findByIdAndUpdate(
                user._id,
                { otp: null },
                { new: true }
            );
            return {
                status: 200,
                message: "Xác thực OTP thành công",
                data: updateOtp
            }
        } catch (error) {
            return {
                status: 400,
                message: error.message,
                data: null
            }
        }
    }

    async resetPasswordFromEmail(email, newPassword, confirmPassword) {
        try {
            const user = await UserModel.findOne({ email: email });
            if (!user) {
                throw new Error("Không tìm thấy người dùng");
            }
            if (newPassword !== confirmPassword) {
                throw new Error("Mật khẩu mới không trùng khớp");
            }
            const salt = await bcrypt.genSaltSync(10);
            const hashPassword = await bcrypt.hashSync(newPassword, salt);
            const updatePassword = await UserModel.findByIdAndUpdate(
                user._id,
                { password: hashPassword },
                { new: true }
            );
            return {
                status: 200,
                message: "Cập nhật mật khẩu thành công",
                data: updatePassword
            }
        } catch (error) {
            console.log("🚀 ~ AuthService ~ resetPasswordFromEmail ~ error:", error)
            return {
                status: 400,
                message: error.message,
                data: null
            }
        }
    }

    async uploadAvatar(id, photoUrl) {
        try {
            const user = await UserModel.findById(id);
            const upload = await uploadAvatarAws(photoUrl);
            if (!user) {
                throw new Error("Không tìm thấy người dùng");
            }
            const updateAvatar = await UserModel.findByIdAndUpdate(
                id,
                { photoUrl: upload.Location },
                { new: true }
            );
            return {
                status: 200,
                message: "Cập nhật ảnh đại diện thành công",
                data: updateAvatar
            }
        } catch (error) {
            console.log("🚀 ~ AuthService ~ uploadAvatar ~ error:", error)
            return {
                status: 400,
                message: error.message,
                data: null
            }
        }
    }

    async updateFcmToken(id, fcmToken) {
        try {
            const user = await UserModel.findById(id);
            if (!user) {
                throw new Error("Không tìm thấy người dùng");
            }
            const updateFcmToken = await UserModel.findByIdAndUpdate(
                id,
                { $push: { fcmToken: fcmToken } },
                { new: true }
            );
            return {
                status: 200,
                message: "Cập nhật fcmToken thành công",
                data: updateFcmToken
            }
        } catch (error) {
            return {
                status: 400,
                message: error.message,
                data: null
            }
        }
    }

    async removeFcmToken(id, fcmToken) {
        try {
            const user = await UserModel.findById(id);
            if (!user) {
                throw new Error("Không tìm thấy người dùng");
            }
            const removeFcmToken = await UserModel.findByIdAndUpdate(
                id,
                { $pull: { fcmToken: fcmToken } },
                { new: true }
            );
            return {
                status: 200,
                message: "Xóa fcmToken thành công",
                data: removeFcmToken
            }
        } catch (error) {
            return {
                status: 400,
                message: error.message,
                data: null
            }
        }
    }

    async getAllUser() {
        try {
            // Tìm những user có fcmToken và không có role là admin
            const users = await UserModel.find({ role: "user", fcmToken: { $exists: true, $not: { $size: 0 } } });
            console.log("🚀 ~ AuthService ~ getAllUser ~ users:", users.length)

            if (users.length === 0) { // Kiểm tra xem có user nào thỏa điều kiện không
                throw new Error("Không tìm thấy người dùng");
            }

            return {
                status: 200,
                message: "Tìm người dùng thành công",
                data: users
            }
        } catch (error) {
            return {
                status: 400,
                message: error.message,
                data: null
            }
        }
    }
}

module.exports = new AuthService();
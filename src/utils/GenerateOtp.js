const generateOTP = () => {
    const otp = Math.floor(1000 + Math.random() * 9000); // Sinh số ngẫu nhiên từ 1000 đến 9999
    return otp.toString();
};

module.exports = { generateOTP }
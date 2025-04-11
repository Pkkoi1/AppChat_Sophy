// Tạo một object để lưu trữ các mã OTP tạm thời (giả lập database)
const otpStorage = new Map();

// Hàm tạo mã OTP ngẫu nhiên 6 số
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hàm gửi OTP
export const sendOTP = async (phoneNumber) => {
  try {
    // Kiểm tra số điện thoại hợp lệ
    if (!phoneNumber || phoneNumber.length < 10) {
      throw new Error("Số điện thoại không hợp lệ");
    }

    // Tạo mã OTP mới
    const otp = generateOTP();

    // Lưu OTP vào storage với thời gian hiệu lực 5 phút
    otpStorage.set(phoneNumber, {
      code: otp,
      expiry: Date.now() + 5 * 60 * 1000, // 5 phút
      attempts: 0,
    });

    // Giả lập delay của API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log(`OTP cho ${phoneNumber}: ${otp}`); // For testing purposes

    return {
      success: true,
      message: "Mã OTP đã được gửi thành công",
      phoneNumber,
      expiresIn: 300, // 5 phút tính bằng giây
    };
  } catch (error) {
    console.error("Lỗi khi gửi OTP:", error);
    throw {
      success: false,
      message: error.message || "Không thể gửi mã OTP",
      error: error,
    };
  }
};

// Hàm xác thực OTP
export const verifyOTP = async (phoneNumber, code) => {
  try {
    // Kiểm tra tham số đầu vào
    if (!phoneNumber || !code) {
      throw new Error("Thiếu thông tin xác thực");
    }

    // Lấy thông tin OTP từ storage
    const otpData = otpStorage.get(phoneNumber);

    // Kiểm tra OTP tồn tại
    if (!otpData) {
      throw new Error("Mã OTP không tồn tại hoặc đã hết hạn");
    }

    // Kiểm tra số lần thử
    if (otpData.attempts >= 3) {
      otpStorage.delete(phoneNumber);
      throw new Error("Đã vượt quá số lần thử. Vui lòng yêu cầu mã OTP mới");
    }

    // Kiểm tra thời gian hiệu lực
    if (Date.now() > otpData.expiry) {
      otpStorage.delete(phoneNumber);
      throw new Error("Mã OTP đã hết hạn");
    }

    // Tăng số lần thử
    otpData.attempts++;

    // Kiểm tra mã OTP
    if (otpData.code !== code) {
      throw new Error("Mã OTP không chính xác");
    }

    // Xóa OTP đã sử dụng
    otpStorage.delete(phoneNumber);

    // Giả lập delay của API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      success: true,
      message: "Xác thực OTP thành công",
      phoneNumber,
    };
  } catch (error) {
    console.error("Lỗi khi xác thực OTP:", error);
    throw {
      success: false,
      message: error.message || "Không thể xác thực mã OTP",
      error: error,
    };
  }
};

// Hàm kiểm tra trạng thái OTP
export const checkOTPStatus = (phoneNumber) => {
  const otpData = otpStorage.get(phoneNumber);
  if (!otpData) {
    return {
      exists: false,
      message: "Không có mã OTP nào đang hoạt động",
    };
  }

  const timeLeft = Math.max(
    0,
    Math.floor((otpData.expiry - Date.now()) / 1000)
  );
  return {
    exists: true,
    timeLeft,
    attempts: otpData.attempts,
    message: `Mã OTP còn hiệu lực trong ${timeLeft} giây`,
  };
};

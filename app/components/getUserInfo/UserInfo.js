import { api } from "@/app/api/api";

// Hàm tiện ích để lấy thông tin người dùng
export const fetchUserInfo = async (id) => {
  if (!id) {
    // console.error("fetchUserInfo: ID không hợp lệ:", id);
    return null; // Trả về null nếu ID không hợp lệ
  }

  try {
    const response = await api.getUserById(id);
    if (response && response.data) {
      return response.data; // Trả về dữ liệu người dùng
    } else {
      console.error("No user found in the response.");
      return null; // Trả về null nếu không tìm thấy người dùng
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    return null; // Trả về null nếu có lỗi
  }
};

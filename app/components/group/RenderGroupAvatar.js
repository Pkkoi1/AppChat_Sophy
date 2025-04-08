import React, { useEffect, useState } from "react";
import { View, Image, Text } from "react-native";
import AvatarUser from "@/app/components/profile/AvatarUser"; // Import AvatarUser
import { fetchUserInfo } from "../getUserInfo/UserInfo";

const RenderGroupAvatar = ({ members }) => {
  const avatarSize = 27; // Kích thước ảnh nhỏ
  const borderWidth = 2; // Viền trắng
  const containerSize = 50; // Kích thước thẻ chứa

  // Vị trí cho các trường hợp khác nhau
  const positions = {
    4: [
      { left: 0, top: 0 }, // Góc trên bên trái
      { right: 0, top: 0 }, // Góc trên bên phải
      { left: 0, bottom: 0 }, // Góc dưới bên trái
      { right: 0, bottom: 0 }, // Góc dưới bên phải
    ],
    3: [
      { left: containerSize / 4, top: 0 }, // Ở trên giữa
      { left: 0, bottom: 0 }, // Góc dưới bên trái
      { right: 0, bottom: 0 }, // Góc dưới bên phải
    ],
    2: [
      { left: 0, top: containerSize / 4 }, // Ở giữa bên trái
      { right: 0, top: containerSize / 4 }, // Ở giữa bên phải
    ],
    1: [
      { left: containerSize / 4, top: containerSize / 4 }, // Ở giữa
    ],
  };

  const [memberDetails, setMemberDetails] = useState([]);

  // Hàm lấy thông tin user từ API
  const fetchMemberDetails = async () => {
    try {
      const details = await Promise.all(
        members.map(async (memberId) => {
          try {
            const userInfo = await fetchUserInfo(memberId);
            return {
              id: memberId,
              fullname: userInfo?.fullname || "User", // Fallback nếu không có fullname
              urlavatar: userInfo?.urlavatar || null, // Fallback nếu không có urlavatar
            };
          } catch (error) {
            console.error(
              "Error fetching user info for member:",
              memberId,
              error
            );
            return {
              id: memberId,
              fullname: "User",
              urlavatar: null,
            };
          }
        })
      );
      setMemberDetails(details);
    } catch (error) {
      console.error("Error fetching member details:", error);
      setMemberDetails([]); // Fallback to empty array
    }
  };

  useEffect(() => {
    if (members) {
      fetchMemberDetails();
    }
  }, [members]);

  const displayedAvatars = memberDetails.slice(0, 4).map((member, index) => {
    const position = positions[memberDetails.length]?.[index] || {
      left: containerSize / 4,
      top: containerSize / 4,
    }; // Lấy vị trí theo số lượng thành viên
    return member?.urlavatar ? (
      <Image
        key={index}
        source={{ uri: member.urlavatar }}
        style={{
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
          position: "absolute",
          ...position,
          borderWidth: borderWidth,
          borderColor: "#fff",
        }}
      />
    ) : (
      <AvatarUser
        key={index}
        fullName={member?.fullname || "User"}
        width={avatarSize}
        height={avatarSize}
        avtText={10}
        shadow={false}
        bordered={true}
        borderWidth={borderWidth}
        style={{
          position: "absolute",
          ...position,
        }}
      />
    );
  });

  return (
    <View
      style={{
        width: containerSize,
        height: containerSize,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
      }}
    >
      {displayedAvatars}
    </View>
  );
};

export default RenderGroupAvatar;

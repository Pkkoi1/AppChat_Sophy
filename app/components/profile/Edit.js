import OptionHeader from "@/app/features/optionHeader/OptionHeader";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { CheckBox } from "@rneui/themed";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import Color from "../colors/Color";
import AvatarUser from "./AvatarUser";
import { api } from "@/app/api/api";

const Edit = ({ route, navigation }) => {
  const { userInfo, isReady = true } = route.params || {};
  const [fullname, setFullname] = useState(userInfo?.fullname || "");
  const [birthday, setBirthday] = useState(
    new Date(userInfo?.birthday || "2000-01-01")
  );
  const [selectedIndex, setIndex] = useState(userInfo?.isMale ? 0 : 1);
  const [showDatePicker, setShowDatePicker] = useState(false);

  if (!isReady) {
    return <Text>Loading...</Text>;
  }

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setBirthday(selectedDate);
  };

  const handleSave = async () => {
    const params = {
      //   fullname,
      birthday: birthday.toISOString().split("T")[0],
      isMale: selectedIndex === 0,
    };

    try {
      const updatedUser = await api.updateUser(userInfo.userId, params);
      Alert.alert("Thành công", "Thông tin người dùng đã được cập nhật.");
      navigation.goBack(); // Quay lại màn hình trước
    } catch (error) {
      Alert.alert("Lỗi", "Cập nhật thông tin thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <View style={styles.container}>
      <OptionHeader title={"Chỉnh sửa thông tin"} />
      <View style={styles.content}>
        {/* Cột 1: Avatar */}
        <View style={styles.columnAvatar}>
          <View style={styles.avatar}>
            {userInfo?.urlavatar ? (
              <Image
                source={{ uri: userInfo.urlavatar }}
                style={styles.avatarImage}
              />
            ) : (
              <AvatarUser
                fullName={userInfo?.fullname || "Người dùng"}
                width={80}
                height={80}
                avtText={24}
                shadow={false}
                bordered={false}
              />
            )}
          </View>
          <TouchableOpacity style={styles.changeAvatarButton}>
            <Text style={styles.changeAvatarText}>
              <Feather name="camera" size={24} color="black" />
            </Text>
          </TouchableOpacity>
        </View>

        {/* Cột 2: Thông tin chỉnh sửa */}
        <View style={styles.columnInfo}>
          {/* Nhập tên */}
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              value={fullname}
              onChangeText={setFullname}
              placeholder="Nhập tên"
            />
            <MaterialCommunityIcons
              name="pencil-outline"
              size={24}
              color="black"
              style={styles.icon}
            />
          </View>

          {/* Nhập ngày sinh */}
          <View style={styles.inputGroup}>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {birthday.toLocaleDateString("vi-VN")}
              </Text>
            </TouchableOpacity>
            <MaterialCommunityIcons
              name="calendar-outline"
              size={24}
              color="black"
              style={styles.icon}
            />
            {showDatePicker && (
              <DateTimePicker
                value={birthday}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}
          </View>

          {/* Chọn giới tính */}
          <View style={styles.radioGroupContainer}>
            <View style={styles.radioGroup}>
              <CheckBox
                title="Nam"
                checked={selectedIndex === 0}
                onPress={() => setIndex(0)}
                checkedIcon="dot-circle-o"
                uncheckedIcon="circle-o"
                containerStyle={styles.radioButton}
              />
              <CheckBox
                title="Nữ"
                checked={selectedIndex === 1}
                onPress={() => setIndex(1)}
                checkedIcon="dot-circle-o"
                uncheckedIcon="circle-o"
                containerStyle={styles.radioButton}
              />
            </View>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.editButton} onPress={handleSave}>
        <Text style={styles.editButtonText}>Lưu</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  content: {
    flexDirection: "row",
    padding: 20,
    marginTop: 20,
  },
  columnAvatar: {
    flex: 1,
    maxWidth: "20%",
    alignItems: "center",
    justifyContent: "flex-start",
    marginLeft: 20,
  },
  columnInfo: {
    flex: 4,
    paddingLeft: 20,
    marginLeft: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#000",
  },
  changeAvatarButton: {
    marginTop: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: "#ddd",
    borderRadius: 5,
  },
  changeAvatarText: {
    color: "#000",
    fontSize: 14,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 15,
    paddingBottom: 5,
  },
  radioGroupContainer: {
    marginBottom: 15,
  },
  icon: {
    marginLeft: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  dateInput: {
    flex: 1,
    justifyContent: "center",
  },
  dateText: {
    fontSize: 16,
    color: "#000",
  },
  radioGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  radioButton: {
    backgroundColor: "transparent",
    borderWidth: 0,
    padding: 0,
  },
  editButton: {
    marginTop: 20,
    backgroundColor: Color.sophy,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginHorizontal: 20,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Edit;

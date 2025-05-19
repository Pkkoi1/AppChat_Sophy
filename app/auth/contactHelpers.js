import * as Contacts from "expo-contacts";
import { Alert, Linking } from "react-native";
import { api } from "@/app/api/api";

/**
 * Lấy danh bạ điện thoại và tìm user trong DB.
 * @param {Function} setPhoneContacts - Hàm setState phoneContacts.
 * @param {Function} setUsersInDB - Hàm setState usersInDB.
 * @param {Function} setContactsLoading - Hàm setState loading.
 * @param {Function} setContactsError - Hàm setState error.
 */
export const getPhoneContacts = async (
  setPhoneContacts,
  setUsersInDB,
  setContactsLoading,
  setContactsError
) => {
  setContactsLoading(true);
  setContactsError(null);
  try {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === "granted") {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
      });

      if (data.length > 0) {
        const formattedContacts = data
          .filter(
            (contact) =>
              contact.name &&
              contact.phoneNumbers &&
              contact.phoneNumbers.length > 0
          )
          .map((contact) => {
            const phoneNumber = contact.phoneNumbers[0].number.replace(
              /[\s\-()]/g,
              ""
            );
            return {
              _id: contact.id,
              fullname: contact.name,
              phone: phoneNumber,
              isPhoneContact: true,
            };
          });

        const phoneNumbers = formattedContacts.map((c) => c.phone);

        try {
          const users = await api.searchUsersByPhones(phoneNumbers);
          setUsersInDB(users || []);
        } catch (err) {
          setUsersInDB([]);
        }

        setPhoneContacts(formattedContacts);
      } else {
        setPhoneContacts([]);
        setUsersInDB([]);
      }
    } else {
      Alert.alert(
        "Cần quyền truy cập danh bạ",
        "Ứng dụng cần quyền truy cập danh bạ để hiển thị danh sách liên hệ của bạn",
        [
          { text: "Đóng", style: "cancel" },
          { text: "Cài đặt", onPress: () => Linking.openSettings() },
        ]
      );
    }
  } catch (err) {
    setContactsError("Không thể truy cập danh bạ điện thoại: " + err.message);
  } finally {
    setContactsLoading(false);
  }
};

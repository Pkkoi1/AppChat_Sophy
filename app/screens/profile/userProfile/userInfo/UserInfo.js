import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  StatusBar,
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../../api/api';

const UserInfo = ({ route, navigation }) => {
  const { user, isFriend = false, requestStatus } = route.params || { user: { fullname: 'Anh 2' } };
  const isActuallyFriend = isFriend || requestStatus === "friend";
  
  // State cho các switch
  const [isFavorite, setIsFavorite] = useState(false);
  const [receiveNotifications, setReceiveNotifications] = useState(true);
  const [blockMyStory, setBlockMyStory] = useState(false);
  const [hideTheirStory, setHideTheirStory] = useState(false);

  // Hàm xử lý xóa bạn
  const handleUnfriend = () => {
    Alert.alert(
      "Xác nhận",
      `Bạn có chắc chắn muốn xóa ${user.fullname} khỏi danh sách bạn bè?`,
      [
        {
          text: "Hủy",
          style: "cancel"
        },
        {
          text: "Xóa bạn",
          style: "destructive",
          onPress: async () => {
            try {
              await api.unfriend(user.userId);
              Alert.alert("Thành công", "Đã xóa bạn bè thành công");
              navigation.navigate("UserProfile", {
                friend: user,
                requestSent: "",
              });
            } catch (error) {
              Alert.alert("Lỗi", "Không thể xóa bạn bè. Vui lòng thử lại sau.");
              console.error("Lỗi khi xóa bạn bè:", error);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header với gradient */}
      <LinearGradient
        colors={['#1a92ff', '#00c6ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{user.fullname}</Text>
      </LinearGradient>

      {/* Phần Thông tin */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Đổi tên gọi nhớ</Text>
        </TouchableOpacity>
        
        <View style={styles.menuItem}>
          <Text style={styles.menuText}>Đánh dấu bạn thân</Text>
          <Switch
            value={isFavorite}
            onValueChange={setIsFavorite}
            trackColor={{ false: '#e0e0e0', true: '#b3e0ff' }}
            thumbColor={isFavorite ? '#007aff' : '#f4f3f4'}
          />
        </View>
        
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Giới thiệu cho bạn bè</Text>
        </TouchableOpacity>
      </View>

      {/* Phần Thông báo */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông báo</Text>
        
        <View style={styles.menuItem}>
          <Text style={styles.menuText}>Nhận thông báo về hoạt động mới của người này</Text>
          <Switch
            value={receiveNotifications}
            onValueChange={setReceiveNotifications}
            trackColor={{ false: '#e0e0e0', true: '#b3e0ff' }}
            thumbColor={receiveNotifications ? '#007aff' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Phần Cài đặt riêng tư */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cài đặt riêng tư</Text>
        
        <View style={styles.menuItem}>
          <Text style={styles.menuText}>Chặn xem nhật ký của tôi</Text>
          <Switch
            value={blockMyStory}
            onValueChange={setBlockMyStory}
            trackColor={{ false: '#e0e0e0', true: '#b3e0ff' }}
            thumbColor={blockMyStory ? '#007aff' : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.menuItem}>
          <Text style={styles.menuText}>Ẩn nhật ký của người này</Text>
          <Switch
            value={hideTheirStory}
            onValueChange={setHideTheirStory}
            trackColor={{ false: '#e0e0e0', true: '#b3e0ff' }}
            thumbColor={hideTheirStory ? '#007aff' : '#f4f3f4'}
          />
        </View>
        
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Báo xấu</Text>
        </TouchableOpacity>
      </View>

      {/* Chỉ hiển thị nút Xóa bạn khi người này là bạn bè */}
      {isActuallyFriend && (
        <TouchableOpacity style={styles.deleteButton} onPress={handleUnfriend}>
          <Text style={styles.deleteText}>Xóa bạn</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  section: {
    marginTop: 10,
    backgroundColor: 'white',
    borderBottomWidth: 0.5,
    borderTopWidth: 0.5,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4a4a4a',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: '#e0e0e0',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 0.5,
    borderColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  menuText: {
    fontSize: 16,
    flex: 1,
  },
  deleteButton: {
    marginTop: 20,
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    borderBottomWidth: 0.5,
    borderTopWidth: 0.5,
    borderColor: '#e0e0e0',
  },
  deleteText: {
    fontSize: 16,
    color: '#ff3b30',
  },
});

export default UserInfo;
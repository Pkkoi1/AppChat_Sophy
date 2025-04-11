// src/screens/ZaloFAQScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const latestPosts = [
  'zStyle – Tùy chỉnh tài khoản, nổi bật trên Zalo',
  'Hỗ trợ chuyển khoản ngân hàng ngay từ tin nhắn Zalo',
  'Lưu kỷ niệm từ Facebook vào Zalo',
  'Xử lý cảnh báo link lừa đảo trên Zalo',
  'Trò chuyện cộng đồng: Thêm kết nối, thêm quyền riêng tư',
];

const mostInterested = [
  'Gửi file nhanh với tính năng Gửi thư mục trên Zalo PC',
  'Khắc phục lỗi không nhận được thông báo Zalo',
  'Sao lưu, khôi phục tin nhắn văn bản trên Zalo',
  'Cách giải phóng dung lượng điện thoại để sử dụng Zalo',
  'Làm gì khi không thể nâng cấp nhóm lên cộng đồng?',
];

const featureSections = [
  { icon: 'information-circle', title: 'Mới bắt đầu', desc: 'Dành cho người mới bắt đầu dùng Zalo' },
  { icon: 'chatbubble', title: 'Nhắn tin và gọi', desc: 'Hướng dẫn nhắn tin, gọi thoại hoặc gọi video' },
  { icon: 'people', title: 'Trò chuyện nhóm', desc: 'Khám phá tiện ích nhóm trò chuyện Zalo' },
  { icon: 'lock-closed', title: 'Bảo mật và riêng tư', desc: 'Quản lý cài đặt về bảo mật và riêng tư' },
  { icon: 'person-circle', title: 'Quản lý tài khoản', desc: 'Hướng dẫn chung về thông tin, tài khoản, dung lượng…' },
  { icon: 'book', title: 'Nhật ký', desc: 'Hướng dẫn sử dụng nhật ký và khoảnh khắc' },
  { icon: 'people-circle', title: 'Bạn bè và danh bạ', desc: 'Hướng dẫn quản lý danh sách bạn bè' },
  { icon: 'laptop', title: 'Zalo cho công việc', desc: 'Khám phá tiện ích học tập và làm việc từ xa' },
];

const ZaloFAQScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#007AFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()}>
          <Icon name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Câu hỏi thường gặp</Text>
        {/* khoảng trống để căn giữa tiêu đề */}
        <View style={{ width: 22 }} />
      </View>

      {/* Search zone (gradient effect đơn giản bằng màu nền) */}
      <View style={styles.searchZone}>
        <View style={styles.searchBar}>
          <Icon name="search" size={18} color="#999" style={{ marginRight: 6 }} />
          <TextInput
            placeholder="Tìm kiếm"
            placeholderTextColor="#999"
            style={{ flex: 1, fontSize: 14, paddingVertical: 0 }}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Notice */}
        <Text style={styles.notice}>
          Zalo chỉ có 1 trang{' '}
          <Text style={styles.link}>https://chat.zalo.me</Text> dành cho chat trên web.
        </Text>

        {/* Bài mới nhất */}
        <Section title="Bài mới nhất" data={latestPosts} />

        {/* Quan tâm nhất */}
        <Section title="Quan tâm nhất" data={mostInterested} />

        {/* Feature sections */}
        {featureSections.map((f, i) => (
          <View key={i} style={styles.featureItem}>
            <Icon name={f.icon} size={22} color="#007AFF" style={{ marginTop: 2 }} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}

        {/* Zalo Điện thoại / PC */}
        <PromoBlock
          title="Zalo điện thoại"
          desc="Các bài viết hỗ trợ dành cho Zalo trên các thiết bị Android, iOS"
        />
        <PromoBlock
          title="Zalo PC"
          desc="Các bài viết hỗ trợ dành cho Zalo trên máy tính"
        />

        {/* Footer */}
        <Text style={styles.footer}>© Zalo Help 2025</Text>
      </ScrollView>
    </View>
  );
};

/* ------------ Helper components ------------ */
const Section = ({ title, data }) => (
  <View style={{ marginBottom: 20 }}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {data.map((txt, idx) => (
      <TouchableOpacity key={idx} activeOpacity={0.6}>
        <Text style={styles.bulletItem}>• {txt}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

const PromoBlock = ({ title, desc }) => (
  <View style={styles.promoBlock}>
    <Text style={styles.promoTitle}>{title}</Text>
    <Text style={styles.promoDesc}>{desc}</Text>
    <TouchableOpacity activeOpacity={0.7}>
      <Text style={styles.link}>Xem tất cả bài viết</Text>
    </TouchableOpacity>
  </View>
);

/* ------------ Styles ------------ */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },

  searchZone: { backgroundColor: '#007AFF', paddingHorizontal: 16, paddingBottom: 20 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingHorizontal: 8,
    height: 36,
  },

  content: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 },

  notice: { fontSize: 14, marginBottom: 20 },
  link: { color: '#007AFF', textDecorationLine: 'underline' },

  sectionTitle: { fontWeight: '600', marginBottom: 8, fontSize: 15 },
  bulletItem: { color: '#007AFF', marginBottom: 6, fontSize: 14 },

  featureItem: { flexDirection: 'row', marginBottom: 18 },
  featureTitle: { fontWeight: '600', fontSize: 15 },
  featureDesc: { fontSize: 13, color: '#555', marginTop: 2 },

  promoBlock: { alignItems: 'center', marginTop: 30 },
  promoTitle: { fontWeight: '600', fontSize: 16, marginBottom: 4 },
  promoDesc: { fontSize: 13, color: '#555', textAlign: 'center', marginBottom: 6, paddingHorizontal: 10 },

  footer: { textAlign: 'center', fontSize: 12, color: '#666', marginTop: 40 },
});

export default ZaloFAQScreen;

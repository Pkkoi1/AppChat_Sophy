import React from "react";
import { FlatList, View } from "react-native";
import Inbox from "./Inbox";

const messages = [
  { id: "1", name: "Nguyễn Văn A", message: "Xin chào!", date: "10:30 AM" },
  { id: "2", name: "Trần Thị B", message: "Bạn khỏe không?", date: "9:15 AM" },
  {
    id: "3",
    name: "Lê Văn C",
    message: "Hôm nay đi chơi nhé!",
    date: "8:00 AM",
  },
  {
    id: "4",
    name: "Phạm Thị D",
    message: "Bạn có rảnh không?",
    date: "7:45 AM",
  },
  {
    id: "5",
    name: "Hoàng Văn E",
    message: "Nhớ mang theo tài liệu nhé!",
    date: "6:30 AM",
  },
  {
    id: "6",
    name: "Trịnh Thị F",
    message: "Đang làm gì đó?",
    date: "11:45 PM",
  },
  {
    id: "7",
    name: "Đặng Văn G",
    message: "Có hẹn vào chiều mai nhé!",
    date: "10:20 PM",
  },
  {
    id: "8",
    name: "Vũ Thị H",
    message: "Tối nay có đá bóng không?",
    date: "9:10 PM",
  },
  { id: "9", name: "Bùi Văn I", message: "Chúc ngủ ngon!", date: "8:55 PM" },
  {
    id: "10",
    name: "Ngô Thị J",
    message: "Gặp nhau lúc 5 giờ nhé!",
    date: "7:40 PM",
  },
  {
    id: "11",
    name: "Lâm Văn K",
    message: "Bạn có xem trận bóng hôm qua không?",
    date: "6:20 PM",
  },
  {
    id: "12",
    name: "Trần Văn L",
    message: "Có tin vui muốn báo cho bạn!",
    date: "5:30 PM",
  },
  {
    id: "13",
    name: "Nguyễn Văn M",
    message: "Mới mua điện thoại mới nè!",
    date: "4:15 PM",
  },
  {
    id: "14",
    name: "Hà Thị N",
    message: "Tôi đang trên đường đến!",
    date: "3:45 PM",
  },
  {
    id: "15",
    name: "Phạm Văn O",
    message: "Còn nhớ tôi chứ?",
    date: "2:30 PM",
  },
  {
    id: "16",
    name: "Lê Thị P",
    message: "Lâu rồi không gặp bạn!",
    date: "1:10 PM",
  },
  {
    id: "17",
    name: "Nguyễn Thị Q",
    message: "Bạn đang ở đâu?",
    date: "12:55 PM",
  },
  {
    id: "18",
    name: "Trần Văn R",
    message: "Cuối tuần có kế hoạch gì chưa?",
    date: "11:25 AM",
  },
  {
    id: "19",
    name: "Đỗ Văn S",
    message: "Trời hôm nay đẹp quá!",
    date: "10:05 AM",
  },
  {
    id: "20",
    name: "Lý Thị T",
    message: "Đi du lịch không bạn?",
    date: "9:50 AM",
  },
  {
    id: "21",
    name: "Dương Văn U",
    message: "Nhớ giữ gìn sức khỏe nhé!",
    date: "8:40 AM",
  },
  {
    id: "22",
    name: "Lã Văn V",
    message: "Chúc một ngày tốt lành!",
    date: "7:30 AM",
  },
  {
    id: "23",
    name: "Phan Thị W",
    message: "Cà phê không bạn ơi?",
    date: "6:20 AM",
  },
  {
    id: "24",
    name: "Nguyễn Văn X",
    message: "Sáng nay tôi có việc bận!",
    date: "5:15 AM",
  },
];

const ListInbox = () => {
  return (
    <View style={{ flex: 1, width: "100%" }}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Inbox name={item.name} message={item.message} date={item.date} />
        )}
      />
    </View>
  );
};

export default ListInbox;

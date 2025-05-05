import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import moment from "moment";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing"; // Import Sharing for non-media files
import { Icon } from "@rneui/themed"; // Import Icon from @rneui/themed

const handleDownload = async (fileUrl, fileName, downloadUrl) => {
  try {
    const path = FileSystem.cacheDirectory + fileName;
    const res = FileSystem.createDownloadResumable(
      downloadUrl || fileUrl,
      path
    );
    const { uri } = await res.downloadAsync();

    if (!uri) throw new Error("Không thể tải file");

    const extension = fileName.split(".").pop()?.toLowerCase();

    // Nếu là media thì dùng MediaLibrary
    if (["jpg", "jpeg", "png", "mp4", "mp3"].includes(extension)) {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        return Alert.alert("Từ chối truy cập", "Không thể lưu file media.");
      }

      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync("Download", asset, false);

      Alert.alert("Thành công", "File media đã lưu vào thư viện.");
    } else {
      // Nếu không phải media: PDF, Word, Excel, ZIP,...
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert("Đã tải", `File đã lưu vào: ${uri}`);
      }
    }
  } catch (err) {
    console.error("Download error:", err);
    Alert.alert("Lỗi", "Tải file thất bại.");
  }
};

const FileTab = ({ conversation }) => {
  const files = conversation?.listFile || [];

  // Filter out invalid files and exclude images, videos, and GIFs
  const validFiles = files.filter((file) => {
    const fileName = file.name || "";
    const fileType = fileName.split(".").pop()?.toLowerCase();
    const isMedia = ["jpg", "jpeg", "png", "gif", "mp4", "mov", "avi", "mkv"].includes(fileType);
    return (file.name || file.downloadUrl) && !isMedia;
  });

  if (validFiles.length === 0) {
    return <Text style={styles.noDataText}>Không có tệp nào</Text>;
  }

  // Group files by date
  const groupedFiles = validFiles.reduce((groups, file) => {
    const date = moment(file.createdAt).format("YYYY-MM-DD");
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(file);
    return groups;
  }, {});

  const groupedData = Object.entries(groupedFiles).map(([date, files]) => ({
    date,
    files,
  }));

  const renderFileIcon = (file) => {
    const fileName = file.name || "";
    const fileType = fileName.split(".").pop()?.toLowerCase();

    if (fileType === "pdf")
      return (
        <Icon name="file-pdf" type="font-awesome-5" size={24} color="#d9534f" />
      );
    if (fileType === "doc" || fileType === "docx")
      return (
        <Icon
          name="file-word"
          type="font-awesome-5"
          size={24}
          color="#007bff"
        />
      );
    if (fileType === "xls" || fileType === "xlsx")
      return (
        <Icon
          name="file-excel"
          type="font-awesome-5"
          size={24}
          color="#28a745"
        />
      );
    if (fileType === "zip" || fileType === "rar")
      return (
        <Icon
          name="file-archive"
          type="font-awesome-5"
          size={24}
          color="#f0ad4e"
        />
      );
    return (
      <Icon
        name="insert-drive-file"
        type="material"
        size={24}
        color="#6c757d"
      />
    );
  };

  return (
    <FlatList
      data={groupedData}
      keyExtractor={(item) => item.date}
      renderItem={({ item }) => (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>
            {moment(item.date).format("DD/MM/YYYY")}
          </Text>
          <FlatList
            data={item.files.reverse()}
            keyExtractor={(file, index) => index.toString()}
            renderItem={({ item: file }) => (
              <View style={styles.fileContainer}>
                <View style={styles.fileInfo}>
                  <View style={styles.icon}>{renderFileIcon(file)}</View>
                  <Text
                    style={styles.fileName}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {file.name || "Tệp không có tên"}
                  </Text>
                </View>
                {file.downloadUrl ? (
                  <TouchableOpacity
                    onPress={() =>
                      handleDownload(
                        file.downloadUrl,
                        file.name || "file",
                        file.downloadUrl
                      )
                    }
                    style={styles.downloadButton}
                  >
                    <Text style={styles.downloadButtonText}>Tải xuống</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.invalidFileText}>Không khả dụng</Text>
                )}
              </View>
            )}
          />
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  noDataText: {
    fontSize: 16,
    color: "#888c90",
    textAlign: "center",
    marginTop: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
  },
  fileContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  fileName: {
    fontSize: 14,
    color: "#000",
    flex: 1,
  },
  downloadButton: {
    backgroundColor: "#007bff",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  downloadButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  invalidFileText: {
    color: "#888c90",
    fontSize: 14,
  },
  icon: {
    marginRight: 10,
  },
});

export default FileTab;

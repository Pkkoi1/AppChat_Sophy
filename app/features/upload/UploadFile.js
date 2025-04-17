const uploadOptions = {
  folder: `conversations/${conversationId}/${type}s`,
  resource_type: "auto",
  flags: "attachment",
};

if (type === "video") {
  uploadOptions.eager = [{ format: "mp4", quality: "auto" }];
  uploadOptions.chunk_size = 6000000;
}

const uploadResponse = await cloudinary.uploader.upload(
  fileBase64,
  uploadOptions
);

const attachment = {
  url: uploadResponse.secure_url,
  downloadUrl: uploadResponse.secure_url.replace(
    "/upload/",
    "/upload/fl_attachment/"
  ),
  type: fileType,
  name: fileName,
  size: uploadResponse.bytes,
};

if (type === "video") {
  attachment.duration = uploadResponse.duration;
  attachment.thumbnail = uploadResponse.thumbnail_url;
}

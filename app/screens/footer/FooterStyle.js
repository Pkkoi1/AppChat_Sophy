const FooterStyle = {
  footer: {
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 50,
    borderTopWidth: 1,
    borderTopColor: "#ddd",

    // Đổ bóng lên trên cho iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 }, // Đẩy bóng lên trên
    shadowOpacity: 0.1,
    shadowRadius: 4,

    // Đổ bóng lên trên cho Android
    elevation: 8,
  },
  iconContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center",
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 12,
    color: "#1b96fd",
    marginTop: 2,
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -10,
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 5,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#fff",
    borderWidth: 2,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
};

export default FooterStyle;

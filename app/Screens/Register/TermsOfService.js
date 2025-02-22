import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

const TermsOfService = (navigation) => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Điều khoản sử dụng dịch vụ Zalo</Text>

      {/* Section 1: Giới thiệu */}
      <Text style={styles.sectionTitle}>1. Giới thiệu</Text>
      <Text style={styles.content}>
        1.1. Thỏa Thuận Sử Dụng Dịch Vụ Zalo (“Thỏa Thuận”) này bao gồm các điều
        khoản, điều kiện, thông báo xử lý dữ liệu cá nhân và các quy định về sử
        dụng các dịch vụ và sản phẩm trong/thuộc hệ sinh thái Zalo (“Nền tảng”),
        được sở hữu và/hoặc vận hành và/hoặc quản lý bởi Công ty Cổ phần VNG
        (“Dịch vụ”).
      </Text>
      <Text style={styles.content}>
        1.2. Để sử dụng bất kỳ Dịch vụ thuộc hệ sinh thái Zalo, Người dùng cần
        đồng ý với toàn bộ các điều khoản và điều kiện của Thỏa Thuận này;
        trường hợp Người dùng không đồng ý với bất kỳ điều khoản nào của Thỏa
        Thuận này thì Người dùng cần ngay lập tức chấm dứt việc sử dụng các Dịch
        vụ.
      </Text>
      <Text style={styles.content}>
        1.3. Việc bấm xác nhận Đồng ý với Thoả thuận sử dụng dịch vụ Zalo được
        hiểu là Người dùng đồng ý đã đọc, đã hiểu, đã được giải thích và cam kết
        tuân thủ toàn bộ nguyên tắc được quy định, quy chế liên kết, tích hợp
        (nếu có, sau đây gọi chung là “Quy chế, chính sách”) trong Thỏa thuận
        này.
      </Text>
      <Text style={styles.content}>
        1.4. Trong phạm vi pháp luật cho phép, trường hợp Người dùng không đồng
        ý với một phần hoặc toàn bộ Thoả thuận này, Chúng tôi có quyền hạn chế,
        ngừng, huỷ bỏ việc cung cấp sản phẩm, dịch vụ cho Người dùng do không có
        đầy đủ các thông tin, dữ liệu để thực hiện cung cấp các sản phẩm, dịch
        vụ cho Người dùng.
      </Text>
      <Text style={styles.content}>
        1.5. VNG bảo lưu quyền được sửa đổi, bổ sung bất kỳ và toàn bộ nội dung
        của Thỏa Thuận này tại bất kỳ thời điểm nào mà không cần báo trước hay
        cần có được sự đồng ý trước của Người dùng.
      </Text>

      {/* Section 2: Định nghĩa */}
      <Text style={styles.sectionTitle}>2. Định nghĩa</Text>
      <Text style={styles.content}>
        VNG; Chúng tôi: Công ty Cổ Phần VNG, là một bên trong Thỏa thuận này.
      </Text>
      <Text style={styles.content}>
        Người dùng/ Bạn/ Chủ thể dữ liệu: Đề cập đến bất kỳ cá nhân hoặc thực
        thể nào sử dụng Dịch vụ, là cá nhân được dữ liệu cá nhân phản ánh, là
        bên còn lại chịu sự ràng buộc của Thỏa thuận này và những quy trình, quy
        chế, chính sách cộng đồng, chính sách liên kết khác (nếu có).
      </Text>
      <Text style={styles.content}>
        Nền tảng: Tất cả các sản phẩm thuộc hệ sinh thái Zalo bao gồm nhưng
        không giới hạn phần mềm Zalo và các sản phẩm yêu cầu sử dụng Tài khoản,
        được cung cấp bởi Công ty Cổ phần VNG.
      </Text>
      <Text style={styles.content}>
        Tài khoản: Là dữ liệu cần thiết để đăng nhập vào Nền tảng.
      </Text>
      <Text style={styles.content}>
        Thiết bị: Là các phần cứng vật lý được dùng để truy cập vào Tài khoản
        cho mục đích sử dụng Dịch vụ.
      </Text>
      <Text style={styles.content}>
        Nội dung người dùng: Là nội dung dưới dạng văn bản, hình ảnh, âm thanh
        và các dạng thể hiện khác do Người dùng tải lên Nền tảng phù hợp với
        Thỏa thuận này.
      </Text>

      {/* Section 3: Tài Khoản */}
      <Text style={styles.sectionTitle}>3. Tài Khoản</Text>
      <Text style={styles.content}>
        3.1. Để sử dụng Dịch vụ, Người dùng cần phải đăng ký Tài khoản. Chúng
        tôi giới hạn số lượng Tài khoản mà Người dùng có thể đăng ký được, cũng
        như số lượng thiết bị tương thích mà Tài khoản có thể liên kết trong
        cùng một thời điểm.
      </Text>
      <Text style={styles.content}>
        3.2. Người dùng hiểu rõ và đồng ý rằng, để nâng cao hiệu quả sử dụng tài
        nguyên hệ thống, trường hợp Người dùng không đăng nhập, sử dụng Tài
        khoản trong vòng 45 ngày kể từ lần đăng nhập cuối cùng, VNG có quyền
        (nhưng không có nghĩa vụ) xóa toàn bộ tài khoản của Người dùng cùng với
        toàn bộ Dữ Liệu của Người dùng.
      </Text>
      <Text style={styles.content}>
        3.3. Người dùng sẽ chịu mọi trách nhiệm, kể cả trách nhiệm pháp lý và
        trước Pháp luật về mọi hoạt động, hành vi được thực hiện thông qua tài
        khoản trong quá trình sử dụng dịch vụ.
      </Text>

      {/* Section 4: Hành vi vi phạm */}
      <Text style={styles.sectionTitle}>4. Hành vi vi phạm</Text>
      <Text style={styles.content}>
        4.1. Sao chép, chỉnh sửa, tái tạo, tạo ra sản phẩm mới hoặc phiên bản
        phát sinh trên cơ sở Nền tảng này.
      </Text>
      <Text style={styles.content}>
        4.2. Bán, chuyển giao, cấp quyền lại, tiết lộ hoặc hình thức chuyển giao
        khác hoặc đưa một phần hoặc toàn bộ dữ liệu cấu thành Nền tảng cho bất
        kỳ Bên thứ ba ngoại trừ những phần dữ liệu mà Người dùng là chủ sở hữu
        hợp pháp.
      </Text>
      <Text style={styles.content}>
        4.3. Di chuyển, xóa bỏ, thay đổi bất kỳ thông báo chính đáng hoặc dấu
        hiệu nào của Nền tảng (bao gồm nhưng không giới hạn các tuyên bố về bản
        quyền).
      </Text>
      <Text style={styles.content}>
        4.4. Thiết kế lại, biên dịch, tháo gỡ, chỉnh sửa, đảo lộn thiết kế của
        Nền tảng hoặc nội dung Nền tảng.
      </Text>
      <Text style={styles.content}>
        4.5. Thay đổi hoặc hủy bỏ trạng thái ban đầu của Nền tảng.
      </Text>
      <Text style={styles.content}>
        4.6. Lợi dụng Nền tảng để thực hiện bất kỳ hành động gây hại cho an toàn
        thông tin, an ninh mạng của VNG, bao gồm nhưng không giới hạn sử dụng dữ
        liệu hoặc truy cập vào máy chủ hệ thống hoặc tài khoản không được phép;
        truy cập vào hệ thống mạng để xóa bỏ, chỉnh sửa và thêm các thông tin;
        phát tán các chương trình độc hại, virus hoặc thực hiện bất kỳ hành động
        nào khác nhằm gây hại hoặc phá hủy hệ thống mạng.
      </Text>
      <Text style={styles.content}>
        4.7. Đăng nhập và sử dụng Dịch vụ bằng một phần mềm tương thích của Bên
        thứ ba hoặc hệ thống không được phát triển, cấp quyền hoặc chấp thuận
        bởi VNG.
      </Text>
      <Text style={styles.content}>
        4.8. Sử dụng, bán, cho mượn, sao chép, chỉnh sửa, kết nối tới, phiên
        dịch, phát hành, công bố các thông tin liên quan đến Nền tảng, xây dựng
        website sao chép/ website giả mạo để công bố các thông tin này hoặc để
        phát triển các sản phẩm phái sinh, công việc hoặc dịch vụ.
      </Text>
      <Text style={styles.content}>
        4.9. Lợi dụng Nền tảng để đăng tải, chuyển, truyền hoặc lưu trữ các
        thông tin vi phạm Pháp luật, vi phạm thuần phong mỹ tục của dân tộc;
        phân biệt và gây chia rẽ chủng tộc; xúc phạm, làm tổn hại quyền lợi hợp
        pháp của các cá nhân hoặc tổ chức.
      </Text>
      <Text style={styles.content}>
        4.10. Lợi dụng Nền tảng để sử dụng, đăng tải, chuyển, truyền hoặc lưu
        trữ bất kỳ nội dung vi phạm quyền sở hữu trí tuệ, bí mật kinh doanh hoặc
        quyền pháp lý của Bên thứ ba;
      </Text>
      <Text style={styles.content}>
        4.11. Lợi dụng Nền tảng hoặc các dịch vụ khác được cung cấp bởi VNG
        trong bất kỳ hình thức vi phạm Pháp luật nào, cho bất kỳ mục đích bất
        hợp pháp nào và/hoặc quấy rối, tác động tiêu cực tới trải nghiệm của
        Người dùng khác.
      </Text>
      <Text style={styles.content}>
        4.12. Lợi dụng các sản phẩm được tạo ra từ trí tuệ nhân tạo AI do Công
        ty triển khai để chỉnh sửa, thay đổi cho các mục đích vi phạm các quy
        định Pháp luật, hoặc trái với đạo đức, thuần phong mỹ tục.
      </Text>
      <Text style={styles.content}>
        4.13. Vi phạm Chính sách cộng đồng và các hình thức, hành vi vi phạm
        pháp luật khác.
      </Text>

      <Text style={styles.sectionTitle}>
        5. Thu thập, Sử dụng và Bảo vệ thông tin Người dùng
      </Text>
      <Text style={styles.content}>
        Bằng việc sử dụng Tài khoản để đăng nhập và sử dụng Dịch vụ, Người dùng
        đồng ý và chấp thuận rằng chúng tôi có quyền áp dụng những biện pháp kỹ
        thuật cho mục đích thu thập và xử lý các dữ liệu liên quan đến Tài khoản
        của Người dùng (Sau đây gọi là “Thông tin tài khoản”).
      </Text>

      <Text style={styles.content}>
        Chúng tôi thực hiện thu thập và xử lý thông tin cá nhân cơ bản và dữ
        liệu cá nhân nhạy cảm của Người dùng, cụ thể như sau:
      </Text>

      <Text style={styles.subSectionTitle}>
        5.1. Dữ liệu cá nhân cơ bản do Người dùng cung cấp, bao gồm:
      </Text>
      <Text style={styles.content}>
        i. Thông tin dữ liệu cá nhân do Người dùng cung cấp nhằm định danh của
        Người dùng khi khởi tạo Tài khoản cũng như trong suốt quá trình Người
        dùng sử dụng Dịch vụ bao gồm: Số điện thoại, Họ và tên, tuổi, giới tính,
        mối quan hệ gia đình, thông tin CMND/CCCD/Hộ chiếu, hình ảnh cá nhân,
        thư điện tử.
      </Text>
      <Text style={styles.content}>
        ii. Nội dung Người dùng khởi tạo công khai hoặc chủ động cung cấp cho
        Chúng tôi trong quá trình sử dụng Dịch vụ bao gồm nhưng không giới hạn:
        Các miêu tả công khai; ảnh đại diện, ảnh bìa; tên liên hệ tùy chỉnh;
        thông tin khảo sát Người dùng điền thông qua Nền tảng.
      </Text>
      <Text style={styles.content}>
        iii. Trường hợp Người dùng là đại diện của Pháp nhân, tổ chức, doanh
        nghiệp: Tên của Pháp nhân, tổ chức, doanh nghiệp; Mã số doanh nghiệp, mã
        số thuế; Địa chỉ trụ sở đăng ký; Địa chỉ liên hệ; Người đại diện theo
        Pháp luật và thông tin của người đại diện theo Pháp luật như Người dùng
        cá nhân tại 5.1 (i); Chức vụ; Địa chỉ thư điện tử (email) quản trị; Tên
        của người quản trị tài khoản; Số điện thoại của người quản trị tài
        khoản.
      </Text>

      <Text style={styles.subSectionTitle}>
        5.2. Dữ liệu cá nhân cơ bản do chúng tôi chủ động thu thập, bao gồm:
      </Text>
      <Text style={styles.content}>
        i. Thông tin Ứng dụng, Thiết bị và Mạng: thông tin liên quan đến hệ điều
        hành, Thiết bị như là phiên bản, ngôn ngữ mặc định, chất lượng tín hiệu
        từ Thiết bị, thông tin cookie, địa chỉ IP, mức năng lượng, dữ liệu tương
        tác với ứng dụng, trạng thái kết nối, dữ liệu về sự cố, hiệu suất, hệ
        điều hành, trình duyệt, thông tin mạng và các loại dữ liệu tương tự.
      </Text>
      <Text style={styles.content}>
        ii. Hoạt động của Tài khoản khi sử dụng Nền tảng: Thời điểm, tần suất
        Tài khoản hoạt động trên Nền tảng, nội dung quảng cáo, các hoạt động mà
        Người dùng thực hiện thông qua Tài khoản, báo cáo sự cố.
      </Text>
      <Text style={styles.content}>
        iii. Danh bạ điện thoại: Dưới sự chấp thuận của Người dùng về việc cấp
        quyền cho Nền tảng truy cập danh bạ điện thoại.
      </Text>
      <Text style={styles.content}>
        iv. Thông tin khi Người dùng cập nhật thông tin liên lạc/ thông tin cá
        nhân qua Phiếu yêu cầu tại trụ sở công ty VNG.
      </Text>

      <Text style={styles.subSectionTitle}>
        5.3. Dữ liệu cá nhân nhạy cảm do Người dùng cung cấp, bao gồm:
      </Text>
      <Text style={styles.content}>
        i. Thông tin vị trí: Dưới sự chấp thuận của Người dùng thông qua hệ điều
        hành về việc chủ động cấp quyền cho Nền tảng truy cập dữ liệu GPS.
      </Text>
      <Text style={styles.content}>
        ii. Thông tin liên quan tới thanh toán: Các thông tin liên quan đến
        thanh toán mà người dùng chủ động cung cấp nhằm thực hiện các tính năng
        hỗ trợ trên Nền tảng.
      </Text>

      <Text style={styles.subSectionTitle}>
        5.4. Mục đích thu thập và sử dụng dữ liệu:
      </Text>
      <Text style={styles.content}>
        i. Để cung cấp dịch vụ: Chúng tôi sử dụng Thông tin tài khoản để khởi
        tạo Tài khoản, định danh Người dùng, phục vụ các chức năng Người dùng
        mong muốn sử dụng trên Nền tảng.
      </Text>
      <Text style={styles.content}>
        ii. Để đề xuất các nội dung cá nhân hoá: Chúng tôi sử dụng Thông tin tài
        khoản để điều chỉnh và cung cấp các nội dung cá nhân hoá, phù hợp với
        nhu cầu và mối quan tâm của Người dùng.
      </Text>
      <Text style={styles.content}>
        iii. Để nghiên cứu phát triển các tính năng, dịch vụ: Chúng tôi sử dụng
        Thông tin tài khoản để tìm hiểu xu hướng, xây dựng thống kê, đánh giá
        rủi ro, tìm hiểu nhu cầu sử dụng Dịch vụ của Người dùng.
      </Text>
      <Text style={styles.content}>
        iv. Đảm bảo tính ổn định và an toàn của dịch vụ: Chúng tôi sử dụng Thông
        tin tài khoản để phục vụ mục đích bảo mật, đảm bảo Người dùng và những
        người dùng khác được bảo vệ khỏi các rủi ro mất an toàn thông tin khi sử
        dụng nền tảng cũng như bảo vệ nền tảng khỏi bị lợi dụng cho các mục đích
        không được cho phép bởi Thoả thuận này.
      </Text>
      <Text style={styles.content}>
        v. Để liên lạc với Người dùng: Chúng tôi liên lạc, phàn hồi các yêu cầu
        từ Người dùng bằng các Thông tin tài khoản Người dùng đã cung cấp, bao
        gồm thông tin liên hệ của Người dùng.
      </Text>
      <Text style={styles.content}>
        vi. Cho mục đích quảng cáo, tiếp thị các sản phẩm, dịch vụ của VNG và
        công ty con, công ty liên kết với VNG và/ hoặc quảng cáo sản phẩm, dịch
        vụ của Bên thứ ba.
      </Text>
      <Text style={styles.content}>
        vii. Hỗ trợ thực hiện các yêu cầu của Người dùng đối với các dịch vụ
        ngoài Nền tảng.
      </Text>
      <Text style={styles.content}>
        viii. Để đáp ứng các thủ tục pháp lý, tuân thủ các quy định của Pháp
        luật hiện hành và theo các yêu cầu của cơ quan nhà nước có thẩm quyền.
      </Text>
      <Text style={styles.content}>
        ix. Để phòng chống lừa đảo, ngăn ngừa các hoạt động xâm nhập, đánh cắp
        tài khoản Người dùng hoặc các hoạt động giả mạo Người dùng.
      </Text>
      <Text style={styles.content}>
        x. Để ngăn chặn hành vi trái Pháp luật.
      </Text>
      <Text style={styles.content}>
        xi. Để phục vụ các mục đích khác có liên quan đến hoạt động kinh doanh
        của Nền tảng mà VNG cho là phù hợp tại từng thời điểm
      </Text>
      <Text style={styles.subSectionTitle}>
        5.5. Kinh doanh dịch vụ tiếp thị, quảng cáo, giới thiệu sản phẩm
      </Text>
      <Text style={styles.content}>
        i. Nội dung: Chúng tôi sẽ giới thiệu thông tin các sản phẩm, dịch vụ do
        Nền tảng và đối tác cung cấp, phù hợp theo quy định của pháp luật và các
        chính sách nội bộ của Chúng tôi.
      </Text>
      <Text style={styles.content}>
        ii. Phương thức: Chúng tôi sẽ gửi các thông tin quảng cáo đến Bạn thông
        qua các kênh khác nhau như:
      </Text>
      <Text style={styles.content}>
        a. Phương tiện truyền thông điện tử: hiển thị biểu ngữ quảng cáo hoặc
        vùng nội dung quảng cáo trên Nền tảng.
      </Text>
      <Text style={styles.content}>
        b. Tiếp thị trực tiếp: tương tác trực tiếp qua các ứng dụng Nền tảng.
      </Text>
      <Text style={styles.content}>
        c. Hoặc các phương thức khác theo quy định của pháp luật.
      </Text>
      <Text style={styles.content}>
        iii. Hình thức: Các thông tin quảng cáo sẽ được hiển thị trên các vùng
        quảng cáo được đặt trên Nền tảng.
      </Text>

      {/* Section 5.6: Tần suất quảng cáo */}
      <Text style={styles.subSectionTitle}>5.6. Tần suất quảng cáo</Text>
      <Text style={styles.content}>
        Tần suất quảng cáo: phù hợp theo quy định pháp luật về quảng cáo.
      </Text>

      {/* Section 5.7: Bảo vệ dữ liệu cá nhân Người dùng dưới 16 tuổi */}
      <Text style={styles.subSectionTitle}>
        5.7. Bảo vệ dữ liệu cá nhân Người dùng dưới 16 tuổi
      </Text>
      <Text style={styles.content}>
        i. Trong quá trình cung cấp sản phẩm, dịch vụ, Nền tảng sẽ có khách hàng
        là cá nhân trong độ tuổi từ đủ 14 (mười bốn) tuổi đến dưới 16 (mười sáu)
        tuổi (gọi là “trẻ em”). Nền tảng sẽ tiến hành các quy trình cần thiết để
        xác minh độ tuổi của Người dùng là trẻ em hoặc Cha/mẹ/người giám hộ
        trước khi thu thập và xử lý dữ liệu cá nhân theo quy định của pháp luật.
      </Text>
      <Text style={styles.content}>
        ii. Trong trường hợp Người dùng là trẻ em đăng ký sử dụng dịch vụ Zalo.
        Cha, mẹ hoặc người giám hộ hợp pháp đồng ý rằng mình có trách nhiệm theo
        dõi, giám sát mọi hoạt động và đảm bảo rằng các hành động xác minh, cấp
        quyền trên tài khoản của trẻ em sẽ luôn được thực hiện bởi Cha/me/người
        giám hộ hợp pháp.
      </Text>
      <Text style={styles.subSectionTitle}>5.8. Chia sẻ dữ liệu</Text>
      <Text style={styles.content}>
        i. Chúng tôi chia sẻ thông tin Người dùng với các Công ty thuộc VNG bao
        gồm công ty con, công ty thành viên, công ty liên kết của VNG vì một hay
        nhiều mục đích thu thập nói trên.
      </Text>
      <Text style={styles.content}>
        ii. Chúng tôi sẽ chia sẻ Thông tin tài khoản của Người dùng khi có sự
        cho phép hoặc yêu cầu của Người dùng cho các Bên thứ ba. Đây cũng là đơn
        vị mà Người dùng mong muốn được tiếp cận và/ hoặc đã cho phép Bên thứ ba
        tiếp cận dữ liệu của mình để xúc tiến các bước cần thiết nhằm triển khai
        việc cung cấp hàng hóa/dịch vụ hoặc lợi ích khác cho Người dùng.
      </Text>
      <Text style={styles.content}>
        iii. Zalo xây dựng tính năng hỗ trợ và đăng nhập tài khoản cho các sản
        phẩm dịch vụ Bên thứ ba có nhu cầu. Khi có sự đồng ý của Người dùng,
        trước khi đăng nhập dịch vụ Bên thứ ba, chúng tôi chia sẻ một số thông
        tin tài khoản của Bạn (đã được Bạn cho phép cho Bên thứ ba) để hỗ trợ
        cho việc đăng ký tài khoản của Bạn được thuận tiện hoặc phục vụ các dịch
        vụ của Bên thứ ba mà bạn yêu cầu. Ngoài ra, Bạn đồng ý rằng, nếu tài
        khoản Zalo bị khóa, xóa, hủy hoặc tạm ngừng thì Bạn cũng sẽ không thể
        đăng nhập được vào sản phẩm dịch vụ Bên thứ ba này.
      </Text>
      <Text style={styles.content}>
        iv. Chia sẻ dữ liệu trong các trường hợp khác theo quy định của Pháp
        luật.
      </Text>
      <Text style={styles.content}>
        v. Trong trường hợp cần chia sẻ thông tin của Người dùng theo các điều
        tại 5.8. (i) (ii) (iii) (iv) (v), chúng tôi yêu cầu các Bên tuân thủ các
        hướng dẫn, quy định và yêu cầu nhằm bảo vệ các thông tin được chia sẻ
        theo quy định của Pháp luật.
      </Text>

      <Text style={styles.subSectionTitle}>
        5.9. Thời gian lưu trữ Thông tin tài khoản
      </Text>
      <Text style={styles.content}>
        Thông tin tài khoản của Người dùng sẽ được lưu trữ trong một khoảng thời
        gian cần thiết để đáp ứng việc cung cấp Dịch vụ theo Thỏa thuận này hoặc
        theo quy định của Pháp luật.
      </Text>

      <Text style={styles.subSectionTitle}>
        5.10. Cập nhật, sửa đổi, xóa Thông tin tài khoản
      </Text>
      <Text style={styles.content}>
        i. Bằng cách đăng nhập vào Tài khoản của mình, Người dùng có thể truy
        cập tính năng sửa đổi, xóa tài khoản, rút lại sự đồng ý thông tin tài
        khoản đã cung cấp bằng các thao tác giao diện Người dùng của Nền tảng
        hoặc gửi văn bản đến trụ sở Công ty Cổ phần VNG để yêu cầu thực hiện
        thay đổi.
      </Text>
      <Text style={styles.content}>
        ii. Trường hợp Người dùng không đồng ý việc tiếp tục để VNG thu thập và
        sử dụng Thông tin tài khoản của Người dùng, ngoài việc Người dùng có thể
        chủ động vô hiệu hóa quyền truy cập trên Nền tảng hoặc trực tiếp đến trụ
        sở Công ty Cổ phần VNG để thực hiện các yêu cầu liên quan.
      </Text>
      <Text style={styles.content}>
        iii. Mọi thông tin liên quan đến quyền của Chủ thể dữ liệu sẽ được điền
        vào phiếu yêu cầu tại trụ sở Công ty Cổ phần VNG theo địa chỉ được đề
        cập tại Mục 10 của Thỏa thuận dịch vụ này và có bộ phận chuyên trách
        hướng dẫn Người dùng hoàn thành yêu cầu. Vui lòng lưu ý rằng, chúng tôi
        sẽ xác thực danh tính của Người dùng nhằm mục đích bảo vệ quyền lợi
        Người dùng trước khi tiến hành xử lý.
      </Text>
      <Text style={styles.content}>
        iv. Chúng tôi chỉ có thể thực hiện yêu cầu của Bạn đối với các Thông tin
        tài khoản chúng tôi có thu thập và Bạn đã đồng ý cho việc xử lý tại Điều
        5 Thỏa thuận này.
      </Text>
      <Text style={styles.sectionTitle}>
        6. Các trường hợp xử lý dữ liệu cá nhân không cần sự đồng ý của Người
        dùng
      </Text>
      <Text style={styles.content}>
        6.1. Trong trường hợp khẩn cấp, cần xử lý ngay dữ liệu cá nhân có liên
        quan đến bảo vệ tính mạng, sức khoẻ của Người dùng hoặc người khác.
      </Text>
      <Text style={styles.content}>
        6.2. Việc chia sẻ dữ liệu cá nhân theo quy định của luật.
      </Text>
      <Text style={styles.content}>
        6.3. Việc xử lý dữ liệu của cơ quan nhà nước có thẩm quyền trong trường
        hợp tình trạng khẩn cấp về quốc phòng, an ninh quốc gia, trật tự toàn xã
        hội, thảm hoạ lớn, dịch bệnh nguy hiểm; khi có nguy cơ đe dọa an ninh,
        quốc phòng nhưng chưa đến mức ban bố tình trạng khẩn cấp; phòng, chống
        bạo loạn, khủng bố, phòng, chống tội phạm và vi phạm Pháp luật theo quy
        định của luật.
      </Text>
      <Text style={styles.content}>
        6.4. Để thực hiện nghĩa vụ theo hợp đồng của Chủ thể dữ liệu với cơ
        quan, tổ chức, cá nhân có liên quan theo quy định của luật.
      </Text>
      <Text style={styles.content}>
        6.5. Phục vụ hoạt động của cơ quan nhà nước đã được quy định theo luật
        chuyên ngành.
      </Text>

      <Text style={styles.sectionTitle}>7. Bảo Mật Thông Tin</Text>
      <Text style={styles.content}>
        7.1. VNG không ngừng nỗ lực bảo vệ Người dùng trước các nguy cơ về an
        toàn thông tin. Về mặt kỹ thuật, Nền tảng liên tục duy trì tích hợp các
        tính năng bảo mật mạnh mẽ và chuyên sâu nhằm bảo vệ Thông tin tài khoản
        của Người dùng được lưu trữ và xử lý một cách an toàn. Chúng tôi cung
        cấp một số công cụ mà Người dùng có thể lựa chọn và sử dụng thông qua
        giao diện người dùng để kiểm soát Thông tin tài khoản, ví dụ tính năng
        Quyền riêng tư cho phép kiểm soát Người dùng khác xem và bình luận Nội
        dung Người dùng; tính năng cảnh báo nguy cơ bảo mật khi truy cập các
        đường dẫn đến các website mà hệ thống kỹ thuật của VNG phát hiện.
      </Text>
      <Text style={styles.content}>
        7.2. Tuy nhiên, Người dùng đồng ý rằng mức độ bảo mật còn phụ thuộc vào
        Thiết bị Người dùng đang sử dụng, kết nối internet hoặc kết nối nội bộ
        của Người dùng và các yếu tố khác thuộc về trách nhiệm của Bên thứ ba.
        Người dùng hiểu rõ và chấp nhận rủi ro về bảo mật (nếu có) khi sử dụng
        Dịch vụ.
      </Text>
      <Text style={styles.content}>
        7.3. VNG cam kết bảo vệ quyền riêng tư và bảo mật thông tin của Người
        dùng.
      </Text>
      <Text style={styles.sectionTitle}>8. Quyền của Chủ thể dữ liệu</Text>
      <Text style={styles.content}>
        8.1. Quyền rút lại sự đồng ý, hạn chế và phản đối xử lý dữ liệu cá nhân,
        xoá dữ liệu cá nhân:
      </Text>
      <Text style={styles.content}>
        i. Sau khi xác nhận đồng ý đối với Thoả thuận này, trong quá trình sử
        dụng Nền tảng, Người dùng có quyền rút lại sự đồng ý, yêu cầu hạn chế,
        phản đối xử lý dữ liệu cá nhân và/ hoặc xoá dữ liệu cá nhân. Nền tảng sẽ
        thực hiện các thủ tục cần thiết nhằm chấm dứt, hạn chế xử lý dữ liệu cá
        nhân theo thời hạn, phạm vi và các nội dung khác mà Người dùng yêu cầu
        sau khi đã thực hiện đúng và đầy đủ các thủ tục để khởi tạo một yêu cầu
        hợp lệ.
      </Text>
      <Text style={styles.content}>
        ii. Yêu cầu được xem như là hợp lệ khi thực hiện theo trình thực, thủ
        tục và đáp ứng đúng và đầy đủ tất cả các điều kiện được quy định như
        sau:
      </Text>
      <Text style={styles.content}>
        Được thực hiện bởi chính Người dùng mà không phải thông qua đại diện hay
        uỷ quyền dưới bất kỳ hình thức nào, trừ các trường hợp Pháp luật quy
        định phải thực hiện thông qua đại diện hay uỷ quyền.
      </Text>
      <Text style={styles.content}>
        Người dùng hiểu rõ và đồng ý cam kết sẽ chịu trách nhiệm về mọi hậu quả,
        thiệt hại có thể xảy ra do hành động rút lại sự đồng ý, thực hiện yêu
        cầu hạn chế, phản đối xử lý dữ liệu cá nhân và/ hoặc xoá dữ liệu cá nhân
        gây ra (nếu có).
      </Text>
      <Text style={styles.content}>
        Hoàn tất thanh toán đầy đủ và đúng hạn các loại phí, chi phí (nếu có
        theo quy định của pháp luật) liên quan đến việc thực hiện yêu cầu rút
        lại sự đồng ý, yêu cầu hạn chế, phản đối xử lý dữ liệu cá nhân, xoá dữ
        liệu cá nhân theo biểu phí tại trụ sở Công ty Cổ phần VNG.
      </Text>
      <Text style={styles.content}>
        iii. Công ty cổ phần VNG có quyền từ chối thực hiện toàn bộ yêu cầu của
        Người dùng nếu yêu cầu không đáp ứng điều kiện hợp lệ theo quy định tại
        8.1 (ii).
      </Text>
      <Text style={styles.content}>
        iv. Trường hợp yêu cầu đáp ứng điều kiện theo quy định, Nền tảng sẽ thực
        hiện các thủ tục cần thiết nhằm chấm dứt, hạn chế xử lý dữ liệu cá nhân
        và/ hoặc xoá dữ liệu cá nhân theo thời hạn, phạm vi và các nội dung khác
        mà Người dùng yêu cầu trong 72 (bảy mươi hai) giờ kể từ thời điểm Người
        dùng gửi yêu cầu hợp lệ.
      </Text>
      <Text style={styles.content}>
        v. Việc rút lại sự đồng ý, yêu cầu hạn chế, phản đối xử lý dữ liệu cá
        nhân và/ hoặc xoá dữ liệu cá nhân không làm ảnh hưởng tới tính hợp pháp
        của việc xử lý dữ liệu cá nhân mà Nền tảng và/ hoặc Bên thứ ba đã thực
        hiện trước thời điểm Nền tảng và/ hoặc Bên thứ ba hoàn tất việc chấm
        dứt, hạn chế xử lý dữ liệu cá nhân và/ hoặc xoá dữ liệu cá nhân.
      </Text>

      <Text style={styles.subSectionTitle}>
        8.2. Quyền cung cấp dữ liệu cá nhân:
      </Text>
      <Text style={styles.content}>
        i. Người dùng được yêu cầu Nền tảng thực hiện việc cung cấp dữ liệu cá
        nhân sau khi Người dùng thực hiện đúng và đầy đủ các thủ tục để khởi tạo
        một yêu cầu hợp lệ theo các quy định về tiếp nhận và xử lý yêu cầu của
        Nền tảng.
      </Text>
      <Text style={styles.content}>
        ii. Nền tảng thực hiện cung cấp dữ liệu cá nhân trong 72 (bảy mươi hai)
        giờ sau khi nhận được yêu cầu hợp lệ.
      </Text>

      <Text style={styles.subSectionTitle}>
        8.3. Quyền chỉnh sửa dữ liệu cá nhân:
      </Text>
      <Text style={styles.content}>
        i. Nền tảng cung cấp cho Người dùng khả năng tự truy cập để xem, chỉnh
        sửa dữ liệu hồ sơ cá nhân của mình một cách tự do.
      </Text>
      <Text style={styles.content}>
        ii. Trường hợp không thể tự chỉnh sửa trực tiếp vì lý do kỹ thuật hoặc
        vì lý do khác, Người dùng có thể yêu cầu Nền tảng chỉnh sửa dữ liệu cá
        nhân của mình bằng Phiếu yêu cầu tại trụ sở Công ty Cổ phần VNG.
      </Text>
      <Text style={styles.content}>
        iii. Nền tảng thực hiện chỉnh sửa dữ liệu cá nhân sau khi xác minh Người
        dùng và được Người dùng đồng ý ngay khi có thể hoặc theo quy định của
        Pháp luật. Trường hợp không thể thực hiện thì Nền tảng sẽ thông báo tới
        Người dùng trong 72 (bảy mươi hai) giờ kể từ khi nhận được yêu cầu chỉnh
        sửa dữ liệu cá nhân.
      </Text>

      <Text style={styles.sectionTitle}>9. Sở Hữu Trí Tuệ</Text>
      <Text style={styles.content}>
        Nền tảng được phát triển và sở hữu bởi VNG, trừ Nội dung Người dùng tải
        lên Nền tảng, tất cả các quyền sở hữu trí tuệ liên quan đến Nền tảng bao
        gồm nhưng không giới hạn mã nguồn, hình ảnh, dữ liệu, thông tin, nội
        dung chứa đựng trong Nền tảng; các sửa đổi, bổ sung, cập nhật của Nền
        tảng và các tài liệu hướng dẫn liên quan (nếu có) sẽ thuộc quyền sở hữu
        duy nhất bởi VNG và không cá nhân, tổ chức nào được phép sao chép, tái
        tạo, phân phối, hoặc hình thức khác xâm phạm tới quyền của chủ sở hữu
        nếu không có sự đồng ý và cho phép bằng văn bản của VNG.
      </Text>

      <Text style={styles.sectionTitle}>10. Sử dụng dịch vụ tính phí</Text>
      <Text style={styles.content}>
        Dịch vụ được cung cấp trên Nền tảng về cơ bản là các dịch vụ miễn phí.
        Ngoài ra, Chúng tôi sẽ triển khai không thu phí hoặc thu phí đối với
        Người dùng một số Dịch vụ. Các mức phí tương ứng với từng gói sử dụng
        Dịch vụ (nếu có) sẽ được VNG công bố đến Người dùng để Người dùng, lựa
        chọn gói sử dụng dịch vụ phù hợp. Trong trường hợp Người dùng lựa chọn
        các Dịch vụ thu phí (nếu có), phí dịch vụ sẽ được thu theo quy định của
        Apple Store hoặc Play Store.
      </Text>

      <Text style={styles.sectionTitle}>11. Lưu Ý Sử Dụng</Text>
      <Text style={styles.content}>
        11.1. Trong quá trình sử dụng Dịch vụ, Người dùng phải hết sức cẩn thận
        khi quyết định tiếp cận, trao đổi thông tin với các Tài khoản khác được
        gắn nhãn “Người lạ”. Nếu Người dùng phát hiện Người lạ có dấu hiệu lừa
        đảo hoặc phạm tội, xin hãy báo cáo lại cho chúng tôi qua email
        feedback@zalo.me, tính năng báo xấu được tích hợp sẵn trên Nền tảng hoặc
        cơ quan có thẩm quyền.
      </Text>
      <Text style={styles.content}>
        11.2. Chúng tôi chỉ cung cấp dịch vụ sử dụng nền tảng cho Người dùng từ
        đủ 14 tuổi trở lên.
      </Text>
      <Text style={styles.content}>
        11.3. Người dùng vui lòng thường xuyên trở lại trang này để cập nhật các
        Điều khoản, nhằm đảm bảo quyền lợi và trách nhiệm của Bạn trong quá
        trình sử dụng dịch vụ.
      </Text>

      <Text style={styles.sectionTitle}>
        12. Thông Tin Liên Hệ Xử Lý Dữ Liệu Cá Nhân Và Báo Cáo Vi Phạm
      </Text>
      <Text style={styles.content}>
        12.1. Nếu Người dùng tin rằng bất kỳ Nội dung nào được phát hành công
        khai thông qua Nền tảng có dấu hiệu vi phạm quyền của Người dùng, quyền
        của bất cứ Bên thứ ba nào hoặc vi phạm quy định Pháp luật, vui lòng
        thông báo cho chúng tôi. Một thông báo được xem là hợp lệ nếu có đầy đủ
        các thông tin sau:
      </Text>
      <Text style={styles.content}>Tiêu đề: Báo cáo Vi Phạm</Text>
      <Text style={styles.content}>
        Thông tin bên khiếu nại (họ tên, email, số điện thoại liên hệ…)
      </Text>
      <Text style={styles.content}>
        Thông tin vi phạm (văn bản, ảnh chụp, link, video…)
      </Text>
      <Text style={styles.content}>
        12.2. VNG sẽ xem xét và xử lý từng thông báo vi phạm mà chúng tôi nhận
        được và chúng tôi sẽ thực hiện các bước hợp lý để thông báo lại kết quả
        sau khi xử lý vi phạm cho bên khiếu nại.
      </Text>
      <Text style={styles.content}>
        12.3. Mọi Thông báo vi phạm đề nghị phải được gửi tới địa chỉ email,
        hoặc liên hệ trực tiếp:
      </Text>
      <Text style={styles.content}>
        Người nhận: Bộ phận Bảo Vệ Dữ Liệu Cá Nhân Zalo – Công ty Cổ phần VNG
      </Text>
      <Text style={styles.content}>
        Địa chỉ: Z06 đường số 13, Phường Tân Thuận Đông, Quận 7, TP. Hồ Chí
        Minh.
      </Text>
      <Text style={styles.content}>E-mail: feedback@zalo.me</Text>

      <Text style={styles.sectionTitle}>13. Xử Lý Vi Phạm</Text>
      <Text style={styles.content}>
        13.1. Chúng tôi sẽ sử dụng song song hai hệ thống kiểm duyệt vi phạm và
        kiểm tra tính xác thực của nội dung công khai bằng: (i) Đội ngũ kiểm
        duyệt viên; (ii) Kiểm duyệt tự động bằng máy học và trí tuệ nhân tạo.
      </Text>
      <Text style={styles.content}>
        13.2. Trường hợp Người dùng vi phạm bất kỳ quy định nào trong Thỏa Thuận
        này, VNG có quyền ngay lập tức khóa Tài khoản của Người dùng hoặc yêu
        cầu xác thực danh tính và/hoặc xóa bỏ toàn bộ các thông tin, nội dung vi
        phạm, đồng thời tùy thuộc vào tính chất, mức độ vi phạm, Người dùng sẽ
        phải chịu trách nhiệm trước cơ quan có thẩm quyền, VNG và Bên thứ ba về
        mọi thiệt hại gây ra bởi hoặc xuất phát từ hành vi vi phạm của Người
        dùng.
      </Text>

      <Text style={styles.sectionTitle}>
        14. Từ chối trách nhiệm đảm bảo
      </Text>
      <Text style={styles.content}>
        14.1. Mặc dù chúng tôi nỗ lực tối đa để duy trì tính ổn định của Dịch
        vụ, tuy nhiên những nỗ lực đó có thể sẽ không đáp ứng được mọi kỳ vọng
        của Người dùng. Trừ khi được rõ ràng trong Thỏa thuận này, dù rõ ràng
        hay ngụ ý, VNG không đưa ra bất cứ đảm bảo nào bao gồm nhưng không giới
        hạn những bảo đảm về tính ổn định của Dịch vụ, bảo mật an toàn thông
        tin, tính xác thực của thông tin mà Người dùng tiếp nhận trong quá trình
        sử dụng Dịch vụ.
      </Text>

      <Text style={styles.sectionTitle}>15. Luật áp dụng</Text>
      <Text style={styles.content}>
        Tất cả các vấn đề, nội dung và bất kỳ bất đồng, tranh chấp nào phát sinh
        từ hoặc liên quan đến việc thực hiện Thỏa Thuận này đều được giải thích
        và điều chỉnh theo quy định của Pháp luật nước Cộng Hoà Xã Hội Chủ Nghĩa
        Việt Nam. VNG và Người dùng tại đây thừa nhận luật áp dụng để giải quyết
        tranh chấp, bất đồng nếu có giữa các bên liên quan đến Nền tảng, Dịch vụ
        chỉ là Pháp luật của Việt Nam và không dẫn chiếu đến luật của bất kỳ
        quốc gia nào khác trong mọi trường hợp.
      </Text>

      <Text style={styles.sectionTitle}>16. Hiệu lực của thỏa thuận</Text>
      <Text style={styles.content}>
        16.1 Khi cần thiết, Chúng tôi có thể sửa đổi, cập nhật hoặc điều chỉnh
        các nội dung trong Thoả thuận này tại bất cứ thời điểm nào, và phiên bản
        mới nhất của Thoả thuận sẽ được đăng tải trên Nền tảng chính thức của
        chúng tôi. Bạn đồng ý rằng sẽ chủ động định kỳ kiểm tra tại mục Điều
        khoản sử dụng trên Nền tảng để luôn được tiếp cận phiên bản được cập
        nhật gần nhất.
      </Text>
      <Text style={styles.content}>
        16.2 Trong trường hợp một hoặc một số điều khoản Thỏa Thuận cung cấp và
        sử dụng dịch vụ Zalo này xung đột với các quy định của luật pháp Việt
        Nam, điều khoản đó sẽ được chỉnh sửa cho phù hợp với quy định pháp luật
        hiện hành, phần còn lại của Thỏa Thuận vẫn giữ nguyên giá trị.
      </Text>
      <Text style={styles.content}>
        Trân trọng cảm ơn Người dùng đã sử dụng sản phẩm và Dịch vụ của VNG.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
  },
});

export default TermsOfService;
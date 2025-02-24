import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

const SocialNetworkTerms = (navigation) => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        THỎA THUẬN CUNG CẤP VÀ SỬ DỤNG DỊCH VỤ MẠNG XÃ HỘI ZALO
      </Text>

      <Text style={styles.sectionTitle}>Điều 1: Giải thích từ ngữ</Text>
      <Text style={styles.content}>
        1.1. Mạng xã hội Zalo: chức năng mạng xã hội của ứng dụng Zalo để các cá
        nhân, tổ chức chia sẻ thông tin (khoa học, công nghệ, kinh tế, văn hóa,
        thể thao, giải trí, quảng cáo, an sinh xã hội) phù hợp quy định pháp
        luật, các chức năng khác của ứng dụng Zalo không thuộc phạm vi mạng xã
        hội này.
      </Text>
      <Text style={styles.content}>
        1.2. Thoả Thuận Sử Dụng Dịch Vụ Mạng Xã Hội Zalo (“Thoả thuận”): là thỏa
        thuận bao gồm các điều khoản, điều kiện, thông báo xử lý dữ liệu cá nhân
        và các quy định liên quan tới cung cấp và sử dụng dịch vụ mạng xã hội
        Zalo cùng với tất cả các bản sửa đổi, bổ sung, cập nhật.
      </Text>
      <Text style={styles.content}>
        1.3. VNGO/ Chúng tôi/ Công ty: là Công Ty TNHH VNG Online.
      </Text>
      <Text style={styles.content}>
        1.4. Dữ liệu cá nhân là thông tin dưới dạng ký hiệu, chữ viết, chữ số,
        hình ảnh, âm thanh hoặc dạng tương tự trên môi trường điện tử gắn liền
        với một con người cụ thể hoặc giúp xác định một con người cụ thể. Dữ
        liệu cá nhân bao gồm dữ liệu cá nhân cơ bản và dữ liệu cá nhân nhạy cảm.
      </Text>
      <Text style={styles.content}>
        1.5. Nền tảng/ Nền tảng Zalo: Tất cả các sản phẩm thuộc hệ sinh thái
        Zalo, bao gồm nhưng không giới hạn phần mềm Zalo và các sản phẩm yêu cầu
        sử dụng Tài khoản, được cung cấp bởi Công ty Cổ phần VNG, VNGO hoặc các
        công ty con, công ty thành viên, công ty liên kết của Công ty Cổ phần
        VNG.
      </Text>
      <Text style={styles.content}>
        1.6. Người dùng/Bạn/Chủ thể dữ liệu: là bên truy cập, sử dụng Mạng xã
        hội Zalo, là cá nhân được dữ liệu cá nhân phản ánh, là bên còn lại chịu
        sự ràng buộc của Thỏa thuận này và những quy trình, quy chế, chính sách
        cộng đồng, chính sách liên kết khác (nếu có).
      </Text>
      <Text style={styles.content}>
        1.7. Sở Hữu Trí Tuệ: là những sáng chế, cải tiến, thiết kế, quy trình,
        công thức, phương pháp, cơ sở dữ liệu, thông tin, bản vẽ, mã, chương
        trình máy tính, tác phẩm có bản quyền (hiện tại và tương lai), thiết kế
        mạch tích hợp bán dẫn, thương hiệu, nhãn hiệu (dù đã đăng ký hay chưa
        đăng ký) tên thương mại và (thiết kế) bao bì thương phẩm.
      </Text>
      <Text style={styles.content}>
        1.8. Nội dung Người dùng: là nội dung dưới dạng văn bản, hình ảnh, âm
        thanh và các dạng thể hiện khác do Người dùng tải lên Mạng xã hội Zalo
        phù hợp với Thoả thuận này.
      </Text>
      <Text style={styles.content}>
        1.9. Nền tảng Zalo: là phần mềm Zalo, được phát triển và vận hành bởi
        Công ty Cổ phần VNG.
      </Text>

      <Text style={styles.sectionTitle}>Điều 2: Nội dung dịch vụ</Text>
      <Text style={styles.content}>
        VNGO cung cấp Mạng xã hội Zalo - được xác định là một tính năng năng
        trên nền tảng Zalo để các cá nhân, tổ chức (đã là thành viên trên Nền
        tảng Zalo) chia sẻ thông tin, hình ảnh, trạng thái (bao gồm nhưng không
        giới hạn các lĩnh vực khoa học, công nghệ, kinh tế, văn hóa, thể thao,
        giải trí, quảng cáo, an sinh xã hội...) phù hợp theo quy định pháp luật.
        Các tính năng năng khác trên Nền tảng Zalo không thuộc phạm vi mạng xã
        hội này.
      </Text>

      <Text style={styles.sectionTitle}>
        Điều 3: Chấp nhận điều khoản sử dụng và sửa đổi
      </Text>
      <Text style={styles.content}>
        3.1. Khi sử dụng Mạng xã hội Zalo, Người dùng đồng ý đã đọc, đã hiểu, đã
        được giải thích và cam kết tuân thủ toàn bộ các nguyên tắc, điều khoản
        được quy định trong Thoả thuận này, cũng như các quy định, quy chế liên
        quan đến việc liên kết, tích hợp (nếu có).
      </Text>
      <Text style={styles.content}>
        3.2. Để đáp ứng nhu cầu sử dụng của Người dùng, Mạng xã hội Zalo không
        ngừng hoàn thiện và phát triển, vì vậy các điều khoản quy định tại Thỏa
        thuận cung cấp và sử dụng dịch vụ Mạng xã hội Zalo này có thể được cập
        nhật, chỉnh sửa bất cứ lúc nào mà không cần phải thông báo trước tới
        Người dùng. VNGO sẽ công bố trên Website, ứng dụng về những thay đổi, bổ
        sung đó. Nếu không chấp thuận, Người dùng có quyền chấm dứt sử dụng dịch
        vụ.
      </Text>
      <Text style={styles.content}>
        3.3. Trong trường hợp một hoặc một số điều khoản Thỏa thuận này xung đột
        với các quy định của luật pháp, điều khoản đó sẽ được chỉnh sửa cho phù
        hợp với quy định pháp luật hiện hành, và phần còn lại của Thỏa thuận sử
        dụng vẫn được giữ nguyên giá trị.
      </Text>
      <Text style={styles.content}>
        3.4. Trong phạm vi pháp luật cho phép, trường hợp Người dùng không đồng
        ý với một phần hoặc toàn bộ Thoả thuận này, Chúng tôi có quyền hạn chế,
        ngừng, huỷ bỏ việc cung cấp sản phẩm, dịch vụ cho Người dùng do không có
        đầy đủ các thông tin, dữ liệu để thực hiện cung cấp các sản phẩm, dịch
        vụ cho Người dùng.
      </Text>

      <Text style={styles.sectionTitle}>Điều 4: Sử dụng dịch vụ</Text>
      <Text style={styles.content}>
        4.1. Người dùng phải đủ năng lực hành vi dân sự và từ đủ 14 tuổi trở lên
        mới được phép đăng nhập ứng dụng Zalo để sử dụng Mạng xã hội Zalo.
      </Text>
      <Text style={styles.content}>
        4.2. Mạng xã hội Zalo cho phép Người dùng cung cấp, chia sẻ thông tin,
        hình ảnh, video phù hợp quy định pháp luật và bình luận nêu ý kiến đánh
        giá. VNGO áp dụng quy trình kiểm duyệt thích hợp để đảm bảo tối đa các
        thông tin được đăng tải phù hợp quy định pháp luật hiện hành.
      </Text>
      <Text style={styles.content}>
        4.3. Người dùng sẽ chịu mọi trách nhiệm về mọi hành động, hành vi được
        thực hiện thông qua Mạng xã hội Zalo trong quá trình sử dụng dịch vụ.
      </Text>
      <Text style={styles.content}>
        4.4. VNGO sẽ áp dụng các biện pháp kỹ thuật, an ninh, bảo mật cần thiết
        theo quy định của Pháp luật và theo các tuyên bố, cam kết chất lượng của
        VNGO để bảo mật thông tin cá nhân của Người dùng. Mặc dù vậy, các rủi ro
        liên quan đến việc cung cấp, bảo mật dữ liệu cá nhân, cho dù là cung cấp
        trực tiếp, qua điện thoại hay qua mạng internet hay qua các phương tiện
        kỹ thuật sẽ luôn tiềm ẩn và KHÔNG CÓ HỆ THỐNG KỸ THUẬT HAY BIỆN PHÁP AN
        NINH, BẢO MẬT NÀO LÀ AN TOÀN TUYỆT ĐỐI hay có thể chống lại được tất cả
        các "hacker", "tamper" (những người xâm nhập trái phép để lục lọi thông
        tin). Do đó, trong trường hợp thông tin cá nhân của Người dùng bị lộ do
        bị tấn công mạng hoặc các nguyên nhân khác nằm ngoài tầm kiểm soát của
        VNGO thì Người dùng theo đây đồng ý miễn cho VNGO toàn bộ trách nhiệm có
        liên quan.
      </Text>
      <Text style={styles.content}>
        4.5. Trong trường hợp tài khoản trên Nền tảng Zalo của Người dùng bị vô
        hiệu hoá, Người dùng sẽ không sử dụng được Mạng xã hội Zalo.
      </Text>
      <Text style={styles.content}>
        4.6. Các vi phạm các quy định, thoả thuận của Người dùng trên Mạng xã
        hội Zalo có thể dẫn tới việc bị vô hiệu hoá tài khoản trên Nền tảng
        Zalo.
      </Text>

      <Text style={styles.sectionTitle}>
        Điều 5: Các nội dung cấm trao đổi và chia sẻ trên mạng xã hội
      </Text>
      <Text style={styles.content}>
        Khi sử dụng Mạng xã hội Zalo, nghiêm cấm Người dùng thực hiện một số
        hành vi bao gồm nhưng không giới hạn sau:
      </Text>
      <Text style={styles.content}>
        5.1. Lợi dụng việc cung cấp, trao đổi, sử dụng thông tin trên Mạng xã
        hội Zalo nhằm mục đích:
      </Text>
      <Text style={styles.content}>
        i. Chống lại Nhà nước Cộng hoà xã hội chủ nghĩa Việt Nam; gây phương hại
        đến an ninh quốc gia, trật tự, an toàn xã hội; phá hoại khối đại đoàn
        kết toàn dân; tuyên truyền chiến tranh xâm lược, khủng bố; gây hận thù,
        mâu thuẫn giữa các dân tộc, sắc tộc, chủng tộc, tôn giáo.
      </Text>
      <Text style={styles.content}>
        ii. Tuyên truyền, kích động bạo lực, dâm ô, đồi trụy, tội ác, tệ nạn xã
        hội, mê tín dị đoan, phá hoại thuần phong, mỹ tục của dân tộc.
      </Text>
      <Text style={styles.content}>
        iii. Đưa thông tin xuyên tạc, vu khống, xúc phạm uy tín của tổ chức,
        danh dự và nhân phẩm của cá nhân.
      </Text>

      <Text style={styles.sectionTitle}>
        Điều 6: Nội dung cung cấp trao đổi thông tin
      </Text>
      <Text style={styles.content}>
        6.1. Người dùng phải chịu trách nhiệm về các nội dung được đăng tải trên
        Mạng xã hội Zalo. Người dùng khẳng định và đảm bảo rằng mình sở hữu
        hoặc/và được sự đồng ý của chủ sở hữu về nội dung mà mình đăng tải đồng
        thời Người dùng cấp phép cho VNGO tất cả bằng sáng chế, nhãn hiệu,
        thương mại, bí mật thương mại, hoặc quyền khác liên quan đến nội dung để
        phổ biến nội dung trên Mạng xã hội Zalo theo các Điều khoản Dịch vụ.
      </Text>
      <Text style={styles.content}>
        6.2. VNGO không chứng thực bất kỳ nội dung nào được đăng tải, sử dụng
        bởi bất kỳ Người dùng nào. VNGO không cho phép các hoạt động vi phạm bản
        quyền và xâm phạm quyền sở hữu trí tuệ trên Dịch vụ. VNGO sẽ chủ động
        loại bỏ tất cả các nội dung Người dùng đăng tải mà không cần báo trước
        nếu VNGO nhận định hoặc nhận được thông báo rằng Người dùng đã đăng tải
        những nội dung vi phạm pháp luật.
      </Text>
      <Text style={styles.content}>
        6.3. Mạng xã hội Zalo thuộc quyền sở hữu của VNGO, VNGO cho phép Người
        dùng đăng tải, cung cấp, trao đổi các thông tin, hình ảnh hoặc các nội
        dung khác nhau trừ những nội dung cấm được quy định trong bản Thỏa thuận
        này và các văn bản pháp luật liên quan.
      </Text>
      <Text style={styles.content}>
        6.4. Người dùng đồng ý để VNGO sử dụng, chỉnh sửa, biên soạn, xuất bản,
        tạo ra các sản phẩm phái sinh bất kỳ nội dung, hình ảnh, bình luận hoặc
        hình thức khác mà Người dùng cung cấp, trao đổi, chia sẻ công khai thông
        qua việc sử dụng Mạng xã hội Zalo hoàn toàn miễn phí.
      </Text>
      <Text style={styles.content}>
        6.5. Người dùng cũng cho phép Người dùng dịch vụ của VNGO được quyền sử
        dụng lại thông tin đăng tải của Người dùng bao gồm nhưng không giới hạn
        việc chỉnh sửa lại, biên soạn, phân tán, trình chiếu nội dung đăng tải
        đó vì mục đích cá nhân hoặc phi thương mại.
      </Text>
      <Text style={styles.content}>
        6.6. Tất cả quyền sở hữu trí tuệ tồn tại trong Mạng xã hội Zalo (ngoại
        trừ quyền sở hữu trí tuệ đối với các nội dung do Người dùng đăng tải)
        đều thuộc về VNGO hoặc được cấp phép hợp pháp cho VNGO sử dụng, theo đó,
        tất cả các quyền hợp pháp đều được đảm bảo. Trừ khi được sự đồng ý bằng
        văn bản của VNGO, Người dùng không được phép xuất bản, tái sản xuất,
        truyền hoặc xâm phạm bằng các hình thức khác tới quyền sở hữu trí tuệ
        của VNGO.
      </Text>
      <Text style={styles.content}>
        6.7. Trong mọi trường hợp, VNGO được quyền xử lý các thông tin đăng tải
        cho phù hợp với thuần phong mỹ tục, các quy tắc đạo đức và các quy tắc
        đảm bảo an ninh quốc gia, và chúng tôi có toàn quyền cho phép hoặc không
        cho phép bài viết, thông tin, hình ảnh của Người dùng xuất hiện hay tồn
        tại trên Mạng xã hội Zalo.
      </Text>
      <Text style={styles.content}>
        6.8. Người dùng hiểu và đồng ý rằng, khi sử dụng mạng xã hội này, Người
        dùng sẽ tiếp nhận nhiều nội dung thông tin, hình ảnh được đăng tải từ
        nhiều nguồn khác nhau. VNGO không chịu trách nhiệm về mức độ chính xác,
        tính hữu ích, độ an toàn, hoặc các quyền sở hữu trí tuệ liên quan tới
        những thông tin mà Người dùng đăng tải. Khi sử dụng dịch vụ có thể Người
        dùng thấy một vài thông tin, bình luận do Người dùng đăng tải không đúng
        sự thật, hoặc gây phản cảm, trong trường hợp này, Người dùng có thể
        thông báo vi phạm cho VNGO hoặc không sử dụng dịch vụ.
      </Text>
      <Text style={styles.content}>
        6.9. VNGO có thể cho phép hoặc liên kết với đối tác thứ ba để cung cấp
        các sản phẩm, dịch vụ của họ trên Mạng xã hội Zalo, do đó, khi tải, cài
        đặt hoặc sử dụng một sản phẩm, dịch vụ như vậy, Người dùng thừa nhận
        rằng (i) Người dùng đã tìm hiểu và chấp thuận các điều khoản sử dụng
        dịch vụ của bên thứ ba (ii) mọi trách nhiệm phát sinh liên quan đến dịch
        vụ là của bên thứ ba, VNGO sẽ hỗ trợ Người dùng nhưng không chịu trách
        nhiệm về các dịch vụ này.
      </Text>
      <Text style={styles.content}>
        6.10. Để đáp ứng nhu cầu và trải nghiệm của Người dùng, VNGO theo kế
        hoạch và quyết định của mình sẽ tiến hành nâng cấp, cập nhật thường
        xuyên các phiên bản, tính năng mới Mạng xã hội Zalo mà không phải báo
        trước với Người dùng.
      </Text>
      <Text style={styles.content}>
        6.11. Người dùng hiểu rằng khi muốn tìm cách xóa nội dung của mình từ
        Mạng xã hội Zalo, việc này phải mất một khoảng thời gian nhất định. Vì
        vấn đề kỹ thuật và quy trình nên có thể không theo ý muốn của Người
        dùng. Người dùng chấp nhận những rủi ro phát sinh và VNGO được loại trừ
        trách nhiệm này. Chúng tôi khuyên Người dùng nên lưu giữ một bản trước
        khi đăng tải lên Mạng xã hội Zalo.
      </Text>
      <Text style={styles.content}>
        6.12. Người dùng đồng ý cấp quyền cho VNGO sử dụng nội dung trao đổi
        thông tin của Người dùng cho mục đích quảng bá, phát triển dịch vụ, bao
        gồm nhưng không giới hạn các dịch vụ mới mà chúng tôi có thể cung cấp
        trong tương lai.
      </Text>
      <Text style={styles.content}>
        6.13. Người dùng đồng ý rằng VNGO có thể giữ lại hoặc tiết lộ nội dung
        của Người dùng, bao gồm cả Thông Tin Cá Nhân cho cơ quan có thẩm quyền
        theo quy định pháp luật, hoặc theo quá trình hợp pháp khác. Trong quá
        trình hoạt động, cho các mục đích duy trì dịch vụ và đảm bảo lợi ích
        Người dùng VNGO có thể sẽ chuyển giao các thông tin của Người dùng cho
        bên thứ ba phù hợp với các quy định của pháp luật.
      </Text>
      <Text style={styles.content}>
        6.14. Trong quá trình sử dụng Mạng xã hội Zalo, nếu Người dùng vi phạm
        bất kỳ quy định nào trong Thỏa Thuận này, chúng tôi có toàn quyền, ngay
        lập tức và không cần thông báo trước cho Người dùng, chấm dứt, xóa bỏ
        tài khoản của Người dùng mà không phải chịu bất cứ trách nhiệm nào đối
        với Người dùng, đồng thời tùy theo mức độ vi phạm, chúng tôi có thể từ
        chối việc Người dùng đăng ký để sử dụng các dịch vụ khác của VNGO.
      </Text>
      <Text style={styles.content}>
        6.15. Mọi vi phạm của chủ tài khoản trong quá trình sử dụng dịch vụ Mạng
        xã hội Zalo, VNGO có quyền tước bỏ mọi quyền lợi của chủ tài khoản đối
        với việc sử dụng dịch vụ cũng như sẽ yêu cầu cơ quan chức năng truy tố
        Người dùng trước pháp luật nếu cần thiết.
      </Text>
      <Text style={styles.content}>
        6.16. Người dùng có thể sẽ chịu trách nhiệm bồi thường thiệt hại dân sự,
        khả năng bị phạt vi phạm hành chính hoặc bị truy tố trách nhiệm hình sự
        nếu có hành vi vi phạm pháp luật khi sử dụng Mạng xã hội Zalo.
      </Text>

      <Text style={styles.sectionTitle}>Điều 7: Sử dụng dịch vụ tính phí</Text>
      <Text style={styles.content}>
        7.1. VNGO sẽ triển khai không thu phí hoặc thu phí đối với khách hàng sử
        dụng dịch vụ Mạng xã hội Zalo. VNGO sẽ thông báo cụ thể trên trang tin
        điện tử có liên quan về các mức phí để Người dùng nắm rõ, lựa chọn gói
        sử dụng dịch vụ phù hợp.
      </Text>
      <Text style={styles.content}>
        7.2. Người dùng dùng các hình thức thanh toán được phép của VNGO để
        thanh toán dịch vụ tính phí.
      </Text>

      <Text style={styles.sectionTitle}>
        Điều 8: Quyền và trách nhiệm của Người dùng
      </Text>
      <Text style={styles.content}>
        8.1. Trong quá trình sử dụng dịch vụ, Người dùng được hỗ trợ giải quyết
        rủi ro nếu phát sinh sự cố.
      </Text>
      <Text style={styles.content}>
        8.2. Người dùng có trách nhiệm bảo mật thông tin tài khoản, nếu những
        thông tin trên bị tiết lộ dưới bất kỳ hình thức nào thì Người dùng phải
        chấp nhận những rủi ro phát sinh. VNGO sẽ căn cứ vào những thông tin
        hiện có trong tài khoản để làm căn cứ quyết định chủ sở hữu tài khoản
        nếu có tranh chấp và VNGO sẽ không chịu trách nhiệm về mọi tổn thất phát
        sinh.
      </Text>
      <Text style={styles.content}>
        8.3. Người dùng đồng ý sẽ thông báo ngay cho VNGO về bất kỳ trường hợp
        nào sử dụng trái phép tài khoản và mật khẩu của Người dùng hoặc bất kỳ
        các hành động phá vỡ hệ thống bảo mật nào. Người dùng cũng bảo đảm rằng,
        Người dùng luôn thoát tài khoản của mình sau mỗi lần sử dụng.
      </Text>
      <Text style={styles.content}>
        8.4. Người dùng phải tuân thủ tuyệt đối quy định về các hành vi cấm, các
        nội dung trao đổi cung cấp thông tin được quy định trong Thỏa thuận này.
        Nếu vi phạm một hoặc nhiều hành vi, tùy thuộc vào mức độ vi phạm VNGO sẽ
        khóa tài khoản vĩnh viễn, tước bỏ mọi quyền lợi của Người dùng đối các
        dịch vụ của VNGO và sẽ yêu cầu cơ quan chức năng truy tố Người dùng
        trước pháp luật nếu cần thiết.
      </Text>
      <Text style={styles.content}>
        8.5. Người dùng phải chịu trách nhiệm pháp lý về mọi nội dung do Người
        dùng đăng tải trên Mạng xã hội Zalo bao gồm nhưng không giới hạn ở trách
        nhiệm bồi thường thiệt hại cho VNGO và các bên liên quan vì vi phạm
        quyền sở hữu trí tuệ.
      </Text>
      <Text style={styles.content}>
        8.6. Chúng tôi có quyền ngay lập tức chấm dứt hoặc khóa tài khoản của
        Người dùng hoặc việc sử dụng Dịch vụ Mạng xã hội Zalo hoặc truy cập vào
        nội dung ở bất kỳ thời điểm nào mà không cần thông báo hoặc có trách
        nhiệm, nếu VNGO xác định rằng Người dùng đã vi phạm các Điều khoản sử
        dụng, vi phạm luật pháp, quy tắc, quy định, tham gia vào các hành vi
        không thích hợp khác, hoặc vì lý do kinh doanh khác. Chúng tôi cũng có
        quyền chấm dứt tài khoản của Người dùng hoặc việc sử dụng của Dịch vụ
        Mạng xã hội Zalo hoặc truy cập vào các nội dung nếu việc sử dụng gây quá
        tải cho máy chủ của chúng tôi. Trong một số trường hợp, chúng tôi có
        quyền sử dụng công nghệ để hạn chế hoạt động như là giới hạn số lượt
        truy cập đến máy chủ Mạng xã hội Zalo hoặc dung lượng sử dụng của Người
        dùng. Người dùng đồng ý tôn trọng những giới hạn và không có bất kì hành
        động nào để phá vỡ, lẩn tránh hoặc bỏ qua chúng.
      </Text>
      <Text style={styles.content}>
        8.7. Thực hiện quyền và trách nhiệm khác theo quy định pháp luật.
      </Text>
      <Text style={styles.sectionTitle}>
        Điều 9: Quyền và trách nhiệm của VNGO
      </Text>
      <Text style={styles.content}>
        9.1. Công khai thỏa thuận cung cấp và sử dụng dịch vụ mạng xã hội.
      </Text>
      <Text style={styles.content}>
        9.2. Có biện pháp phù hợp và các chính sách bảo vệ, bảo mật thông tin
        nhằm bảo mật các thông tin riêng, thông tin cá nhân của Người dùng;
        thông báo cho Người dùng về quyền, trách nhiệm và các rủi ro khi lưu
        trữ, trao đổi và chia sẻ thông tin trên mạng.
      </Text>
      <Text style={styles.content}>
        9.3. Có các biện pháp bảo đảm quyền quyết định của Người dùng theo quy
        định của pháp luật khi cho phép thông tin cá nhân của mình được cung cấp
        cho tổ chức, doanh nghiệp, cá nhân khác.
      </Text>
      <Text style={styles.content}>
        9.4. Cung cấp thông tin cá nhân và thông tin riêng của Người dùng có
        liên quan đến hoạt động khủng bố, tội phạm, vi phạm pháp luật khi có yêu
        cầu của cơ quan quản lý nhà nước có thẩm quyền.
      </Text>
      <Text style={styles.content}>
        9.5. Thực hiện việc đăng ký, lưu trữ và quản lý thông tin cá nhân của
        người thiết lập trang thông tin điện tử cá nhân và người cung cấp thông
        tin khác trên mạng xã hội theo quy định của Bộ Thông tin và Truyền
        thông. Bảo đảm chỉ những người đã cung cấp đầy đủ, chính xác thông tin
        cá nhân theo quy định mới được thiết lập trang thông tin điện tử cá nhân
        hoặc cung cấp thông tin trên mạng xã hội.
      </Text>
      <Text style={styles.content}>
        9.6. Trong quá trình sử dụng dịch vụ, nếu Người dùng vi phạm bất cứ điều
        khoản nào trong Thỏa thuận này hoặc thỏa thuận sử dụng dịch vụ khác của
        VNGO được quy định trên website, chúng tôi có toàn quyền chấm dứt, xóa
        bỏ tài khoản của Người dùng mà không cần sự đồng ý của Người dùng và
        không phải chịu bất cứ trách nhiệm nào đối với Người dùng.
      </Text>
      <Text style={styles.content}>
        9.7. Mọi vi phạm của chủ tài khoản trong quá trình sử dụng dịch vụ của
        VNGO, VNGO có quyền tước bỏ mọi quyền lợi của chủ tài khoản đối với việc
        sử dụng các dịch vụ của VNGO cũng như sẽ yêu cầu cơ quan chức năng truy
        tố Người dùng trước pháp luật nếu cần thiết.
      </Text>
      <Text style={styles.content}>
        9.8. Khi phát hiện những vi phạm như sử dụng cheats, hacks, hoặc những
        lỗi khác, VNGO có quyền sử dụng những thông tin mà Người dùng cung cấp
        khi đăng ký tài khoản để chuyển cho Cơ quan chức năng giải quyết theo
        quy định của pháp luật.
      </Text>
      <Text style={styles.content}>
        9.9. Khi tự phát hiện những vi phạm hoặc nhận được thông báo vi phạm về
        nội dung cấm được quy định tại Thỏa thuận này, VNGO có quyền ngay lập
        tức gỡ bỏ, và/hoặc cảnh cáo, khóa, tạm dừng dịch vụ cho của Người dùng
        vi phạm. VNGO có toàn quyền quyết định các hình thức xử lý đối với các
        trường hợp vi phạm. Tuy vào tính chất sự việc, mức độ ảnh hưởng và
        nghiêm trọng, VNGO sẽ đưa ra hình thức xử lý phù hợp. Quyết định của
        VNGO là quyết định cuối cùng và Người dùng đồng ý chấp hành.
      </Text>
      <Text style={styles.content}>
        9.10. Có trách nhiệm hỗ trợ chủ tài khoản trong quá trình sử dụng dịch
        vụ của VNGO.
      </Text>
      <Text style={styles.content}>
        9.11. Nhận và giải quyết khiếu nại của khách hàng các trường hợp phát
        sinh trong quá trình sử dụng dịch vụ của VNGO, tuy nhiên VNGO chỉ hỗ
        trợ, nhận và giải quyết đối với tài khoản đăng ký đầy đủ thông tin,
        trung thực và chính xác.
      </Text>

      <Text style={styles.sectionTitle}>
        Điều 10: Giới hạn trách nhiệm và từ chối đảm bảo
      </Text>
      <Text style={styles.content}>
        10.1. VNGO sẽ chịu trách nhiệm đối với sự cố hệ thống trong quá trình
        Người dùng sử dụng dịch vụ tương ứng với phần lỗi của VNGO.
      </Text>
      <Text style={styles.content}>
        10.2. Nếu phát sinh rủi ro, thiệt hại trong trường hợp bất khả kháng bao
        gồm nhưng không giới hạn như chập điện, hư hỏng phần cứng, phần mềm, sự
        cố đường truyền internet hoặc do thiên tai, v.v. Người dùng phải chấp
        nhận những rủi ro, thiệt hại nếu có. VNGO cam kết sẽ lỗ lực giảm thiểu
        những rủi ro, thiệt hại phát sinh tuy nhiên VNGO sẽ không chịu bất cứ
        trách nhiệm nào phát sinh trong các trường hợp này.
      </Text>
      <Text style={styles.content}>
        10.3. VNGO hoàn toàn không chịu trách nhiệm rủi ro về mọi giao dịch của
        Người dùng với bên thứ ba trong quá trình sử dụng dịch vụ của VNGO. Khi
        Người dùng sử dụng dịch vụ và/hoặc giao dịch với bên thứ ba, Người dùng
        đã hiểu và đồng ý tự chịu trách nhiệm những rủi ro phát sinh.
      </Text>
      <Text style={styles.content}>
        10.4. Bài viết, video của Người dùng có thể có những hạn chế, có thể gây
        phản đối, bất hợp pháp, không chính xác, hoặc không phù hợp. VNGO không
        chịu trách nhiệm cho bất kỳ bài viết nào, clip, video, hình ảnh nào mà
        Người dùng đăng tải. Chúng tôi có quyền giám sát, hạn chế hoặc loại bỏ
        các nội dung đăng tải trên khi chúng tôi có cơ sở cho rằng, nội dung
        được đăng tải là vi phạm thỏa thuận này cũng như vi phạm pháp luật.
      </Text>
      <Text style={styles.content}>
        10.5. Trước khi thực hiện và hoàn tất các thủ tục yêu cầu thực hiện
        quyền của Chủ thể dữ liệu, Người dùng có trách nhiệm nghiên cứu, hiểu rõ
        và nhận thức được các hệ quả pháp lý, trách nhiệm và các quyền tương ứng
        của VNGO có thể xảy ra khi thực hiện quyền Chủ thể dữ liệu. Việc Chủ thể
        dữ liệu thực hiện một hoặc đồng thời các hành động rút lại sự đồng ý,
        yêu cầu hạn chế, phản đối xử lý dữ liệu cá nhân và/ hoặc xoá dữ liệu cá
        nhân có thể sẽ dẫn tới một hoặc đồng thời những hậu quả pháp lý và/ hoặc
        thiệt hại mà Nền tảng phải gánh chịu hoặc tiềm ẩn nguy cơ sẽ phải gánh
        chịu, bao gồm nhưng không giới hạn: (i) Những thiệt hại mà VNGO trực
        tiếp phải gánh chịu nếu tiếp tục thực hiện quyền Chủ thể dữ liệu; (ii)
        Vi phạm hợp đồng, văn bản thoả thuận về việc xử lý dữ liệu cá nhân đã
        giao kết với Bên thứ ba. Trường hợp theo đánh giá hợp lý của VNGO nhận
        thấy có thể tiềm ẩn những hậu quả pháp lý và/ hoặc thiệt hại đã nêu rõ ở
        trên, VNGO có quyền cân nhắc và quyết định đơn phương chấm dứt thực hiện
        các yêu cầu của Chủ thể dữ liệu.
      </Text>

      <Text style={styles.sectionTitle}>
        Điều 11: Thu thập thông tin, mục đích sử dụng và bảo mật thông tin
      </Text>
      <Text style={styles.content}>
        11.1. Nhằm không ngừng cải tiến chất lượng dịch vụ, đáp ứng nhu cầu của
        Người dùng, khi đăng nhập sử dụng Mạng xã hội Zalo, VNGO thực hiện một
        hoặc nhiều các họat động xử lý dữ liệu cá nhân đối với những dữ liệu cụ
        thể như sau:
      </Text>
      <Text style={styles.content}>
        a. Dữ liệu cá nhân cơ bản do Người dùng cung cấp, bao gồm:
      </Text>
      <Text style={styles.content}>
        i. Thông tin dữ liệu cá nhân do Người dùng cung cấp khi khởi tạo Tài
        khoản cũng như trong suốt quá trình Người dùng sử dụng Dịch vụ bao gồm:
        Số điện thoại, Họ và tên, tuổi, giới tính, mối quan hệ gia đình, danh
        sách bạn bè, các thông tin trên CMND/CCCD/Hộ chiếu, hình ảnh cá nhân,
        thư điện tử.
      </Text>
      <Text style={styles.content}>
        ii. Nội dung Người dùng khởi tạo công khai hoặc chủ động cung cấp cho
        Chúng tôi trong quá trình sử dụng Dịch vụ bao gồm nhưng không giới hạn:
        Các miêu tả công khai; ảnh đại diện, ảnh bìa; tên liên hệ tùy chỉnh;
        thông tin khảo sát Người dùng điền thông qua Nền tảng.
      </Text>
      <Text style={styles.content}>
        b. Dữ liệu cá nhân cơ bản do VNGO chủ động thu thập, bao gồm:
      </Text>
      <Text style={styles.content}>
        i. Thông tin Ứng dụng, Thiết bị và Mạng: thông tin liên quan đến hệ điều
        hành, Thiết bị như là phiên bản, ngôn ngữ mặc định, chất lượng tín hiệu
        từ Thiết bị, thông tin cookie, địa chỉ IP, mức năng lượng, dữ liệu tương
        tác với ứng dụng, trạng thái kết nối, dữ liệu về sự cố, hiệu suất, hệ
        điều hành, trình duyệt, thông tin mạng và các loại dữ liệu tương tự.
      </Text>
      <Text style={styles.content}>
        ii. Hoạt động của Tài khoản khi sử dụng Mạng xã hội Zalo: Thời điểm, tần
        suất Tài Khoản hoạt động trên Nền tảng, nội dung quảng cáo, các hoạt
        động mà Người dùng thực hiện thông qua Tài khoản, báo cáo sự cố.
      </Text>
      <Text style={styles.content}>
        iii. Thông tin khi Người dùng cập nhật thông tin liên lạc/thông tin cá
        nhân qua Phiếu yêu cầu hợp lệ.
      </Text>
      <Text style={styles.content}>
        c. Dữ liệu cá nhân nhạy cảm do Người dùng cung cấp, bao gồm thông tin vị
        trí dưới sự chấp thuận của Bạn thông qua hệ điều hành về việc cấp quyền
        cho Mạng xã hội Zalo truy cập dữ liệu GPS.
      </Text>
      <Text style={styles.content}>
        d. Trường hợp Người dùng là tài khoản Chương trình Zalo Official
        Account, Người đại diện của hoặc Người quản trị tài khoản của Pháp nhân,
        tổ chức, doanh nghiệp có trách nhiệm cung cấp những dữ liệu sau cho
        Chúng tôi khi đăng ký tài khoản: Tên của Pháp nhân, tổ chức, doanh
        nghiệp; Mã số doanh nghiệp, mã số thuế; Địa chỉ trụ sở đăng ký; Địa chỉ
        liên hệ; Thông tin Người đại diện theo Pháp luật trong giấy chứng nhận
        đăng ký kinh doanh và các thông tin khác được quy định tại Điều 11.1.(i)
        của Thoả thuận này; Địa chỉ thư điện tử (email) quản trị; Tên của người
        quản trị tài khoản; Số điện thoại của người quản trị tài khoản.
      </Text>
      <Text style={styles.content}>
        e. Dữ liệu cá nhân mà Chúng tôi có thể yêu cầu Người dùng cung cấp.
      </Text>
      <Text style={styles.content}>
        f. Thông tin được Người dùng chia sẻ trên mạng xã hội Zalo.
      </Text>

      <Text style={styles.sectionTitle}>Điều 12: Chia sẻ dữ liệu</Text>
      <Text style={styles.content}>
        12.1. Chúng tôi nhận và chia sẻ thông tin Người dùng với các Công ty
        thuộc trực thuộc Công ty Cổ phần VNG bao gồm công ty con, công ty thành
        viên, công ty liên kết của VNG vì một hay nhiều mục đích nói trên.
      </Text>
      <Text style={styles.content}>
        12.2. Ngoài ra, chúng tôi sẽ chia sẻ Thông tin tài khoản của Người dùng
        khi có sự cho phép hoặc yêu cầu của Người dùng cho các Bên thứ ba. Đây
        cũng là đơn vị mà Người dùng mong muốn được tiếp cận và/ hoặc đã cho
        phép Bên thứ ba tiếp cận dữ liệu của mình để xúc tiến các bước cần thiết
        nhằm triển khai việc cung cấp hàng hoá/ dịch vụ hoặc lợi ích khác cho
        Người dùng.
      </Text>
      <Text style={styles.content}>
        12.3. Chia sẻ dữ liệu trong các trường hợp khác theo quy định của Pháp
        luật.
      </Text>
      <Text style={styles.content}>
        12.4. Trong trường hợp cần chia sẻ thông tin của Người dùng theo các
        điều 12.1, 12.2, 12.3, chúng tôi yêu cầu các Bên tuân thủ các hướng dẫn,
        quy định và yêu cầu nhằm bảo vệ các thông tin được chia sẻ theo quy định
        của Pháp luật.
      </Text>
      <Text style={styles.content}>
        12.5. Người dùng cũng đồng ý cho phép VNGO được chuyển giao dữ liệu được
        thu thập cho chủ sở hữu nền tảng Zalo để nhằm các mục đích cải thiện sản
        phẩm, đảm bảo trải nghiệm tốt nhất cho Người dùng, bảo đảm an toàn an
        ninh thông tin, phục vụ báo cáo, cung cấp thông tin cho Cơ quan có thẩm
        quyền, và thực hiện các hoạt động marketing, quảng cáo trên nền tảng
        Zalo nói chung và Mạng xã hội Zalo nói riêng.
      </Text>

      <Text style={styles.sectionTitle}>
        Điều 13: Các trường hợp xử lý dữ liệu cá nhân không cần sự đồng ý của
        Người dùng
      </Text>
      <Text style={styles.content}>
        13.1. Trong trường hợp khẩn cấp, cần xử lý ngay dữ liệu cá nhân có liên
        quan đến bảo vệ tính mạng, sức khoẻ của Người dùng hoặc người khác.
      </Text>
      <Text style={styles.content}>
        13.2. Việc chia sẻ dữ liệu cá nhân theo quy định của luật.
      </Text>
      <Text style={styles.content}>
        13.3. Việc xử lý dữ liệu của cơ quan nhà nước có thẩm quyền trong trường
        hợp tình trạng khẩn cấp về quốc phòng, an ninh quốc gia, trật tự toàn xã
        hội, thảm hoạ lớn, dịch bệnh nguy hiểm; khi có nguy cơ đe dọa an ninh,
        quốc phòng nhưng chưa đến mức ban bố tình trạng khẩn cấp; phòng, chống
        bạo loạn, khủng bố, phòng, chống tội phạm và vi phạm Pháp luật theo quy
        định của luật.
      </Text>
      <Text style={styles.content}>
        13.4. Để thực hiện nghĩa vụ theo hợp đồng của Chủ thể dữ liệu với cơ
        quan, tổ chức, cá nhân có liên quan theo quy định của luật.
      </Text>
      <Text style={styles.content}>
        13.5. Phục vụ hoạt động của cơ quan nhà nước đã được quy định theo luật
        chuyên ngành.
      </Text>
      <Text style={styles.content}>
        13.6. Các trường hợp chia sẻ dữ liệu khác đã được Người dùng đồng ý
        trong Thoả thuận này.
      </Text>

      <Text style={styles.sectionTitle}>
        Điều 14: Quyền của Chủ thể dữ liệu
      </Text>
      <Text style={styles.content}>
        14.1. Quyền rút lại sự đồng ý, hạn chế và phản đối xử lý dữ liệu cá
        nhân, xoá dữ liệu cá nhân:
      </Text>
      <Text style={styles.content}>
        a. Sau khi xác nhận đồng ý đối với Thoả thuận này, trong quá trình sử
        dụng Mạng xã hội Zalo, Người dùng có quyền rút lại sự đồng ý, yêu cầu
        hạn chế, phản đối xử lý dữ liệu cá nhân và/ hoặc xoá dữ liệu cá nhân.
        VNGO sẽ thực hiện các thủ tục cần thiết nhằm chấm dứt, hạn chế xử lý dữ
        liệu cá nhân theo thời hạn, phạm vi và các nội dung khác mà Người dùng
        yêu cầu sau khi đã thực hiện đúng và đầy đủ các thủ tục để khởi tạo một
        yêu cầu hợp lệ.
      </Text>
      <Text style={styles.content}>
        b. Yêu cầu được xem như là hợp lệ khi thực hiện theo trình thực, thủ tục
        và đáp ứng đúng và đầy đủ tất cả các điều kiện được quy định như sau:
      </Text>
      <Text style={styles.content}>
        - Được thực hiện bởi chính Người dùng mà không phải thông qua đại diện
        hay uỷ quyền dưới bất kỳ hình thức nào, trừ các trường hợp Pháp luật quy
        định phải thực hiện thông qua đại diện hay uỷ quyền.
      </Text>
      <Text style={styles.content}>
        - Người dùng hiểu rõ và đồng ý cam kết sẽ chịu trách nhiệm về mọi hậu
        quả, thiệt hại có thể xảy ra do hành động rút lại sự đồng ý, thực hiện
        yêu cầu hạn chế, phản đối xử lý dữ liệu cá nhân và/ hoặc xoá dữ liệu cá
        nhân gây ra (nếu có).
      </Text>
      <Text style={styles.content}>
        - Hoàn tất thanh toán đầy đủ và đúng hạn các loại phí, chi phí liên quan
        đến việc thực hiện yêu cầu rút lại sự đồng ý, yêu cầu hạn chế, phản đối
        xử lý dữ liệu cá nhân, xoá dữ liệu cá nhân theo biểu phí tại địa điểm
        được quy định theo Điều 15 Thoả thuận này.
      </Text>
      <Text style={styles.content}>
        c. VNGO có quyền từ chối thực hiện toàn bộ yêu cầu của Người dùng nếu
        yêu cầu không đáp ứng điều kiện hợp lệ theo quy định tại 14.b.
      </Text>
      <Text style={styles.content}>
        d. Trường hợp yêu cầu đáp ứng điều kiện theo quy định, VNGO sẽ thực hiện
        các thủ tục cần thiết nhằm chấm dứt, hạn chế xử lý dữ liệu cá nhân và/
        hoặc xoá dữ liệu cá nhân theo thời hạn, phạm vi và các nội dung khác mà
        Người dùng yêu cầu trong 72 (bảy mươi hai) giờ kể từ thời điểm Người
        dùng gửi yêu cầu hợp lệ.
      </Text>
      <Text style={styles.content}>
        e. Việc rút lại sự đồng ý, yêu cầu hạn chế, phản đối xử lý dữ liệu cá
        nhân và/ hoặc xoá dữ liệu cá nhân không làm ảnh hưởng tới tính hợp pháp
        của việc xử lý dữ liệu cá nhân mà VNGO và/ hoặc Bên thứ ba đã thực hiện
        trước thời điểm VNGO và/ hoặc Bên thứ ba hoàn tất việc chấm dứt, hạn chế
        xử lý dữ liệu cá nhân và/ hoặc xoá dữ liệu cá nhân.
      </Text>

      <Text style={styles.sectionTitle}>
        Điều 15: Thông tin liên hệ liên quan tới hoạt động xử lý dữ liệu cá nhân
        và giải quyết khiếu nại, tố cáo, bồi thường
      </Text>
      <Text style={styles.content}>
        15.1. Người dùng vi phạm Thỏa Thuận này thì tùy theo mức độ nghiêm trọng
        của hành vi vi phạm, VNGO sẽ đơn phương và toàn quyền quyết định hình
        thức xử lý phù hợp theo nguyên tắc xử lý vi phạm như sau:
      </Text>
      <Text style={styles.content}>
        a. Khóa tài khoản có thời hạn hoặc vĩnh viễn, điều đó đồng nghĩa với
        việc nội dung được đăng tải bởi Người dùng sẽ bị xóa bỏ.
      </Text>
      <Text style={styles.content}>
        b. Hủy bỏ toàn bộ những quyền lợi của Người dùng gắn liền với Mạng xã
        hội Zalo và các sản phẩm, dịch vụ do VNGO cung cấp.
      </Text>
      <Text style={styles.content}>
        15.2. Bất kỳ tranh chấp phát sinh trong quá trình sử dụng của sử dụng
        Mạng xã hội Zalo sẽ được giải quyết theo pháp luật hiện hành của nước
        Cộng hòa xã hội chủ nghĩa Việt Nam.
      </Text>
      <Text style={styles.content}>
        15.3. Bất kỳ khiếu nại nào phát sinh trong quá sử dụng Mạng xã hội Zalo
        phải được gửi đến VNGO ngay sau khi xảy ra sự kiện phát sinh khiếu nại:
      </Text>
      <Text style={styles.content}>
        Địa chỉ liên hệ: Bộ phận Nhật ký Zalo, Công ty TNHH VNG Online - Tầng
        16, Tòa nhà ROX Tower, số 54A Nguyễn Chí Thanh, Phường Láng Thượng, Quận
        Đống đa, Thành phố Hà Nội Email: hotro@nhatkyzalo.vn
      </Text>
      <Text style={styles.content}>
        15.4. Trong trường hợp Ngưởi sử dụng có bất kỳ câu hỏi nào liên quan đến
        Quy định bảo vệ dữ liệu cá nhân hoặc các vấn đề liên quan đến quyền của
        Chủ thể dữ liệu hoặc xử lý dữ liệu cá nhân của Ngưởi sử dụng, Bạn vui
        lòng liên hệ trực tiếp tại:
      </Text>
      <Text style={styles.content}>
        Bộ phận Bảo Vệ Dữ Liệu Cá Nhân, Địa điểm kinh doanh số 1 – Công ty TNHH
        VNG Online Tầng hai, Khu chung cư phức hợp M2, số 72 Nguyễn Cơ Thạch,
        Phường An Lợi Đông, Quận 2, Thành phố Hồ Chí Minh, Việt Nam
      </Text>

      <Text style={styles.sectionTitle}>
        Điều 16: Quy tắc quản lí xử phạt vi phạm Người dùng
      </Text>
      <Text style={styles.content}>
        16.1. Người dùng vi phạm thỏa thuận cung cấp và sử dụng mạng xã hội thì
        tùy theo mức độ nghiêm trọng của hành vi vi phạm sẽ bị xử phạt tương
        ứng.
      </Text>
      <Text style={styles.content}>
        16.2. Trường hợp hành vi vi phạm của Người dùng chưa được quy định trong
        thỏa thuận này thì tùy vào tính chất, mức độ của hành vi vi phạm, VNGO
        sẽ đơn phương, toàn quyền quyết định mức xử phạt hợp lý.
      </Text>
      <Text style={styles.content}>
        16.3. Hình thức xử phạt khóa tài khoản có thời hạn hoặc vĩnh viễn, điều
        đó đồng nghĩa với việc Người dùng cũng không thể sử dụng các dịch vụ
        khác khi truy cập từ tài khoản.
      </Text>
      <Text style={styles.content}>
        16.4. Nếu tài khoản bị khóa vĩnh viễn, thì toàn bộ những quyền lợi của
        chủ tài khoản cũng sẽ khóa vĩnh viễn.
      </Text>
      <Text style={styles.content}>
        Người dùng hiểu rõ và đồng ý rằng, để nâng cao hiệu quả sử dụng tài
        nguyên hệ thống, trường hợp Người dùng không đăng nhập, sử dụng Tài
        khoản trong vòng 45 ngày kể từ lần đăng nhập cuối cùng, VNGO có quyền
        (nhưng không có nghĩa vụ) xóa toàn bộ tài khoản của Người dùng cùng với
        toàn bộ Dữ Liệu của Người dùng.
      </Text>

      <Text style={styles.sectionTitle}>
        Điều 17: Bản quyền, quyền sở hữu trí tuệ và quy trình báo cáo vi phạm
      </Text>
      <Text style={styles.content}>
        17.1. Tất cả quyền Sở Hữu Trí Tuệ (bao gồm bản quyền) của hoặc liên quan
        đến Mạng xã hội Zalo (ngoại trừ quyền sở hữu trí tuệ liên quan tới các
        nội dung do Người dùng đăng tải) thuộc quyền sở hữu toàn vẹn và duy nhất
        của VNGO và/hoặc được cấp phép hợp pháp cho VNGO sử dụng bao gồm cả các
        phiên bản cập nhật, nâng cấp.
      </Text>
      <Text style={styles.content}>
        17.2. Đối với các nội dung do Người dùng đăng tải, chia sẻ trên Mạng xã
        hội Zalo, Người dùng phải tự chịu trách nhiệm về tính hợp pháp và các
        trách nhiệm pháp lý với các nội dung, thông tin, hình ảnh, âm thanh và
        bất kỳ sự chia sẻ nào khác. Tuy nhiên, trong mọi trường hợp, Mạng xã hội
        Zalo vẫn được bảo lưu quyền xử lý các thông tin đăng tải, phù hợp với
        thuần phong mỹ tục, các quy tắc đạo đức và các quy tắc đảm bảo an ninh
        quốc gia, và có toàn quyền
      </Text>

      <Text style={styles.content}>
        cho phép hoặc không cho phép nội dung của Người dùng xuất hiện hoặc tồn
        tại trên Mạng xã hội Zalo.
      </Text>
      <Text style={styles.content}>
        17.3. VNGO có toàn quyền, bao gồm nhưng không giới hạn trong các quyền
        tác giả, nhãn hiệu, kiểu dáng công nghiệp, bí mật kinh doanh và các
        quyền Sở Hữu Trí Tuệ khác trong dịch vụ Mạng xã hội Zalo của VNGO. Việc
        sử dụng quyền và sở hữu của VNGO cần phải được VNGO cho phép trước bằng
        văn bản. Ngoài việc được cấp phép bằng văn bản, VNGO không cấp phép dưới
        bất kỳ hình thức nào khác cho dù đó là hình thức công bố hay hàm ý để
        Người dùng thực hiện các quyền trên. Và do vậy, Người dùng không có
        quyền sử dụng dịch vụ của chúng tôi vào mục đích thương mại mà không có
        sự cho phép bằng văn bản của chúng tôi trước đó.
      </Text>
      <Text style={styles.content}>
        17.4. VNGO chủ động kiểm tra và gỡ bỏ các nội dung vi phạm bản quyền căn
        cứ vào các báo cáo vi phạm trước đó và cơ sở dữ liệu về nội dung vi phạm
        có bản quyền.
      </Text>

      <Text style={styles.sectionTitle}>Điều 18: Hiệu lực của thỏa thuận</Text>
      <Text style={styles.content}>
        18.1 Khi cần thiết, Chúng tôi có thể sửa đổi, cập nhật hoặc điều chỉnh
        các nội dung trong Thoả thuận này tại bất cứ thời điểm nào, và phiên bản
        mới nhất của Thoả thuận sẽ được đăng tải trên Nền tảng chính thức của
        chúng tôi. Bạn đồng ý rằng sẽ định kỳ kiểm tra tại mục Điều khoản sử
        dụng trên Nền tảng để luôn được tiếp cận với phiên bản được cập nhật gần
        nhất.
      </Text>
      <Text style={styles.content}>
        18.2 Trong trường hợp một hoặc một số điều khoản Thỏa Thuận cung cấp và
        sử dụng dịch vụ Mạng xã hội Zalo này xung đột với các quy định của luật
        pháp Việt Nam, điều khoản đó sẽ được chỉnh sửa cho phù hợp với quy định
        pháp luật hiện hành, phần còn lại của Thỏa Thuận vẫn giữ nguyên giá trị.
      </Text>
      <Text style={styles.content}>
        Trân trọng cảm ơn Người dùng đã sử dụng Sản phẩm và Dịch vụ của VNGO.
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

export default SocialNetworkTerms;

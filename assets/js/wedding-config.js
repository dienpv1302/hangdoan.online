/* =========================================================================
   CẤU HÌNH ĐÁM CƯỚI — CHỈ CẦN SỬA FILE NÀY
   Dùng chung cho index.html và invitation.html.
   ========================================================================= */

/* --- 1. LINK GOOGLE MAPS ------------------------------------------------
   Cách lấy link: mở Google Maps > tìm địa điểm > Chia sẻ (Share) >
   Sao chép đường liên kết. Dán link đó vào giữa hai dấu nháy bên dưới.     */
var WEDDING_MAPS = {
    // NHÀ GÁI - Xóm Bắc Bồi, Xã Hải Minh, Huyện Hải Hậu, Tỉnh Nam Định
    // Toạ độ: 20°14'55.9"N 106°15'27.1"E  (20.2488723, 106.2575322)
    'nha-gai': 'https://www.google.com/maps/search/?api=1&query=20.2488723,106.2575322',

    // Link Google Maps của NHÀ TRAI (Xóm 32, Xã Hải Minh, Huyện Hải Hậu)
    'nha-trai': 'https://maps.app.goo.gl/AHfvJBQJt8uPPumu7'
};

/* --- 2. THÔNG TIN MỪNG CƯỚI (mã QR) -------------------------------------
   qrImage : đường dẫn tới ảnh mã QR (đặt ảnh trong assets/images/)
   bank    : tên ngân hàng
   owner   : tên chủ tài khoản (viết IN HOA như trên thẻ)
   account : số tài khoản
   Để trống ('') dòng nào thì dòng đó tự động không hiển thị.              */
var WEDDING_GIFT = {
    title: 'Hộp mừng cưới',
    message: 'Cảm ơn bạn đã dành cho chúng mình những lời chúc và tình cảm quý giá. ' +
             'Sự hiện diện của bạn đã là món quà lớn nhất rồi ♥',
    // Chú ý viết đúng chữ hoa/thường: máy chủ Linux phân biệt QR.jpg với qr.jpg
    qrImage: 'assets/images/QR.jpg',

    // Lấy theo đúng thông tin in trên ảnh QR
    bank: 'MB Bank (Ngân hàng Quân đội)',
    owner: 'NGUYEN THI HANG',
    account: '0336637575'
};

/* --- 3. NGÀY CƯỚI (dùng cho bảng lịch) ----------------------------------
   date       : ngày lễ thành hôn, viết dạng 'yyyy-mm-dd'
   highlights : các ngày được tô đậm trên lịch (lễ nhà gái, lễ thành hôn)
   Thứ trong tuần được tính tự động nên không lo ghi nhầm.                  */
var WEDDING_DAY = {
    date: '2026-12-20',
    highlights: [
        { day: '2026-12-19', label: 'Lễ nhà gái' },
        { day: '2026-12-20', label: 'Lễ thành hôn' }
    ]
};

/* --- 4. LỜI NGỎ CỦA CÔ DÂU & CHÚ RỂ ------------------------------------- */
var WEDDING_INTRO = {
    groom: 'Xin chào mọi người, mình là một kỹ sư IT. Công việc giúp mình rèn luyện tư duy ' +
           'logic, sự kiên trì và tinh thần trách nhiệm trong mọi việc. Hôm nay, mình vô cùng ' +
           'hạnh phúc khi được nắm tay người mình yêu bước vào một chặng đường mới. Xin chân ' +
           'thành cảm ơn gia đình, người thân và bạn bè đã có mặt để chung vui và chúc phúc ' +
           'cho chúng mình.',
    bride: 'Xin chào mọi người, mình là một bác sĩ. Công việc đã dạy mình sự tận tâm, trách ' +
           'nhiệm và luôn biết trân trọng những giá trị của cuộc sống. Hôm nay, mình rất hạnh ' +
           'phúc khi được cùng người mình yêu bước sang một hành trình mới. Xin cảm ơn gia ' +
           'đình, người thân và bạn bè đã đến chung vui và chúc phúc cho chúng mình.'
};

/* --- 5. ALBUM ẢNH CƯỚI (trang gallery.html) -----------------------------
   Ảnh gốc nằm ở assets/images/all_image/ (giữ nguyên, không dùng cho web vì
   quá nặng). Hai thư mục thumb/ và large/ là bản đã thu nhỏ để tải nhanh.

   Muốn THÊM ảnh mới:
     1. Chép ảnh gốc vào assets/images/all_image/
     2. Chạy lại script thu nhỏ ảnh (xem README-anh.md)
     3. Thêm tên file vào danh sách photos bên dưới
   Thứ tự trong danh sách chính là thứ tự hiển thị trên trang.              */
var WEDDING_ALBUM = {
    thumbDir: 'assets/images/all_image/thumb/',
    largeDir: 'assets/images/all_image/large/',
    photos: [
        'B.jpg',
        'DUY_8351.jpg',
        'DUY_8361.jpg',
        'DUY_8369.jpg',
        'DUY_8376.jpg',
        'DUY_8398.jpg',
        'DUY_8400.jpg',
        'DUY_8435.jpg',
        'DUY_8491.jpg',
        'DUY_8504.jpg',
        'DUY_8553.jpg',
        'DUY_8600.jpg',
        'DUY_8635.jpg',
        'DUY_8639.jpg',
        'DUY_8645.jpg',
        'DUY_8703.jpg',
        'DUY_8729.jpg',
        'DUY_8834.jpg',
        'DUY_8856.jpg',
        'DUY_8884.jpg',
        'DUY_8930.jpg',
        'DUY_8939.jpg',
        'DUY_8954.jpg',
        'DUY_8964.jpg',
        'DUY_9107.jpg',
        'DUY_9191.jpg'
    ]
};

/* --- 5b. 4 ẢNH XEM TRƯỚC Ở TRANG CHỦ ------------------------------------
   Mục "Ảnh cưới" hiện 4 ô, mỗi ô gắn với một nhóm phông nền riêng nên lúc nào
   cũng đủ 4 phông khác nhau. Cứ sau `interval` mili giây thì một ô đổi sang
   ảnh khác trong cùng nhóm của nó (mờ dần sang ảnh mới, lần lượt từng ô).
   Muốn tắt tự đổi: đặt interval = 0.                                       */
var WEDDING_PREVIEW = {
    interval: 3000,

    // Cứ mỗi `interval` mili giây, một nhóm ô được chọn ngẫu nhiên (2 tới 4 ô)
    // sẽ đảo vị trí cho nhau - phông nền đi theo ảnh sang ô mới, đồng thời một
    // ô trong nhóm đó lấy luôn ảnh khác cùng phông. Số ô mỗi lượt khác nhau
    // nên nhìn không bị đều đặn máy móc. Đặt interval = 0 để tắt hẳn.

    groups: [
        {
            name: 'Nền đỏ chữ Hỷ',
            photos: ['B.jpg', 'DUY_8703.jpg', 'DUY_8834.jpg', 'DUY_8856.jpg',
                     'DUY_8729.jpg', 'DUY_8884.jpg']
        },
        {
            name: 'Nền xanh olive',
            photos: ['DUY_8351.jpg', 'DUY_8361.jpg', 'DUY_8369.jpg', 'DUY_8376.jpg',
                     'DUY_8398.jpg', 'DUY_8400.jpg', 'DUY_8435.jpg', 'DUY_9107.jpg']
        },
        {
            name: 'Nền xám studio',
            photos: ['DUY_8491.jpg', 'DUY_8504.jpg', 'DUY_8553.jpg', 'DUY_8600.jpg',
                     'DUY_8635.jpg', 'DUY_8639.jpg', 'DUY_8645.jpg']
        },
        {
            name: 'Nền rèm trắng',
            photos: ['DUY_8930.jpg', 'DUY_8939.jpg', 'DUY_8954.jpg', 'DUY_8964.jpg',
                     'DUY_9191.jpg']
        }
    ]
};

/* --- 6. XÁC NHẬN THAM DỰ (RSVP) -----------------------------------------
   Web tĩnh không tự lưu được dữ liệu, nên form gửi về một bảng Google Sheets
   của bạn. Các bước lấy đường dẫn xem trong README-rsvp.md (làm 1 lần, ~5 phút).

   Khi endpoint còn để trống, form vẫn hiện nhưng bấm gửi sẽ báo lỗi rõ ràng
   thay vì im lặng làm mất dữ liệu của khách.                                */
var WEDDING_RSVP = {
    // TODO: dán đường dẫn Google Apps Script vào đây
    // Dạng: https://script.google.com/macros/s/AKfycb....../exec
    
    endpoint: 'https://script.google.com/macros/s/AKfycbxchcQz4UPt5VEw0HHVO9QLTBTsCdG2AIzhi_vFvke2YbpI6kbeT_R9mngcNciiSUk_kQ/exec',

    deadline: 'trước ngày 10/12/2026',

    // Khách chọn cách đi tới đám cưới
    transports: [
        'Tự di chuyển',
        'Đi xe tuyến tại số 3 Lê Quang Đạo'
    ]
};

/* --- 7. LỜI CHÚC MẪU ----------------------------------------------------
   Những lời chúc hiển thị sẵn khi khách mở trang. Thêm / bớt tuỳ ý.       */
var WEDDING_DEFAULT_WISHES = [
    { name: 'Gia đình hai bên', message: 'Chúc hai con trăm năm hạnh phúc, sớm sinh quý tử, mãi mãi yêu thương nhau.' },
    { name: 'Hội bạn thân', message: 'Cưới rồi nhớ giữ phong độ nhé! Chúc hai vợ chồng luôn vui vẻ, đủ đầy và đi du lịch thật nhiều.' },
    { name: 'Đồng nghiệp', message: 'Chúc mừng hạnh phúc! Chúc anh chị một mái ấm ngập tràn tiếng cười và bình an.' }
];

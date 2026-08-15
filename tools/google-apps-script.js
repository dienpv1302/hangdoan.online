/**
 * NHẬN XÁC NHẬN THAM DỰ (RSVP) VÀO GOOGLE SHEETS
 *
 * Đây KHÔNG phải file của website. Bạn copy toàn bộ nội dung file này rồi dán
 * vào Google Apps Script của bảng tính. Xem hướng dẫn từng bước ở README-rsvp.md
 */

var SHEET_NAME = 'RSVP';

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }

    // Lần đầu chạy thì tạo dòng tiêu đề
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Thời gian gửi', 'Họ tên', 'Điện thoại', 'Tham dự',
        'Phương tiện', 'Lời nhắn'
      ]);
      sheet.getRange(1, 1, 1, 6).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    var p = (e && e.parameter) ? e.parameter : {};

    sheet.appendRow([
      new Date(),
      p.name || '',
      p.phone || '',
      p.attend || '',
      p.transport || '',
      p.message || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/** Mở đường dẫn /exec bằng trình duyệt sẽ thấy dòng này -> biết là đã chạy được */
function doGet() {
  return ContentService
    .createTextOutput('RSVP endpoint dang hoat dong.')
    .setMimeType(ContentService.MimeType.TEXT);
}

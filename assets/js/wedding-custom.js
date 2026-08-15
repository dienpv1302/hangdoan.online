/* =========================================================================
   Logic bổ sung: link Google Maps + Lời chúc + Hộp mừng cưới (QR)
   Mọi nội dung cần sửa nằm ở assets/js/wedding-config.js
   ========================================================================= */
(function () {
    'use strict';

    var STORAGE_KEY = 'wedding_wishes_v1';

    /* ---------------------------------------------------------------
       1. Gán link Google Maps cho mọi thẻ <a data-map="...">
       --------------------------------------------------------------- */
    function applyMapLinks() {
        if (typeof WEDDING_MAPS === 'undefined') return;

        var links = document.querySelectorAll('a[data-map]');
        for (var i = 0; i < links.length; i++) {
            var url = WEDDING_MAPS[links[i].getAttribute('data-map')];
            if (url) {
                links[i].href = url;
                links[i].target = '_blank';
                links[i].rel = 'noopener';
            }
        }
    }

    /* ---------------------------------------------------------------
       2. Bảng lịch tháng cưới — tự tính thứ nên không sợ ghi nhầm
       --------------------------------------------------------------- */
    var WEEKDAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    var WEEKDAY_FULL = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

    function parseDay(text) {
        var parts = String(text).split('-');
        return new Date(+parts[0], +parts[1] - 1, +parts[2]);
    }

    function pad2(n) {
        return (n < 10 ? '0' : '') + n;
    }

    function formatDay(date) {
        return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate());
    }

    // Thứ Hai = 0 ... Chủ Nhật = 6, đúng thói quen xem lịch của người Việt
    function mondayIndex(date) {
        return (date.getDay() + 6) % 7;
    }

    function initCalendar() {
        var host = document.getElementById('wedding-calendar');
        if (!host || typeof WEDDING_DAY === 'undefined') return;

        var target = parseDay(WEDDING_DAY.date);
        if (isNaN(target.getTime())) return;

        var marks = {};
        var highlights = WEDDING_DAY.highlights || [];
        for (var h = 0; h < highlights.length; h++) {
            marks[highlights[h].day] = highlights[h].label || '';
        }

        var year = target.getFullYear();
        var month = target.getMonth();
        var firstDay = new Date(year, month, 1);
        var totalDays = new Date(year, month + 1, 0).getDate();
        var leading = mondayIndex(firstDay);

        var table = document.createElement('table');
        table.className = 'wedding-calendar-table';

        var caption = document.createElement('caption');
        caption.textContent = 'Tháng ' + (month + 1) + ' năm ' + year;
        table.appendChild(caption);

        var thead = document.createElement('thead');
        var headRow = document.createElement('tr');
        for (var w = 0; w < WEEKDAY_LABELS.length; w++) {
            var th = document.createElement('th');
            th.scope = 'col';
            th.textContent = WEEKDAY_LABELS[w];
            headRow.appendChild(th);
        }
        thead.appendChild(headRow);
        table.appendChild(thead);

        var tbody = document.createElement('tbody');
        var row = document.createElement('tr');
        var cell;

        for (var b = 0; b < leading; b++) {
            cell = document.createElement('td');
            cell.className = 'is-empty';
            row.appendChild(cell);
        }

        for (var d = 1; d <= totalDays; d++) {
            if (row.children.length === 7) {
                tbody.appendChild(row);
                row = document.createElement('tr');
            }

            var current = new Date(year, month, d);
            var key = formatDay(current);

            cell = document.createElement('td');
            cell.textContent = d;

            if (Object.prototype.hasOwnProperty.call(marks, key)) {
                cell.className = 'is-marked';
                if (marks[key]) {
                    cell.title = marks[key] + ' - ' + WEEKDAY_FULL[current.getDay()];
                }
            }

            row.appendChild(cell);
        }

        while (row.children.length < 7) {
            cell = document.createElement('td');
            cell.className = 'is-empty';
            row.appendChild(cell);
        }
        tbody.appendChild(row);
        table.appendChild(tbody);

        host.innerHTML = '';
        host.appendChild(table);

        // Chú thích dưới lịch: ngày nào, thứ mấy
        if (highlights.length) {
            var legend = document.createElement('ul');
            legend.className = 'wedding-calendar-legend';

            for (var i = 0; i < highlights.length; i++) {
                var date = parseDay(highlights[i].day);
                if (isNaN(date.getTime())) continue;

                var item = document.createElement('li');
                item.textContent = (highlights[i].label ? highlights[i].label + ': ' : '') +
                    WEEKDAY_FULL[date.getDay()] + ', ngày ' + date.getDate() +
                    ' tháng ' + (date.getMonth() + 1) + ' năm ' + date.getFullYear();
                legend.appendChild(item);
            }

            host.appendChild(legend);
        }
    }

    /* ---------------------------------------------------------------
       3. Lời ngỏ của cô dâu & chú rể
       --------------------------------------------------------------- */
    function initIntro() {
        if (typeof WEDDING_INTRO === 'undefined') return;

        var groom = document.getElementById('groom-intro');
        var bride = document.getElementById('bride-intro');
        if (groom && WEDDING_INTRO.groom) groom.textContent = WEDDING_INTRO.groom;
        if (bride && WEDDING_INTRO.bride) bride.textContent = WEDDING_INTRO.bride;
    }

    /* ---------------------------------------------------------------
       4. Album ảnh cưới + khung xem ảnh phóng to
       --------------------------------------------------------------- */
    // Khung xem ảnh phóng to, dùng chung cho trang album và 4 ảnh xem trước
    var viewerApi = null;
    function getViewer() {
        if (viewerApi !== null) return viewerApi;

        var box = document.getElementById('album-viewer');
        var viewerImg = document.getElementById('album-viewer-img');
        if (!box || !viewerImg) { viewerApi = false; return false; }

        var counter = document.getElementById('album-counter');
        var list = [];
        var dir = '';
        var current = -1;

        function show(index) {
            if (!list.length) return;
            if (index < 0) index = list.length - 1;
            if (index >= list.length) index = 0;
            current = index;

            viewerImg.src = dir + list[current];
            viewerImg.alt = 'Ảnh cưới ' + (current + 1);
            if (counter) counter.textContent = (current + 1) + ' / ' + list.length;
        }

        function close() {
            box.hidden = true;
            viewerImg.removeAttribute('src');   // ngừng tải ảnh khi đã đóng
            document.body.classList.remove('gift-modal-open');
        }

        box.addEventListener('click', function (e) {
            var action = e.target.getAttribute('data-album');
            if (action === 'close') close();
            else if (action === 'prev') show(current - 1);
            else if (action === 'next') show(current + 1);
        });

        document.addEventListener('keydown', function (e) {
            if (box.hidden) return;
            if (e.key === 'Escape' || e.keyCode === 27) close();
            else if (e.key === 'ArrowLeft' || e.keyCode === 37) show(current - 1);
            else if (e.key === 'ArrowRight' || e.keyCode === 39) show(current + 1);
        });

        // Vuốt trái/phải trên điện thoại
        var touchX = null;
        box.addEventListener('touchstart', function (e) {
            touchX = e.changedTouches[0].clientX;
        }, { passive: true });

        box.addEventListener('touchend', function (e) {
            if (touchX === null) return;
            var delta = e.changedTouches[0].clientX - touchX;
            if (delta > 50) show(current - 1);
            else if (delta < -50) show(current + 1);
            touchX = null;
        }, { passive: true });

        viewerApi = {
            open: function (photos, largeDir, index) {
                list = photos;
                dir = largeDir;
                show(index);
                box.hidden = false;
                document.body.classList.add('gift-modal-open');
            }
        };
        return viewerApi;
    }

    function initAlbum() {
        var grid = document.getElementById('album-grid');
        if (!grid || typeof WEDDING_ALBUM === 'undefined') return;

        var photos = WEDDING_ALBUM.photos || [];
        var thumbDir = WEDDING_ALBUM.thumbDir || '';
        var largeDir = WEDDING_ALBUM.largeDir || '';

        for (var i = 0; i < photos.length; i++) {
            var item = document.createElement('button');
            item.type = 'button';
            item.className = 'album-item';
            item.setAttribute('data-index', i);
            item.setAttribute('aria-label', 'Xem ảnh ' + (i + 1));

            var img = document.createElement('img');
            img.src = thumbDir + photos[i];
            img.alt = 'Ảnh cưới ' + (i + 1);
            img.loading = 'lazy';          // chỉ tải khi cuộn tới
            img.decoding = 'async';

            item.appendChild(img);
            grid.appendChild(item);
        }

        var total = document.getElementById('album-total');
        if (total) total.textContent = photos.length;

        grid.addEventListener('click', function (e) {
            var item = e.target.closest ? e.target.closest('.album-item') : null;
            if (!item) return;
            var viewer = getViewer();
            if (viewer) {
                viewer.open(photos, largeDir, parseInt(item.getAttribute('data-index'), 10) || 0);
            }
        });
    }

    /* ---------------------------------------------------------------
       4b. Bốn ảnh xem trước ở trang chủ, tự đổi theo thời gian
       Mỗi ô gắn cứng với một nhóm phông nền nên lúc nào cũng đủ 4 phông
       khác nhau; cứ tới lượt thì một ô đổi sang ảnh khác cùng nhóm.
       --------------------------------------------------------------- */
    function initPreview() {
        var slots = document.querySelectorAll('.preview-item');
        if (!slots.length) return;
        if (typeof WEDDING_PREVIEW === 'undefined' || typeof WEDDING_ALBUM === 'undefined') return;

        var groups = WEDDING_PREVIEW.groups || [];
        if (!groups.length) return;

        var thumbDir = WEDDING_ALBUM.thumbDir || '';
        var largeDir = WEDDING_ALBUM.largeDir || '';
        var order = [];         // ô thứ i đang giữ nhóm phông nền nào
        var showing = [];       // tên ảnh đang hiện ở từng ô
        var layers = [];        // hai lớp ảnh chồng nhau của từng ô

        // Mỗi nhóm nhớ lại mấy tấm vừa hiện để không bị lặp lại sớm
        var recent = [];
        var RECENT_KEEP = 3;

        function pickFresh(groupIndex, avoid) {
            var group = groups[groupIndex];
            var photos = (group && group.photos) || [];
            if (!photos.length) return null;
            if (photos.length === 1) return photos[0];

            if (!recent[groupIndex]) recent[groupIndex] = [];
            var used = recent[groupIndex];

            // Ưu tiên những tấm chưa dùng trong vài lượt gần đây
            var pool = [];
            for (var i = 0; i < photos.length; i++) {
                if (used.indexOf(photos[i]) === -1) pool.push(photos[i]);
            }

            // Hết ảnh mới thì xóa lịch sử, chỉ cần khác tấm đang hiện
            if (!pool.length) {
                recent[groupIndex] = [];
                for (var j = 0; j < photos.length; j++) {
                    if (photos[j] !== avoid) pool.push(photos[j]);
                }
            }
            if (!pool.length) pool = photos;

            var name = pool[Math.floor(Math.random() * pool.length)];
            recent[groupIndex].push(name);
            while (recent[groupIndex].length > RECENT_KEEP) recent[groupIndex].shift();
            return name;
        }

        // Mỗi ô có hai thẻ ảnh chồng lên nhau. Đổi ảnh bằng cách nạp ảnh mới
        // vào lớp đang ẩn rồi cho nó hiện dần đè lên lớp cũ (cross-fade),
        // nên không bao giờ thấy khoảng trống giữa hai ảnh.
        function setupLayers(idx) {
            var first = slots[idx].querySelector('img');
            if (!first) return null;

            var second = first.cloneNode(false);
            second.removeAttribute('src');
            second.style.opacity = '0';
            first.style.opacity = '1';
            first.parentNode.insertBefore(second, first.nextSibling);

            return { imgs: [first, second], front: 0 };
        }

        function applyPhoto(idx, animate) {
            var pair = layers[idx];
            var group = groups[order[idx]];
            var name = showing[idx];
            if (!pair || !group || !name) return;

            slots[idx].setAttribute('data-group', order[idx]);

            var current = pair.imgs[pair.front];
            var next = pair.imgs[1 - pair.front];
            var url = thumbDir + name;
            var label = 'Ảnh cưới - ' + (group.name || '');

            if (!animate) {
                current.src = url;
                current.alt = label;
                return;
            }

            var swap = function () {
                next.alt = label;
                next.style.opacity = '1';
                current.style.opacity = '0';
                pair.front = 1 - pair.front;
            };

            var loader = new Image();
            loader.onload = function () {
                next.src = url;
                // đợi trình duyệt vẽ xong ảnh mới rồi mới bắt đầu chuyển
                if (window.requestAnimationFrame) {
                    window.requestAnimationFrame(function () {
                        window.requestAnimationFrame(swap);
                    });
                } else {
                    setTimeout(swap, 30);
                }
            };
            loader.onerror = function () { next.src = url; swap(); };
            loader.src = url;
        }

        // Khởi đầu: xáo thứ tự các nhóm rồi rải vào 4 ô
        for (var g = 0; g < groups.length; g++) order.push(g);
        for (var k = order.length - 1; k > 0; k--) {
            var j = Math.floor(Math.random() * (k + 1));
            var tmp = order[k]; order[k] = order[j]; order[j] = tmp;
        }

        for (var i = 0; i < slots.length; i++) {
            if (i >= order.length) order[i] = order[i % groups.length];
            var grp = groups[order[i]];
            if (!grp || !grp.photos || !grp.photos.length) continue;

            layers[i] = setupLayers(i);
            showing[i] = pickFresh(order[i], null);
            applyPhoto(i, false);
        }

        // Bấm vào ô thì mở khung xem lớn với đúng nhóm ảnh đang ở ô đó
        for (var sIdx = 0; sIdx < slots.length; sIdx++) {
            (function (idx) {
                slots[idx].addEventListener('click', function () {
                    var grp = groups[order[idx]];
                    var photos = (grp && grp.photos) || [];
                    if (!photos.length) return;

                    var pos = photos.indexOf(showing[idx]);
                    var viewer = getViewer();
                    if (viewer) viewer.open(photos, largeDir, pos < 0 ? 0 : pos);
                });
            })(sIdx);
        }

        var interval = WEDDING_PREVIEW.interval;
        if (!interval || interval < 500) return;   // đặt 0 để tắt tự đổi

        // Mỗi lượt: chọn ngẫu nhiên một nhóm ô rồi đảo vị trí của chúng cho nhau
        // (phông nền đi theo ảnh sang ô mới), đồng thời một ô trong số đó đổi
        // hẳn sang ảnh khác cùng phông. Số ô mỗi lượt thay đổi ngẫu nhiên nên
        // nhìn không bị đều đặn máy móc.
        function shuffleArray(arr) {
            for (var i = arr.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
            }
            return arr;
        }

        setInterval(function () {
            if (slots.length < 2) return;

            // Chọn ngẫu nhiên 2 tới 4 ô
            var pool = [];
            for (var i = 0; i < slots.length; i++) pool.push(i);
            shuffleArray(pool);

            var count = 2 + Math.floor(Math.random() * (slots.length - 1));
            var chosen = pool.slice(0, count);

            // Đảo vị trí các phông nền giữa những ô đó
            var packs = [];
            for (var c = 0; c < chosen.length; c++) packs.push(order[chosen[c]]);

            var before = packs.slice();
            shuffleArray(packs);

            var moved = false;
            for (var m = 0; m < packs.length; m++) {
                if (packs[m] !== before[m]) { moved = true; break; }
            }
            if (!moved && packs.length > 1) {
                var sw = packs[0]; packs[0] = packs[1]; packs[1] = sw;
            }

            // Mọi ô được chọn đều lấy ảnh MỚI, không phải bê ảnh cũ sang ô khác
            for (var t = 0; t < chosen.length; t++) {
                var slot = chosen[t];
                order[slot] = packs[t];
                showing[slot] = pickFresh(packs[t], showing[slot]);
                applyPhoto(slot, true);
            }
        }, interval);
    }

    /* ---------------------------------------------------------------
       5. Lời chúc — lưu trong localStorage của trình duyệt khách
       --------------------------------------------------------------- */
    function readStoredWishes() {
        try {
            var raw = window.localStorage.getItem(STORAGE_KEY);
            var list = raw ? JSON.parse(raw) : [];
            return Object.prototype.toString.call(list) === '[object Array]' ? list : [];
        } catch (e) {
            return []; // localStorage bị chặn (chế độ ẩn danh) hoặc dữ liệu hỏng
        }
    }

    function writeStoredWishes(list) {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
            return true;
        } catch (e) {
            return false;
        }
    }

    // Dựng thẻ bằng textContent nên nội dung khách nhập luôn hiển thị
    // dưới dạng văn bản thuần, không thể chèn HTML/script.
    function buildWishCard(wish, index, isMine) {
        var card = document.createElement('div');
        card.className = 'wish-card';

        var message = document.createElement('p');
        message.className = 'wish-message';
        message.textContent = wish.message;
        card.appendChild(message);

        var name = document.createElement('p');
        name.className = 'wish-name';
        name.textContent = wish.name;
        card.appendChild(name);

        if (isMine) {
            var remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'wish-remove';
            remove.setAttribute('aria-label', 'Xoá lời chúc này');
            remove.setAttribute('data-index', index);
            remove.innerHTML = '&times;';
            card.appendChild(remove);
        }

        return card;
    }

    function renderWishes() {
        var listEl = document.getElementById('wishes-list');
        if (!listEl) return;

        var mine = readStoredWishes();
        var defaults = (typeof WEDDING_DEFAULT_WISHES !== 'undefined') ? WEDDING_DEFAULT_WISHES : [];

        listEl.innerHTML = '';

        // Lời chúc của khách hiện lên trước, mới nhất trên cùng
        for (var i = mine.length - 1; i >= 0; i--) {
            listEl.appendChild(buildWishCard(mine[i], i, true));
        }
        for (var j = 0; j < defaults.length; j++) {
            listEl.appendChild(buildWishCard(defaults[j], j, false));
        }

        if (!listEl.children.length) {
            var empty = document.createElement('p');
            empty.className = 'wishes-empty';
            empty.textContent = 'Hãy là người đầu tiên gửi lời chúc nhé!';
            listEl.appendChild(empty);
        }
    }

    function setNote(text, isError) {
        var note = document.getElementById('wishes-note');
        if (!note) return;
        note.textContent = text;
        note.className = isError ? 'wishes-note is-error' : 'wishes-note';
    }

    function initWishes() {
        var form = document.getElementById('wishes-form');
        if (!form) return;

        renderWishes();

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            var nameEl = document.getElementById('wish-name');
            var messageEl = document.getElementById('wish-message');
            var name = nameEl.value.replace(/\s+/g, ' ').trim();
            var message = messageEl.value.trim();

            if (!name) {
                setNote('Bạn cho chúng mình xin tên với nhé!', true);
                nameEl.focus();
                return;
            }
            if (!message) {
                setNote('Bạn chưa viết lời chúc rồi.', true);
                messageEl.focus();
                return;
            }

            var list = readStoredWishes();
            list.push({ name: name.slice(0, 40), message: message.slice(0, 300) });

            if (!writeStoredWishes(list)) {
                setNote('Trình duyệt đang chặn lưu dữ liệu nên lời chúc không giữ lại được.', true);
                return;
            }

            messageEl.value = '';
            setNote('Cảm ơn ' + name + ' đã gửi lời chúc ♥');
            renderWishes();
        });

        // Xoá lời chúc do chính khách vừa gửi
        var listEl = document.getElementById('wishes-list');
        listEl.addEventListener('click', function (e) {
            var btn = e.target.closest ? e.target.closest('.wish-remove') : null;
            if (!btn) return;

            var index = parseInt(btn.getAttribute('data-index'), 10);
            var list = readStoredWishes();
            if (isNaN(index) || index < 0 || index >= list.length) return;

            list.splice(index, 1);
            writeStoredWishes(list);
            setNote('');
            renderWishes();
        });
    }

    /* ---------------------------------------------------------------
       6. Xác nhận tham dự (RSVP) — gửi về Google Sheets
       --------------------------------------------------------------- */
    function encodeForm(data) {
        var parts = [];
        for (var key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
            }
        }
        return parts.join('&');
    }

    function setRsvpNote(text, isError) {
        var note = document.getElementById('rsvp-note');
        if (!note) return;
        note.textContent = text;
        note.className = isError ? 'wishes-note is-error' : 'wishes-note';
    }

    function initRsvp() {
        var form = document.getElementById('rsvp-form');
        if (!form || typeof WEDDING_RSVP === 'undefined') return;

        // Đổ danh sách phương tiện vào ô chọn
        var transportSelect = document.getElementById('rsvp-transport');
        var transports = WEDDING_RSVP.transports || [];
        if (transportSelect) {
            for (var i = 0; i < transports.length; i++) {
                var opt = document.createElement('option');
                opt.value = transports[i];
                opt.textContent = transports[i];
                transportSelect.appendChild(opt);
            }
        }

        var deadlineEl = document.getElementById('rsvp-deadline');
        if (deadlineEl && WEDDING_RSVP.deadline) {
            deadlineEl.textContent = WEDDING_RSVP.deadline;
        }

        // Khách không tới được thì không cần hỏi đi bằng gì
        var transportRow = document.getElementById('rsvp-transport-row');
        form.addEventListener('change', function (e) {
            if (e.target.name !== 'attend') return;
            if (transportRow) {
                transportRow.style.display = e.target.value === 'Có' ? '' : 'none';
            }
        });

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            var nameEl = document.getElementById('rsvp-name');
            var name = nameEl.value.replace(/\s+/g, ' ').trim();
            if (!name) {
                setRsvpNote('Bạn cho chúng mình xin họ tên với nhé!', true);
                nameEl.focus();
                return;
            }

            var attendEl = form.querySelector('input[name="attend"]:checked');
            if (!attendEl) {
                setRsvpNote('Bạn chọn giúp là có tới được hay không nhé.', true);
                return;
            }

            var endpoint = WEDDING_RSVP.endpoint;
            if (!endpoint) {
                setRsvpNote('Chưa cấu hình nơi nhận xác nhận. Chủ nhà xem hướng dẫn trong README-rsvp.md.', true);
                return;
            }

            var payload = {
                name: name,
                phone: document.getElementById('rsvp-phone').value.trim(),
                attend: attendEl.value,
                transport: attendEl.value === 'Có' && transportSelect ? transportSelect.value : '',
                message: document.getElementById('rsvp-message').value.trim()
            };

            var button = form.querySelector('button[type="submit"]');
            if (button) button.disabled = true;
            setRsvpNote('Đang gửi...');

            // Gửi dạng form-urlencoded để Google Apps Script đọc được qua e.parameter.
            // Dùng no-cors nên trình duyệt không cho đọc phản hồi — coi như đã gửi
            // nếu không có lỗi mạng.
            var body = encodeForm(payload);
            var done = function () {
                if (button) button.disabled = false;
                setRsvpNote('Cảm ơn ' + name + ' đã xác nhận. Hẹn gặp bạn trong ngày vui ♥');
                form.reset();
                if (transportRow) transportRow.style.display = '';
            };
            var fail = function () {
                if (button) button.disabled = false;
                setRsvpNote('Gửi chưa được, bạn kiểm tra lại mạng hoặc nhắn trực tiếp cho gia đình giúp mình nhé.', true);
            };

            if (window.fetch) {
                window.fetch(endpoint, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
                    body: body
                }).then(done, fail);
                return;
            }

            var xhr = new XMLHttpRequest();
            xhr.open('POST', endpoint, true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
            xhr.onload = done;
            xhr.onerror = done;   // CORS chặn đọc phản hồi nhưng dữ liệu vẫn tới nơi
            xhr.send(body);
        });
    }

    /* ---------------------------------------------------------------
       7. Hộp mừng cưới — popup mã QR
       --------------------------------------------------------------- */
    function fillGiftRow(rowId, valueId, value) {
        var row = document.getElementById(rowId);
        var valueEl = document.getElementById(valueId);
        if (!row || !valueEl) return;
        if (!value) {
            row.style.display = 'none';   // để trống trong config thì ẩn dòng
            return;
        }
        valueEl.textContent = value;
    }

    function initGift() {
        var modal = document.getElementById('gift-modal');
        if (!modal || typeof WEDDING_GIFT === 'undefined') return;

        var openBtn = document.getElementById('gift-open');
        var lastFocused = null;

        // Đổ nội dung từ config
        var titleEl = document.getElementById('gift-modal-title');
        var introEl = document.getElementById('gift-modal-intro');
        var imgEl = document.getElementById('gift-qr-img');
        if (titleEl && WEDDING_GIFT.title) titleEl.textContent = WEDDING_GIFT.title;
        if (introEl && WEDDING_GIFT.message) introEl.textContent = WEDDING_GIFT.message;
        if (imgEl && WEDDING_GIFT.qrImage) imgEl.src = WEDDING_GIFT.qrImage;

        fillGiftRow('gift-row-bank', 'gift-bank', WEDDING_GIFT.bank);
        fillGiftRow('gift-row-owner', 'gift-owner', WEDDING_GIFT.owner);
        fillGiftRow('gift-row-account', 'gift-account', WEDDING_GIFT.account);

        var copyBtn = document.getElementById('gift-copy');
        if (copyBtn && !WEDDING_GIFT.account) copyBtn.style.display = 'none';

        function openModal() {
            lastFocused = document.activeElement;
            modal.hidden = false;
            document.body.classList.add('gift-modal-open');
            var closeBtn = modal.querySelector('.gift-modal-close');
            if (closeBtn) closeBtn.focus();
        }

        function closeModal() {
            modal.hidden = true;
            document.body.classList.remove('gift-modal-open');
            if (copyBtn) copyBtn.textContent = 'Sao chép số tài khoản';
            if (lastFocused && lastFocused.focus) lastFocused.focus();
        }

        if (openBtn) openBtn.addEventListener('click', openModal);

        // Đóng khi bấm nút X hoặc nền mờ
        modal.addEventListener('click', function (e) {
            if (e.target.hasAttribute('data-gift-close')) closeModal();
        });

        document.addEventListener('keydown', function (e) {
            if (!modal.hidden && (e.key === 'Escape' || e.keyCode === 27)) closeModal();
        });

        // Sao chép số tài khoản
        if (copyBtn) {
            copyBtn.addEventListener('click', function () {
                var account = WEDDING_GIFT.account || '';
                var done = function () { copyBtn.textContent = 'Đã sao chép ♥'; };

                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(account).then(done, function () {
                        copyBtn.textContent = 'Không sao chép được, bạn nhập tay giúp mình nhé';
                    });
                    return;
                }

                // Trình duyệt cũ hoặc trang không chạy HTTPS
                var temp = document.createElement('textarea');
                temp.value = account;
                temp.setAttribute('readonly', '');
                temp.style.position = 'fixed';
                temp.style.opacity = '0';
                document.body.appendChild(temp);
                temp.select();
                try { document.execCommand('copy'); done(); } catch (err) { /* bỏ qua */ }
                document.body.removeChild(temp);
            });
        }
    }

    /* --------------------------------------------------------------- */
    function init() {
        applyMapLinks();
        initCalendar();
        initIntro();
        initAlbum();
        initPreview();
        initRsvp();
        initWishes();
        initGift();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

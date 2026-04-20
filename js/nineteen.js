/*
======================================================================
NINETEEN.JS - 19단 암기 기능 (v2)
======================================================================
## 챕터 구조 (세로 기준 - 열 기반)
  - 챕터 ID: "bA" = b열(승수) × 행 1~9
              "bB" = b열(승수) × 행 11~19
  - 예) "3A" → 1×3, 2×3, 3×3 ... 9×3
        "3B" → 11×3, 12×3 ... 19×3

## 출제 로직
  - 미출제 문제 → 가중치 HIGH
  - 오답률 높을수록 가중치 UP
  - 직전에 1회 등장한 문제 → 이후 5번 동안 제외 (cooldown)

## 히트맵 5단계
  0회 → 흰색(미시도)
  0~20% 오답률 → 초록 (레벨1)
  20~40%       → 연초록 (레벨2)
  40~60%       → 노랑 (레벨3)
  60~80%       → 주황 (레벨4)
  80~100%      → 빨강 (레벨5)
======================================================================
*/

// =============================================
// 1. 전역 상태
// =============================================
let ntStats = {};             // { "3x7": { correct, total } }
let ntSelectedChapters = new Set(); // "3A", "3B" 형태
let ntIsDragging = false;
let ntDragMode = null;        // 'select' | 'deselect'
let ntTestMode = false;
let ntCurrentQ = null;        // { a, b, answer }
let ntTableVisible = true;

// 쿨다운: 최근 출제된 문제를 추적 (key → 남은 제외 횟수)
let ntCooldown = {};          // { "3x7": 5 }
let ntQuestionCount = 0;      // 총 출제 횟수

// =============================================
// 2. localStorage 저장/불러오기
// =============================================
function ntSaveStats() {
    localStorage.setItem('ntStats', JSON.stringify(ntStats));
}
function ntLoadStats() {
    const saved = localStorage.getItem('ntStats');
    if (saved) ntStats = JSON.parse(saved);
}

// =============================================
// 3. 챕터 유틸 (열 기준 - b값 기반)
//
//  챕터 "bA" = 승수 b, 피승수 1~9  → 셀 (a=1~9,  b)
//  챕터 "bB" = 승수 b, 피승수 11~19 → 셀 (a=11~19, b)
// =============================================
function ntGetChapterCells(chapterId) {
    const b = parseInt(chapterId);          // 열(승수)
    const part = chapterId.slice(-1);       // 'A' | 'B'
    const rows = part === 'A'
        ? [1,2,3,4,5,6,7,8,9]
        : [11,12,13,14,15,16,17,18,19];
    return rows.map(a => ({ a, b }));
}

// 셀(a행, b열)이 속한 챕터 ID 반환
function ntGetCellChapter(a, b) {
    if (a === 10 || b === 10) return null; // 십자선 제외
    if (a >= 1  && a <= 9 ) return `${b}A`;
    if (a >= 11 && a <= 19) return `${b}B`;
    return null;
}

// =============================================
// 4. 히트맵 색상 (5단계)
// =============================================
function ntGetHeatColor(key) {
    const stat = ntStats[key];
    if (!stat || stat.total === 0) return null; // 미시도 → 색 없음

    const errRate = 1 - (stat.correct / stat.total);

    if (errRate <= 0.00) return 'rgba(16,  185, 129, 0.30)'; // Lv1 초록
    if (errRate < 0.20)  return 'rgba(52,  211, 153, 0.25)'; // Lv2 연초록
    if (errRate < 0.40)  return 'rgba(251, 191,  36, 0.35)'; // Lv3 노랑
    if (errRate < 0.60)  return 'rgba(249, 115,  22, 0.40)'; // Lv4 주황
    if (errRate < 0.80)  return 'rgba(239,  68,  68, 0.45)'; // Lv5 연빨강
    return                       'rgba(185,  28,  28, 0.55)'; // Lv6 짙은빨강
}

// =============================================
// 5. 표 렌더링
// =============================================
function ntRenderTable() {
    const wrap = document.getElementById('nt-table-wrap');
    if (!wrap) return;
    wrap.innerHTML = '';

    const table = document.createElement('table');
    table.className = 'nt-table';
    table.id = 'nt-table';

    /* ── 헤더 행 (열 번호 1~19) ── */
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.appendChild(ntMakeTh(''));
    for (let b = 1; b <= 19; b++) {
        const th = ntMakeTh(b);
        if (b === 10) th.classList.add('nt-cross-header');
        headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    /* ── 바디 (행 = 피승수 1~19) ── */
    const tbody = document.createElement('tbody');
    for (let a = 1; a <= 19; a++) {
        const tr = document.createElement('tr');
        if (a === 10) tr.classList.add('nt-cross-row');

        // 행 헤더
        const rh = ntMakeTh(a);
        if (a === 10) rh.classList.add('nt-cross-header');
        tr.appendChild(rh);

        for (let b = 1; b <= 19; b++) {
            const td = document.createElement('td');
            td.textContent = a * b;
            td.dataset.a = a;
            td.dataset.b = b;

            if (a === 10 || b === 10) {
                // 십자선
                td.classList.add('nt-cross');
            } else {
                const chId = ntGetCellChapter(a, b);
                td.dataset.chapter = chId;
                td.classList.add('nt-cell');

                // 히트맵
                const heat = ntGetHeatColor(`${a}x${b}`);
                if (heat) td.style.backgroundColor = heat;

                // 선택 상태
                if (ntSelectedChapters.has(chId)) td.classList.add('nt-selected');

                // 이벤트
                td.addEventListener('mousedown',  ntOnCellMouseDown);
                td.addEventListener('mouseenter', ntOnCellMouseEnter);
            }
            tr.appendChild(td);
        }

        tbody.appendChild(tr);
    }

    table.appendChild(tbody);
    wrap.appendChild(table);

    // 전역 마우스업
    document.addEventListener('mouseup', () => { ntIsDragging = false; }, { once: false });
}

function ntMakeTh(text) {
    const th = document.createElement('th');
    th.textContent = text;
    return th;
}

// =============================================
// 6. 드래그 선택 (열 기준 챕터)
// =============================================
function ntOnCellMouseDown(e) {
    const chId = e.currentTarget.dataset.chapter;
    if (!chId) return;
    e.preventDefault();
    ntIsDragging = true;
    ntDragMode = ntSelectedChapters.has(chId) ? 'deselect' : 'select';
    ntToggleChapter(chId, ntDragMode);
    ntUpdateTableSelection();
    ntUpdateTestBtn();
}

function ntOnCellMouseEnter(e) {
    if (!ntIsDragging) return;
    const chId = e.currentTarget.dataset.chapter;
    if (!chId) return;
    ntToggleChapter(chId, ntDragMode);
    ntUpdateTableSelection();
    ntUpdateTestBtn();
}

function ntToggleChapter(chId, mode) {
    if (mode === 'select') ntSelectedChapters.add(chId);
    else ntSelectedChapters.delete(chId);
}

function ntUpdateTableSelection() {
    document.querySelectorAll('.nt-cell').forEach(td => {
        td.classList.toggle('nt-selected', ntSelectedChapters.has(td.dataset.chapter));
    });
    ntUpdateChapterBadges();
}

// =============================================
// 7. 챕터 배지
// =============================================
function ntUpdateChapterBadges() {
    const container = document.getElementById('nt-chapter-badges');
    if (!container) return;
    container.innerHTML = '';

    if (ntSelectedChapters.size === 0) {
        container.innerHTML = '<span class="nt-badge-empty">표에서 칸을 드래그해 연습할 단을 선택하세요</span>';
        ntUpdateTestBtn();
        return;
    }

    // 정렬: 숫자(b값) → A/B
    const sorted = [...ntSelectedChapters].sort((x, y) => {
        const na = parseInt(x), nb = parseInt(y);
        if (na !== nb) return na - nb;
        return x.slice(-1) < y.slice(-1) ? -1 : 1;
    });

    sorted.forEach(chId => {
        const b    = parseInt(chId);
        const part = chId.slice(-1);
        const label = part === 'A' ? `×${b} (1~9단)` : `×${b} (11~19단)`;
        const badge = document.createElement('span');
        badge.className = 'nt-badge';
        badge.innerHTML = `${label} <button onclick="ntRemoveChapter('${chId}')">✕</button>`;
        container.appendChild(badge);
    });
    ntUpdateTestBtn();
}

function ntRemoveChapter(chId) {
    ntSelectedChapters.delete(chId);
    ntUpdateTableSelection();
}

function ntSelectAll() {
    for (let b = 1; b <= 19; b++) {
        if (b === 10) continue;
        ntSelectedChapters.add(`${b}A`);
        ntSelectedChapters.add(`${b}B`);
    }
    ntUpdateTableSelection();
}

function ntDeselectAll() {
    ntSelectedChapters.clear();
    ntUpdateTableSelection();
}

function ntUpdateTestBtn() {
    const btn = document.getElementById('nt-start-test-btn');
    if (btn) btn.disabled = ntSelectedChapters.size === 0;
}

// =============================================
// 8. 테스트 모드 전환
// =============================================
function ntStartTest() {
    if (ntSelectedChapters.size === 0) return;
    ntTestMode = true;
    ntTableVisible = false;
    ntCooldown = {};
    ntQuestionCount = 0;

    document.getElementById('nt-table-section').style.display = 'none';
    document.getElementById('nt-test-section').style.display  = 'block';
    document.getElementById('nt-table-toggle-wrap').style.display = 'block';
    document.getElementById('nt-table-toggle-label').textContent = '표 보기 ▼';

    ntUpdateTestChapterInfo();
    ntGenerateTestQuestion();
}

function ntExitTest() {
    ntTestMode = false;
    document.getElementById('nt-table-section').style.display = 'block';
    document.getElementById('nt-test-section').style.display  = 'none';
    document.getElementById('nt-table-toggle-wrap').style.display = 'none';
    ntRenderTable(); // 히트맵 갱신
}

function ntToggleTableInTest() {
    const section = document.getElementById('nt-table-section');
    const label   = document.getElementById('nt-table-toggle-label');
    ntTableVisible = !ntTableVisible;
    section.style.display = ntTableVisible ? 'block' : 'none';
    label.textContent = ntTableVisible ? '표 숨기기 ▲' : '표 보기 ▼';
}

function ntUpdateTestChapterInfo() {
    const el = document.getElementById('nt-test-chapter-info');
    if (!el) return;
    const sorted = [...ntSelectedChapters].sort((x, y) => {
        const na = parseInt(x), nb = parseInt(y);
        if (na !== nb) return na - nb;
        return x.slice(-1) < y.slice(-1) ? -1 : 1;
    });
    const labels = sorted.map(chId => {
        const b    = parseInt(chId);
        const part = chId.slice(-1);
        return part === 'A' ? `×${b}(1~9단)` : `×${b}(11~19단)`;
    });
    el.textContent = '연습 범위: ' + labels.join(', ');
}

// =============================================
// 9. 출제 로직
//    우선순위:
//    ① 쿨다운 없는 문제만 후보
//    ② 미출제 문제 가중치 HIGH (×6)
//    ③ 오답률 높을수록 가중치 UP (1 + errRate×5)
//    ④ 정답률 100% 문제 가중치 DOWN (×0.5)
// =============================================
function ntGetAllCells() {
    const cells = [];
    ntSelectedChapters.forEach(chId => {
        ntGetChapterCells(chId).forEach(c => cells.push(c));
    });
    return cells;
}

function ntGetWeightedCell() {
    const allCells = ntGetAllCells();
    if (allCells.length === 0) return null;

    // 쿨다운에서 제외 불가능한 경우(전부 쿨다운) → 쿨다운 절반 감소 후 재시도
    let candidates = allCells.filter(c => !ntCooldown[`${c.a}x${c.b}`]);
    if (candidates.length === 0) {
        // 모든 문제가 쿨다운 → 쿨다운 절반 강제 소진
        Object.keys(ntCooldown).forEach(k => {
            ntCooldown[k] = Math.floor(ntCooldown[k] / 2);
            if (ntCooldown[k] <= 0) delete ntCooldown[k];
        });
        candidates = allCells.filter(c => !ntCooldown[`${c.a}x${c.b}`]);
        if (candidates.length === 0) candidates = allCells; // 최후 fallback
    }

    const weights = candidates.map(c => {
        const key  = `${c.a}x${c.b}`;
        const stat = ntStats[key];

        if (!stat || stat.total === 0) return 6; // 미출제 → 높은 가중치

        const errRate = 1 - (stat.correct / stat.total);
        if (errRate <= 0) return 0.5;            // 항상 맞춘 문제 → 낮은 가중치
        return 1 + errRate * 5;                  // 오답률 비례 가중치
    });

    const total = weights.reduce((s, w) => s + w, 0);
    let rand = Math.random() * total;
    for (let i = 0; i < candidates.length; i++) {
        rand -= weights[i];
        if (rand <= 0) return candidates[i];
    }
    return candidates[candidates.length - 1];
}

function ntGenerateTestQuestion() {
    const cell = ntGetWeightedCell();
    if (!cell) return;

    ntCurrentQ = { a: cell.a, b: cell.b, answer: cell.a * cell.b };

    // 쿨다운 카운터 감소
    Object.keys(ntCooldown).forEach(k => {
        ntCooldown[k]--;
        if (ntCooldown[k] <= 0) delete ntCooldown[k];
    });

    document.getElementById('nt-question').textContent = `${cell.a} × ${cell.b} = ?`;
    document.getElementById('nt-answer-input').value   = '';
    document.getElementById('nt-test-feedback').textContent = '';
    document.getElementById('nt-test-feedback').className   = 'feedback-display';
    document.getElementById('nt-answer-input').focus();

    ntHighlightCurrentCell(cell.a, cell.b);
    ntQuestionCount++;
}

function ntHighlightCurrentCell(a, b) {
    document.querySelectorAll('.nt-current').forEach(el => el.classList.remove('nt-current'));
    const td = document.querySelector(`.nt-cell[data-a="${a}"][data-b="${b}"]`);
    if (td) td.classList.add('nt-current');
}

// =============================================
// 10. 정답 확인
// =============================================
function ntCheckAnswer() {
    if (!ntCurrentQ) return;

    const input    = document.getElementById('nt-answer-input');
    const feedback = document.getElementById('nt-test-feedback');
    const userVal  = parseInt(input.value.trim(), 10);
    const key      = `${ntCurrentQ.a}x${ntCurrentQ.b}`;

    if (!ntStats[key]) ntStats[key] = { correct: 0, total: 0 };
    ntStats[key].total++;

    if (userVal === ntCurrentQ.answer) {
        ntStats[key].correct++;
        feedback.textContent = '🟢 정답!';
        feedback.className   = 'feedback-display nt-feedback correct';

        // 정답 → 쿨다운 5회 등록
        ntCooldown[key] = 5;

        ntSaveStats();
        ntUpdateStats();

        // 히트맵 즉시 갱신 (해당 셀만)
        const td = document.querySelector(`.nt-cell[data-a="${ntCurrentQ.a}"][data-b="${ntCurrentQ.b}"]`);
        if (td) {
            const heat = ntGetHeatColor(key);
            td.style.backgroundColor = heat || '';
        }

        setTimeout(ntGenerateTestQuestion, 400);

    } else {
        feedback.textContent = `❌ 오답  (정답: ${ntCurrentQ.answer})`;
        feedback.className   = 'feedback-display nt-feedback wrong';
        // 오답은 쿨다운 등록 X (계속 나와야 함)
        input.select();
        ntSaveStats();
        ntUpdateStats();
    }
}

// =============================================
// 11. 통계 패널
// =============================================
function ntUpdateStats() {
    const el = document.getElementById('nt-stats-display');
    if (!el) return;

    let correct = 0, total = 0;
    ntGetAllCells().forEach(c => {
        const s = ntStats[`${c.a}x${c.b}`];
        if (s) { correct += s.correct; total += s.total; }
    });

    const rate = total > 0 ? Math.round((correct / total) * 100) : 0;
    el.innerHTML = `
        <span class="nt-stat-item">
            <i class="fas fa-check-circle" style="color:#10B981"></i>
            정답률 <strong>${rate}%</strong>
        </span>
        <span class="nt-stat-item">
            <i class="fas fa-list" style="color:#4F46E5"></i>
            총 <strong>${total}</strong>문제
        </span>
    `;
}

// =============================================
// 12. 초기화
// =============================================
function ntResetStats() {
    if (!confirm('선택된 범위의 학습 기록을 초기화할까요?')) return;
    ntGetAllCells().forEach(c => delete ntStats[`${c.a}x${c.b}`]);
    ntSaveStats();
    ntRenderTable();
    ntUpdateStats();
}

function ntResetAllStats() {
    if (!confirm('전체 19단 학습 기록을 모두 초기화할까요?')) return;
    ntStats = {};
    ntSaveStats();
    ntRenderTable();
    ntUpdateStats();
}

// =============================================
// 13. 진입점 (페이지 전환 시 호출)
// =============================================
function ntInit() {
    ntLoadStats();
    // 테스트 모드 중 다른 페이지 갔다가 돌아온 경우 → 표 모드로 초기화
    ntTestMode = false;
    const tableSection = document.getElementById('nt-table-section');
    const testSection  = document.getElementById('nt-test-section');
    const toggleWrap   = document.getElementById('nt-table-toggle-wrap');
    if (tableSection) tableSection.style.display = 'block';
    if (testSection)  testSection.style.display  = 'none';
    if (toggleWrap)   toggleWrap.style.display   = 'none';

    ntRenderTable();
    ntUpdateChapterBadges();
    ntUpdateTestBtn();
    ntUpdateStats();

    // Enter 키 정답 제출
    const input = document.getElementById('nt-answer-input');
    if (input) {
        // 중복 리스너 방지
        const newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);
        newInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') ntCheckAnswer();
        });
    }
}

/*
======================================================================
@@ SCRIPT.JS - GSAT 연습 페이지 기능 (최종 상세 주석본)
======================================================================
이 파일은 웹사이트의 모든 동적 기능을 제어합니다.

## 목차 (Table of Contents) ##

### CHAPTER 1: 분수 비교 연습 기능
  1-1. 상수 정의 및 전역 변수
    1-1-1. 최소 분수 값 차이 상수
    1-1-2. 난이도 '하'용 퍼센트 배열
    1-1-3. 문제 저장 배열
  1-2. 핵심 유틸리티 함수
    1-2-1. 특정 자릿수 랜덤 숫자 생성
  1-3. 문제 생성 로직
    1-3-1. (난이도 '하') 퍼센트 기반 분수 생성
    1-3-2. (난이도 '하') 첫 분수와 비슷한 값의 두 번째 분수 생성
    1-3-3. (난이도 '중/상') 일반 분수 생성
    1-3-4. (난이도 '중/상') 특정 분수와 비슷한 값의 분수 생성
    1-3-5. 전체 문제 생성 제어 함수
  1-4. 화면 출력(DOM) 관련 함수
    1-4-1. 분수/퍼센트 버튼 DOM 요소 생성
    1-4-2. 생성된 모든 문제를 화면에 렌더링
  1-5. 사용자 상호작용 및 채점
    1-5-1. 사용자가 분수를 클릭했을 때의 동작
    1-5-2. '채점' 버튼 클릭 시 채점 실행

### CHAPTER 2: 곱셈 연습 기능
  2-1. 전역 변수
    2-1-1. 현재 문제 정보 저장 변수
  2-2. 기능 함수
    2-2-1. 새로운 곱셈 문제 생성 및 표시
    2-2-2. 사용자 정답 확인

### CHAPTER 3: 도식 추리 기능
  3-1. 전역 변수 및 헬퍼 함수
    3-1-1. 문제 상태 저장용 전역 변수
    3-1-2. 배열 섞기(Shuffle) 함수
    3-1-3. 알파벳 이동(Shift) 함수
  3-2. 문제 생성 로직
    3-2-1. 기본 코드(숫자2, 문자2) 생성
    3-2-2. '증감 변환' 문제 생성
    3-2-3. '순서 변환' 문제 생성
    3-2-4. (난이도 '상') 새로운 코드에 규칙 적용
    3-2-5. 전체 도식 추리 문제 생성 제어 함수
  3-3. 사용자 상호작용 및 채점
    3-3-1. '채점' 버튼 클릭 시 채점 실행

### CHAPTER 4: 알파벳 외우기 기능
  4-1. 전역 변수
    4-1-1. 문제 상태 저장용 전역 변수
  4-2. 기능 함수
    4-2-1. 새로운 알파벳 문제 생성
    4-2-2. 사용자 정답 확인

### CHAPTER 5: 페이지 전환 및 공통 UI 기능
  5-1. 공통 DOM 요소 변수
  5-2. 페이지 전환 제어 함수
    5-2-1. 사이드바 메뉴 버튼 활성화
    5-2-2. 특정 콘텐츠 페이지만 표시
  5-3. 페이지별 표시 함수
    5-3-1. 분수 비교 페이지 표시
    5-3-2. 곱셈 연습 페이지 표시
    5-3-3. 도식 추리 페이지 표시
    5-3-4. 알파벳 외우기 페이지 표시

### CHAPTER 6: 이벤트 리스너 설정
  6-1. 사이드바 메뉴 클릭 이벤트
  6-2. 페이지 내부 버튼 클릭 이벤트
  6-3. 난이도 선택 변경 이벤트
  6-4. 정답 입력(Enter 키) 이벤트

### CHAPTER 7: 초기 실행 코드
======================================================================
*/


/*
==================================================
@@ CHAPTER 1: 분수 비교 연습 기능
==================================================
*/

// ### 1-1. 상수 정의 및 전역 변수 ###
const MIN_DIFF_RATIO = 0.015;
const presetPercentages = [5,5,15,15,20,20,25,25,30,35,50,50,70,70,75,75,80,80,85,110,115,120,120,125,125,150];
let currentFractionProblem = null; // 현재 문제 하나만 저장
let scores = {
    easy: { correct: 0, total: 0 },
    medium: { correct: 0, total: 0 },
    hard: { correct: 0, total: 0 }
};




// ### 1-2. 핵심 유틸리티 함수 ###
function randomNumber(isThreeDigit) {
  if (isThreeDigit) {
    return Math.floor(Math.random() * 900) + 100;
  } else {
    return Math.floor(Math.random() * 9000) + 1000;
  }
}


// ### 1-3. 문제 생성 로직 ###
function generateEasyFraction1() {
  const p = presetPercentages[Math.floor(Math.random() * presetPercentages.length)];
  const value1 = p / 100;
  const minDenom = Math.ceil(100 / value1);
  let denominator;
  const digitType = (Math.random() < 0.5 && minDenom <= 999) ? "3" : "4";
  if (digitType === "3") {
    do { denominator = randomNumber(true); } while (denominator < minDenom);
  } else {
    do { denominator = randomNumber(false); } while (denominator < minDenom);
  }
  let numerator = Math.round(value1 * denominator);
  if (numerator < 100) numerator = 100;
  return { frac: { numerator, denominator }, value: value1, preset: p };
}

function generateEasyFraction2(value1) {
  let attempts = 0;
  while (true) {
    attempts++;
    if (attempts > 1000) return generateEasyFraction2Core(value1 * 1.10);
    const delta = (Math.random() * 2 - 1) * 0.10;
    const targetValue2 = value1 * (1 + delta);
    if (Math.abs(targetValue2 - value1) / value1 < MIN_DIFF_RATIO) continue;
    return generateEasyFraction2Core(targetValue2);
  }
}

function generateEasyFraction2Core(targetValue2) {
  const minDenom = Math.ceil(100 / targetValue2);
  const digitType = (Math.random() < 0.5 && minDenom <= 999) ? "3" : "4";
  let denominator;
  if (digitType === "3") {
    do { denominator = randomNumber(true); } while (denominator < minDenom);
  } else {
    do { denominator = randomNumber(false); } while (denominator < minDenom);
  }
  let numerator = Math.round(targetValue2 * denominator);
  if (numerator < 100) numerator = 100;
  return { numerator, denominator, value: targetValue2 };
}

function generateFraction() {
  return {
    numerator: (Math.random() < 0.5 ? randomNumber(true) : randomNumber(false)),
    denominator: (Math.random() < 0.5 ? randomNumber(true) : randomNumber(false))
  };
}

function generateCloseFractionValue(baseFraction, difficulty) {
  const baseValue = baseFraction.numerator / baseFraction.denominator;
  const errorRange = (difficulty === 'hard') ? 0.05 : 0.15;
  let attempts = 0;
  while (true) {
    attempts++;
    if (attempts > 1000) return { numerator: baseFraction.numerator, denominator: baseFraction.denominator };
    const error = (Math.random() * 2 - 1) * errorRange;
    const targetValue = baseValue * (1 + error);
    if (Math.abs(targetValue - baseValue) / baseValue < MIN_DIFF_RATIO) continue;
    const fraction2 = tryBuildFraction2(targetValue);
    if (fraction2) return fraction2;
  }
}

function tryBuildFraction2(targetValue) {
  for (let attempt = 0; attempt < 100; attempt++) {
    let denomIs3 = Math.random() < 0.5;
    let denominator = denomIs3 ? randomNumber(true) : randomNumber(false);
    let numerator = Math.round(targetValue * denominator);
    if (numerator >= 100 && numerator <= 9999) return { numerator, denominator };
  }
  return null;
}

function generateProblem(difficulty) {
  let frac1, frac2, answer;
  if (difficulty === 'easy') {
    const result1 = generateEasyFraction1();
    frac1 = result1.frac;
    const result2 = generateEasyFraction2(result1.value);
    frac2 = { numerator: result2.numerator, denominator: result2.denominator };
    answer = (result1.value > result2.value) ? "first" : "second";
    return { frac1, frac2, answer, difficulty, preset: result1.preset };
  } else {
    do { frac1 = generateFraction(); }
    while (frac1.numerator / frac1.denominator < 0.5 || frac1.numerator / frac1.denominator > 2);
    frac2 = generateCloseFractionValue(frac1, difficulty);
    answer = (frac1.numerator / frac1.denominator > frac2.numerator / frac2.denominator) ? "first" : "second";
    return { frac1, frac2, answer, difficulty };
  }
}



function generateAndRenderFractionProblem() {
  const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
  
  // 새 문제가 생성되기 전에, 현재 난이도에 맞는 점수를 화면에 표시
  updateScoreDisplay(); 

  currentFractionProblem = generateProblem(difficulty);
  renderFractionProblem();
}




// ### 1-4. 화면 출력(DOM) 관련 함수 ###
function createFractionButton(fraction, side) {
  // 난이도 '하'의 첫 번째 분수는 퍼센트로 표시
  if (currentFractionProblem.difficulty === 'easy' && side === "first") {
    const btn = document.createElement('div');
    btn.className = 'percentage';
    btn.textContent = currentFractionProblem.preset + "%";
    btn.addEventListener('click', () => checkFractionAnswer(side, btn));
    return btn;
  } else {
    const btn = document.createElement('div');
    btn.className = 'fraction';
    const numSpan = document.createElement('span');
    numSpan.className = 'numerator';
    numSpan.textContent = fraction.numerator;
    btn.appendChild(numSpan);
    const denSpan = document.createElement('span');
    denSpan.className = 'denominator';
    denSpan.textContent = fraction.denominator;
    btn.appendChild(denSpan);
    btn.addEventListener('click', () => checkFractionAnswer(side, btn));
    return btn;
  }
}

function renderFractionProblem() {
  const problemsDiv = document.getElementById('problems');
  problemsDiv.innerHTML = '';
  const div = document.createElement('div');
  div.className = 'problem';
  const frac1Btn = createFractionButton(currentFractionProblem.frac1, "first");
  const frac2Btn = createFractionButton(currentFractionProblem.frac2, "second");
  const feedbackSpan = document.createElement('span');
  feedbackSpan.id = 'fraction-feedback';
  feedbackSpan.style.marginLeft = '10px'; // 왼쪽 여백 추가
  feedbackSpan.style.fontSize = '1.5em';

  div.appendChild(frac1Btn);
  div.appendChild(document.createTextNode(' vs '));
  div.appendChild(frac2Btn);
  div.appendChild(feedbackSpan); // 이 줄을 맨 뒤로 옮겼습니다.
  problemsDiv.appendChild(div);
}



// ### 1-5. 사용자 상호작용 및 채점 ###
function checkFractionAnswer(selectedSide, btn) {
    const feedbackSpan = document.getElementById('fraction-feedback');
    const problemDiv = btn.parentElement;
    const difficulty = currentFractionProblem.difficulty;

    // 모든 버튼의 선택 효과 우선 제거 후 현재 클릭한 버튼에만 적용
    const allButtons = problemDiv.querySelectorAll('.fraction, .percentage');
    allButtons.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');

    // 이 문제에 대한 첫 번째 클릭인지 확인
    const isFirstAttempt = !problemDiv.dataset.attempted;

    // 정답을 맞혔을 경우
    if (selectedSide === currentFractionProblem.answer) {
        feedbackSpan.textContent = '🟢';

        // 첫 시도에 정답을 맞혔을 때만 점수 기록
        if (isFirstAttempt) {
            problemDiv.dataset.attempted = 'true';
            scores[difficulty].total++;
            scores[difficulty].correct++;
            updateScoreDisplay();
        }

        // 정답을 맞히면 시도 횟수와 상관없이 항상 다음 문제 로드
        setTimeout(generateAndRenderFractionProblem, 200);

    } else { // 오답을 클릭했을 경우
        feedbackSpan.textContent = '❌';

        // 첫 시도에 오답을 클릭했을 때만 점수 기록
        if (isFirstAttempt) {
            problemDiv.dataset.attempted = 'true';
            scores[difficulty].total++;
            updateScoreDisplay();
        }
    }
}




function updateScoreDisplay() {
    const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
    const currentScore = scores[difficulty];

    const scoreText = document.getElementById('score-text');
    const scoreBar = document.getElementById('score-bar');
    const percentage = currentScore.total > 0 ? (currentScore.correct / currentScore.total) * 100 : 0;

    scoreText.textContent = `정답률: ${currentScore.correct}/${currentScore.total}`;
    scoreBar.style.width = percentage + '%';

    saveScores(); // 점수가 변경될 때마다 저장
}


/*
==================================================
@@ CHAPTER 1-6: 점수 저장/불러오기 (LocalStorage)
==================================================
*/
// scores 객체를 JSON 문자열로 변환하여 로컬 저장소에 저장합니다.
function saveScores() {
    localStorage.setItem('gsatScores', JSON.stringify(scores));
}

// 로컬 저장소에서 점수 데이터를 불러와 scores 객체를 업데이트합니다.
function loadScores() {
    const savedScores = localStorage.getItem('gsatScores');
    if (savedScores) {
        scores = JSON.parse(savedScores);
    }
}







/*
==================================================
@@ CHAPTER 2: 곱셈 연습 기능
==================================================
*/

// ### 2-1. 전역 변수 ###
// 2-1-1. 현재 문제 정보 저장 변수
let currentProblem = null; // 현재 출제된 곱셈 문제의 숫자와 정답을 저장합니다.

// ### 2-2. 기능 함수 ###
/**
 * 2-2-1. 새로운 곱셈 문제를 생성하고 화면에 표시합니다.
 * 사용자가 설정한 범위 내에서 두 숫자를 랜덤으로 뽑아 문제를 만듭니다.
 */
function generateMulProblem() {
  const amin = parseInt(document.getElementById("rangeAmin").value, 10);
  const amax = parseInt(document.getElementById("rangeAmax").value, 10);
  const bmin = parseInt(document.getElementById("rangeBmin").value, 10);
  const bmax = parseInt(document.getElementById("rangeBmax").value, 10);

  let validA = (!isNaN(amin) && !isNaN(amax) && amin <= amax);
  let validB = (!isNaN(bmin) && !isNaN(bmax) && bmin <= bmax);

  let finalAmin = 2, finalAmax = 99, finalBmin = 2, finalBmax = 19;

  if (validA && validB) {
    finalAmin = amin; finalAmax = amax; finalBmin = bmin; finalBmax = bmax;
  }

  const a = Math.floor(Math.random() * (finalAmax - finalAmin + 1)) + finalAmin;
  const b = Math.floor(Math.random() * (finalBmax - finalBmin + 1)) + finalBmin;

  currentProblem = { a, b, answer: a * b };
  
  // 화면에 문제 표시
  const aStr = currentProblem.a.toString();
  const bStr = currentProblem.b.toString();
  const maxLen = Math.max(aStr.length, bStr.length + 2);
  document.getElementById('lineA').textContent = aStr.padStart(maxLen, ' ');
  document.getElementById('lineB').textContent = ('× ' + bStr).padStart(maxLen, ' ');
  const inputElem = document.getElementById('answer-input');
  inputElem.value = '';
  inputElem.focus(); // 사용자가 바로 입력할 수 있도록 포커스
  document.getElementById('feedback').textContent = '';
}

/**
 * 2-2-2. 사용자 정답을 확인하고 피드백을 줍니다.
 * 정답이면 잠시 후 다음 문제로 넘어갑니다.
 */
function checkMulAnswer() {
  const inputElem = document.getElementById('answer-input');
  const feedbackElem = document.getElementById('feedback');
  const userAnswer = parseInt(inputElem.value, 10);

  if (userAnswer === currentProblem.answer) {
    feedbackElem.textContent = '🟢'; // 정답 피드백
    setTimeout(generateMulProblem, 500); // 0.5초 후 새 문제 생성
  } else {
    feedbackElem.textContent = '❌'; // 오답 피드백
    inputElem.select(); // 사용자가 쉽게 수정하도록 입력값 전체 선택
  }
}


/*
==================================================
@@ CHAPTER 3: 도식 추리 기능
==================================================
*/

// ### 3-1. 전역 변수 및 헬퍼 함수 ###
// 3-1-1. 문제 상태 저장용 전역 변수
let currentTransformType, currentOriginalCode, currentTransformedCode, expectedIncrementRule, expectedOrderRule, currentRTDifficulty, currentIncrementTypes, currentIncrementShifts, expectedHighAnswer;

/**
 * 3-1-2. 배열의 요소를 무작위로 섞는 함수 (피셔-예이츠 셔플)
 * @param {Array} array - 섞을 배열
 * @returns {Array} 섞인 배열
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * 3-1-3. 주어진 알파벳을 특정 값만큼 이동시키는 함수
 * @param {string} letter - 이동시킬 알파벳 (A-Z)
 * @param {number} shift - 이동할 값 (양수 또는 음수)
 * @returns {string} 이동된 알파벳
 */
function shiftLetter(letter, shift) {
  const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let index = alpha.indexOf(letter);
  index = (index + shift + 26) % 26; // 음수 값도 처리하기 위해 +26
  return alpha[index];
}


// ### 3-2. 문제 생성 로직 ###
/**
 * 3-2-1. 문제의 기본이 되는 '숫자 2개, 알파벳 2개'로 구성된 4자리 코드를 생성합니다.
 * @returns {string} 예: "A5B6"
 */
function generateBasicCode() {
  let digits = [];
  while (digits.length < 2) {
    let d = Math.floor(Math.random() * 10);
    if (!digits.includes(d)) digits.push(d);
  }
  let letters = [];
  const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  while (letters.length < 2) {
    let ch = alpha[Math.floor(Math.random() * 26)];
    if (!letters.includes(ch)) letters.push(ch);
  }
  let codeArr = [...digits, ...letters];
  shuffleArray(codeArr);
  return codeArr.join("");
}

/**
 * 3-2-2. '증감 변환' 규칙을 랜덤으로 생성하여 문제를 만듭니다.
 * 각 자리가 숫자/알파벳인지, 얼마나 변하는지를 랜덤으로 결정합니다.
 */
function generateIncrementProblem() {
  let types = ["digit", "digit", "letter", "letter"];
  shuffleArray(types);
  let originalArr = [];
  let transformedArr = [];
  let incrementRules = [];
  const allowedShifts = [-4, -3, -2, -1, 1, 2, 3, 4];
  let chosenDigits = [];
  let chosenLetters = [];
  currentIncrementTypes = types.slice();
  for (let i = 0; i < 4; i++) {
    if (types[i] === "digit") {
      let valid = false, shift, origDigit;
      for (let attempt = 0; attempt < 100; attempt++) {
        shift = allowedShifts[Math.floor(Math.random() * allowedShifts.length)];
        let minVal = (shift < 0) ? Math.abs(shift) : 0;
        let maxVal = (shift > 0) ? (9 - shift) : 9;
        let possible = [];
        for (let d = minVal; d <= maxVal; d++) {
          if (!chosenDigits.includes(d)) possible.push(d);
        }
        if (possible.length > 0) {
          origDigit = possible[Math.floor(Math.random() * possible.length)];
          valid = true;
          break;
        }
      }
      if (!valid) {
        let possible = Array.from({length: 10}, (_, k) => k).filter(d => !chosenDigits.includes(d));
        origDigit = possible[Math.floor(Math.random() * possible.length)];
        shift = 1;
      }
      chosenDigits.push(origDigit);
      originalArr.push(origDigit.toString());
      transformedArr.push((origDigit + shift).toString());
      incrementRules.push(shift);
    } else {
      const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      let possibleLetters = alpha.split('').filter(ch => !chosenLetters.includes(ch));
      let origLetter = possibleLetters[Math.floor(Math.random() * possibleLetters.length)];
      chosenLetters.push(origLetter);
      let shift = allowedShifts[Math.floor(Math.random() * allowedShifts.length)];
      originalArr.push(origLetter);
      transformedArr.push(shiftLetter(origLetter, shift));
      incrementRules.push(shift);
    }
  }
  currentOriginalCode = originalArr.join("");
  currentTransformedCode = transformedArr.join("");
  expectedIncrementRule = incrementRules.map(v => v.toString()).join(" ");
  currentIncrementShifts = incrementRules.slice();
}

/**
 * 3-2-3. '순서 변환' 규칙을 랜덤으로 생성하여 문제를 만듭니다.
 * 1234의 순서를 무작위로 섞어 새로운 순서 규칙을 만듭니다.
 */
function generateOrderProblem() {
  currentOriginalCode = generateBasicCode();
  let positions;
  do {
    positions = [1, 2, 3, 4];
    shuffleArray(positions);
  } while (positions.every((pos, idx) => pos === idx + 1));
  expectedOrderRule = positions.join("");
  let originalArr = currentOriginalCode.split("");
  currentTransformedCode = positions.map(pos => originalArr[pos - 1]).join("");
}

/**
 * 3-2-4. (난이도 '상') 앞서 생성된 규칙을 새로운 코드에 적용하는 함수입니다.
 */
function generateNewIncrementForHigh() {
  let newOriginalArr = [];
  let newTransformedArr = [];
  const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let chosenDigits = [];
  let chosenLetters = [];
  for (let i = 0; i < 4; i++) {
    let shift = currentIncrementShifts[i];
    if (currentIncrementTypes[i] === "digit") {
      let minVal = (shift < 0) ? Math.abs(shift) : 0;
      let maxVal = (shift > 0) ? (9 - shift) : 9;
      let possible = Array.from({length: maxVal - minVal + 1}, (_, k) => k + minVal).filter(d => !chosenDigits.includes(d));
      if (possible.length === 0) possible = Array.from({length: 10}, (_, k) => k).filter(d => !chosenDigits.includes(d));
      let origDigit = possible[Math.floor(Math.random() * possible.length)];
      chosenDigits.push(origDigit);
      newOriginalArr.push(origDigit.toString());
      newTransformedArr.push((origDigit + shift).toString());
    } else {
      let possibleLetters = alpha.split('').filter(ch => !chosenLetters.includes(ch));
      let origLetter = possibleLetters[Math.floor(Math.random() * possibleLetters.length)];
      chosenLetters.push(origLetter);
      newOriginalArr.push(origLetter);
      newTransformedArr.push(shiftLetter(origLetter, shift));
    }
  }
  return {
    original: newOriginalArr.join(""),
    transformed: newTransformedArr.join("")
  };
}
function generateNewOrderForHigh() {
  let newOriginal = generateBasicCode();
  let originalArr = newOriginal.split("");
  let newTransformed = expectedOrderRule.split("").map(pos => originalArr[pos - 1]).join("");
  return { original: newOriginal, transformed: newTransformed };
}

/**
 * 3-2-5. 도식 추리 문제 생성 과정을 총괄하는 메인 함수입니다.
 * 난이도에 따라 다른 종류의 문제를 생성하고 화면에 표시합니다.
 */
function generateRandomTransformProblem() {
  currentRTDifficulty = document.querySelector('input[name="rt-difficulty"]:checked').value;
  const isLow = currentRTDifficulty === "하";
  document.getElementById("rt-low-inputs").style.display = isLow ? "block" : "none";
  document.getElementById("rt-high-inputs").style.display = isLow ? "none" : "block";

  currentTransformType = (Math.random() < 0.5) ? "증감" : "순서";
  if (currentTransformType === "증감") generateIncrementProblem();
  else generateOrderProblem();

  document.getElementById("random-transform-display").textContent = currentOriginalCode + " → " + currentTransformedCode;
  
  if (isLow) {
    document.getElementById("increment-input").value = "";
    document.getElementById("order-input").value = "";
    document.getElementById("increment-input").focus();
  } else {
    const newPair = (currentTransformType === "증감") ? generateNewIncrementForHigh() : generateNewOrderForHigh();
    document.getElementById("new-code-display").textContent = newPair.original + " → ?";
    expectedHighAnswer = newPair.transformed;
    document.getElementById("high-answer-input").value = "";
    document.getElementById("high-answer-input").focus();
  }
  document.getElementById("random-feedback").textContent = "";
}


// ### 3-3. 사용자 상호작용 및 채점 ###
/**
 * 3-3-1. 사용자가 입력한 답을 채점하고 결과를 피드백합니다.
 */
function gradeRandomTransformProblem() {
  let feedback = "";
  const isLow = currentRTDifficulty === "하";

  if (isLow) {
    if (currentTransformType === "증감") {
      let userInput = document.getElementById("increment-input").value.trim();
      if (userInput === expectedIncrementRule) {
        feedback = "🟢";
      } else {
        feedback = "❌ 오답. 정답: " + expectedIncrementRule;
      }
    } else { // 순서
      let userInput = document.getElementById("order-input").value.trim();
      if (userInput === expectedOrderRule) {
        feedback = "🟢";
      } else {
        feedback = "❌ 오답. 정답: " + expectedOrderRule;
      }
    }
  } else { // 상
    let userInput = document.getElementById("high-answer-input").value.trim().toUpperCase();
    if (userInput === expectedHighAnswer) {
      feedback = "🟢";
    } else {
      feedback = "❌ 오답. 정답: " + expectedHighAnswer;
    }
  }
  
  document.getElementById("random-feedback").textContent = feedback;
  if (feedback === "🟢") {
    setTimeout(generateRandomTransformProblem, 500);
  }
}


/*
==================================================
@@ CHAPTER 4: 알파벳 외우기 기능
==================================================
*/

// ### 4-1. 전역 변수 ###
// 4-1-1. 문제 상태 저장용 전역 변수
let alphaDifficulty = "하";
let currentAlphaQuestion = "";
let currentAlphaAnswer = "";
let recentAlphaLower = []; // 중복 출제 방지를 위한 최근 문제 기록 (난이도 '하')

// ### 4-2. 기능 함수 ###
/**
 * 4-2-1. 새로운 알파벳 문제를 난이도에 맞춰 생성하고 화면에 표시합니다.
 */
function generateAlphaProblem() {
  const inputElem = document.getElementById('alpha-answer');
  alphaDifficulty = document.querySelector('input[name="alpha-difficulty"]:checked').value;
  const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  if (alphaDifficulty === "하") {
    inputElem.placeholder = "숫자 입력";
    let idx;
    do {
      idx = Math.floor(Math.random() * 26);
    } while (recentAlphaLower.includes(idx));
    recentAlphaLower.push(idx);
    if (recentAlphaLower.length > 10) recentAlphaLower.shift();
    
    currentAlphaQuestion = alpha[idx];
    currentAlphaAnswer = (idx + 1).toString();
    document.getElementById("alpha-question").textContent = currentAlphaQuestion + " → ?";
  } else if (alphaDifficulty === "중") {
    inputElem.placeholder = "알파벳 입력";
    const sign = Math.random() < 0.5 ? '+' : '-';
    const shift = Math.floor(Math.random() * 5) + 1;
    let baseIdx;
    if (sign === '+') {
      baseIdx = Math.floor(Math.random() * (26 - shift)); // 0 to 25-shift
    } else {
      baseIdx = Math.floor(Math.random() * (26 - shift)) + shift; // shift to 25
    }
    const resultIdx = baseIdx + (sign === '+' ? shift : -shift);
    currentAlphaQuestion = `${alpha[baseIdx]} ${sign} ${shift} = ?`;
    currentAlphaAnswer = alpha[resultIdx];
    document.getElementById("alpha-question").textContent = currentAlphaQuestion;
  } else { // 상
    inputElem.placeholder = "알파벳 입력";
    const shift = (Math.floor(Math.random() * 5) + 1) * (Math.random() < 0.5 ? 1 : -1);
    let idx1, idx2;
    if (shift > 0) {
        idx1 = Math.floor(Math.random() * (26 - shift));
        do { idx2 = Math.floor(Math.random() * (26 - shift)); } while (idx1 === idx2);
    } else {
        idx1 = Math.floor(Math.random() * (26 + shift)) - shift;
        do { idx2 = Math.floor(Math.random() * (26 + shift)) - shift; } while (idx1 === idx2);
    }
    const qElem = document.getElementById("alpha-question");
    qElem.style.whiteSpace = "pre";
    qElem.textContent = `${alpha[idx1]} → ${alpha[idx1 + shift]}\n${alpha[idx2]} → ?`;
    currentAlphaAnswer = alpha[idx2 + shift];
  }

  inputElem.value = "";
  document.getElementById("alpha-feedback").textContent = "";
  inputElem.focus();
}

/**
 * 4-2-2. 사용자 정답을 확인하고 피드백을 줍니다.
 */
function checkAlphaAnswer() {
  let user = document.getElementById("alpha-answer").value.trim().toUpperCase();
  let feedbackElem = document.getElementById("alpha-feedback");
  if (user === currentAlphaAnswer) {
    feedbackElem.textContent = "🟢";
    setTimeout(generateAlphaProblem, 500);
  } else {
    feedbackElem.textContent = "❌";
    document.getElementById("alpha-answer").select();
  }
}


/*
==================================================
@@ CHAPTER 5: 페이지 전환 및 공통 UI 기능
==================================================
*/

// ### 5-1. 공통 DOM 요소 변수 ###
// 페이지 전환 시 자주 사용되는 DOM 요소들을 미리 변수에 할당하여 성능을 향상시킵니다.
const banner = document.getElementById("page-banner");
const navButtons = document.querySelectorAll('.main-nav button');
const pages = document.querySelectorAll('#fraction-page, #multiplication-page, #random-transform-page, #alphabet-page');


// ### 5-2. 페이지 전환 제어 함수 ###
/**
 * 5-2-1. 클릭된 사이드바 메뉴 버튼에 'active' 클래스를 적용하고, 나머지 버튼에서는 제거합니다.
 * @param {HTMLElement} activeButton - 활성화할 버튼 요소
 */
function setActive(activeButton) {
  navButtons.forEach(button => button.classList.remove('active'));
  activeButton.classList.add('active');
}

/**
 * 5-2-2. 지정된 페이지만 화면에 보여주고, 나머지 페이지들은 숨깁니다.
 * @param {HTMLElement} activePage - 화면에 표시할 페이지의 div 요소
 */
function showPage(activePage) {
  pages.forEach(page => page.style.display = 'none');
  activePage.style.display = 'block';
}


// ### 5-3. 페이지별 표시 함수 ###
// 각 함수는 특정 페이지를 화면에 표시하기 위한 일련의 작업을 수행합니다.
// (배너 텍스트 변경, 메뉴 버튼 활성화, 페이지 표시, 새 문제 생성)

function showFractionPage() {
  banner.textContent = "분수 비교 연습";
  setActive(document.getElementById('btn-fraction'));
  showPage(document.getElementById('fraction-page'));
  generateAndRenderFractionProblem();
}

function showMultiplicationPage() {
  banner.textContent = "곱셈 연습";
  setActive(document.getElementById('btn-multiplication'));
  showPage(document.getElementById('multiplication-page'));
  generateMulProblem();
}

function showRandomTransformPage() {
  banner.textContent = "도식 추리";
  setActive(document.getElementById('btn-random-transform'));
  showPage(document.getElementById('random-transform-page'));
  generateRandomTransformProblem();
}

function showAlphaQuizPage() {
  banner.textContent = "알파벳 외우기";
  setActive(document.getElementById('btn-alphaquiz'));
  showPage(document.getElementById('alphabet-page'));
  generateAlphaProblem();
}





/*
==================================================
@@ CHAPTER 6: 이벤트 리스너 설정
==================================================
// 사용자의 행동(클릭, 키 입력 등)을 감지하여 정의된 함수를 실행하도록 연결합니다.
*/

// ### 6-1. 사이드바 메뉴 클릭 이벤트 ###
document.getElementById("btn-fraction").addEventListener("click", showFractionPage);
document.getElementById("btn-multiplication").addEventListener("click", showMultiplicationPage);
document.getElementById("btn-random-transform").addEventListener("click", showRandomTransformPage);
document.getElementById("btn-alphaquiz").addEventListener("click", showAlphaQuizPage);

// ### 6-2. 페이지 내부 버튼 클릭 이벤트 ###
document.getElementById("new-random-problem").addEventListener("click", generateRandomTransformProblem);
document.getElementById("grade-random-problem").addEventListener("click", gradeRandomTransformProblem);
document.getElementById("reset-score-btn").addEventListener("click", () => {
    if (confirm("정말로 모든 난이도의 점수를 초기화하시겠습니까?")) {
        // scores 전역 변수를 초기 상태로 되돌립니다.
        scores = {
            easy: { correct: 0, total: 0 },
            medium: { correct: 0, total: 0 },
            hard: { correct: 0, total: 0 }
        };
        // 초기화된 점수를 화면에 반영하고, 로컬 저장소에도 덮어씁니다.
        updateScoreDisplay();
    }
})





// ### 6-3. 난이도 선택 변경 이벤트 ###
document.querySelectorAll('input[name="difficulty"]').forEach(radio => { radio.addEventListener('change', generateAndRenderFractionProblem); });
document.querySelectorAll('input[name="rt-difficulty"]').forEach(radio => { radio.addEventListener("change", generateRandomTransformProblem); });
document.querySelectorAll('input[name="alpha-difficulty"]').forEach(radio => { radio.addEventListener("change", generateAlphaProblem); });

// ### 6-4. 정답 입력(Enter 키) 이벤트 ###
document.getElementById('answer-input').addEventListener('keydown', e => { if (e.key === 'Enter') checkMulAnswer(); });
document.getElementById("increment-input").addEventListener("keydown", e => { if (e.key === "Enter") gradeRandomTransformProblem(); });
document.getElementById("order-input").addEventListener("keydown", e => { if (e.key === "Enter") gradeRandomTransformProblem(); });
document.getElementById("high-answer-input").addEventListener("keydown", e => { if (e.key === "Enter") gradeRandomTransformProblem(); });
document.getElementById("alpha-answer").addEventListener("keydown", e => { if (e.key === "Enter") checkAlphaAnswer(); });






/*
==================================================
@@ CHAPTER 7: 초기 실행 코드
==================================================
*/

// 웹페이지에 처음 접속했을 때 저장된 점수를 불러옵니다.
loadScores();

// 웹페이지에 처음 접속했을 때 '분수 비교 연습' 페이지를 기본으로 보여줍니다.
showFractionPage();
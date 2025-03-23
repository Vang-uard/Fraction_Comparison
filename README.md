<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>분수 비교 연습</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px auto; /* 좌우 중앙 정렬 */
      max-width: 800px;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
    }
    .fraction, .percentage {
      display: inline-block;
      text-align: center;
      margin: 0 10px;
      padding: 10px;
      border: 2px solid #ccc;
      border-radius: 4px;
      cursor: pointer;
      user-select: none;
      font-size: 1.2em;
    }
    .fraction .numerator {
      display: block;
      border-bottom: 1px solid #000;
      padding: 0 4px;
    }
    .fraction .denominator {
      display: block;
      padding: 0 4px;
    }
    .selected {
      background-color: #add8e6;
      border-color: #007bff;
    }
    .problem {
      margin-bottom: 15px;
      padding: 10px;
      border-bottom: 1px solid #ddd;
      text-align: center;
    }
    .controls {
      text-align: center;
      margin-top: 20px;
    }
    .result {
      margin-top: 10px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>분수 비교 연습</h1>
    <p>난이도를 선택하면 바로 문제가 새로 생성됩니다.<br>
       아래 15문제에서 두 분수 중 더 큰 분수를 클릭하세요.</p>
    <label><input type="radio" name="difficulty" value="hard"> 상</label>
    <label><input type="radio" name="difficulty" value="medium" checked> 중</label>
    <label><input type="radio" name="difficulty" value="easy"> 하</label>
  </div>

  <div id="problems"></div>

  <div class="controls">
    <button id="refresh">문제 새로고침</button>
    <button id="grade">채점</button>
    <div class="result" id="result"></div>
  </div>

  <script>
    // 최소 1.5% 이상 차이가 나야 함
    const MIN_DIFF_RATIO = 0.015; // 1.5%

    // 3자리 또는 4자리 수를 랜덤 생성 (50:50 확률)
    function randomNumber(isThreeDigit) {
      if (isThreeDigit) {
        return Math.floor(Math.random() * 900) + 100; // 100~999
      } else {
        return Math.floor(Math.random() * 9000) + 1000; // 1000~9999
      }
    }

    // Easy 난이도용 백분율 목록
    const presetPercentages = [5,15,20,25,50,75,80,85,110,120,125,150];

    // ----------------------------------------------------------------
    // Easy 난이도
    // ----------------------------------------------------------------

    // Easy 난이도 분수1: 미리 정해진 백분율로 생성
    function generateEasyFraction1() {
      const p = presetPercentages[Math.floor(Math.random() * presetPercentages.length)];
      const value1 = p / 100;  // 예: 80% → 0.8

      // 분자 = round(value1 * denominator)가 최소 100
      // denominator는 3자리/4자리 중 선택
      const minDenom = Math.ceil(100 / value1);
      let denominator;
      // digitType = 3자리 or 4자리
      const digitType = (Math.random() < 0.5 && minDenom <= 999) ? "3" : "4";
      if (digitType === "3") {
        do {
          denominator = randomNumber(true); // 3자리
        } while (denominator < minDenom);
      } else {
        do {
          denominator = randomNumber(false); // 4자리
        } while (denominator < minDenom);
      }
      let numerator = Math.round(value1 * denominator);
      if (numerator < 100) numerator = 100;
      return {
        frac: { numerator, denominator },
        value: value1,
        preset: p
      };
    }

    // Easy 난이도 분수2: 분수1 값(value1)에서 ±10% 범위
    // + 최소 1.5% 차이 조건
    function generateEasyFraction2(value1) {
      let attempts = 0;
      while (true) {
        attempts++;
        if (attempts > 1000) {
          // 실패 시 fallback
          // value1에 +10% 고정값 정도로 생성
          let fallbackValue = value1 * 1.10;
          return generateEasyFraction2Core(fallbackValue);
        }
        // 실제 생성 시도
        const delta = (Math.random() * 2 - 1) * 0.10; // ±10%
        const targetValue2 = value1 * (1 + delta);
        if (Math.abs(targetValue2 - value1) / value1 < MIN_DIFF_RATIO) {
          // 1.5% 미만이면 재시도
          continue;
        }
        // 1.5% 이상 차이가 나면 분수2 생성
        return generateEasyFraction2Core(targetValue2);
      }
    }

    // 분수2의 분모/분자를 계산하는 코어 로직
    function generateEasyFraction2Core(targetValue2) {
      const minDenom = Math.ceil(100 / targetValue2);
      const digitType = (Math.random() < 0.5 && minDenom <= 999) ? "3" : "4";
      let denominator;
      if (digitType === "3") {
        do {
          denominator = randomNumber(true);
        } while (denominator < minDenom);
      } else {
        do {
          denominator = randomNumber(false);
        } while (denominator < minDenom);
      }
      let numerator = Math.round(targetValue2 * denominator);
      if (numerator < 100) numerator = 100;
      return {
        numerator,
        denominator,
        value: targetValue2
      };
    }

    // ----------------------------------------------------------------
    // Medium/Hard 난이도
    // ----------------------------------------------------------------

    // 완전 무작위 분수 생성
    function generateFraction() {
      return {
        numerator: (Math.random() < 0.5 ? randomNumber(true) : randomNumber(false)),
        denominator: (Math.random() < 0.5 ? randomNumber(true) : randomNumber(false))
      };
    }

    // Medium/Hard: 분수2 생성 (±15%/±5% 오차) + 최소 1.5% 차이 조건
    function generateCloseFractionValue(baseFraction, difficulty) {
      const baseValue = baseFraction.numerator / baseFraction.denominator;
      const errorRange = (difficulty === 'hard') ? 0.05 : 0.15;
      let attempts = 0;

      while (true) {
        attempts++;
        if (attempts > 1000) {
          // fallback
          return { numerator: baseFraction.numerator, denominator: baseFraction.denominator };
        }

        // 무작위 오차
        const error = (Math.random() * 2 - 1) * errorRange;
        const targetValue = baseValue * (1 + error);

        // 최소 1.5% 차이 확인
        if (Math.abs(targetValue - baseValue) / baseValue < MIN_DIFF_RATIO) {
          // 1.5% 미만이면 재시도
          continue;
        }

        // 이제 cross-digit 로직으로 fraction2 생성
        const fraction2 = tryBuildFraction2(targetValue, baseFraction);
        if (fraction2) return fraction2; // 유효하면 반환
      }
    }

    // cross-digit 생성 로직
    function tryBuildFraction2(targetValue, baseFraction) {
      let attempts2 = 0;
      while (attempts2 < 1000) {
        attempts2++;
        const forceCross = Math.random() < 0.8; // 80% 확률 cross-digit
        if (forceCross) {
          if (Math.random() < 0.5) {
            // 옵션 A: 분자가 3자리, 분모가 4자리
            const denominator = randomNumber(false);
            const numerator = Math.round(targetValue * denominator);
            if (numerator >= 100 && numerator <= 999) {
              return { numerator, denominator };
            }
          } else {
            // 옵션 B: 분자가 4자리, 분모가 3자리
            const denominator = randomNumber(true);
            const numerator = Math.round(targetValue * denominator);
            if (numerator >= 1000 && numerator <= 9999) {
              return { numerator, denominator };
            }
          }
        } else {
          // 기존 방식
          const denomIsThree = Math.random() < 0.5;
          const denominator = denomIsThree ? randomNumber(true) : randomNumber(false);
          const numerator = Math.round(targetValue * denominator);
          if (numerator >= 100 && numerator <= 9999) {
            return { numerator, denominator };
          }
        }
      }
      // 실패
      return null;
    }

    // ----------------------------------------------------------------
    // 난이도별 문제 생성
    // ----------------------------------------------------------------

    function generateProblem(difficulty) {
      let frac1, frac2, answer;
      if (difficulty === 'easy') {
        // Easy 난이도
        const result1 = generateEasyFraction1();
        frac1 = result1.frac;
        const value1 = result1.value;  // 분수1의 실제 값
        const preset = result1.preset; // UI 표시용 백분율

        // 분수2 생성
        const result2 = generateEasyFraction2(value1);
        frac2 = { numerator: result2.numerator, denominator: result2.denominator };

        // 정답 결정
        answer = (value1 > result2.value) ? "first" : "second";

        return {
          frac1, frac2, answer,
          userAnswer: null,
          difficulty,
          preset
        };

      } else {
        // Medium/Hard 난이도
        // 분수1: 0.5~2 범위 내에서 생성
        do {
          frac1 = generateFraction();
        } while (frac1.numerator / frac1.denominator < 0.5 || frac1.numerator / frac1.denominator > 2);

        // 분수2 생성
        const fraction2 = generateCloseFractionValue(frac1, difficulty);
        frac2 = { numerator: fraction2.numerator, denominator: fraction2.denominator };

        // 정답 결정
        const val1 = frac1.numerator / frac1.denominator;
        const val2 = frac2.numerator / frac2.denominator;
        answer = (val1 > val2) ? "first" : "second";

        return {
          frac1, frac2, answer,
          userAnswer: null,
          difficulty
        };
      }
    }

    // ----------------------------------------------------------------
    // UI 렌더링
    // ----------------------------------------------------------------

    let problems = [];

    // 분수/백분율 버튼 생성
    function createFractionButton(fraction, problemIndex, fractionSide) {
      const problem = problems[problemIndex];

      // Easy + 왼쪽(분수1)인 경우 → 백분율로 표시
      if (problem.difficulty === 'easy' && fractionSide === "first") {
        const btn = document.createElement('div');
        btn.className = 'percentage';
        btn.textContent = problem.preset + "%";
        btn.addEventListener('click', function() {
          selectAnswer(problemIndex, btn, fractionSide);
        });
        return btn;
      } else {
        // 기본 분수 표기
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

        btn.addEventListener('click', function() {
          selectAnswer(problemIndex, btn, fractionSide);
        });
        return btn;
      }
    }

    function selectAnswer(problemIndex, btn, fractionSide) {
      const problemDiv = document.getElementById('problem-' + problemIndex);
      const allButtons = problemDiv.querySelectorAll('.fraction, .percentage');
      allButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      problems[problemIndex].userAnswer = fractionSide;
    }

    function renderProblems() {
      const problemsDiv = document.getElementById('problems');
      problemsDiv.innerHTML = '';
      problems.forEach((problem, index) => {
        const div = document.createElement('div');
        div.className = 'problem';
        div.id = 'problem-' + index;

        const frac1Btn = createFractionButton(problem.frac1, index, "first");
        const frac2Btn = createFractionButton(problem.frac2, index, "second");
        div.appendChild(frac1Btn);
        div.appendChild(frac2Btn);

        problemsDiv.appendChild(div);
      });
    }

    // 문제 생성
    function generateProblems() {
      const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
      problems = [];
      for (let i = 0; i < 15; i++) {
        problems.push(generateProblem(difficulty));
      }
      renderProblems();
      document.getElementById('result').textContent = "";
    }

    // 채점
    function gradeProblems() {
      let correctCount = 0;
      problems.forEach((problem, index) => {
        const problemDiv = document.getElementById('problem-' + index);
        if (problem.userAnswer === problem.answer) {
          correctCount++;
          problemDiv.style.backgroundColor = '#d4edda'; // 연한 초록
        } else {
          problemDiv.style.backgroundColor = '#f8d7da'; // 연한 빨강
        }
      });
      document.getElementById('result').textContent = "정답: " + correctCount + " / 15";
    }

    // 이벤트 연결
    document.getElementById('refresh').addEventListener('click', generateProblems);
    document.getElementById('grade').addEventListener('click', gradeProblems);
    document.querySelectorAll('input[name="difficulty"]').forEach(radio => {
      radio.addEventListener('change', generateProblems);
    });

    // 초기 실행
    generateProblems();
  </script>
</body>
</html>

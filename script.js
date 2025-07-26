let ballProvidersManuallyChanged = false; // 공 제공자 수 수동 변경 여부를 추적하는 플래그

function setCourtValue(id, value) {
  document.getElementById(id).value = value;
  // 코트 수 변경 시 인원 및 공 제공자 기본값 업데이트 및 재계산
  updateCourtRelatedDefaults(); // 추가된 함수 호출
  calculateFees(); // 재계산 호출
}

function setPeopleValue(value) {
  document.getElementById('totalPeople').value = value;
  calculateFees(); // 인원수 변경 시 재계산 호출
}

// 새로운 함수 추가: 테니스공 제공자 수 버튼 클릭 시 호출
function setBallProviders(value) {
  document.getElementById('ballProviders').value = value;
  ballProvidersManuallyChanged = true; // 수동 변경 플래그 설정
  updateBallProviderDefaults(); // 공 제공자 수 변경 시 공 개수 드롭다운도 업데이트
  calculateFees(); // 재계산 호출
}

// 새로운 함수 추가: 각 제공자 공 개수 버튼 클릭 시 호출
function setBallCount(id, value) {
  document.getElementById(id).value = value;
  calculateFees(); // 공 개수 변경 시 재계산 호출
}

function updateBallProviderDefaults(isInitialLoadOrCourtChange = false) {
  const indoorCourts = parseInt(document.getElementById('indoorCourts').value || 0);
  const outdoorCourts = parseInt(document.getElementById('outdoorCourts').value || 0);
  const totalCourts = indoorCourts + outdoorCourts;

  const ballProvidersSelect = document.getElementById('ballProviders');
  const ballProvider1BallsSelect = document.getElementById('ballProvider1Balls');
  const ballProvider2BallsSelect = document.getElementById('ballProvider2Balls');
  const ballProvider3BallsSelect = document.getElementById('ballProvider3Balls');
  const ballProvider4BallsSelect = document.getElementById('ballProvider4Balls');

  if (isInitialLoadOrCourtChange && ballProvidersSelect.value === "") {
      ballProvidersSelect.value = "0";
  }

  const providers = parseInt(ballProvidersSelect.value);
  document.getElementById('ballProvider1Group').style.display = (providers >= 1) ? 'block' : 'none';
  document.getElementById('ballProvider2Group').style.display = (providers >= 2) ? 'block' : 'none';
  document.getElementById('ballProvider3Group').style.display = (providers >= 3) ? 'block' : 'none';
  document.getElementById('ballProvider4Group').style.display = (providers >= 4) ? 'block' : 'none';

  const ballSelects = [ballProvider1BallsSelect, ballProvider2BallsSelect, ballProvider3BallsSelect, ballProvider4BallsSelect];
  for (let i = 0; i < ballSelects.length; i++) {
    if (providers >= (i + 1)) {
      if (ballSelects[i].value === "0" || ballSelects[i].value === "") {
        ballSelects[i].value = "1";
      }
    } else {
      ballSelects[i].value = "0";
    }
  }
}

/**
 * 코트 수 선택에 따라 인원수와 공 제공자 수 및 공 개수 기본값을 업데이트하고,
 * 공 제공자별 공 개수 드롭다운을 활성화/비활성화합니다.
 * 사용자가 수동으로 공 제공자 수를 변경했을 경우 그 값을 존중합니다.
 */
function updateCourtRelatedDefaults() {
    const indoorCourts = parseInt(document.getElementById('indoorCourts').value) || 0;
    const outdoorCourts = parseInt(document.getElementById('outdoorCourts').value) || 0;
    const selectedCourtCount = indoorCourts + outdoorCourts;

    // 1. 총 인원수 기본값 설정 (코트수 * 4)
    const totalPeopleInput = document.getElementById('totalPeople');
    const currentTotalPeople = parseInt(totalPeopleInput.value);
    const suggestedTotalPeople = selectedCourtCount * 4;
    if (currentTotalPeople < suggestedTotalPeople) {
        totalPeopleInput.value = suggestedTotalPeople;
    }

    // 2. 공 제공자 인원 기본값 설정 (코트수와 동일) - 이 부분이 수정됩니다.
    const ballProvidersSelect = document.getElementById('ballProviders');
    let bestMatchValue = 0; // 초기값 0으로 설정
    let minDiff = Infinity;
    let foundExactMatch = false;

    // 먼저 정확히 일치하는 옵션이 있는지 확인
    for (let i = 0; i < ballProvidersSelect.options.length; i++) {
        const optionValue = parseInt(ballProvidersSelect.options[i].value);
        if (optionValue === selectedCourtCount) {
            bestMatchValue = optionValue;
            foundExactMatch = true;
            break;
        }
    }

    // 정확히 일치하는 옵션이 없으면 가장 가까운 값 찾기
    if (!foundExactMatch) {
        for (let i = 0; i < ballProvidersSelect.options.length; i++) {
            const optionValue = parseInt(ballProvidersSelect.options[i].value);
            const diff = Math.abs(optionValue - selectedCourtCount);
            if (diff < minDiff) {
                minDiff = diff;
                bestMatchValue = optionValue;
            }
        }
    }

    // 사용자가 수동으로 변경하지 않았거나, 현재 값이 0(초기값)인 경우에만 기본값으로 업데이트
    if (!ballProvidersManuallyChanged || parseInt(ballProvidersSelect.value) === 0) {
        ballProvidersSelect.value = bestMatchValue;
    }


    // 3. 공 제공자 개수 드롭다운 활성화/비활성화 및 기본값 (1개) 설정
    const currentBallProviders = parseInt(ballProvidersSelect.value) || 0; // 현재 선택된 공 제공자 수

    for (let i = 1; i <= 4; i++) {
        const ballProviderCountContainer = document.getElementById(`ballProvider${i}Group`);
        const ballProviderBallsSelect = document.getElementById(`ballProvider${i}Balls`);

        if (ballProviderCountContainer && ballProviderBallsSelect) {
            if (i <= currentBallProviders) {
                ballProviderCountContainer.style.display = 'block';
                ballProviderBallsSelect.disabled = false;
                if (ballProviderBallsSelect.value === '' || parseInt(ballProviderBallsSelect.value) === 0) {
                    ballProviderBallsSelect.value = '1';
                }
            } else {
                ballProviderCountContainer.style.display = 'none';
                ballProviderBallsSelect.disabled = true;
                ballProviderBallsSelect.value = '0';
            }
        }
    }
}


// --- 이벤트 리스너 연결 (수정 및 추가) ---
// 페이지 로드 시 초기값 설정 및 계산 실행
document.addEventListener('DOMContentLoaded', () => {
    updateCourtRelatedDefaults();
    calculateFees(); // 초기 계산
    loadRankingBoardUrl(); // 페이지 로드 시 랭킹보드 URL 로드 함수 호출
});

// 코트 수 변경 시 기본값 업데이트 및 계산 재실행
document.getElementById('indoorCourts').addEventListener('change', () => {
    updateCourtRelatedDefaults();
    calculateFees();
});
document.getElementById('outdoorCourts').addEventListener('change', () => {
    updateCourtRelatedDefaults();
    calculateFees();
});

// 공 제공자 수 변경 시에도 공 개수 기본값 재설정 및 계산
// 사용자가 수동으로 ballProviders를 변경했음을 기록
document.getElementById('ballProviders').addEventListener('change', () => {
    ballProvidersManuallyChanged = true; // 수동 변경 플래그 설정
    updateBallProviderDefaults(); // 공 제공자 수 변경 시 공 개수 드롭다운도 업데이트
    calculateFees();
});

// 공 제공자별 공 개수 변경 시 계산
document.getElementById('ballProvider1Balls').addEventListener('change', calculateFees);
document.getElementById('ballProvider2Balls').addEventListener('change', calculateFees);
document.getElementById('ballProvider3Balls').addEventListener('change', calculateFees);
document.getElementById('ballProvider4Balls').addEventListener('change', calculateFees);

// 기존의 다른 eventListeners 유지
document.getElementById('date').addEventListener('change', calculateFees);
document.getElementById('startTime').addEventListener('change', calculateFees);
document.getElementById('endTime').addEventListener('change', calculateFees);
document.getElementById('indoorDiscountCourts').addEventListener('change', calculateFees);
document.getElementById('outdoorDiscountCourts').addEventListener('change', calculateFees);

document.addEventListener('DOMContentLoaded', function() {
  const dateInput = document.getElementById('date');

  updateTimeDefaults();
  dateInput.addEventListener('change', updateTimeDefaults);

  updateBallProviderDefaults(true);

  // Kakao SDK 초기화 (카톡 버튼 숨겨져 있어도 초기화 유지)
  // 이곳에 사용자님의 실제 JavaScript 키를 넣어주세요.
  // 예: Kakao.init('YOUR_JAVO_SCRIPT_KEY');
});

async function updateTimeDefaults() {
  const dateInput = document.getElementById('date');
  const startTimeSelect = document.getElementById('startTime');
  const endTimeSelect = document.getElementById('endTime');

  const selectedDateString = dateInput.value;
  const selectedDate = new Date(selectedDateString);
  const dayOfWeek = selectedDate.getDay(); // 0=일, 1=월, ..., 6=토

  let isWeekendOrHoliday = (dayOfWeek === 0 || dayOfWeek === 6);

  if (!isWeekendOrHoliday) {
    try {
      const holidays = await new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler(resolve)
          .withFailureHandler(reject)
          .getPublicHolidays(selectedDate.getFullYear());
      });

      const holidayDates = holidays.map(h => {
        const date = new Date(h.date);
        return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 10);
      });

      if (holidayDates.includes(selectedDateString)) {
        isWeekendOrHoliday = true;
      }
    } catch (e) {
      console.error("공휴일 정보를 가져오는 중 오류 발생:", e.message);
    }
  }

  if (isWeekendOrHoliday) {
    startTimeSelect.value = "06:00";
    endTimeSelect.value = "08:00";
  } else {
    startTimeSelect.value = "10:00";
    endTimeSelect.value = "12:00";
  }
}

function calculateFees() {
  document.getElementById('loadingMessage').style.display = 'block';
  document.getElementById('error').style.display = 'none';
  document.getElementById('result').style.display = 'none';
  document.getElementById('infoMessage').style.display = 'none';

  const date = document.getElementById('date').value;
  const startTime = document.getElementById('startTime').value;
  const endTime = document.getElementById('endTime').value;
  const indoorCourts = document.getElementById('indoorCourts').value;
  const indoorDiscountCourts = document.getElementById('indoorDiscountCourts').value;
  const outdoorCourts = document.getElementById('outdoorCourts').value;
  const outdoorDiscountCourts = document.getElementById('outdoorDiscountCourts').value;
  const totalPeople = document.getElementById('totalPeople').value;
  const ballProviders = document.getElementById('ballProviders').value;
  const ballProvider1Balls = document.getElementById('ballProvider1Balls').value;
  const ballProvider2Balls = document.getElementById('ballProvider2Balls').value;
  const ballProvider3Balls = document.getElementById('ballProvider3Balls').value;
  const ballProvider4Balls = document.getElementById('ballProvider4Balls').value;

  const formData = {
    date: date,
    startTime: startTime,
    endTime: endTime,
    indoorCourts: indoorCourts,
    indoorDiscountCourts: indoorDiscountCourts,
    outdoorCourts: outdoorCourts,
    outdoorDiscountCourts: outdoorDiscountCourts,
    totalPeople: totalPeople,
    ballProviders: ballProviders,
    firstProviderBallCount: ballProvider1Balls,
    secondProviderBallCount: ballProvider2Balls,
    thirdProviderBallCount: ballProvider3Balls,
    fourthProviderBallCount: ballProvider4Balls
  };

  google.script.run
    .withSuccessHandler(function(response) {
      document.getElementById('loadingMessage').style.display = 'none';

      if (response.error) {
        document.getElementById('error').textContent = response.error;
        document.getElementById('error').style.display = 'block';
      } else {
        document.getElementById('calculationResultTitle').style.display = 'block';
        document.getElementById('totalCourtFee').innerHTML = `🎾 <strong>총 코트 대여료:</strong> ${response.totalCourtFee.toLocaleString()}원`;
        document.getElementById('totalTennisCost').innerHTML = `🥎 <strong>총 테니스 비용 (공 포함):</strong> ${response.totalTennisCost.toLocaleString()}원`;

        const individualCostsDiv = document.getElementById('individualCosts');
        individualCostsDiv.innerHTML = '';

        response.individualCosts.forEach(item => {
          let displayItem = item.replace(/\*\*/g, '<strong>') + '</strong>';

          // '일반 참가자 송금액:' 항목만 같은 줄에 표시하도록 수정
          if (item.includes('일반 참가자 송금액:')) {
              individualCostsDiv.innerHTML += `<span class="inline-item">💰 ${displayItem}</span>`;
          } else if (item.includes('테니스공 제공자 환급액:')) { // 기존 환급액 메시지 유지
              individualCostsDiv.innerHTML += `<span class="inline-item">💸 ${displayItem}</span>`;
          } else { // 그 외 항목은 기존처럼 줄바꿈 유지 (주로 추가 지불 메시지)
              // 마지막 식에만 "🏃‍♂️ 부지런한사람:" 추가
              if (item.includes('원 = ') && item.includes('원)')) {
                  individualCostsDiv.innerHTML += `<span>🏃‍♂️ <strong>부지런한사람:</strong> ${displayItem}</span>`;
              } else {
                  individualCostsDiv.innerHTML += `<span>${displayItem}</span>`;
              }
          }
        });

        // 코트 대여 임무 표시 로직 추가
        const courtRentalDutyDisplay = document.getElementById('courtRentalDutyDisplay');
        if (response.courtRentalDuty) {
          courtRentalDutyDisplay.innerHTML = `🌟 <strong>코트 대여 임무:</strong> ${response.courtRentalDuty}`;
          courtRentalDutyDisplay.style.display = 'block';
        } else {
          courtRentalDutyDisplay.style.display = 'none'; // 주말이 아니거나 이름이 없으면 숨김
        }

        document.getElementById('result').style.display = 'block';
      }
    })
    .withFailureHandler(function(error) {
      document.getElementById('loadingMessage').style.display = 'none';
      document.getElementById('loadingMessage').textContent = '계산 중입니다...'; // 원래 메시지로 복원
      document.getElementById('error').textContent = '계산 중 오류가 발생했습니다: ' + error.message;
      document.getElementById('error').style.display = 'block';
    })
    .calculateCourtFees(formData);
}

// --- 랭킹보드 버튼 관련 함수 (새로 추가) ---
function loadRankingBoardUrl() {
    const rankingBoardButton = document.getElementById('rankingBoardButton');
    rankingBoardButton.style.display = 'none'; // 기본적으로 숨김

    google.script.run
        .withSuccessHandler(function(url) {
            if (url) { // URL이 유효할 경우
                rankingBoardButton.style.display = 'block'; // 버튼 보이기
                rankingBoardButton.onclick = function() {
                    window.open(url, '_blank'); // 새 탭에서 URL 열기
                };
            } else { // URL이 없거나 유효하지 않을 경우 (Code.gs에서 null 반환 시)
                rankingBoardButton.style.display = 'none'; // 버튼 숨김
                console.warn("랭킹보드 웹앱 주소를 불러올 수 없거나 유효하지 않습니다. 버튼을 숨깁니다.");
            }
        })
        .withFailureHandler(function(error) {
            console.error("랭킹보드 웹앱 주소를 불러오는 중 오류 발생:", error.message);
            rankingBoardButton.style.display = 'none'; // 오류 시 버튼 숨김
        })
        .getScoreTrackerAppUrl(); // Code.gs의 함수 호출 (이 함수가 이제 랭킹보드 URL을 가져옴)
}

// 페이지 로드 시 랭킹보드 URL을 로드하도록 호출
document.addEventListener('DOMContentLoaded', loadRankingBoardUrl);

// 기존의 openScoreTracker 함수 및 관련 스크립트 삭제됨.
// 기존의 Kakao SDK 초기화 부분은 주석 처리된 채로 유지합니다.
document.addEventListener('DOMContentLoaded', function() {
    // 기존 Kakao SDK 초기화 (필요시 활성화하고 YOUR_JAVO_SCRIPT_KEY를 실제 키로 변경)
    // Kakao.init('YOUR_JAVO_SCRIPT_KEY');
});
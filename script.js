// 카카오톡 SDK 초기화
if (Kakao && !Kakao.isInitialized()) {
    Kakao.init('67cf828f37dca7dd4b1feef97f2ea7f1');
    console.log('Kakao SDK initialized:', Kakao.isInitialized());
}

// =========================================================
// 1. 데이터 정의 (구글 시트에서 가져와 하드코딩된 내용)
// =========================================================

const COURT_FEES = {
    OUTDOOR: {
        weekday: { early: 3000, day: 3000, night: 4500 },
        weekend: { early: 4000, day: 4000, night: 6000 }
    },
    INDOOR: { weekday: 6000, weekend: 11000 }
};

const LIGHTING_FEES = {
    OUTDOOR: { early: 4000, day: 0, night: 4000 },
    INDOOR: 4000
};

const MONTHLY_TIME_SLOTS = {
    1: { earlyStart: '05:00', earlyEnd: '08:00', dayStart: '08:00', dayEnd: '17:00', nightStart: '17:00', nightEnd: '22:00' },
    2: { earlyStart: '05:00', earlyEnd: '07:00', dayStart: '07:00', dayEnd: '18:00', nightStart: '18:00', nightEnd: '22:00' },
    3: { earlyStart: '05:00', earlyEnd: '07:00', dayStart: '07:00', dayEnd: '18:00', nightStart: '18:00', nightEnd: '22:00' },
    4: { earlyStart: '05:00', earlyEnd: '06:00', dayStart: '06:00', dayEnd: '19:00', nightStart: '19:00', nightEnd: '22:00' },
    5: { earlyStart: '05:00', earlyEnd: '06:00', dayStart: '06:00', dayEnd: '19:00', nightStart: '19:00', nightEnd: '22:00' },
    6: { earlyStart: '05:00', earlyEnd: '06:00', dayStart: '06:00', dayEnd: '20:00', nightStart: '20:00', nightEnd: '22:00' },
    7: { earlyStart: '05:00', earlyEnd: '06:00', dayStart: '06:00', dayEnd: '20:00', nightStart: '20:00', nightEnd: '22:00' },
    8: { earlyStart: '05:00', earlyEnd: '06:00', dayStart: '06:00', dayEnd: '20:00', nightStart: '20:00', nightEnd: '22:00' },
    9: { earlyStart: '05:00', earlyEnd: '06:00', dayStart: '06:00', dayEnd: '19:00', nightStart: '19:00', nightEnd: '22:00' },
    10: { earlyStart: '05:00', earlyEnd: '07:00', dayStart: '07:00', dayEnd: '18:00', nightStart: '18:00', nightEnd: '22:00' },
    11: { earlyStart: '05:00', earlyEnd: '07:00', dayStart: '07:00', dayEnd: '17:00', nightStart: '17:00', nightEnd: '22:00' },
    12: { earlyStart: '05:00', earlyEnd: '08:00', dayStart: '08:00', dayEnd: '17:00', nightStart: '17:00', nightEnd: '22:00' }
};

const COURT_MANAGERS = [
    { name: '이창민', start: '2025-04-01', end: '2025-09-30' },
    { name: '박준형', start: '2025-10-01', end: '2026-03-31' },
    { name: '김진규', start: '2026-04-01', end: '2026-09-30' },
    { name: '김동주', start: '2026-10-01', end: '2027-03-31' },
    { name: '이우열', start: '2027-04-01', end: '2027-09-30' },
    { name: '임상섭', start: '2027-10-01', end: '2028-03-31' },
    { name: '김요셉', start: '2028-04-01', end: '2028-09-30' },
    { name: '나지수', start: '2028-10-01', end: '2029-03-31' },
    { name: '육권문', start: '2029-04-01', end: '2029-09-30' },
    { name: '최용진', start: '2029-10-01', end: '2030-03-31' },
    { name: '김지석', start: '2030-04-01', end: '2030-09-30' },
    { name: '이영상', start: '2030-10-01', end: '2031-03-31' },
    { name: '이창민', start: '2031-04-01', end: '2031-09-30' }
];

const BALL_PRICE = 3500;
const INDOOR_OPERATION_START_HOUR = 5;
const INDOOR_OPERATION_END_HOUR = 22;
const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));

// =========================================================
// 2. DOM 요소 가져오기
// =========================================================
const usageDateInput = document.getElementById('usageDate');
const startTimeSelect = document.getElementById('startTime');
const endTimeSelect = document.getElementById('endTime');
const indoorCourtCountSelect = document.getElementById('indoorCourtCount');
const indoorDiscountedCourtCountSelect = document.getElementById('indoorDiscountedCourtCount');
const outdoorCourtCountSelect = document.getElementById('outdoorCourtCount');
const outdoorDiscountedCourtCountSelect = document.getElementById('outdoorDiscountedCourtCount');
const totalParticipantsSelect = document.getElementById('totalParticipants');
const ballProviderCountSelect = document.getElementById('ballProviderCount');
const ballProvidersDiv = document.getElementById('ballProviders');
const calculateBtn = document.getElementById('calculateBtn');
const shareKakaoBtn = document.getElementById('shareKakao');
const totalCourtRentalDisplayFeeSpan = document.getElementById('totalCourtRentalDisplayFee');
const totalTennisCostSpan = document.getElementById('totalTennisCost');
const regularParticipantAmountSpan = document.getElementById('regularParticipantAmount');
const ballProviderSettlementDiv = document.getElementById('ballProviderSettlement');
const courtManagerResultDiv = document.getElementById('courtManagerResult');
const courtManagerSpan = document.getElementById('courtManager');

// =========================================================
// 3. 헬퍼 함수
// =========================================================

function populateTimeOptions(selectElement) {
    selectElement.innerHTML = '';
    TIME_OPTIONS.forEach(hour => {
        const option = document.createElement('option');
        option.value = hour;
        option.textContent = `${hour}:00`;
        selectElement.appendChild(option);
    });
}

function isWeekend(dateString) {
    const date = new Date(dateString);
    const day = date.getDay();
    return day === 0 || day === 6;
}

function getTimeCategory(month, hour) {
    const slots = MONTHLY_TIME_SLOTS[`${month}`];
    if (!slots) return null;

    const hourNum = parseInt(hour);
    const earlyEndHour = parseInt(slots.earlyEnd.split(':')[0]);
    const dayEndHour = parseInt(slots.dayEnd.split(':')[0]);
    const nightEndHour = parseInt(slots.nightEnd.split(':')[0]);

    if (hourNum >= parseInt(slots.earlyStart.split(':')[0]) && hourNum < earlyEndHour) return 'early';
    if (hourNum >= parseInt(slots.dayStart.split(':')[0]) && hourNum < dayEndHour) return 'day';
    if (hourNum >= parseInt(slots.nightStart.split(':')[0]) && hourNum < nightEndHour || hourNum === nightEndHour && slots.nightEnd.endsWith('00')) return 'night';
    return null;
}

function findCourtManager(dateString) {
    const targetDate = new Date(dateString);
    targetDate.setHours(0, 0, 0, 0);
    for (const manager of COURT_MANAGERS) {
        const startDate = new Date(manager.start);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(manager.end);
        endDate.setHours(0, 0, 0, 0);
        if (targetDate >= startDate && targetDate <= endDate) {
            return manager.name;
        }
    }
    return '정보 없음';
}

function updateDiscountedCourtOptions(totalSelectId, discountedSelectId) {
    const totalCourts = parseInt(document.getElementById(totalSelectId).value);
    const discountedSelect = document.getElementById(discountedSelectId);
    const currentDiscounted = parseInt(discountedSelect.value);
    discountedSelect.innerHTML = '';
    for (let i = 0; i <= totalCourts; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `${i}개`;
        option.selected = i === Math.min(currentDiscounted, totalCourts); // 현재 값 유지하되 총 코트수 초과하지 않게
        discountedSelect.appendChild(option);
    }
    const buttonRow = discountedSelect.nextElementSibling;
    if (buttonRow && buttonRow.classList.contains('button-row')) {
        buttonRow.innerHTML = '';
        for (let i = 0; i <= totalCourts; i++) {
            const button = document.createElement('button');
            button.type = 'button';
            button.dataset.target = discountedSelectId;
            button.dataset.value = i;
            button.textContent = `${i}개`;
            buttonRow.appendChild(button);
        }
    }
}

function generateBallProviderInputs() {
    const count = parseInt(ballProviderCountSelect.value);
    ballProvidersDiv.innerHTML = ''; // 기존 입력 필드 초기화

    for (let i = 0; i < count; i++) {
        const ballProviderGroup = document.createElement('div');
        ballProviderGroup.classList.add('input-group');
        ballProviderGroup.classList.add('ball-provider-info'); // CSS 스타일링을 위한 클래스 추가

        ballProviderGroup.innerHTML = `
            <label for="ballCount${i}">공 제공자 ${i + 1} 제공 공 개수:</label>
            <select id="ballCount${i}" class="ball-count-select">
                ${Array.from({ length: 5 }, (_, j) => `<option value="${j}" ${j === 1 ? 'selected' : ''}>${j}개</option>`).join('')}
            </select>
            <div class="button-row">
                ${Array.from({ length: 5 }, (_, j) => `<button type="button" data-target="ballCount${i}" data-value="${j}">${j}개</button>`).join('')}
            </div>
        `;
        ballProvidersDiv.appendChild(ballProviderGroup);
    }
}

// 버튼 클릭 시 드롭다운 값 변경 헬퍼
function handleButtonClick(event) {
    const targetId = event.target.dataset.target;
    const value = event.target.dataset.value;
    if (targetId && value !== undefined) {
        const selectElement = document.getElementById(targetId);
        if (selectElement) {
            selectElement.value = value;
            // 특정 select 변경 시 연동되는 로직 호출
            if (targetId === 'ballProviderCount') {
                generateBallProviderInputs();
            } else if (targetId === 'indoorCourtCount') {
                updateDiscountedCourtOptions('indoorCourtCount', 'indoorDiscountedCourtCount');
            } else if (targetId === 'outdoorCourtCount') {
                updateDiscountedCourtOptions('outdoorCourtCount', 'outdoorDiscountedCourtCount');
            }
        }
    }
}


// =========================================================
// 4. 메인 계산 로직
// =========================================================
function calculateFees() {
    const usageDateStr = usageDateInput.value;
    const startTimeHour = parseInt(startTimeSelect.value);
    const endTimeHour = parseInt(endTimeSelect.value);

    const indoorCourtCount = parseInt(indoorCourtCountSelect.value);
    const indoorDiscountedCourtCount = parseInt(indoorDiscountedCourtCountSelect.value);
    const outdoorCourtCount = parseInt(outdoorCourtCountSelect.value);
    const outdoorDiscountedCourtCount = parseInt(outdoorDiscountedCourtCountSelect.value);

    const totalParticipants = parseInt(totalParticipantsSelect.value);
    const ballProviderCount = parseInt(ballProviderCountSelect.value);

    // 필수 입력값 검증
    if (!usageDateStr) {
        alert('날짜를 선택해주세요.');
        return;
    }
    if (startTimeHour >= endTimeHour) {
        alert('종료 시간은 시작 시간보다 늦어야 합니다.');
        return;
    }
    if (totalParticipants <= 0) {
        alert('총 인원수는 1명 이상이어야 합니다.');
        return;
    }
    if (indoorCourtCount + outdoorCourtCount === 0) {
        alert('실내 또는 실외 코트를 1개 이상 대여해야 합니다.');
        return;
    }
    if (indoorDiscountedCourtCount < 0 || indoorDiscountedCourtCount > indoorCourtCount ||
        outdoorDiscountedCourtCount < 0 || outdoorDiscountedCourtCount > outdoorCourtCount) {
        alert('감면 코트 수는 0 이상이고 총 코트 수를 초과할 수 없습니다.');
        resetResults();
        return;
    }

    const selectedDate = new Date(usageDateStr);
    const month = selectedDate.getMonth() + 1;
    const isDayOff = isWeekend(usageDateStr);

    let totalCourtRentalFee = 0; // 순수 코트 대여료 (할인 적용 전)
    let totalLightingFee = 0; // 총 조명 요금
    let totalDiscountAmount = 0; // 총 할인 금액

    // 각 시간대별로 계산 (시작 시간부터 종료 시간 전까지)
    for (let hour = startTimeHour; hour < endTimeHour; hour++) {
        const timeCategory = getTimeCategory(month, hour);
        if (!timeCategory) {
            alert(`선택하신 날짜와 시간대(${hour}:00)에 해당하는 요금 정보가 없습니다.`);
            resetResults();
            return;
        }

        // 실내 코트 계산
        let indoorRentalFeePerHour = isDayOff ? COURT_FEES.INDOOR.weekend : COURT_FEES.INDOOR.weekday;
        let indoorLightingFeePerHour = LIGHTING_FEES.INDOOR;

        for (let i = 0; i < indoorCourtCount; i++) {
            let currentIndoorRentalFee = indoorRentalFeePerHour;
            if (i < indoorDiscountedCourtCount) {
                const discountedAmount = currentIndoorRentalFee * 0.5;
                totalDiscountAmount += (currentIndoorRentalFee - discountedAmount);
                currentIndoorRentalFee = discountedAmount;
            }
            totalCourtRentalFee += currentIndoorRentalFee;
            totalLightingFee += indoorLightingFeePerHour;
        }

        // 실외 코트 계산
        let outdoorRentalFeePerHour = isDayOff ? COURT_FEES.OUTDOOR.weekend[timeCategory] : COURT_FEES.OUTDOOR.weekday[timeCategory];
        let outdoorLightingFeePerHour = LIGHTING_FEES.OUTDOOR[timeCategory];

        for (let i = 0; i < outdoorCourtCount; i++) {
            let currentOutdoorRentalFee = outdoorRentalFeePerHour;
            if (i < outdoorDiscountedCourtCount) {
                const discountedAmount = currentOutdoorRentalFee * 0.5;
                totalDiscountAmount += (currentOutdoorRentalFee - discountedAmount);
                currentOutdoorRentalFee = discountedAmount;
            }
            totalCourtRentalFee += currentOutdoorRentalFee;
            totalLightingFee += outdoorLightingFeePerHour;
        }
    }

    const finalTotalCourtAndLightingFee = totalCourtRentalFee + totalLightingFee;

    let totalBallCount = 0;
    const ballCountsPerProvider = [];
    for (let i = 0; i < ballProviderCount; i++) {
        const ballCountElement = document.getElementById(`ballCount${i}`);
        const count = ballCountElement ? parseInt(ballCountElement.value) : 0;
        totalBallCount += count;
        ballCountsPerProvider.push(count);
    }
    const totalBallFee = totalBallCount * BALL_PRICE;
    const finalTotalTennisCost = finalTotalCourtAndLightingFee + totalBallFee;

    const regularParticipantAmount = finalTotalTennisCost / totalParticipants;

    // 공 제공자 정산 (동적으로 생성)
    ballProviderSettlementDiv.innerHTML = '';
    
    if (ballProviderCount > 0) {
        const headerP = document.createElement('p');
        headerP.innerHTML = `💰 <strong>2. 테니스공 제공자 정산:</strong>`;
        ballProviderSettlementDiv.appendChild(headerP);
    }

    for (let i = 0; i < ballProviderCount; i++) {
        const currentProviderBallCount = ballCountsPerProvider[i];
        const providerBallCost = currentProviderBallCount * BALL_PRICE;
        const ballProviderRefund = providerBallCost - regularParticipantAmount;
        
        let ballProviderText = `- 공 제공자 ${i + 1} (공값 ${providerBallCost.toLocaleString()}원): `;
        ballProviderText += `${providerBallCost.toLocaleString()}원 - ${regularParticipantAmount.toLocaleString()} = ${ballProviderRefund.toLocaleString()}원`;
        ballProviderText += ` (총 ${ballProviderRefund.toLocaleString()}원 ${ballProviderRefund >= 0 ? '환급' : '지불'})`;
        
        const ballProviderP = document.createElement('p');
        ballProviderP.innerHTML = ballProviderText;
        ballProviderP.style.marginLeft = '10px';
        ballProviderSettlementDiv.appendChild(ballProviderP);

        // '부지런한사람' 로직: 환급액이 양수일 때만 표시
        if (ballProviderRefund > 0) {
            let remainingRefund = ballProviderRefund;
            let diligentPersonText = `🏃‍♂️ 부지런한사람: (`;
            let firstIteration = true;

            while (remainingRefund >= regularParticipantAmount) {
                if (!firstIteration) {
                    diligentPersonText += ` - ${regularParticipantAmount.toLocaleString()}`;
                } else {
                    diligentPersonText += `${remainingRefund.toLocaleString()}`;
                    firstIteration = false;
                }
                remainingRefund -= regularParticipantAmount;
            }
            // 최종 나머지 표시
            if (remainingRefund > 0 || firstIteration) { // 첫 반복에서 바로 나머지가 나오는 경우도 처리
                if (!firstIteration) { // 중간에 뺐는데 나머지가 생긴 경우
                    diligentPersonText += ` = ${remainingRefund.toLocaleString()})`;
                } else { // 처음부터 나머지만 있는 경우 (예: 5000원 - 2000원 = 3000원)
                    diligentPersonText += ` - ${regularParticipantAmount.toLocaleString()} = ${remainingRefund.toLocaleString()})`;
                }
            } else if (remainingRefund <= 0 && !firstIteration) { // 음수가 되기 직전까지 다 뺀 경우
                diligentPersonText += ` = ${remainingRefund.toLocaleString()})`; // 남은 금액 표시 (음수 포함)
            } else if (firstIteration) { // 환급금 자체가 일반 참가자 송금액보다 적어 바로 음수이거나 0인 경우
                // 이 경우 부지런한 사람 표시 안함 (조건이 ballProviderRefund > 0 이므로)
                // 하지만 혹시 나중에 음수까지 표시한다면 이 부분 수정 필요
            }


            const diligentPersonP = document.createElement('p');
            diligentPersonP.innerHTML = diligentPersonText;
            diligentPersonP.style.marginLeft = '30px';
            ballProviderSettlementDiv.appendChild(diligentPersonP);
        }
    }


    // 코트 대여 임무자 (주말에만 표시)
    if (isDayOff) {
        courtManagerResultDiv.style.display = 'block'; // 주말에만 표시
        courtManagerSpan.textContent = findCourtManager(usageDateStr);
    } else {
        courtManagerResultDiv.style.display = 'none'; // 평일에는 숨김
    }
    
    // 결과 표시
    totalCourtRentalDisplayFeeSpan.textContent = `${finalTotalCourtAndLightingFee.toLocaleString()}원`;
    totalTennisCostSpan.textContent = `${finalTotalTennisCost.toLocaleString()}원`;
    regularParticipantAmountSpan.textContent = `${regularParticipantAmount.toLocaleString()}원`;
}

// =========================================================
// 5. 이벤트 리스너
// =========================================================

// 페이지 로드 시 시간 옵션 채우기 및 기본 날짜, 입력 필드 값 설정
document.addEventListener('DOMContentLoaded', () => {
    populateTimeOptions(startTimeSelect);
    populateTimeOptions(endTimeSelect);

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    
    usageDateInput.value = todayStr;

    // 기본 시간 설정: 평일 10시~12시, 주말 6시~8시
    if (isWeekend(todayStr)) {
        startTimeSelect.value = '06';
        endTimeSelect.value = '08';
    } else {
        startTimeSelect.value = '10';
        endTimeSelect.value = '12';
    }

    // 초기 코트 수에 따른 감면 코트 수 옵션 업데이트
    updateDiscountedCourtOptions('indoorCourtCount', 'indoorDiscountedCourtCount');
    updateDiscountedCourtOptions('outdoorCourtCount', 'outdoorDiscountedCourtCount');

    // 초기 공 제공자 입력 필드 생성
    generateBallProviderInputs();

    // 초기 계산 (선택된 기본값으로)
    calculateFees();
});

// 날짜 변경 시 시작/종료 시간 기본값 조정 (평일 10~12, 주말 6~8)
usageDateInput.addEventListener('change', (event) => {
    const selectedDateStr = event.target.value;
    if (isWeekend(selectedDateStr)) {
        startTimeSelect.value = '06';
        endTimeSelect.value = '08';
    } else {
        startTimeSelect.value = '10';
        endTimeSelect.value = '12';
    }
    calculateFees(); // 날짜 변경 시 자동 재계산
});

// 코트 수 변경 시 감면 코트 수 옵션 업데이트
indoorCourtCountSelect.addEventListener('change', () => {
    updateDiscountedCourtOptions('indoorCourtCount', 'indoorDiscountedCourtCount');
    calculateFees();
});
indoorDiscountedCourtCountSelect.addEventListener('change', calculateFees);

outdoorCourtCountSelect.addEventListener('change', () => {
    updateDiscountedCourtOptions('outdoorCourtCount', 'outdoorDiscountedCourtCount');
    calculateFees();
});
outdoorDiscountedCourtCountSelect.addEventListener('change', calculateFees);


// 총 인원, 공 제공자 수 변경 시 동적 입력 필드 생성 및 재계산
totalParticipantsSelect.addEventListener('change', calculateFees);
ballProviderCountSelect.addEventListener('change', () => {
    generateBallProviderInputs(); // 공 제공자 수 변경 시 입력 필드 재생성
    calculateFees(); // 입력 필드 생성 후 재계산
});

// 공 제공자 개별 공 개수 변경 시 재계산 (동적으로 생성된 요소에 이벤트 위임)
ballProvidersDiv.addEventListener('change', (event) => {
    if (event.target.classList.contains('ball-count-select')) {
        calculateFees();
    }
});


// 드롭다운 옆 버튼 클릭 이벤트 (모든 .button-row 에 이벤트 위임)
document.querySelectorAll('.input-section').forEach(section => {
    section.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON' && event.target.closest('.button-row')) {
            handleButtonClick(event);
            calculateFees(); // 버튼 클릭 시 자동 재계산
        }
    });
});


// 시작/종료 시간 변경 시 재계산
startTimeSelect.addEventListener('change', calculateFees);
endTimeSelect.addEventListener('change', calculateFees);


// 계산 버튼 클릭 이벤트
calculateBtn.addEventListener('click', calculateFees);

// 카카오톡 공유 버튼 클릭 이벤트
shareKakaoBtn.addEventListener('click', function() {
    if (!Kakao.isInitialized()) {
        alert('카카오톡 SDK가 초기화되지 않았습니다. 잠시 후 다시 시도해주세요.');
        return;
    }

    // 카카오톡 공유 메시지 구성
    let shareText = `🎾 코트비 계산 결과 🎾\n\n`;
    shareText += `총 코트 대여료: ${totalCourtRentalDisplayFeeSpan.textContent}\n`;
    shareText += `총 테니스 비용 (공 포함): ${totalTennisCostSpan.textContent}\n\n`;
    shareText += `1. 일반 참가자 송금액: ${regularParticipantAmountSpan.textContent}\n`;
    
    const settlementHtml = ballProviderSettlementDiv.innerHTML;
    if (settlementHtml.trim() !== '') {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = settlementHtml;
        let settlementText = tempDiv.textContent
            .replace(/🎾|🥎|💰|🏃‍♂️|🌟/g, '') // 이모지 제거
            .replace(/2\. 테니스공 제공자 정산:/g, '2. 테니스공 제공자 정산:') // 헤더 텍스트 보정
            .replace(/(\r\n|\n|\r)/gm, '\n') // 모든 줄바꿈을 \n으로 통일
            .split('\n') // 줄바꿈 기준으로 분리
            .map(line => line.trim()) // 각 줄의 앞뒤 공백 제거
            .filter(line => line.length > 0) // 빈 줄 제거
            .join('\n'); // 다시 줄바꿈으로 연결
        shareText += `\n${settlementText}\n`;
    }
    
    // 코트 대여 임무자 정보가 표시될 때만 공유 메시지에 포함
    if (courtManagerResultDiv.style.display !== 'none') {
        shareText += `\n🌟 코트 대여 임무: ${courtManagerSpan.textContent}\n\n`;
    } else {
        shareText += `\n`; // 줄바꿈만 추가하여 일관성 유지
    }

    shareText += `테니스 코트비 계산기에서 계산되었습니다.`;

    Kakao.Share.sendDefault({
        objectType: 'text',
        text: shareText,
        link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
        },
    });
});


// 결과창 초기화 함수
function resetResults() {
    totalCourtRentalDisplayFeeSpan.textContent = '0원';
    totalTennisCostSpan.textContent = '0원';
    regularParticipantAmountSpan.textContent = '0원';
    ballProviderSettlementDiv.innerHTML = '';
    courtManagerSpan.textContent = '정보 없음';
    courtManagerResultDiv.style.display = 'none'; // 결과 초기화 시 숨김
}
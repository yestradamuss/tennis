// 카카오톡 SDK 초기화
if (typeof Kakao !== 'undefined' && !Kakao.isInitialized()) {
    Kakao.init('67cf828f37dca7dd4b1feef97f2ea7f1');
    console.log('Kakao SDK initialized:', Kakao.isInitialized());
}

// 데이터 정의
const COURT_FEES = {
    OUTDOOR: {
        weekday: { early: 3000, day: 3000, night: 4500 },
        weekend: { early: 4000, day: 4000, night: 6000 }
    },
    INDOOR: {
        weekday: 6000,
        weekend: 11000
    }
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

// DOM 요소
const usageDateInput = document.getElementById('usageDate');
const startTimeSelect = document.getElementById('startTime');
const endTimeSelect = document.getElementById('endTime');
const indoorCourtCountSelect = document.getElementById('indoorCourtCount');
const indoorDiscountCountSelect = document.getElementById('indoorDiscountCount');
const outdoorCourtCountSelect = document.getElementById('outdoorCourtCount');
const outdoorDiscountCountSelect = document.getElementById('outdoorDiscountCount');
const totalParticipantsSelect = document.getElementById('totalParticipants');
const ballProviderCountSelect = document.getElementById('ballProviderCount');
const ballProviderDetailsDiv = document.getElementById('ballProviderDetails');
const calculateBtn = document.getElementById('calculateBtn');
const shareKakaoBtn = document.getElementById('shareKakao');

const totalCourtRentalDisplayFeeSpan = document.getElementById('totalCourtRentalDisplayFee');
const totalTennisCostSpan = document.getElementById('totalTennisCost');
const regularParticipantAmountSpan = document.getElementById('regularParticipantAmount');
const ballProviderSettlementDiv = document.getElementById('ballProviderSettlement');
const courtManagerSpan = document.getElementById('courtManager');
const courtManagerSection = document.getElementById('courtManagerSection');

// 헬퍼 함수들
function populateTimeOptions() {
    startTimeSelect.innerHTML = '';
    endTimeSelect.innerHTML = '';
    
    // 05시부터 22시까지만 생성
    for (let i = 5; i <= 22; i++) {
        const hour = String(i).padStart(2, '0');
        const startOption = document.createElement('option');
        startOption.value = hour;
        startOption.textContent = `${hour}:00`;
        startTimeSelect.appendChild(startOption);
        
        const endOption = document.createElement('option');
        endOption.value = hour;
        endOption.textContent = `${hour}:00`;
        endTimeSelect.appendChild(endOption);
    }
}

// 대한민국 공휴일 목록 (연도별)
const KOREA_HOLIDAYS = {
    2024: [
        '2024-01-01', // 신정
        '2024-02-09', '2024-02-10', '2024-02-11', '2024-02-12', // 설날 연휴
        '2024-03-01', // 삼일절
        '2024-04-10', // 국회의원선거일
        '2024-05-05', // 어린이날
        '2024-05-06', // 어린이날 대체공휴일
        '2024-05-15', // 석가탄신일
        '2024-06-06', // 현충일
        '2024-08-15', // 광복절
        '2024-09-16', '2024-09-17', '2024-09-18', // 추석 연휴
        '2024-10-03', // 개천절
        '2024-10-09', // 한글날
        '2024-12-25', // 성탄절
    ],
    2025: [
        '2025-01-01', // 신정
        '2025-01-28', '2025-01-29', '2025-01-30', // 설날 연휴
        '2025-03-01', // 삼일절
        '2025-05-05', // 어린이날
        '2025-05-13', // 석가탄신일
        '2025-06-06', // 현충일
        '2025-08-15', // 광복절
        '2025-10-05', '2025-10-06', '2025-10-07', // 추석 연휴
        '2025-10-03', // 개천절
        '2025-10-09', // 한글날
        '2025-12-25', // 성탄절
    ],
    2026: [
        '2026-01-01', // 신정
        '2026-02-16', '2026-02-17', '2026-02-18', // 설날 연휴
        '2026-03-01', // 삼일절
        '2026-05-05', // 어린이날
        '2026-05-02', // 석가탄신일
        '2026-06-06', // 현충일
        '2026-08-15', // 광복절
        '2026-09-24', '2026-09-25', '2026-09-26', // 추석 연휴
        '2026-10-03', // 개천절
        '2026-10-09', // 한글날
        '2026-12-25', // 성탄절
    ],
    2027: [
        '2027-01-01', // 신정
        '2027-02-06', '2027-02-07', '2027-02-08', // 설날 연휴
        '2027-03-01', // 삼일절
        '2027-05-05', // 어린이날
        '2027-05-21', // 석가탄신일
        '2027-06-06', // 현충일
        '2027-08-15', // 광복절
        '2027-10-14', '2027-10-15', '2027-10-16', // 추석 연휴
        '2027-10-03', // 개천절
        '2027-10-09', // 한글날
        '2027-12-25', // 성탄절
    ]
};

function isHoliday(dateString) {
    const year = new Date(dateString).getFullYear();
    const holidays = KOREA_HOLIDAYS[year] || [];
    return holidays.includes(dateString);
}

function isWeekend(dateString) {
    const date = new Date(dateString);
    const day = date.getDay();
    return day === 0 || day === 6 || isHoliday(dateString); // 일요일(0), 토요일(6), 또는 공휴일
}

function getTimeCategory(month, hour) {
    const slots = MONTHLY_TIME_SLOTS[month];
    if (!slots) return null;

    const hourNum = parseInt(hour);
    const earlyStartHour = parseInt(slots.earlyStart.split(':')[0]);
    const earlyEndHour = parseInt(slots.earlyEnd.split(':')[0]);
    const dayStartHour = parseInt(slots.dayStart.split(':')[0]);
    const dayEndHour = parseInt(slots.dayEnd.split(':')[0]);
    const nightStartHour = parseInt(slots.nightStart.split(':')[0]);
    const nightEndHour = parseInt(slots.nightEnd.split(':')[0]);

    if (hourNum >= earlyStartHour && hourNum < earlyEndHour) return 'early';
    else if (hourNum >= dayStartHour && hourNum < dayEndHour) return 'day';
    else if (hourNum >= nightStartHour && hourNum < nightEndHour) return 'night';
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

function updateBallProviderDetails() {
    const count = parseInt(ballProviderCountSelect.value);
    const indoorCount = parseInt(indoorCourtCountSelect.value);
    const outdoorCount = parseInt(outdoorCourtCountSelect.value);
    
    // 총 코트수 = 실내코트수 + 실외코트수 (감면코트는 이미 포함되어 있으므로 별도로 빼지 않음)
    const totalCourts = indoorCount + outdoorCount;
    
    ballProviderDetailsDiv.innerHTML = '';

    for (let i = 1; i <= count; i++) {
        const detailDiv = document.createElement('div');
        detailDiv.className = 'ball-provider-detail';
        
        // 공 개수 기본값 계산 - 총 코트수를 공급자 수로 나누어 분배
        let defaultBallCount = 0;
        if (count > 0 && totalCourts > 0) {
            const baseCount = Math.floor(totalCourts / count);
            const remainder = totalCourts % count;
            // 앞쪽 제공자들이 나머지를 하나씩 더 가져가도록
            defaultBallCount = baseCount + (i <= remainder ? 1 : 0);
        }
        
        detailDiv.innerHTML = `
            <div class="input-group">
                <label for="ballProvider${i}Count">공 제공자 ${i} 공 개수:</label>
                <select id="ballProvider${i}Count">
                    <option value="0" ${defaultBallCount === 0 ? 'selected' : ''}>0개</option>
                    <option value="1" ${defaultBallCount === 1 ? 'selected' : ''}>1개</option>
                    <option value="2" ${defaultBallCount === 2 ? 'selected' : ''}>2개</option>
                    <option value="3" ${defaultBallCount === 3 ? 'selected' : ''}>3개</option>
                    <option value="4" ${defaultBallCount === 4 ? 'selected' : ''}>4개</option>
                </select>
            </div>
            <div class="button-group">
                <button type="button" class="quick-btn" data-target="ballProvider${i}Count" data-value="0">0</button>
                <button type="button" class="quick-btn" data-target="ballProvider${i}Count" data-value="1">1</button>
                <button type="button" class="quick-btn" data-target="ballProvider${i}Count" data-value="2">2</button>
                <button type="button" class="quick-btn" data-target="ballProvider${i}Count" data-value="3">3</button>
                <button type="button" class="quick-btn" data-target="ballProvider${i}Count" data-value="4">4</button>
            </div>
        `;
        
        ballProviderDetailsDiv.appendChild(detailDiv);
    }
    
    // 새로 생성된 버튼들에 이벤트 리스너 추가
    attachQuickButtonListeners();
}

function setDefaultValues() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    
    usageDateInput.value = todayStr;
    
    // 평일/주말 상관없이 모든 경우에 동일한 기본값 설정
    if (isWeekend(todayStr)) {
        startTimeSelect.value = '06';
        endTimeSelect.value = '08';
    } else {
        startTimeSelect.value = '10';
        endTimeSelect.value = '12';
    }
    
    // 항상 동일한 기본값: 실내 2개, 실내 감면 1개, 실외 0개, 실외 감면 0개
    indoorCourtCountSelect.value = '2';
    indoorDiscountCountSelect.value = '1';
    outdoorCourtCountSelect.value = '0';
    outdoorDiscountCountSelect.value = '0';
    
    updateTotalParticipants();
    ballProviderCountSelect.value = '1';
    updateBallProviderDetails();
}

function updateTotalParticipants() {
    const indoorCount = parseInt(indoorCourtCountSelect.value);
    const outdoorCount = parseInt(outdoorCourtCountSelect.value);
    const totalCourts = indoorCount + outdoorCount;
    const defaultParticipants = totalCourts * 4;
    
    // 전체 코트 수 기준으로 기본값 설정 (최소 4명)
    const targetParticipants = Math.max(4, defaultParticipants);
    totalParticipantsSelect.value = targetParticipants.toString();
}

function attachQuickButtonListeners() {
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.dataset.target;
            const value = this.dataset.value;
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.value = value;
                
                // 특별한 경우 처리
                if (targetId === 'ballProviderCount') {
                    updateBallProviderDetails();
                } else if (targetId === 'indoorCourtCount' || targetId === 'outdoorCourtCount') {
                    updateTotalParticipants();
                    updateBallProviderDetails(); // 코트수 변경시 공 개수도 업데이트
                }
            }
        });
    });
}

function calculateFees() {
    const usageDateStr = usageDateInput.value;
    const startHour = parseInt(startTimeSelect.value);
    const endHour = parseInt(endTimeSelect.value);
    const indoorCourtCount = parseInt(indoorCourtCountSelect.value);
    const indoorDiscountCount = parseInt(indoorDiscountCountSelect.value);
    const outdoorCourtCount = parseInt(outdoorCourtCountSelect.value);
    const outdoorDiscountCount = parseInt(outdoorDiscountCountSelect.value);
    const totalParticipants = parseInt(totalParticipantsSelect.value);
    const ballProviderCount = parseInt(ballProviderCountSelect.value);

    if (!usageDateStr) {
        alert('사용 날짜를 선택해주세요.');
        return;
    }

    if (endHour <= startHour) {
        alert('종료 시간은 시작 시간보다 늦어야 합니다.');
        return;
    }

    if (indoorDiscountCount > indoorCourtCount) {
        alert('실내 코트 감면대상수가 대여수를 초과할 수 없습니다.');
        return;
    }

    if (outdoorDiscountCount > outdoorCourtCount) {
        alert('실외 코트 감면대상수가 대여수를 초과할 수 없습니다.');
        return;
    }

    const selectedDate = new Date(usageDateStr);
    const month = selectedDate.getMonth() + 1;
    const isDayOff = isWeekend(usageDateStr);
    const hours = endHour - startHour;

    let totalCourtFee = 0;
    let totalBallCost = 0;

    // 실내 코트 계산
    for (let i = 0; i < indoorCourtCount; i++) {
        let courtFee = isDayOff ? COURT_FEES.INDOOR.weekend : COURT_FEES.INDOOR.weekday;
        courtFee *= hours; // 시간당 요금 * 사용 시간
        
        if (i < indoorDiscountCount) {
            courtFee *= 0.5; // 50% 할인
        }
        
        totalCourtFee += courtFee;
        totalCourtFee += LIGHTING_FEES.INDOOR * hours; // 조명료
    }

    // 실외 코트 계산
    for (let i = 0; i < outdoorCourtCount; i++) {
        let courtFee = 0;
        let lightingFee = 0;
        
        for (let h = startHour; h < endHour; h++) {
            const timeCategory = getTimeCategory(month, h);
            if (timeCategory) {
                const hourlyCourtFee = isDayOff ? 
                    COURT_FEES.OUTDOOR.weekend[timeCategory] : 
                    COURT_FEES.OUTDOOR.weekday[timeCategory];
                
                courtFee += hourlyCourtFee;
                lightingFee += LIGHTING_FEES.OUTDOOR[timeCategory];
            }
        }
        
        if (i < outdoorDiscountCount) {
            courtFee *= 0.5; // 50% 할인
        }
        
        totalCourtFee += courtFee + lightingFee;
    }

    // 테니스공 비용 계산
    for (let i = 1; i <= ballProviderCount; i++) {
        const ballCountElement = document.getElementById(`ballProvider${i}Count`);
        if (ballCountElement) {
            const ballCount = parseInt(ballCountElement.value);
            totalBallCost += ballCount * BALL_PRICE;
        }
    }

    const totalTennisCost = totalCourtFee + totalBallCost;
    const regularParticipantAmount = Math.round(totalTennisCost / totalParticipants);

    // 결과 표시
    totalCourtRentalDisplayFeeSpan.textContent = `${totalCourtFee.toLocaleString()}원`;
    totalTennisCostSpan.textContent = `${totalTennisCost.toLocaleString()}원`;
    regularParticipantAmountSpan.textContent = `${regularParticipantAmount.toLocaleString()}원`;

    // 공 제공자 정산
    ballProviderSettlementDiv.innerHTML = '';
    
    if (ballProviderCount > 0) {
        const headerP = document.createElement('p');
        headerP.innerHTML = `💰 <strong>2. 테니스공 제공자 정산:</strong>`;
        ballProviderSettlementDiv.appendChild(headerP);

        for (let i = 1; i <= ballProviderCount; i++) {
            const ballCountElement = document.getElementById(`ballProvider${i}Count`);
            if (ballCountElement) {
                const ballCount = parseInt(ballCountElement.value);
                const ballCost = ballCount * BALL_PRICE;
                let refund = ballCost - regularParticipantAmount;
                
                const ballProviderP = document.createElement('p');
                ballProviderP.innerHTML = `- 공 제공자 ${i} (공값 ${ballCost.toLocaleString()}원): ${ballCost.toLocaleString()}원 - ${regularParticipantAmount.toLocaleString()}원 = ${refund >= 0 ? refund.toLocaleString() + '원' : Math.abs(refund).toLocaleString() + '원 송금'} (총 ${Math.abs(refund).toLocaleString()}원 ${refund >= 0 ? '환급' : '송금'})`;
                ballProviderP.style.marginLeft = '10px';
                ballProviderSettlementDiv.appendChild(ballProviderP);

                // 부지런한사람 계산 (환급금이 양수일 경우에만)
                if (refund > 0) {
                    let remainingRefund = refund;
                    let deductionSteps = [];
                    
                    // 환급금에서 일반참가자 송금액을 반복해서 뺌 (음수가 나오기 전까지)
                    while (remainingRefund >= regularParticipantAmount) {
                        remainingRefund -= regularParticipantAmount;
                        deductionSteps.push(regularParticipantAmount);
                    }
                    
                    // 계산 과정을 텍스트로 표시
                    let calculationText = `${refund.toLocaleString()}원`;
                    for (let step of deductionSteps) {
                        calculationText += ` - ${step.toLocaleString()}원`;
                    }
                    calculationText += ` = ${remainingRefund.toLocaleString()}원`;
                    
                    const calculationP = document.createElement('p');
                    calculationP.innerHTML = `  환급: ${calculationText}`;
                    calculationP.style.marginLeft = '20px';
                    calculationP.style.fontSize = '0.9em';
                    calculationP.style.color = '#666';
                    ballProviderSettlementDiv.appendChild(calculationP);
                    
                    // 나머지가 있을 때만 부지런한사람 표시
                    if (remainingRefund > 0) {
                        const diligentPersonAmount = regularParticipantAmount - remainingRefund;
                        const diligentPersonP = document.createElement('p');
                        diligentPersonP.innerHTML = `🏃‍♂️ <strong>부지런한사람:</strong> (${regularParticipantAmount.toLocaleString()}원 - ${remainingRefund.toLocaleString()}원 = ${diligentPersonAmount.toLocaleString()}원)`;
                        diligentPersonP.style.marginLeft = '30px';
                        ballProviderSettlementDiv.appendChild(diligentPersonP);
                    }
                }
            }
        }
    }

    // 코트 대여 임무자 (주말에만 표시)
    if (isDayOff) {
        const managerName = findCourtManager(usageDateStr);
        courtManagerSpan.textContent = managerName;
        courtManagerSection.style.display = 'block';
    } else {
        courtManagerSection.style.display = 'none';
    }
}

function resetResults() {
    totalCourtRentalDisplayFeeSpan.textContent = '0원';
    totalTennisCostSpan.textContent = '0원';
    regularParticipantAmountSpan.textContent = '0원';
    ballProviderSettlementDiv.innerHTML = '';
    courtManagerSpan.textContent = '정보 없음';
    courtManagerSection.style.display = 'block';
}

// 이벤트 리스너
document.addEventListener('DOMContentLoaded', () => {
    populateTimeOptions();
    setDefaultValues();
    attachQuickButtonListeners();
    // 초기 화면에 기본 계산 결과 표시
    calculateFees();
});

usageDateInput.addEventListener('change', (event) => {
    const selectedDateStr = event.target.value;
    if (isWeekend(selectedDateStr)) {
        startTimeSelect.value = '06';
        endTimeSelect.value = '08';
    } else {
        startTimeSelect.value = '10';
        endTimeSelect.value = '12';
    }
    // 평일/주말 상관없이 모두 동일한 코트 설정
    indoorCourtCountSelect.value = '2';
    indoorDiscountCountSelect.value = '1';
    outdoorCourtCountSelect.value = '0';
    outdoorDiscountCountSelect.value = '0';
    updateTotalParticipants();
    updateBallProviderDetails();
});

// 시작 시간 변경 시 종료 시간 자동 설정
startTimeSelect.addEventListener('change', (event) => {
    const startHour = parseInt(event.target.value);
    const endHour = Math.min(startHour + 2, 22); // 2시간 후로 설정하되 22시를 넘지 않음
    endTimeSelect.value = String(endHour).padStart(2, '0');
});

// 코트 수 변경 시 공 제공자 세부사항도 업데이트
indoorCourtCountSelect.addEventListener('change', () => {
    updateTotalParticipants();
    updateBallProviderDetails();
});
outdoorCourtCountSelect.addEventListener('change', () => {
    updateTotalParticipants();
    updateBallProviderDetails();
});

ballProviderCountSelect.addEventListener('change', updateBallProviderDetails);

calculateBtn.addEventListener('click', calculateFees);

shareKakaoBtn.addEventListener('click', function() {
    if (typeof Kakao === 'undefined' || !Kakao.isInitialized()) {
        alert('카카오톡 SDK가 초기화되지 않았습니다. 잠시 후 다시 시도해주세요.');
        return;
    }

    let shareText = `🎾 코트비 계산 결과 🎾\n\n`;
    shareText += `총 코트 대여료: ${totalCourtRentalDisplayFeeSpan.textContent}\n`;
    shareText += `총 테니스 비용 (공 포함): ${totalTennisCostSpan.textContent}\n\n`;
    shareText += `1. 일반 참가자 송금액: ${regularParticipantAmountSpan.textContent}\n`;
    
    const settlementHtml = ballProviderSettlementDiv.innerHTML;
    if (settlementHtml.trim() !== '') {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = settlementHtml;
        let settlementText = tempDiv.textContent
            .replace(/🎾|🥎|💰|🏃‍♂️|🌟/g, '')
            .replace(/총 테니스공 제공자 정산:/g, '2. 테니스공 제공자 정산:')
            .replace(/(\r\n|\n|\r)/gm, '\n')
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n');
        shareText += `\n${settlementText}\n`;
    }
    
    if (courtManagerSection.style.display !== 'none') {
        shareText += `\n🌟 코트 대여 임무: ${courtManagerSpan.textContent}\n\n`;
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

// 계산기 함수들
let calcDisplay = '';
let lastOperator = '';
let waitingForOperand = false;

function appendToDisplay(value) {
    const display = document.getElementById('calcDisplay');
    
    if (waitingForOperand) {
        calcDisplay = value;
        waitingForOperand = false;
    } else {
        calcDisplay = calcDisplay === '0' ? value : calcDisplay + value;
    }
    
    display.value = calcDisplay;
}

function clearCalculator() {
    calcDisplay = '0';
    lastOperator = '';
    waitingForOperand = false;
    document.getElementById('calcDisplay').value = calcDisplay;
}

function deleteLast() {
    if (calcDisplay.length > 1) {
        calcDisplay = calcDisplay.slice(0, -1);
    } else {
        calcDisplay = '0';
    }
    document.getElementById('calcDisplay').value = calcDisplay;
}

function calculateResult() {
    try {
        // 보안을 위해 안전한 계산만 허용
        const sanitized = calcDisplay.replace(/[^0-9+\-*/.() ]/g, '');
        const result = Function('"use strict"; return (' + sanitized + ')')();
        
        if (result === Infinity || result === -Infinity || isNaN(result)) {
            throw new Error('Invalid calculation');
        }
        
        calcDisplay = result.toString();
        document.getElementById('calcDisplay').value = calcDisplay;
        waitingForOperand = true;
    } catch (error) {
        calcDisplay = 'Error';
        document.getElementById('calcDisplay').value = calcDisplay;
        waitingForOperand = true;
    }
}

// 계산기 초기화
document.addEventListener('DOMContentLoaded', () => {
    clearCalculator();
});
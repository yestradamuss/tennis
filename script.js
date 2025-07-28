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
        weekday: {
            early: 3000,
            day: 3000,
            night: 4500
        },
        weekend: {
            early: 4000,
            day: 4000,
            night: 6000
        }
    },
    INDOOR: {
        weekday: 6000,
        weekend: 11000
    }
};

const LIGHTING_FEES = {
    OUTDOOR: {
        early: 4000,
        day: 0,
        night: 4000
    },
    INDOOR: 4000 // 실내 코트는 항상 4000원
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


// =========================================================
// 2. DOM 요소 가져오기
// =========================================================
const courtTypeSelect = document.getElementById('courtType');
const usageDateInput = document.getElementById('usageDate');
const usageTimeSelect = document.getElementById('usageTime');
const courtCountSelect = document.getElementById('courtCount');
const discountedCourtCountInput = document.getElementById('discountedCourtCount');
const totalParticipantsInput = document.getElementById('totalParticipants');
const ballCountInput = document.getElementById('ballCount');
const calculateBtn = document.getElementById('calculateBtn');
const shareKakaoBtn = document.getElementById('shareKakao');

const totalCourtRentalDisplayFeeSpan = document.getElementById('totalCourtRentalDisplayFee');
const totalTennisCostSpan = document.getElementById('totalTennisCost');
const regularParticipantAmountSpan = document.getElementById('regularParticipantAmount');
const ballProviderSettlementDiv = document.getElementById('ballProviderSettlement');
const courtManagerSpan = document.getElementById('courtManager');

// =========================================================
// 3. 헬퍼 함수
// =========================================================

// 시간 옵션 동적 생성
function populateTimeOptions() {
    usageTimeSelect.innerHTML = ''; // 기존 옵션 초기화
    for (let i = 0; i < 24; i++) {
        const hour = String(i).padStart(2, '0');
        const option = document.createElement('option');
        option.value = hour;
        option.textContent = `${hour}:00`;
        usageTimeSelect.appendChild(option);
    }
}

// 특정 날짜가 주말/공휴일인지 확인 (0: 일요일, 6: 토요일)
function isWeekend(dateString) {
    const date = new Date(dateString);
    const day = date.getDay(); 
    return day === 0 || day === 6;
}

// 시간대에 따른 요금 종류 반환 (조기, 주간, 야간)
function getTimeCategory(month, hour) {
    const slots = MONTHLY_TIME_SLOTS[month];
    if (!slots) return null; // 해당 월의 데이터가 없으면 null 반환

    const hourNum = parseInt(hour);

    // 각 시간대의 시작 및 종료 시간 파싱 (HH:MM -> Number)
    const earlyStartHour = parseInt(slots.earlyStart.split(':')[0]);
    const earlyEndHour = parseInt(slots.earlyEnd.split(':')[0]);
    const dayStartHour = parseInt(slots.dayStart.split(':')[0]);
    const dayEndHour = parseInt(slots.dayEnd.split(':')[0]);
    const nightStartHour = parseInt(slots.nightStart.split(':')[0]);
    const nightEndHour = parseInt(slots.nightEnd.split(':')[0]);

    if (hourNum >= earlyStartHour && hourNum < earlyEndHour) {
        return 'early';
    } else if (hourNum >= dayStartHour && hourNum < dayEndHour) {
        return 'day';
    } else if (hourNum >= nightStartHour && hourNum < nightEndHour) {
        return 'night';
    }
    return null; // 해당 시간대에 속하지 않음
}

// 코트 대여 임무자 찾기
function findCourtManager(dateString) {
    const targetDate = new Date(dateString);
    targetDate.setHours(0, 0, 0, 0); // 시간 정보 초기화하여 날짜만 비교

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

// 입력 필드 기본값 설정 함수 (총 인원수, 공 개수)
function setDefaultInputValues() {
    const currentCourtCount = parseInt(courtCountSelect.value);
    totalParticipantsInput.value = currentCourtCount * 4;
    ballCountInput.value = currentCourtCount;
}


// =========================================================
// 4. 메인 계산 로직
// =========================================================
function calculateFees() {
    const courtType = courtTypeSelect.value;
    const usageDateStr = usageDateInput.value;
    const usageTimeHour = parseInt(usageTimeSelect.value);
    const courtCount = parseInt(courtCountSelect.value);
    const discountedCourtCount = parseInt(discountedCourtCountInput.value);
    const totalParticipants = parseInt(totalParticipantsInput.value);
    const ballCount = parseInt(ballCountInput.value);

    // 필수 입력값 검증
    if (!usageDateStr) {
        alert('사용 날짜를 선택해주세요.');
        return;
    }
    if (totalParticipants <= 0) {
        alert('총 인원수는 1명 이상이어야 합니다.');
        return;
    }
    if (discountedCourtCount < 0 || discountedCourtCount > courtCount) {
        alert('감면 코트 수는 0 이상이고 총 코트 수를 초과할 수 없습니다.');
        resetResults();
        return;
    }


    const selectedDate = new Date(usageDateStr);
    const month = selectedDate.getMonth() + 1;
    const isDayOff = isWeekend(usageDateStr);

    let pureCourtRentalFeeBeforeDiscount = 0;
    let lightingFeePerCourt = 0;       
    
    let totalActualCourtRentalFee = 0;
    let totalActualLightingFee = 0;    
    let discountAmount = 0;            

    // 실내 코트 운영 시간 외에는 경고
    if (courtType === 'indoor') {
        if (usageTimeHour < INDOOR_OPERATION_START_HOUR || usageTimeHour >= INDOOR_OPERATION_END_HOUR) {
            alert(`실내 코트는 ${String(INDOOR_OPERATION_START_HOUR).padStart(2, '0')}:00 ~ ${String(INDOOR_OPERATION_END_HOUR).padStart(2, '0')}:00에만 이용 가능합니다.`);
            resetResults();
            return;
        }
    }

    if (courtType === 'outdoor') {
        const timeCategory = getTimeCategory(month, usageTimeHour);
        if (!timeCategory) {
            alert('선택하신 날짜와 시간에 해당하는 실외 코트 요금 정보가 없습니다.');
            resetResults();
            return;
            // Fallback for cases where time category might not be found (though theoretically should be covered by time slots)
        }

        pureCourtRentalFeeBeforeDiscount = isDayOff ? COURT_FEES.OUTDOOR.weekend[timeCategory] : COURT_FEES.OUTDOOR.weekday[timeCategory];
        lightingFeePerCourt = LIGHTING_FEES.OUTDOOR[timeCategory];

    } else { // indoor
        pureCourtRentalFeeBeforeDiscount = isDayOff ? COURT_FEES.INDOOR.weekend : COURT_FEES.INDOOR.weekday;
        lightingFeePerCourt = LIGHTING_FEES.INDOOR;
    }

    // 각 코트별 요금 계산
    for (let i = 0; i < courtCount; i++) {
        let currentCourtRentalFee = pureCourtRentalFeeBeforeDiscount;
        let currentLightingFee = lightingFeePerCourt;

        // 감면 코트 처리 (할인 코트 수만큼 50% 할인 적용)
        if (i < discountedCourtCount) {
            const discountedRentalFee = currentCourtRentalFee * 0.5;
            discountAmount += (currentCourtRentalFee - discountedRentalFee);
            currentCourtRentalFee = discountedRentalFee;
        }

        totalActualCourtRentalFee += currentCourtRentalFee;
        totalActualLightingFee += currentLightingFee;
    }

    // 최종 요금 계산
    const finalTotalCourtAndLightingFee = totalActualCourtRentalFee + totalActualLightingFee;
    const totalBallFee = ballCount * BALL_PRICE;
    const finalTotalTennisCost = finalTotalCourtAndLightingFee + totalBallFee;

    const regularParticipantAmount = finalTotalTennisCost / totalParticipants;

    // 공 제공자 정산 (동적으로 생성)
    ballProviderSettlementDiv.innerHTML = '';
    
    if (ballCount > 0) {
        const headerP = document.createElement('p');
        headerP.innerHTML = `💰 <strong>2. 테니스공 제공자 정산:</strong>`;
        ballProviderSettlementDiv.appendChild(headerP);
    }

    for (let i = 0; i < ballCount; i++) {
        const ballProviderRefund = BALL_PRICE - regularParticipantAmount;
        
        let ballProviderText = `- 공 제공자 ${i + 1} (공값 ${BALL_PRICE.toLocaleString()}원): `;
        ballProviderText += `${BALL_PRICE.toLocaleString()}원 - ${regularParticipantAmount.toLocaleString()} = ${ballProviderRefund.toLocaleString()}원`;
        ballProviderText += ` (총 ${ballProviderRefund.toLocaleString()}원 ${ballProviderRefund >= 0 ? '환급' : '지불'})`;
        
        const ballProviderP = document.createElement('p');
        ballProviderP.innerHTML = ballProviderText;
        ballProviderP.style.marginLeft = '10px';
        ballProviderSettlementDiv.appendChild(ballProviderP);

        // '부지런한사람' 로직: 환급액과 상관없이 항상 표시
        const diligentPersonAmount = regularParticipantAmount - ballProviderRefund; // Calculation remains the same
        const diligentPersonP = document.createElement('p');
        diligentPersonP.innerHTML = `🏃‍♂️ 부지런한사람: (${regularParticipantAmount.toLocaleString()}원 - ${ballProviderRefund.toLocaleString()}원 = ${diligentPersonAmount.toLocaleString()}원)`;
        diligentPersonP.style.marginLeft = '30px';
        ballProviderSettlementDiv.appendChild(diligentPersonP);
    }


    // 코트 대여 임무자 (주말에만 표시)
    let managerName = '정보 없음';
    if (isDayOff) {
        managerName = findCourtManager(usageDateStr);
    }
    
    // 결과 표시
    totalCourtRentalDisplayFeeSpan.textContent = `${finalTotalCourtAndLightingFee.toLocaleString()}원`;
    totalTennisCostSpan.textContent = `${finalTotalTennisCost.toLocaleString()}원`;
    regularParticipantAmountSpan.textContent = `${regularParticipantAmount.toLocaleString()}원`;
    courtManagerSpan.textContent = managerName;
}

// =========================================================
// 5. 이벤트 리스너
// =========================================================

// 페이지 로드 시 시간 옵션 채우기 및 기본 날짜, 입력 필드 값 설정
document.addEventListener('DOMContentLoaded', () => {
    populateTimeOptions();

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    
    usageDateInput.value = todayStr;

    // 페이지 로드 시 오늘 날짜에 따라 사용 시간 기본값 설정
    if (isWeekend(todayStr)) {
        usageTimeSelect.value = '06'; // 주말: 06:00
    } else {
        usageTimeSelect.value = '10'; // 평일: 10:00
    }

    setDefaultInputValues(); // 총 인원수, 공 개수 기본값 설정
});

// 날짜 변경 시 '사용 시간' 기본값 조정 (주말은 06:00, 평일은 10:00)
usageDateInput.addEventListener('change', (event) => {
    const selectedDateStr = event.target.value;
    if (isWeekend(selectedDateStr)) {
        usageTimeSelect.value = '06'; // 주말: 06:00
    } else {
        usageTimeSelect.value = '10'; // 평일: 10:00
    }
});

// 코트 수 변경 시 총 인원수, 공 개수 기본값 조정
courtCountSelect.addEventListener('change', setDefaultInputValues);


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
        // 텍스트 변환 시 HTML 태그 및 불필요한 공백 제거, 줄바꿈 통일
        let settlementText = tempDiv.textContent
            .replace(/🎾|🥎|💰|🏃‍♂️|🌟/g, '') // 이모지 제거
            .replace(/총 테니스공 제공자 정산:/g, '2. 테니스공 제공자 정산:') // 헤더 텍스트 보정
            .replace(/(\r\n|\n|\r)/gm, '\n') // 모든 줄바꿈을 \n으로 통일
            .split('\n') // 줄바꿈 기준으로 분리
            .map(line => line.trim()) // 각 줄의 앞뒤 공백 제거
            .filter(line => line.length > 0) // 빈 줄 제거
            .join('\n'); // 다시 줄바꿈으로 연결
        shareText += `\n${settlementText}\n`;
    }
    
    shareText += `\n🌟 코트 대여 임무: ${courtManagerSpan.textContent}\n\n`;
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
}
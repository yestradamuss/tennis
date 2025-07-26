// ====== Helper Functions (Utilities) ======
function getHourMin(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return { hours, minutes };
}

function timeToMinutes(timeValue) {
    if (typeof timeValue === 'string') {
        const parts = timeValue.split(':');
        if (parts.length === 2) {
            const hours = Number(parts[0]);
            const minutes = Number(parts[1]);
            if (!isNaN(hours) && !isNaN(minutes)) {
                return hours * 60 + minutes;
            }
        }
        throw new Error(`시간 형식이 올바르지 않습니다: ${timeValue}. "HH:MM" 형식이어야 합니다.`);
    } else if (timeValue instanceof Date) {
        return timeValue.getHours() * 60 + timeValue.getMinutes();
    } else if (typeof timeValue === 'number') {
        return Math.round(timeValue * 60);
    }
    throw new Error(`시간 형식이 올바르지 않습니다: ${timeValue}.`);
}

function formatCurrency(amount) {
    if (isNaN(amount) || amount === null) {
        return "0원";
    }
    return Math.round(amount).toLocaleString() + '원';
}

// ====== DOM Element Handlers ======
function setCourtValue(id, value) {
    document.getElementById(id).value = value;
    updateCourtRelatedDefaults();
    calculateFees(); // 값 변경 후 바로 계산
}

function setPeopleValue(value) {
    document.getElementById('totalPeople').value = value;
    calculateFees(); // 값 변경 후 바로 계산
}

function setBallProviders(value) {
    document.getElementById('ballProviders').value = value;
    document.getElementById('ballProviders').dataset.manuallyChanged = 'true'; // 수동 변경 플래그 설정
    updateBallProviderDefaults(); // 이제 이 함수가 수동 변경을 감지합니다.
    calculateFees(); // 값 변경 후 바로 계산
}

function setBallCount(id, value) {
    document.getElementById(id).value = value;
    calculateFees(); // 값 변경 후 바로 계산
}

// ====== Default Value Updaters ======
function populateTimeOptions() {
    const startTimeSelect = document.getElementById('startTime');
    const endTimeSelect = document.getElementById('endTime');
    startTimeSelect.innerHTML = '';
    endTimeSelect.innerHTML = '';

    for (let h = 0; h < 24; h++) {
        const hourStr = String(h).padStart(2, '0');
        const optionText = `${hourStr}:00`;
        const startOption = document.createElement('option');
        startOption.value = optionText;
        startOption.textContent = optionText;
        startTimeSelect.appendChild(startOption);

        const endOption = document.createElement('option');
        endOption.value = optionText;
        endOption.textContent = optionText;
        endTimeSelect.appendChild(endOption);
    }
}

function updateTimeDefaults() {
    const dateInput = document.getElementById('date');
    const startTimeSelect = document.getElementById('startTime');
    const endTimeSelect = document.getElementById('endTime');

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    dateInput.value = `${year}-${month}-${day}`; // 오늘 날짜로 기본값 설정

    const dayOfWeek = today.getDay(); // 0=일, 1=월, ..., 6=토

    // 주말(토, 일)에는 06:00 ~ 08:00, 평일에는 10:00 ~ 12:00
    if (dayOfWeek === 0 || dayOfWeek === 6) { // 일요일 또는 토요일
        startTimeSelect.value = "06:00";
        endTimeSelect.value = "08:00";
    } else { // 평일
        startTimeSelect.value = "10:00";
        endTimeSelect.value = "12:00";
    }
}

function updateBallProviderDefaults() {
    const ballProvidersSelect = document.getElementById('ballProviders');
    const providers = parseInt(ballProvidersSelect.value || 0);

    const ballProviderGroups = [
        document.getElementById('ballProvider1Group'),
        document.getElementById('ballProvider2Group'),
        document.getElementById('ballProvider3Group'),
        document.getElementById('ballProvider4Group')
    ];
    const ballProviderBallsSelects = [
        document.getElementById('ballProvider1Balls'),
        document.getElementById('ballProvider2Balls'),
        document.getElementById('ballProvider3Balls'),
        document.getElementById('ballProvider4Balls')
    ];

    for (let i = 0; i < ballProviderGroups.length; i++) {
        if (ballProviderGroups[i]) { // 요소가 존재하는지 확인
            if (providers >= (i + 1)) {
                ballProviderGroups[i].style.display = 'flex'; // flex로 변경하여 레이아웃 유지
                ballProviderBallsSelects[i].disabled = false;
                if (ballProviderBallsSelects[i].value === "0" || ballProviderBallsSelects[i].value === "") {
                    ballProviderBallsSelects[i].value = "1"; // 기본값으로 1개 설정
                }
            } else {
                ballProviderGroups[i].style.display = 'none';
                ballProviderBallsSelects[i].disabled = true;
                ballProviderBallsSelects[i].value = "0"; // 숨길 때 0으로 리셋
            }
        }
    }
}

function updateCourtRelatedDefaults() {
    const indoorCourts = parseInt(document.getElementById('indoorCourts').value || 0);
    const outdoorCourts = parseInt(document.getElementById('outdoorCourts').value || 0);
    const totalCourts = indoorCourts + outdoorCourts;

    const totalPeopleInput = document.getElementById('totalPeople');
    const currentTotalPeople = parseInt(totalPeopleInput.value || 0);
    const suggestedTotalPeople = totalCourts * 4;

    if (currentTotalPeople < suggestedTotalPeople) {
        totalPeopleInput.value = suggestedTotalPeople;
    }
     // 총 인원 최소값 4 고정 (HTML에도 min="4" 있음)
    if (parseInt(totalPeopleInput.value) < 4) {
        totalPeopleInput.value = 4;
    }


    // 공 제공자 수 자동 설정 (수동 변경이 없었거나 0일 경우에만)
    const ballProvidersSelect = document.getElementById('ballProviders');
    const ballProvidersManuallyChanged = ballProvidersSelect.dataset.manuallyChanged === 'true';

    if (!ballProvidersManuallyChanged || parseInt(ballProvidersSelect.value || 0) === 0) {
        let bestMatchValue = 0;
        let minDiff = Infinity;
        let foundExactMatch = false;

        for (let i = 0; i < ballProvidersSelect.options.length; i++) {
            const optionValue = parseInt(ballProvidersSelect.options[i].value);
            if (optionValue === totalCourts) {
                bestMatchValue = optionValue;
                foundExactMatch = true;
                break;
            }
        }

        if (!foundExactMatch) {
            for (let i = 0; i < ballProvidersSelect.options.length; i++) {
                const optionValue = parseInt(ballProvidersSelect.options[i].value);
                const diff = Math.abs(optionValue - totalCourts);
                if (diff < minDiff) {
                    minDiff = diff;
                    bestMatchValue = optionValue;
                }
            }
        }
        ballProvidersSelect.value = bestMatchValue;
    }
    updateBallProviderDefaults(); // 공 제공자 수 변경 후 공 개수 입력 필드 업데이트
}

// ====== Hardcoded Rate Data (from Google Sheets logic) ======

// 실내 코트 기본 대여료 (시간당, 조명 요금 제외)
// 고객님 요청에 따라 평일 6,000원, 주말 12,000원 고정
const INDOOR_COURT_BASE_RATES = {
    'weekday': 6000,
    'weekend': 12000
};

// 조명요금표 시트 데이터 (code.gs.txt에서 참조하던 내용)
// Outdoor rates and lighting based on this table
const LIGHT_RATES_DATA = [
    { "분류": "야간", "시작시간": "20:00", "종료시간": "22:00", "평일이용료": 5000, "주말이용료": 10000, "조명요금": 4000, "월1": 0, "월2": 0, "월3": 0, "월4": 0, "월5": 0, "월6": 0, "월7": 1, "월8": 1, "월9": 1, "월10": 1, "월11": 0, "월12": 0 },
    { "분류": "야간", "시작시간": "17:00", "종료시간": "22:00", "평일이용료": 5000, "주말이용료": 10000, "조명요금": 4000, "월1": 1, "월2": 1, "월3": 1, "월4": 0, "월5": 0, "월6": 0, "월7": 0, "월8": 0, "월9": 0, "월10": 0, "월11": 1, "월12": 1 },
    { "분류": "조기", "시작시간": "05:00", "종료시간": "06:00", "평일이용료": 5000, "주말이용료": 10000, "조명요금": 4000, "월1": 1, "월2": 1, "월3": 1, "월4": 1, "월5": 1, "월6": 1, "월7": 1, "월8": 1, "월9": 1, "월10": 1, "월11": 1, "월12": 1 }
];

// 기타 상수 (고객님 요청에 따라 고정)
const BALL_PRICE_PER_UNIT = 3500; // 기타요금 시트 B2
const INDOOR_LIGHT_HOURLY_RATE = 4000; // 기타요금 시트 '실내조명' 항목
const COURT_DISCOUNT_PERCENTAGE = 0.5; // 50% 할인 (할인정책 시트 '감면' 항목)

// ====== Main Calculation Logic (Refactored to match code.gs.txt) ======
function calculateFees() {
    const dateStr = document.getElementById('date').value;
    const startTimeValue = document.getElementById('startTime').value;
    const endTimeValue = document.getElementById('endTime').value;
    const indoorCourts = parseInt(document.getElementById('indoorCourts').value || 0);
    const indoorDiscountCourts = parseInt(document.getElementById('indoorDiscountCourts').value || 0);
    const outdoorCourts = parseInt(document.getElementById('outdoorCourts').value || 0);
    const outdoorDiscountCourts = parseInt(document.getElementById('outdoorDiscountCourts').value || 0);
    const totalPeople = parseInt(document.getElementById('totalPeople').value || 0);
    const ballProviders = parseInt(document.getElementById('ballProviders').value || 0);

    const ballProvider1Balls = parseInt(document.getElementById('ballProvider1Balls').value || 0);
    const ballProvider2Balls = parseInt(document.getElementById('ballProvider2Balls').value || 0);
    const ballProvider3Balls = parseInt(document.getElementById('ballProvider3Balls').value || 0);
    const ballProvider4Balls = parseInt(document.getElementById('ballProvider4Balls').value || 0);

    const resultDiv = document.getElementById('result');
    const loadingMessage = document.getElementById('loadingMessage');
    const errorMessage = document.getElementById('error');
    const infoMessage = document.getElementById('infoMessage');
    const kakaoShareButton = document.getElementById('kakaoShareButton');

    loadingMessage.style.display = 'block';
    errorMessage.style.display = 'none';
    resultDiv.style.display = 'none';
    infoMessage.style.display = 'none';
    kakaoShareButton.style.display = 'none'; // 계산 시작 시 버튼 숨김

    try {
        const selectedDate = new Date(dateStr);
        const selectedMonth = selectedDate.getMonth() + 1; // 1월은 1
        const dayOfWeek = selectedDate.getDay(); // 0:일, 6:토

        // 공휴일 정보는 클라이언트 측에서 동적으로 가져올 수 없어 제외됨 (주말만 고려)
        const isWeekendOrHoliday = (dayOfWeek === 0 || dayOfWeek === 6); // 0:일, 6:토

        // 유효성 검사
        if (indoorCourts + outdoorCourts === 0) {
            throw new Error("코트를 최소 1개 이상 대여해야 합니다.");
        }
        if (indoorDiscountCourts > indoorCourts || outdoorDiscountCourts > outdoorCourts) {
            throw new Error("감면 대상 코트 수는 실제 코트 대여 수를 초과할 수 없습니다.");
        }
        if (ballProviders > totalPeople) {
            throw new Error("테니스공 제공자 수는 총 인원수를 초과할 수 없습니다.");
        }
        if (ballProviders > 4) { // 최대 4명으로 제한
            throw new Error("테니스공 제공자는 최대 4명까지 지정할 수 있습니다.");
        }
        if (totalPeople < 4 || totalPeople > 16) {
            throw new Error("총 인원수는 4명에서 16명 사이여야 합니다.");
        }

        const selectedStartMin = timeToMinutes(startTimeValue);
        const selectedEndMin = timeToMinutes(endTimeValue);
        const durationMinutes = selectedEndMin - selectedStartMin;

        if (durationMinutes <= 0) {
            throw new Error("종료 시간은 시작 시간보다 늦어야 합니다.");
        }
        if (durationMinutes % 60 !== 0) {
            throw new Error("대여 시간은 1시간 단위로만 가능합니다.");
        }
        const totalOverlapHours = durationMinutes / 60; // 총 대여 시간 (시간 단위)

        let totalCourtUsageFee = 0; // 코트 대여료 (할인 적용)
        let totalLightFee = 0;      // 조명비 (할인 미적용)

        // 1. 실내 코트 계산 로직
        if (indoorCourts > 0) {
            const indoorHourlyRate = isWeekendOrHoliday ? INDOOR_COURT_BASE_RATES.weekend : INDOOR_COURT_BASE_RATES.weekday;

            // 정상 실내 코트 요금
            totalCourtUsageFee += (indoorCourts - indoorDiscountCourts) * indoorHourlyRate * totalOverlapHours;
            // 할인 실내 코트 요금 (코트 대여료에만 할인 적용)
            totalCourtUsageFee += indoorDiscountCourts * indoorHourlyRate * totalOverlapHours * COURT_DISCOUNT_PERCENTAGE;
            // 실내 조명비 (할인 없음)
            totalLightFee += indoorCourts * INDOOR_LIGHT_HOURLY_RATE * totalOverlapHours;
        }

        // 2. 실외 코트 계산 로직
        if (outdoorCourts > 0) {
            const defaultDaytimeCourtRate = isWeekendOrHoliday ? 4000 : 3000; // code.gs.txt의 기본 요금

            for (let currentMin = selectedStartMin; currentMin < selectedEndMin; currentMin++) {
                let courtRateForThisMinute = defaultDaytimeCourtRate;
                let lightingRateForThisMinute = 0;

                for (const lightingRow of LIGHT_RATES_DATA) {
                    const monthColumn = `월${selectedMonth}`;
                    // 월 컬럼 값이 1이고 야간/조기 분류인 경우만 고려
                    if ((lightingRow['분류'] === '야간' || lightingRow['분류'] === '조기') && lightingRow[monthColumn] == 1) {
                        const rateStartMin = timeToMinutes(lightingRow['시작시간']);
                        const rateEndMin = timeToMinutes(lightingRow['종료시간']);

                        if (currentMin >= rateStartMin && currentMin < rateEndMin) {
                            courtRateForThisMinute = isWeekendOrHoliday ?
                                parseFloat(lightingRow['주말이용료']) : parseFloat(lightingRow['평일이용료']);
                            lightingRateForThisMinute = parseFloat(lightingRow['조명요금']) || 0;
                            break; // 해당 시간에 적용되는 첫 규칙을 찾으면 루프 종료
                        }
                    }
                }

                // 분당 요금 계산 (시간당 요금을 60으로 나눔)
                const courtRatePerMinute = courtRateForThisMinute / 60;
                const lightingRatePerMinute = lightingRateForThisMinute / 60;

                const outdoorNormalCourts = outdoorCourts - outdoorDiscountCourts;
                // 코트 사용료 계산 (정상 + 할인)
                totalCourtUsageFee += courtRatePerMinute * outdoorNormalCourts;
                totalCourtUsageFee += courtRatePerMinute * outdoorDiscountCourts * COURT_DISCOUNT_PERCENTAGE; // 할인 적용

                // 조명비 계산 (정상 + 할인 코트 모두 동일하게 적용, 할인 없음)
                totalLightFee += lightingRatePerMinute * outdoorNormalCourts;
                totalLightFee += lightingRatePerMinute * outdoorDiscountCourts;
            }
        }

        const totalRentalFee = Math.round(totalCourtUsageFee + totalLightFee); // 총 코트 대여료 = 코트 사용료 + 총 조명비
        const totalBallsProvided = ballProvider1Balls + ballProvider2Balls + ballProvider3Balls + ballProvider4Balls;
        const totalTennisBallCost = totalBallsProvided * BALL_PRICE_PER_UNIT;
        const totalOverallCost = totalRentalFee + totalTennisBallCost; // 최종 총 비용 = 총 코트 대여료 + 총 공 비용

        // --- 1인당 비용 정산 로직 ---
        const finalIndividualCostsDisplay = [];
        const sharePerPersonIncludingBalls = Math.round(totalOverallCost / totalPeople);
        finalIndividualCostsDisplay.push(`**1. 일반 참가자 송금액:**`);
        finalIndividualCostsDisplay.push(`  **${sharePerPersonIncludingBalls.toLocaleString()}원**`);

        finalIndividualCostsDisplay.push(`\n**2. 테니스공 제공자 정산:**`);
        const providerMessages = [];
        const ballProvidersArray = [
            { count: ballProvider1Balls, label: "공 제공자 1" },
            { count: ballProvider2Balls, label: "공 제공자 2" },
            { count: ballProvider3Balls, label: "공 제공자 3" },
            { count: ballProvider4Balls, label: "공 제공자 4" }
        ];

        for (let i = 0; i < ballProviders; i++) {
            const provider = ballProvidersArray[i];
            if (!provider) continue;

            const actualCostForProvider = provider.count * BALL_PRICE_PER_UNIT;
            let netDifference = sharePerPersonIncludingBalls - actualCostForProvider;

            if (provider.count === 0) {
                 // 공을 제공한다고 선택했으나 실제 제공한 공이 없는 경우
                providerMessages.push(`  - ${provider.label}: 추가 지불 없음`);
            } else if (netDifference < 0) { // 지불해야 할 금액보다 실제 공 지출이 더 많으면 환급 (음수)
                const refundAmount = Math.abs(netDifference);
                let refundCalculationDetails = `${actualCostForProvider.toLocaleString()}원`;
                let tempAmount = actualCostForProvider;
                let deductedParts = [];
                while (tempAmount >= sharePerPersonIncludingBalls) {
                    tempAmount -= sharePerPersonIncludingBalls;
                    deductedParts.push(sharePerPersonIncludingBalls.toLocaleString());
                }
                if (deductedParts.length > 0) {
                    refundCalculationDetails += ` - ${deductedParts.join(' - ')}`;
                }
                refundCalculationDetails += ` = ${refundAmount.toLocaleString()}원 (총 ${refundAmount.toLocaleString()}원 환급)`;


                providerMessages.push(`  - ${provider.label} (공값 ${actualCostForProvider.toLocaleString()}원):`);
                providerMessages.push(`    ${refundCalculationDetails}`);
                // if (resultOfSubtraction >= 0) {
                //     providerMessages.push(`    (${sharePerPersonIncludingBalls.toLocaleString()}원 - ${refundAmount.toLocaleString()}원 = ${resultOfSubtraction.toLocaleString()}원)`);
                // } else {
                //      providerMessages.push(`    (${sharePerPersonIncludingBalls.toLocaleString()}원 - ${refundAmount.toLocaleString()}원 = ${resultOfSubtraction.toLocaleString()}원)`);
                // }


            } else if (netDifference > 0) { // 지불해야 할 금액보다 실제 공 지출이 더 적으면 추가 지불
                providerMessages.push(`  - ${provider.label}: **${netDifference.toLocaleString()}원** 추가 지불`);
            } else { // 0인 경우
                providerMessages.push(`  - ${provider.label}: 정산 완료`);
            }
        }

        if (providerMessages.length > 0) {
            providerMessages.forEach(msg => finalIndividualCostsDisplay.push(msg));
        } else {
            finalIndividualCostsDisplay.push(`  - 없음`);
        }

        // --- 코트 대여 임무자 표시 로직 (하드코딩된 값으로 대체) ---
        // 원래는 시트에서 동적으로 가져왔으나, 클라이언트 측에서 불가능하여 정적인 메시지로 변경
        let courtRentalDutyName = "주말/공휴일 대여 시 표시됩니다."; // 기본 메시지
        if (isWeekendOrHoliday) {
            courtRentalDutyName = "이창민"; // 예시: 주말/공휴일 대여 시 고정된 이름
        }

        // === 결과 표시 ===
        document.getElementById('totalCourtFee').innerHTML = `🎾 <strong>총 코트 대여료:</strong> ${formatCurrency(totalRentalFee)}`;
        document.getElementById('totalTennisCost').innerHTML = `🥎 <strong>총 테니스 비용 (공 포함):</strong> ${formatCurrency(totalOverallCost)}`;

        // HTML 렌더링을 위해 <br> 태그로 줄바꿈 처리
        document.getElementById('individualCosts').innerHTML = `
            <h3>개인별 정산:</h3>
            ${finalIndividualCostsDisplay.join('<br>')}
        `;

        document.getElementById('courtRentalDutyDisplay').innerHTML = `🌟 <strong>코트 대여 임무:</strong> ${courtRentalDutyName}`;

        resultDiv.style.display = 'block';
        loadingMessage.style.display = 'none';

        // 카카오톡 공유 버튼 활성화
        if (typeof Kakao !== 'undefined' && Kakao.isInitialized()) {
            kakaoShareButton.style.display = 'block';
            kakaoShareButton.onclick = () => shareKakao(
                formatCurrency(totalRentalFee),
                formatCurrency(totalOverallCost),
                formatCurrency(sharePerPersonIncludingBalls),
                ballProvidersArray.map(p => p.count), // 공 개수만 전달
                BALL_PRICE_PER_UNIT,
                courtRentalDutyName
            );
        } else {
             console.warn("카카오 SDK가 초기화되지 않았거나 로드되지 않았습니다. JavaScript 키를 확인해주세요.");
             kakaoShareButton.style.display = 'none';
             infoMessage.textContent = "카카오톡 공유 기능을 사용하려면 Kakao.init() 설정이 필요합니다.";
             infoMessage.style.display = 'block';
        }

    } catch (e) {
        loadingMessage.style.display = 'none';
        errorMessage.textContent = '오류: ' + e.message;
        errorMessage.style.display = 'block';
        kakaoShareButton.style.display = 'none'; // 에러 발생 시 버튼 숨김
    }
}

// ====== Kakao Share Function ======
function shareKakao(totalCourtFee, totalTennisCost, regularParticipantCost, ballProviderBallCounts, ballPricePerUnit, courtRentalDuty) {
    if (!Kakao.isInitialized()) {
        alert("카카오 SDK가 초기화되지 않았습니다. 개발자 키를 확인해주세요.");
        return;
    }

    let descriptionText = `🎾 코트 대여료: ${totalCourtFee}\n`;
    descriptionText += `🥎 총 비용: ${totalTennisCost}\n\n`;
    descriptionText += `**1. 일반 참가자 송금액:**\n  **${regularParticipantCost}**\n\n`;

    let ballProviderSummary = [];
    let providerIndexCounter = 1;
    ballProviderBallCounts.forEach((ballCount) => {
        if (ballCount > 0) {
            const providerLabel = `공 제공자 ${providerIndexCounter}`;
            const actualCostForProvider = ballCount * ballPricePerUnit;
            const netDifferenceValue = parseFloat(regularParticipantCost.replace(/[^0-9.-]+/g,"")) - actualCostForProvider;

            if (netDifferenceValue < 0) {
                const refundAmount = Math.abs(netDifferenceValue);
                let refundCalculationDetails = `${actualCostForProvider.toLocaleString()}원`;
                let tempAmount = actualCostForProvider;
                let deductedParts = [];
                const sharePerPersonNum = parseFloat(regularParticipantCost.replace(/[^0-9.-]+/g,""));
                while (tempAmount >= sharePerPersonNum && sharePerPersonNum > 0) {
                    tempAmount -= sharePerPersonNum;
                    deductedParts.push(sharePerPersonNum.toLocaleString());
                }
                if (deductedParts.length > 0) {
                    refundCalculationDetails += ` - ${deductedParts.join(' - ')}`;
                }
                refundCalculationDetails += ` = ${refundAmount.toLocaleString()}원 (총 ${refundAmount.toLocaleString()}원 환급)`;
                
                ballProviderSummary.push(`  - ${providerLabel} (공값 ${actualCostForProvider.toLocaleString()}원):\n    ${refundCalculationDetails}`);

            } else if (netDifferenceValue > 0) {
                 ballProviderSummary.push(`  - ${providerLabel}: **${netDifferenceValue.toLocaleString()}원** 추가 지불`);
            } else {
                ballProviderSummary.push(`  - ${providerLabel}: 정산 완료`);
            }
        }
        providerIndexCounter++; // 다음 제공자 인덱스 증가
    });

    if (ballProviderSummary.length > 0) {
        descriptionText += `**2. 테니스공 제공자 정산:**\n${ballProviderSummary.join('\n')}\n\n`;
    } else {
        descriptionText += `**2. 테니스공 제공자 정산:**\n  - 없음\n\n`;
    }

    descriptionText += `🌟 **코트 대여 임무:** ${courtRentalDuty}`;

    Kakao.Share.sendDefault({
        objectType: 'text',
        text: descriptionText,
        link: {
            mobileWebUrl: window.location.href, // 현재 페이지 URL
            webUrl: window.location.href
        },
        buttons: [
            {
                title: '계산기 바로가기',
                link: {
                    mobileWebUrl: window.location.href,
                    webUrl: window.location.href,
                },
            },
        ],
    });
}

// ====== Event Listeners and Initial Load ======
document.addEventListener('DOMContentLoaded', () => {
    populateTimeOptions(); // 시간 드롭다운 채우기
    updateTimeDefaults(); // 날짜 및 시간 기본값 설정
    
    const ballProvidersSelect = document.getElementById('ballProviders');
    if (ballProvidersSelect) {
        ballProvidersSelect.dataset.manuallyChanged = 'false';
    }
    updateCourtRelatedDefaults(); // 코트 수에 따른 인원/공 제공자 기본값 설정
    calculateFees(); // 페이지 로드 시 초기 계산

    // 모든 입력 필드 변경 시 계산 재실행
    document.getElementById('date').addEventListener('change', calculateFees);
    document.getElementById('startTime').addEventListener('change', calculateFees);
    document.getElementById('endTime').addEventListener('change', calculateFees);

    // 코트 관련 입력 필드 (setCourtValue에서 이미 calculateFees 호출됨)
    document.getElementById('indoorCourts').addEventListener('change', updateCourtRelatedDefaults);
    document.getElementById('indoorDiscountCourts').addEventListener('change', calculateFees);
    document.getElementById('outdoorCourts').addEventListener('change', updateCourtRelatedDefaults);
    document.getElementById('outdoorDiscountCourts').addEventListener('change', calculateFees);

    document.getElementById('totalPeople').addEventListener('change', calculateFees);
    document.getElementById('ballProviders').addEventListener('change', () => {
        document.getElementById('ballProviders').dataset.manuallyChanged = 'true';
        updateBallProviderDefaults();
        calculateFees();
    });
    document.getElementById('ballProvider1Balls').addEventListener('change', calculateFees);
    document.getElementById('ballProvider2Balls').addEventListener('change', calculateFees);
    document.getElementById('ballProvider3Balls').addEventListener('change', calculateFees);
    document.getElementById('ballProvider4Balls').addEventListener('change', calculateFees);


    // 계산 버튼 클릭 이벤트
    document.querySelector('.calculate-button').addEventListener('click', calculateFees);


    // Kakao SDK 초기화
    const KAKAO_JAVASCRIPT_KEY = '67cf828f37dca7dd4b1feef97f2ea7f1'; // 요청하신 키 적용
    const kakaoShareButton = document.getElementById('kakaoShareButton');
    const infoMessage = document.getElementById('infoMessage');

    if (KAKAO_JAVASCRIPT_KEY && KAKAO_JAVASCRIPT_KEY !== 'YOUR_JAVO_SCRIPT_KEY_HERE') {
        Kakao.init(KAKAO_JAVASCRIPT_KEY);
        console.log("카카오 SDK 초기화됨:", Kakao.isInitialized());
        if (infoMessage) {
            infoMessage.style.display = 'none';
        }
    } else {
        console.warn("카카오 JavaScript 키가 설정되지 않았습니다. 카카오톡 공유 기능이 비활성화됩니다.");
        if (kakaoShareButton) {
            kakaoShareButton.style.display = 'none';
        }
        if (infoMessage) {
            infoMessage.textContent = "카카오톡 공유 기능을 사용하려면 카카오 개발자 사이트에서 JavaScript 키를 발급받아 script.js 파일의 Kakao.init() 부분에 설정해야 합니다.";
            infoMessage.style.display = 'block';
        }
    }
});
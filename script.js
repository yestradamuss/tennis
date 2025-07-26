// 요금표 데이터 (기존 구글시트 데이터를 로컬 객체로 변환)
const INDOOR_RATES = {
    weekday: 7000, // 평일 이용료
    weekend: 8000  // 주말 이용료
};

const OUTDOOR_RATES = {
    weekday: 3000, // 평일 기본 이용료
    weekend: 4000  // 주말 기본 이용료
};

// 조명 요금표 (월별 야간 시간대)
const LIGHTING_RATES = {
    1: { start: "17:00", end: "06:00", weekdayRate: 5000, weekendRate: 6000, lightingFee: 2000 }, // 1월
    2: { start: "18:00", end: "06:00", weekdayRate: 5000, weekendRate: 6000, lightingFee: 2000 }, // 2월
    3: { start: "18:30", end: "06:00", weekdayRate: 5000, weekendRate: 6000, lightingFee: 2000 }, // 3월
    4: { start: "19:00", end: "06:00", weekdayRate: 5000, weekendRate: 6000, lightingFee: 2000 }, // 4월
    5: { start: "19:30", end: "06:00", weekdayRate: 5000, weekendRate: 6000, lightingFee: 2000 }, // 5월
    6: { start: "20:00", end: "06:00", weekdayRate: 5000, weekendRate: 6000, lightingFee: 2000 }, // 6월
    7: { start: "19:30", end: "06:00", weekdayRate: 5000, weekendRate: 6000, lightingFee: 2000 }, // 7월
    8: { start: "19:00", end: "06:00", weekdayRate: 5000, weekendRate: 6000, lightingFee: 2000 }, // 8월
    9: { start: "18:30", end: "06:00", weekdayRate: 5000, weekendRate: 6000, lightingFee: 2000 }, // 9월
    10: { start: "18:00", end: "06:00", weekdayRate: 5000, weekendRate: 6000, lightingFee: 2000 }, // 10월
    11: { start: "17:30", end: "06:00", weekdayRate: 5000, weekendRate: 6000, lightingFee: 2000 }, // 11월
    12: { start: "17:00", end: "06:00", weekdayRate: 5000, weekendRate: 6000, lightingFee: 2000 }  // 12월
};

// 한국 공휴일 데이터 (2024-2025년)
const KOREAN_HOLIDAYS = {
    2024: [
        '2024-01-01', '2024-02-09', '2024-02-10', '2024-02-11', '2024-02-12',
        '2024-03-01', '2024-04-10', '2024-05-05', '2024-05-06', '2024-05-15',
        '2024-06-06', '2024-08-15', '2024-09-16', '2024-09-17', '2024-09-18',
        '2024-10-03', '2024-10-09', '2024-12-25'
    ],
    2025: [
        '2025-01-01', '2025-01-28', '2025-01-29', '2025-01-30', '2025-03-01',
        '2025-04-05', '2025-05-05', '2025-05-15', '2025-06-06', '2025-08-15',
        '2025-10-03', '2025-10-06', '2025-10-07', '2025-10-08', '2025-10-09',
        '2025-12-25'
    ]
};

let ballProvidersManuallyChanged = false;

// 유틸리티 함수들
function timeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

function isWeekendOrHoliday(date) {
    const dayOfWeek = date.getDay(); // 0:일, 6:토
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    const dateString = date.toISOString().slice(0, 10);
    const year = date.getFullYear();
    const holidays = KOREAN_HOLIDAYS[year] || [];
    const isHoliday = holidays.includes(dateString);
    
    return isWeekend || isHoliday;
}

// 폼 조작 함수들
function setCourtValue(id, value) {
    document.getElementById(id).value = value;
    updateCourtRelatedDefaults();
    calculateFees();
}

function setPeopleValue(value) {
    document.getElementById('totalPeople').value = value;
    calculateFees();
}

function setBallProviders(value) {
    document.getElementById('ballProviders').value = value;
    ballProvidersManuallyChanged = true;
    updateBallProviderDefaults();
    calculateFees();
}

function setBallCount(id, value) {
    document.getElementById(id).value = value;
    calculateFees();
}

function updateBallProviderDefaults(isInitialLoadOrCourtChange = false) {
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

function updateCourtRelatedDefaults() {
    const indoorCourts = parseInt(document.getElementById('indoorCourts').value) || 0;
    const outdoorCourts = parseInt(document.getElementById('outdoorCourts').value) || 0;
    const selectedCourtCount = indoorCourts + outdoorCourts;

    // 총 인원수 기본값 설정 (코트수 * 4)
    const totalPeopleInput = document.getElementById('totalPeople');
    const currentTotalPeople = parseInt(totalPeopleInput.value);
    const suggestedTotalPeople = selectedCourtCount * 4;
    if (currentTotalPeople < suggestedTotalPeople) {
        totalPeopleInput.value = suggestedTotalPeople;
    }

    // 공 제공자 수 기본값 설정
    const ballProvidersSelect = document.getElementById('ballProviders');
    let bestMatchValue = 0;
    let minDiff = Infinity;
    let foundExactMatch = false;

    for (let i = 0; i < ballProvidersSelect.options.length; i++) {
        const optionValue = parseInt(ballProvidersSelect.options[i].value);
        if (optionValue === selectedCourtCount) {
            bestMatchValue = optionValue;
            foundExactMatch = true;
            break;
        }
    }

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

    if (!ballProvidersManuallyChanged || parseInt(ballProvidersSelect.value) === 0) {
        ballProvidersSelect.value = bestMatchValue;
    }

    // 공 제공자별 공 개수 드롭다운 업데이트
    const currentBallProviders = parseInt(ballProvidersSelect.value) || 0;

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

function updateTimeDefaults() {
    const dateInput = document.getElementById('date');
    const startTimeSelect = document.getElementById('startTime');
    const endTimeSelect = document.getElementById('endTime');

    const selectedDate = new Date(dateInput.value);
    const isWeekendOrHol = isWeekendOrHoliday(selectedDate);

    if (isWeekendOrHol) {
        startTimeSelect.value = "06:00";
        endTimeSelect.value = "08:00";
    } else {
        startTimeSelect.value = "10:00";
        endTimeSelect.value = "12:00";
    }
}

// 메인 계산 함수
function calculateFees() {
    try {
        document.getElementById('loadingMessage').style.display = 'block';
        document.getElementById('error').style.display = 'none';
        document.getElementById('result').style.display = 'none';
        document.getElementById('infoMessage').style.display = 'none';

        // 입력값 수집
        const selectedDate = new Date(document.getElementById('date').value);
        const selectedMonth = selectedDate.getMonth() + 1;
        const isWeekendOrHol = isWeekendOrHoliday(selectedDate);

        const indoorCourts = parseInt(document.getElementById('indoorCourts').value);
        const indoorDiscountCourts = parseInt(document.getElementById('indoorDiscountCourts').value);
        const outdoorCourts = parseInt(document.getElementById('outdoorCourts').value);
        const outdoorDiscountCourts = parseInt(document.getElementById('outdoorDiscountCourts').value);

        const startTimeValue = document.getElementById('startTime').value;
        const endTimeValue = document.getElementById('endTime').value;

        const totalPeople = parseInt(document.getElementById('totalPeople').value);
        const ballProviders = parseInt(document.getElementById('ballProviders').value);
        const ballProvider1Balls = parseInt(document.getElementById('ballProvider1Balls').value || 0);
        const ballProvider2Balls = parseInt(document.getElementById('ballProvider2Balls').value || 0);
        const ballProvider3Balls = parseInt(document.getElementById('ballProvider3Balls').value || 0);
        const ballProvider4Balls = parseInt(document.getElementById('ballProvider4Balls').value || 0);

        // 유효성 검사
        if (isNaN(indoorCourts) || isNaN(indoorDiscountCourts) || isNaN(outdoorCourts) || 
            isNaN(outdoorDiscountCourts) || isNaN(totalPeople) || isNaN(ballProviders) ||
            !startTimeValue || !endTimeValue) {
            throw new Error("모든 필수 입력값을 올바르게 입력해주세요.");
        }

        if (indoorDiscountCourts > indoorCourts || outdoorDiscountCourts > outdoorCourts) {
            throw new Error("감면 대상 코트 수는 실제 코트 대여 수를 초과할 수 없습니다.");
        }

        if (ballProviders > totalPeople) {
            throw new Error("테니스공 제공자 수는 총 인원수를 초과할 수 없습니다.");
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

        const totalOverlapHours = durationMinutes / 60;

        let totalCourtUsageFee = 0;
        let totalLightFee = 0;

        // 실내 코트 계산
        if (indoorCourts > 0) {
            const hourlyRate = isWeekendOrHol ? INDOOR_RATES.weekend : INDOOR_RATES.weekday;
            
            // 정상 실내 코트 요금
            totalCourtUsageFee += (indoorCourts - indoorDiscountCourts) * hourlyRate * totalOverlapHours;
            // 할인 실내 코트 요금
            totalCourtUsageFee += indoorDiscountCourts * hourlyRate * totalOverlapHours * DISCOUNT_FACTOR;
            // 실내 조명비 (할인 없음)
            totalLightFee += indoorCourts * INDOOR_LIGHT_HOURLY_RATE * totalOverlapHours;
        }

        // 실외 코트 계산
        if (outdoorCourts > 0) {
            const defaultDaytimeCourtRate = isWeekendOrHol ? OUTDOOR_RATES.weekend : OUTDOOR_RATES.weekday;

            for (let currentMin = selectedStartMin; currentMin < selectedEndMin; currentMin++) {
                let courtRateForThisMinute = defaultDaytimeCourtRate;
                let lightingRateForThisMinute = 0;

                // 야간 요금 확인
                const lightingData = LIGHTING_RATES[selectedMonth];
                if (lightingData) {
                    const nightStartMin = timeToMinutes(lightingData.start);
                    const nightEndMin = timeToMinutes(lightingData.end);
                    
                    // 야간 시간대 확인 (시작 시간이 종료 시간보다 큰 경우 자정을 넘어가는 것으로 처리)
                    let isNightTime = false;
                    if (nightStartMin > nightEndMin) {
                        // 자정을 넘어가는 경우 (예: 17:00 ~ 06:00)
                        isNightTime = currentMin >= nightStartMin || currentMin < nightEndMin;
                    } else {
                        // 같은 날 내의 시간대
                        isNightTime = currentMin >= nightStartMin && currentMin < nightEndMin;
                    }

                    if (isNightTime) {
                        courtRateForThisMinute = isWeekendOrHol ? lightingData.weekendRate : lightingData.weekdayRate;
                        lightingRateForThisMinute = lightingData.lightingFee;
                    }
                }

                // 분당 요금 계산
                const courtRatePerMinute = courtRateForThisMinute / 60;
                const lightingRatePerMinute = lightingRateForThisMinute / 60;

                const outdoorNormalCourts = outdoorCourts - outdoorDiscountCourts;

                // 코트 사용료 계산
                totalCourtUsageFee += courtRatePerMinute * outdoorNormalCourts;
                totalCourtUsageFee += courtRatePerMinute * outdoorDiscountCourts * DISCOUNT_FACTOR;

                // 조명비 계산
                totalLightFee += lightingRatePerMinute * outdoorNormalCourts;
                totalLightFee += lightingRatePerMinute * outdoorDiscountCourts;
            }
        }

        const totalRentalFee = Math.round(totalCourtUsageFee + totalLightFee);
        const totalBallsProvided = ballProvider1Balls + ballProvider2Balls + ballProvider3Balls + ballProvider4Balls;
        const totalTennisBallCost = totalBallsProvided * TENNIS_BALL_PRICE;
        const totalOverallCost = totalRentalFee + totalTennisBallCost;

        // 1인당 비용 정산 로직
        const finalIndividualCostsDisplay = [];
        const sharePerPersonIncludingBalls = Math.round(totalOverallCost / totalPeople);

        finalIndividualCostsDisplay.push(`**1. 일반 참가자 송금액:**`);
        finalIndividualCostsDisplay.push(`  **${sharePerPersonIncludingBalls.toLocaleString()}원**`);

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

            const actualCostForProvider = provider.count * TENNIS_BALL_PRICE;
            let netDifference = sharePerPersonIncludingBalls - actualCostForProvider;

            if (provider.count === 0) {
                providerMessages.push(`  - ${provider.label}: 추가 지불 없음`);
            } else if (netDifference < 0) {
                let refundDisplayString = `${actualCostForProvider.toLocaleString()}원`;
                let currentAmount = actualCostForProvider;
                let deductedAmounts = [];

                while (currentAmount >= sharePerPersonIncludingBalls) {
                    currentAmount -= sharePerPersonIncludingBalls;
                    deductedAmounts.push(sharePerPersonIncludingBalls.toLocaleString());
                }

                if (deductedAmounts.length > 0) {
                    refundDisplayString += ` - ${deductedAmounts.join(' - ')}`;
                }

                let finalCalcResult = actualCostForProvider - (deductedAmounts.length * sharePerPersonIncludingBalls);
                const refundAmount = Math.abs(finalCalcResult);

                providerMessages.push(`  - ${provider.label} (공값 ${actualCostForProvider.toLocaleString()}원):`);
                providerMessages.push(`    ${refundDisplayString} = ${refundAmount.toLocaleString()}원 (총 ${Math.abs(netDifference).toLocaleString()}원 환급)`);
                
                const resultOfSubtraction = sharePerPersonIncludingBalls - refundAmount;
                providerMessages.push(`    (${sharePerPersonIncludingBalls.toLocaleString()}원 - ${refundAmount.toLocaleString()}원 = ${resultOfSubtraction.toLocaleString()}원)`);

            } else if (netDifference > 0) {
                providerMessages.push(`  - ${provider.label}: **${netDifference.toLocaleString()}원** 추가 지불`);
            } else {
                providerMessages.push(`  - ${provider.label}: 정산 완료`);
            }
        }

        if (providerMessages.length > 0) {
            providerMessages.forEach(msg => finalIndividualCostsDisplay.push(msg));
        } else {
            finalIndividualCostsDisplay.push(`  - 없음`);
        }

        // 결과 표시
        document.getElementById('loadingMessage').style.display = 'none';
        document.getElementById('calculationResultTitle').style.display = 'block';
        document.getElementById('totalCourtFee').innerHTML = `🎾 <strong>총 코트 대여료:</strong> ${totalRentalFee.toLocaleString()}원`;
        document.getElementById('totalTennisCost').innerHTML = `🥎 <strong>총 테니스 비용 (공 포함):</strong> ${totalOverallCost.toLocaleString()}원`;

        const individualCostsDiv = document.getElementById('individualCosts');
        individualCostsDiv.innerHTML = '';

        finalIndividualCostsDisplay.forEach(item => {
            let displayItem = item.replace(/\*\*/g, '<strong>') + '</strong>';

            if (item.includes('일반 참가자 송금액:')) {
                individualCostsDiv.innerHTML += `<span class="inline-item">💰 ${displayItem}</span>`;
            } else if (item.includes('테니스공 제공자 환급액:')) {
                individualCostsDiv.innerHTML += `<span class="inline-item">💸 ${displayItem}</span>`;
            } else {
                if (item.includes('원 = ') && item.includes('원)')) {
                    individualCostsDiv.innerHTML += `<span>🏃‍♂️ <strong>부지런한사람:</strong> ${displayItem}</span>`;
                } else {
                    individualCostsDiv.innerHTML += `<span>${displayItem}</span>`;
                }
            }
        });

        // 코트 대여 임무 (주말/공휴일에만 표시, 현재는 숨김)
        document.getElementById('courtRentalDutyDisplay').style.display = 'none';

        document.getElementById('result').style.display = 'block';

    } catch (error) {
        document.getElementById('loadingMessage').style.display = 'none';
        document.getElementById('error').textContent = error.message;
        document.getElementById('error').style.display = 'block';
    }
}

// 카카오톡 공유 기능
function shareToKakao() {
    const resultDiv = document.getElementById('result');
    if (resultDiv.style.display === 'none') {
        alert('먼저 요금을 계산해주세요.');
        return;
    }

    const totalCourtFee = document.getElementById('totalCourtFee').textContent;
    const totalTennisCost = document.getElementById('totalTennisCost').textContent;
    const date = document.getElementById('date').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;

    const shareText = `🎾 테니스 코트 예약 결과\n\n📅 날짜: ${date}\n⏰ 시간: ${startTime} ~ ${endTime}\n\n${totalCourtFee}\n${totalTennisCost}\n\n자세한 정산 내역은 링크를 확인해주세요!`;

    Kakao.Share.sendDefault({
        objectType: 'text',
        text: shareText,
        link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href
        }
    });
}

// 이벤트 리스너 설정
document.addEventListener('DOMContentLoaded', function() {
    // 오늘 날짜로 초기화
    const today = new Date().toISOString().slice(0, 10);
    document.getElementById('date').value = today;

    // 초기값 설정
    updateCourtRelatedDefaults();
    updateTimeDefaults();
    calculateFees();

    // 랭킹보드 버튼 설정
    document.getElementById('rankingBoardButton').onclick = function() {
        window.open(RANKING_BOARD_URL, '_blank');
    };

    // 카카오 SDK 초기화
    Kakao.init('67cf828f37dca7dd4b1feef97f2ea7f1');
    
    // 카카오톡 공유 버튼 이벤트
    document.getElementById('kakaoShareButton').onclick = shareToKakao;

    // 이벤트 리스너 연결
    document.getElementById('date').addEventListener('change', function() {
        updateTimeDefaults();
        calculateFees();
    });
    
    document.getElementById('startTime').addEventListener('change', calculateFees);
    document.getElementById('endTime').addEventListener('change', calculateFees);
    
    document.getElementById('indoorCourts').addEventListener('change', function() {
        updateCourtRelatedDefaults();
        calculateFees();
    });
    
    document.getElementById('outdoorCourts').addEventListener('change', function() {
        updateCourtRelatedDefaults();
        calculateFees();
    });
    
    document.getElementById('indoorDiscountCourts').addEventListener('change', calculateFees);
    document.getElementById('outdoorDiscountCourts').addEventListener('change', calculateFees);
    document.getElementById('totalPeople').addEventListener('change', calculateFees);
    
    document.getElementById('ballProviders').addEventListener('change', function() {
        ballProvidersManuallyChanged = true;
        updateBallProviderDefaults();
        calculateFees();
    });
    
    document.getElementById('ballProvider1Balls').addEventListener('change', calculateFees);
    document.getElementById('ballProvider2Balls').addEventListener('change', calculateFees);
    document.getElementById('ballProvider3Balls').addEventListener('change', calculateFees);
    document.getElementById('ballProvider4Balls').addEventListener('change', calculateFees);
});
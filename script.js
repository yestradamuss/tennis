// ====== Helper Functions (Utilities) ======
function getHourDiff(start, end) {
    const startHour = parseInt(start.split(':')[0]);
    const endHour = parseInt(end.split(':')[0]);
    return endHour - startHour;
}

function parseKoreanNumber(str) {
    // 공백 및 콤마 제거
    let cleanedStr = String(str).replace(/[\s,]/g, '');
    // '원' 제거
    cleanedStr = cleanedStr.replace(/원$/, '');
    return parseInt(cleanedStr);
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
                ballProviderGroups[i].style.display = 'block';
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

// ====== Main Calculation Logic (Transferred from Code.gs) ======
function calculateFees() { // 함수 이름 변경: calculateCourtFees -> calculateFees
    const dateStr = document.getElementById('date').value;
    const startTimeStr = document.getElementById('startTime').value;
    const endTimeStr = document.getElementById('endTime').value;
    const indoorCourts = parseInt(document.getElementById('indoorCourts').value);
    const indoorDiscountCourts = parseInt(document.getElementById('indoorDiscountCourts').value);
    const outdoorCourts = parseInt(document.getElementById('outdoorCourts').value);
    const outdoorDiscountCourts = parseInt(document.getElementById('outdoorDiscountCourts').value);
    const totalPeople = parseInt(document.getElementById('totalPeople').value);
    const ballProvidersCount = parseInt(document.getElementById('ballProviders').value);

    const ballProviderBalls = [
        parseInt(document.getElementById('ballProvider1Balls').value || 0),
        parseInt(document.getElementById('ballProvider2Balls').value || 0),
        parseInt(document.getElementById('ballProvider3Balls').value || 0),
        parseInt(document.getElementById('ballProvider4Balls').value || 0)
    ].slice(0, ballProvidersCount); // 실제 제공자 수만큼만 사용

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
        const dayOfWeek = selectedDate.getDay(); // 0:일, 1:월, ..., 6:토
        const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5; // 월-금
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 일-토

        const startHour = parseInt(startTimeStr.split(':')[0]);
        const endHour = parseInt(endTimeStr.split(':')[0]);
        const totalCourtHours = endHour - startHour;

        if (totalCourtHours <= 0) {
            throw new Error("종료 시간은 시작 시간보다 늦어야 합니다.");
        }
        if (indoorCourts + outdoorCourts === 0) {
            throw new Error("코트를 최소 1개 이상 대여해야 합니다.");
        }
        if (totalPeople < 4) {
            throw new Error("총 인원은 최소 4명 이상이어야 합니다.");
        }

        // ====== 코트 요금 계산 로직 ======
        const INDOOR_WEEKDAY_DAY_RATE = 20000;
        const INDOOR_WEEKDAY_NIGHT_RATE = 25000;
        const INDOOR_WEEKEND_RATE = 30000;

        const OUTDOOR_WEEKDAY_DAY_RATE = 5000;
        const OUTDOOR_WEEKDAY_NIGHT_RATE = 7000;
        const OUTDOOR_WEEKEND_RATE = 10000;

        const INDOOR_DISCOUNT_PERCENTAGE = 0.5; // 50% 할인
        const OUTDOOR_DISCOUNT_PERCENTAGE = 0.5; // 50% 할인

        let totalCourtFee = 0;

        for (let i = 0; i < totalCourtHours; i++) {
            const currentHour = startHour + i;
            let hourlyIndoorRate = 0;
            let hourlyOutdoorRate = 0;

            if (isWeekday) {
                if (currentHour >= 6 && currentHour < 18) { // 평일 주간 (06시-17시)
                    hourlyIndoorRate = INDOOR_WEEKDAY_DAY_RATE;
                    hourlyOutdoorRate = OUTDOOR_WEEKDAY_DAY_RATE;
                } else { // 평일 야간 (18시-22시)
                    hourlyIndoorRate = INDOOR_WEEKDAY_NIGHT_RATE;
                    hourlyOutdoorRate = OUTDOOR_WEEKDAY_NIGHT_RATE;
                }
            } else if (isWeekend) { // 주말 및 공휴일 (시간대 구분 없음)
                hourlyIndoorRate = INDOOR_WEEKEND_RATE;
                hourlyOutdoorRate = OUTDOOR_WEEKEND_RATE;
            }

            // 실내 코트 요금
            totalCourtFee += (indoorCourts - indoorDiscountCourts) * hourlyIndoorRate;
            totalCourtFee += indoorDiscountCourts * hourlyIndoorRate * INDOOR_DISCOUNT_PERCENTAGE;

            // 실외 코트 요금
            totalCourtFee += (outdoorCourts - outdoorDiscountCourts) * hourlyOutdoorRate;
            totalCourtFee += outdoorDiscountCourts * hourlyOutdoorRate * OUTDOOR_DISCOUNT_PERCENTAGE;
        }

        // 테니스공 비용 (공 1개당 7,000원)
        const BALL_PRICE_PER_UNIT = 7000;
        let totalBallCost = 0;
        ballProviderBalls.forEach(count => {
            totalBallCost += count * BALL_PRICE_PER_UNIT;
        });

        const totalTennisCost = totalCourtFee + totalBallCost;
        const regularParticipantCost = totalTennisCost / totalPeople;

        // 코트 대여 임무 분배 (간단한 로직, Apps Script에서 가져옴)
        const courtRentalDuty = "이창민"; // 고정값

        // === 결과 표시 ===
        document.getElementById('totalCourtFee').innerHTML = `🎾 <strong>총 코트 대여료:</strong> ${formatCurrency(totalCourtFee)}`;
        document.getElementById('totalTennisCost').innerHTML = `🥎 <strong>총 테니스 비용 (공 포함):</strong> ${formatCurrency(totalTennisCost)}`;

        let ballProviderDetailsHtml = "";
        let totalRefundsForKakaoShare = 0; // 카카오 공유를 위한 총 환급액 합계

        ballProviderBalls.forEach((ballCount, index) => {
            if (ballCount > 0) {
                const providerIndex = index + 1;
                const costOfBallsProvided = ballCount * BALL_PRICE_PER_UNIT;
                const netAmount = regularParticipantCost - costOfBallsProvided;

                if (netAmount < 0) { // 공 제공자가 받을 돈이 있을 경우 (음수 -> 환급)
                    const refund = Math.abs(netAmount);
                    totalRefundsForKakaoShare += refund;
                    ballProviderDetailsHtml += `<p>- 공 제공자 ${providerIndex} (공값 ${formatCurrency(costOfBallsProvided)}): ${formatCurrency(refund)} 환급</p>`;
                } else if (netAmount > 0) { // 공 제공자가 낼 돈이 있을 경우 (양수 -> 송금)
                    ballProviderDetailsHtml += `<p>- 공 제공자 ${providerIndex} (공값 ${formatCurrency(costOfBallsProvided)}): ${formatCurrency(netAmount)} 송금</p>`;
                } else { // 정확히 맞아 떨어지는 경우
                    ballProviderDetailsHtml += `<p>- 공 제공자 ${providerIndex} (공값 ${formatCurrency(costOfBallsProvided)}): 정산 완료</p>`;
                }
            }
        });

        document.getElementById('individualCosts').innerHTML = `
            <h3>개인별 정산:</h3>
            <p>💰 <strong>1. 일반 참가자 송금액:</strong> ${formatCurrency(regularParticipantCost)}</p>
            <p><strong>2. 테니스공 제공자 정산:</strong></p>
            ${ballProviderDetailsHtml}
        `;

        document.getElementById('courtRentalDutyDisplay').innerHTML = `🌟 <strong>코트 대여 임무:</strong> ${courtRentalDuty}`;

        resultDiv.style.display = 'block';
        loadingMessage.style.display = 'none';

        // 카카오톡 공유 버튼 활성화
        if (typeof Kakao !== 'undefined' && Kakao.isInitialized()) {
            kakaoShareButton.style.display = 'block';
            kakaoShareButton.onclick = () => shareKakao(
                formatCurrency(totalCourtFee),
                formatCurrency(totalTennisCost),
                formatCurrency(regularParticipantCost),
                ballProviderBalls,
                BALL_PRICE_PER_UNIT,
                totalRefundsForKakaoShare, // 여기서는 실제로 사용되지 않지만, API 인자 맞춰서 전달
                courtRentalDuty
            );
        } else {
             console.warn("카카오 SDK가 초기화되지 않았거나 로드되지 않았습니다. JavaScript 키를 확인해주세요.");
             kakaoShareButton.style.display = 'none'; // SDK 로드 안되면 버튼 숨김
             infoMessage.textContent = "카카오톡 공유 기능을 사용하려면 카카오 개발자 사이트에서 JavaScript 키를 발급받아 script.js 파일의 Kakao.init() 부분에 설정해야 합니다.";
             infoMessage.style.display = 'block';
        }

    } catch (e) {
        loadingMessage.style.display = 'none';
        errorMessage.textContent = '오류: ' + e.message;
        errorMessage.style.display = 'block';
        kakaoShareButton.style.display = 'none'; // 에러 발생 시 버튼 숨김
    }
}

// ====== Kakao Share Function (Transferred from Code.gs) ======
function shareKakao(totalCourtFee, totalTennisCost, regularParticipantCost, ballProviderBalls, ballPricePerUnit, totalRefunds, courtRentalDuty) {
    if (!Kakao.isInitialized()) {
        alert("카카오 SDK가 초기화되지 않았습니다. 개발자 키를 확인해주세요.");
        return;
    }

    let descriptionText = `🎾 코트 대여료: ${totalCourtFee}\n`;
    descriptionText += `🥎 총 비용: ${totalTennisCost}\n\n`;
    descriptionText += `💰 일반 참가자 송금액: ${regularParticipantCost}\n\n`;

    let ballProviderSummary = [];
    ballProviderBalls.forEach((ballCount, index) => {
        if (ballCount > 0) {
            const providerIndex = index + 1;
            const costOfBallsProvided = ballCount * ballPricePerUnit;
            const netAmount = parseKoreanNumber(regularParticipantCost) - costOfBallsProvided;

            if (netAmount < 0) {
                ballProviderSummary.push(`공 제공자 ${providerIndex} (공값 ${formatCurrency(costOfBallsProvided)}): ${formatCurrency(Math.abs(netAmount))} 환급`);
            } else if (netAmount > 0) {
                 ballProviderSummary.push(`공 제공자 ${providerIndex} (공값 ${formatCurrency(costOfBallsProvided)}): ${formatCurrency(netAmount)} 송금`);
            } else {
                ballProviderSummary.push(`공 제공자 ${providerIndex} (공값 ${formatCurrency(costOfBallsProvided)}): 정산 완료`);
            }
        }
    });

    if (ballProviderSummary.length > 0) {
        descriptionText += `2. 테니스공 제공자 정산:\n${ballProviderSummary.join('\n')}\n\n`;
    }

    descriptionText += `🌟 코트 대여 임무: ${courtRentalDuty}`;

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
    updateTimeDefaults(); // 날짜 및 시간 기본값 설정
    // 공 제공자 수동 변경 여부 초기화 (필요시)
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
    // 여기서는 updateCourtRelatedDefaults만 호출하도록 하여 중복 호출을 피하고 로직 흐름을 명확히 함
    document.getElementById('indoorCourts').addEventListener('change', updateCourtRelatedDefaults);
    document.getElementById('indoorDiscountCourts').addEventListener('change', calculateFees); // 감면수는 직접 계산으로
    document.getElementById('outdoorCourts').addEventListener('change', updateCourtRelatedDefaults);
    document.getElementById('outdoorDiscountCourts').addEventListener('change', calculateFees); // 감면수는 직접 계산으로

    document.getElementById('totalPeople').addEventListener('change', calculateFees);
    document.getElementById('ballProviders').addEventListener('change', () => {
        document.getElementById('ballProviders').dataset.manuallyChanged = 'true';
        updateBallProviderDefaults();
        calculateFees();
    });
    // 공 개수 입력 필드 (setBallCount에서 이미 calculateFees 호출됨)
    document.getElementById('ballProvider1Balls').addEventListener('change', calculateFees);
    document.getElementById('ballProvider2Balls').addEventListener('change', calculateFees);
    document.getElementById('ballProvider3Balls').addEventListener('change', calculateFees);
    document.getElementById('ballProvider4Balls').addEventListener('change', calculateFees);


    // 계산 버튼 클릭 이벤트
    document.querySelector('.calculate-button').addEventListener('click', calculateFees);


    // Kakao SDK 초기화 (요청하신 키 적용 완료!)
    const KAKAO_JAVASCRIPT_KEY = '67cf828f37dca7dd4b1feef97f2ea7f1'; // 요청하신 키 적용 완료!
    const kakaoShareButton = document.getElementById('kakaoShareButton');
    const infoMessage = document.getElementById('infoMessage');

    if (KAKAO_JAVASCRIPT_KEY && KAKAO_JAVASCRIPT_KEY !== 'YOUR_JAVO_SCRIPT_KEY_HERE') { // 혹시나 'YOUR_JAVO_SCRIPT_KEY_HERE'가 남을 경우를 위한 안전장치
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
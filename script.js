// script.js 파일 전체 내용

document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('dateInput');
    const startTimeSelect = document.getElementById('startTime');
    const endTimeSelect = document.getElementById('endTime');
    const indoorCourtCountInput = document.getElementById('indoorCourtCount');
    const indoorDiscountCountInput = document.getElementById('indoorDiscountCount');
    const outdoorCourtCountInput = document.getElementById('outdoorCourtCount');
    const outdoorDiscountCountInput = document.getElementById('outdoorDiscountCount');
    const totalParticipantsInput = document.getElementById('totalParticipants');
    const ballProvidersSelect = document.getElementById('ballProviders');
    const firstBallProviderBallsSelect = document.getElementById('firstBallProviderBalls');
    const calculateBtn = document.getElementById('calculateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const resultSection = document.getElementById('resultSection');
    const totalCourtFeeSpan = document.getElementById('totalCourtFee');
    const totalTennisCostSpan = document.getElementById('totalTennisCost');
    const generalParticipantFeeSpan = document.getElementById('generalParticipantFee');
    const ballProviderSettlementsDiv = document.getElementById('ballProviderSettlements');
    const courtDutyPersonSpan = document.getElementById('courtDutyPerson');
    const kakaoShareButton = document.getElementById('kakaoShareButton');
    const infoMessage = document.getElementById('infoMessage');

    // 상수 정의 (임의의 값, 실제 요금 체계에 따라 변경 필요)
    const INDOOR_COURT_FEE_PER_HOUR = 15000;
    const OUTDOOR_COURT_FEE_PER_HOUR = 7000;
    const DISCOUNT_RATE = 0.5; // 50% 할인
    const BALL_COST_PER_BALL = 7000; // 공 1개당 가격

    // 시간 옵션 생성
    function generateTimeOptions() {
        for (let i = 0; i < 24; i++) {
            const time = String(i).padStart(2, '0') + ':00';
            const optionStart = document.createElement('option');
            optionStart.value = time;
            optionStart.textContent = time;
            startTimeSelect.appendChild(optionStart);

            const optionEnd = document.createElement('option');
            optionEnd.value = time;
            optionEnd.textContent = time;
            endTimeSelect.appendChild(optionEnd);
        }
    }

    // 날짜/시간 기본값 설정
    function setDefaultDateTime() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${year}-${month}-${day}`;

        // 현재 시간으로부터 가장 가까운 다음 정각을 기본값으로 설정
        const currentHour = today.getHours();
        let defaultStartTime = String(currentHour + 1).padStart(2, '0') + ':00';
        let defaultEndTime = String(currentHour + 2).padStart(2, '0') + ':00';

        // 23시 이후는 다음날 06시로 조정
        if (currentHour >= 23) {
            defaultStartTime = '06:00';
            defaultEndTime = '08:00';
            // 날짜도 다음 날로 설정 (선택사항, 복잡하므로 현재는 생략)
        } else if (currentHour === 22) { // 22시 시작시 23시 종료
            defaultEndTime = '23:00';
        }

        startTimeSelect.value = defaultStartTime;
        endTimeSelect.value = defaultEndTime;
    }

    // 숫자 입력 필드 옆 버튼 핸들러
    document.querySelectorAll('.button-group button').forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.dataset.target;
            const value = this.dataset.value;
            document.getElementById(targetId).value = value;
        });
    });

    calculateBtn.addEventListener('click', calculateFees);
    resetBtn.addEventListener('click', resetCalculator);

    function calculateFees() {
        const date = dateInput.value;
        const startTime = startTimeSelect.value;
        const endTime = endTimeSelect.value;
        const indoorCourtCount = parseInt(indoorCourtCountInput.value);
        const indoorDiscountCount = parseInt(indoorDiscountCountInput.value);
        const outdoorCourtCount = parseInt(outdoorCourtCountInput.value);
        const outdoorDiscountCount = parseInt(outdoorDiscountCountInput.value);
        const totalParticipants = parseInt(totalParticipantsInput.value);
        const ballProviders = parseInt(ballProvidersSelect.value);
        const firstBallProviderBalls = parseInt(firstBallProviderBallsSelect.value);

        if (!date || !startTime || !endTime) {
            alert('날짜와 시간을 입력해주세요.');
            return;
        }

        const startHour = parseInt(startTime.split(':')[0]);
        const endHour = parseInt(endTime.split(':')[0]);
        let durationHours = endHour - startHour;

        if (durationHours <= 0) {
            alert('종료 시간은 시작 시간보다 늦어야 합니다.');
            return;
        }

        let totalCourtFee = 0;
        let totalDiscountedIndoorFee = 0;
        let totalDiscountedOutdoorFee = 0;

        // 실내 코트 요금 계산
        totalCourtFee += (indoorCourtCount - indoorDiscountCount) * INDOOR_COURT_FEE_PER_HOUR * durationHours;
        totalDiscountedIndoorFee = indoorDiscountCount * INDOOR_COURT_FEE_PER_HOUR * durationHours * DISCOUNT_RATE;
        totalCourtFee += totalDiscountedIndoorFee;

        // 실외 코트 요금 계산
        totalCourtFee += (outdoorCourtCount - outdoorDiscountCount) * OUTDOOR_COURT_FEE_PER_HOUR * durationHours;
        totalDiscountedOutdoorFee = outdoorDiscountCount * OUTDOOR_COURT_FEE_PER_HOUR * durationHours * DISCOUNT_RATE;
        totalCourtFee += totalDiscountedOutdoorFee;

        // 총 공 개수 및 비용
        const totalBallsProvided = firstBallProviderBalls + (ballProviders > 1 ? (ballProviders - 1) * 2 : 0);
        const totalBallCost = totalBallsProvided * BALL_COST_PER_BALL;

        // 총 테니스 비용
        const totalTennisCost = totalCourtFee + totalBallCost;

        // 일반 참가자 1인당 송금액
        const generalParticipants = totalParticipants - ballProviders;
        let generalParticipantFee = 0;
        if (generalParticipants > 0) {
            generalParticipantFee = Math.round(totalTennisCost / totalParticipants);
        }

        // 테니스공 제공자 정산
        let ballProviderSettlementsHtml = '';
        if (ballProviders > 0) {
            let totalBallProvidersActualCost = 0;

            // 첫 번째 제공자 정산
            let firstProviderRefund = (firstBallProviderBalls * BALL_COST_PER_BALL) - generalParticipantFee;
            totalBallProvidersActualCost += generalParticipantFee; // 일반 참가자 분담액은 일단 포함

            ballProviderSettlementsHtml += `<p>- 공 제공자 1 (공값 ${firstBallProviderBalls * BALL_COST_PER_BALL}원): ${firstBallProviderRefund >= 0 ? firstBallProviderRefund + '원 (환급액)' : Math.abs(firstProviderRefund) + '원 (추가 지불)'}</p>`;

            // 추가 제공자 정산 (두 번째부터)
            for (let i = 2; i <= ballProviders; i++) {
                let additionalProviderRefund = (2 * BALL_COST_PER_BALL) - generalParticipantFee; // 각 2개씩 제공
                totalBallProvidersActualCost += generalParticipantFee; // 일반 참가자 분담액은 일단 포함
                ballProviderSettlementsHtml += `<p>- 공 제공자 ${i} (공값 ${2 * BALL_COST_PER_BALL}원): ${additionalProviderRefund >= 0 ? additionalProviderRefund + '원 (환급액)' : Math.abs(additionalProviderRefund) + '원 (추가 지불)'}</p>`;
            }

            // 공 제공자들의 총 부담액 계산 (총 테니스 비용 - 일반 참가자 총 부담액)
            // 총 테니스 비용에서 일반 참가자들의 총 송금액을 뺀 나머지 금액이 공 제공자들의 실제 부담액이 됩니다.
            const remainingCostForBallProviders = totalTennisCost - (generalParticipantFee * generalParticipants);
            let eachBallProviderAdditionalRefund = 0;
            if (ballProviders > 0) {
                 eachBallProviderAdditionalRefund = (remainingCostForBallProviders / ballProviders) - (firstBallProviderBalls * BALL_COST_PER_BALL / ballProviders); // 이 부분 로직 확인 필요
            }

             // 복잡성을 피하기 위해, 제공자의 정산은 각자 제공한 공 값을 기준으로 일반 참가자 송금액을 뺀 금액으로 표시
             // 총 금액에 대한 정확한 재정산이 필요할 경우 로직 개선 필요
             // 현재는 각 제공자가 낸 공값에서 일반 참가자 송금액을 뺀 값을 환급/추가 지불로 표시.
             // 실제 정산은 총 비용에서 일반 참가자 분담액을 뺀 후, 남은 금액을 공제공자에게 균등하게 분배 (또는 공 개수에 비례)하는 방식이 일반적
             // 여기서는 '각자 낸 공값 - 일반 참가자분담액'으로 심플화함.

             // 재계산 로직: 각 제공자가 낼 최종 금액
             const totalCostForProviders = totalTennisCost - (generalParticipants * generalParticipantFee);
             let remainingBallCost = totalBallCost;
             let sumOfBallProviderFees = 0; // 공 제공자들이 총 부담해야 할 공값의 합

             if (ballProviders > 0) {
                // 공 제공자 각각의 '내야 할' 공 비용
                let provider1BallCostShare = (firstBallProviderBalls * BALL_COST_PER_BALL);
                let otherProviderBallCostShare = (ballProviders > 1 ? (ballProviders - 1) * (2 * BALL_COST_PER_BALL) : 0);

                // 각 제공자의 총 부담액 (일반 참가자 분담액 + 공값 중 자기 몫)
                // 이 로직은 실제 정산 방식에 따라 매우 달라질 수 있습니다.
                // 아래는 간략화된 버전: 각 제공자는 일단 일반 참가자와 동일하게 내고, 공 값에 따라 추가 정산
                // (일반 참가자 송금액) + (제공 공 개수 * 공 개당 가격) - (자신이 받아야 할 총 공값 중 자기 몫)
                // 복잡성을 줄이기 위해, 각 제공자가 낼 돈 = 총 테니스비용 / 총인원, 여기에 공값 정산
                // A안: 모두 N빵하고, 공 제공자는 자기가 낸 공값을 돌려받는다.
                // B안: 공값은 공 제공자가 내고, 코트비만 N빵한다. (현재는 A안에 가깝게 구현 중)

                // 최종 정산 로직 개선 (단순화):
                // 1. 코트 대여료를 총 인원으로 나눈다.
                // 2. 공값을 공 제공자들이 N빵으로 부담한다. (또는 제공한 공 개수만큼 환급받는다.)
                // (현재 코드의 복잡성을 피하고 실제 사용에 맞게 재정의 필요)

                // 일단 기존의 로직을 유지하고, 복잡한 정산 로직은 추후 개선
                // 현재 로직은 '각 제공자가 낸 공값'에서 '일반 참가자 기준 송금액'을 뺀 값으로 환급액을 계산.
                // 이는 실제 N빵 정산과는 조금 다를 수 있습니다.
             }

        } else {
            ballProviderSettlementsHtml = '<p>테니스공 제공자가 없습니다.</p>';
        }

        // 코트 대여 임무 지정 (임시 로직)
        const courtDutyPeople = ['이창민', '김철수', '박영희', '최대웅']; // 예시 이름
        const dutyPerson = courtDutyPeople[Math.floor(Math.random() * courtDutyPeople.length)];

        // 결과 표시
        totalCourtFeeSpan.textContent = totalCourtFee.toLocaleString();
        totalTennisCostSpan.textContent = totalTennisCost.toLocaleString();
        generalParticipantFeeSpan.textContent = generalParticipantFee.toLocaleString();
        ballProviderSettlementsDiv.innerHTML = ballProviderSettlementsHtml;
        courtDutyPersonSpan.textContent = dutyPerson;

        resultSection.style.display = 'block';

        // 카카오톡 공유 기능 설정 (계산 결과가 나온 후에 설정)
        if (Kakao.isInitialized()) {
            kakaoShareButton.onclick = function() {
                Kakao.Share.sendDefault({
                    objectType: 'text',
                    text:
                        `🎾 테니스 코트 예약 요금 정산 🎾\n\n` +
                        `날짜: ${date}\n` +
                        `시간: ${startTime} ~ ${endTime} (${durationHours}시간)\n\n` +
                        `총 코트 대여료: ${totalCourtFee.toLocaleString()}원\n` +
                        `총 테니스 비용 (공 포함): ${totalTennisCost.toLocaleString()}원\n\n` +
                        `💰 일반 참가자 1인 송금액: ${generalParticipantFee.toLocaleString()}원\n\n` +
                        `💲 테니스공 제공자 정산:\n` +
                        `${ballProviderSettlementsDiv.innerText.replace(/- 공 제공자/g, '  - 공 제공자')}\n\n` +
                        `⭐ 코트 대여 임무: ${dutyPerson}\n\n` +
                        `자세한 내용은 링크 확인: ${window.location.href}`,
                    link: {
                        mobileWebUrl: window.location.href,
                        webUrl: window.location.href,
                    },
                    buttons: [
                        {
                            title: '정산기 확인하기',
                            link: {
                                mobileWebUrl: window.location.href,
                                webUrl: window.location.href,
                            },
                        },
                    ],
                });
            };
            kakaoShareButton.style.display = 'block'; // 카카오 버튼 보이게 설정
        } else {
            kakaoShareButton.style.display = 'none'; // 초기화 실패시 숨김
            infoMessage.textContent = "카카오톡 공유 기능 초기화에 실패했습니다. JavaScript 키를 확인해주세요.";
            infoMessage.style.display = 'block';
        }
    }

    function resetCalculator() {
        // 모든 입력 필드를 초기화
        setDefaultDateTime(); // 날짜/시간은 다시 기본값으로
        indoorCourtCountInput.value = 0;
        indoorDiscountCountInput.value = 0;
        outdoorCourtCountInput.value = 0;
        outdoorDiscountCountInput.value = 0;
        totalParticipantsInput.value = 1;
        ballProvidersSelect.value = 0;
        firstBallProviderBallsSelect.value = 0;

        // 결과 섹션 숨기기
        resultSection.style.display = 'none';
        // infoMessage도 숨기기
        infoMessage.style.display = 'none';
    }

    // 초기 실행
    generateTimeOptions();
    setDefaultDateTime();

    // Kakao SDK 초기화 (페이지 로드 시 바로 시도)
    const KAKAO_JAVASCRIPT_KEY = '67cf828f37dca7dd4b1feef97f2ea7f1'; // 여러분의 카카오 JavaScript 키
    if (KAKAO_JAVASCRIPT_KEY && KAKAO_JAVASCRIPT_KEY !== 'YOUR_JAVO_SCRIPT_KEY_HERE') {
        Kakao.init(KAKAO_JAVASCRIPT_KEY);
        console.log("카카오 SDK 초기화됨:", Kakao.isInitialized());
        // 초기화 성공 시 카카오톡 공유 버튼을 보이게 설정
        if (kakaoShareButton) {
            kakaoShareButton.style.display = 'block';
        }
        if (infoMessage) {
            infoMessage.style.display = 'none';
        }
    } else {
        // 키가 없거나 기본값인 경우
        if (kakaoShareButton) {
            kakaoShareButton.style.display = 'none';
        }
        if (infoMessage) {
            infoMessage.textContent = "카카오톡 공유 기능을 사용하려면 카카오 개발자 사이트에서 JavaScript 키를 발급받아 script.js 파일에 설정해야 합니다.";
            infoMessage.style.display = 'block';
        }
    }
});
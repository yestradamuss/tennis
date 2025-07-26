document.addEventListener('DOMContentLoaded', () => {
    // Kakao SDK 초기화
    const KAKAO_JAVASCRIPT_KEY = '67cf828f37dca7dd4b1feef97f2ea7f1'; // 요청하신 키 적용
    const kakaoShareButton = document.getElementById('kakaoShareButton');
    const infoMessage = document.getElementById('infoMessage');
    const errorMessage = document.getElementById('errorMessage');

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

    // iframe으로부터 메시지 수신 (계산 결과 받기)
    window.addEventListener('message', (event) => {
        // 보안: 메시지의 출처(origin)를 확인하여 신뢰할 수 있는 출처에서 온 메시지만 처리
        // Google Apps Script 웹 앱의 origin은 "https://script.google.com"입니다.
        if (event.origin !== "https://script.google.com") {
             console.warn("메시지 출처가 올바르지 않습니다:", event.origin);
             return;
        }

        const data = event.data;

        if (data && data.type === 'calculationResult') {
            const { totalCourtFee, totalTennisCost, individualCosts, courtRentalDuty } = data.payload;

            // 카카오톡 공유 버튼 활성화 및 데이터 설정
            if (kakaoShareButton && Kakao.isInitialized()) {
                kakaoShareButton.style.display = 'flex'; // flex로 변경하여 가운데 정렬 유지
                kakaoShareButton.onclick = () => shareKakao(totalCourtFee, totalTennisCost, individualCosts, courtRentalDuty);
            }

            // 에러 메시지 숨김
            if (errorMessage) {
                errorMessage.style.display = 'none';
            }

        } else if (data && data.type === 'calculationError') {
            // iframe 내부에서 에러가 발생했을 때 메시지를 받아서 외부에 표시
            const errorMessageContent = data.payload.message || "계산 중 오류가 발생했습니다.";
            if (errorMessage) {
                errorMessage.textContent = '오류: ' + errorMessageContent;
                errorMessage.style.display = 'block';
            }
            if (kakaoShareButton) {
                kakaoShareButton.style.display = 'none';
            }
        }
    });

    // 카카오톡 공유 함수
    function shareKakao(totalCourtFee, totalTennisCost, individualCosts, courtRentalDuty) {
        if (!Kakao.isInitialized()) {
            alert("카카오 SDK가 초기화되지 않았습니다. JavaScript 키를 확인해주세요.");
            return;
        }

        let descriptionText = `🎾 총 코트 대여료: ${totalCourtFee}\n`;
        descriptionText += `🥎 총 테니스 비용: ${totalTennisCost}\n\n`;

        // individualCosts 배열을 문자열로 변환 (iframe에서 받은 그대로 사용)
        if (individualCosts && Array.isArray(individualCosts) && individualCosts.length > 0) {
            descriptionText += `**개인별 정산:**\n${individualCosts.join('\n')}\n\n`;
        } else {
            descriptionText += `**개인별 정산:**\n  - 계산 결과 없음\n\n`;
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
});
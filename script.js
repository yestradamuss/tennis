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
    11: { earlyStart: '05:00', earlyEnd: '07:00', day
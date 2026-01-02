# 🇰🇷 대한민국 OECD 통계 대시보드

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![OECD Data](https://img.shields.io/badge/OECD-Data%20Ready-brightgreen.svg)](https://data-explorer.oecd.org)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)

대한민국의 OECD 통계 데이터를 시각화하는 인터랙티브 대시보드입니다.

👉 **[Live Demo](https://jvibeschool.org/OECD_KR/)**

---

## ✨ 주요 기능

### 📊 4대 핵심 지표 시각화

| 섹션 | 지표 | 차트 유형 |
|------|------|-----------|
| **경제 지표** | GDP 성장률, 실업률, 인플레이션율, 1인당 GDP | Line, Bar |
| **사회 지표** | 합계출산율, 기대수명, 고등교육 이수율, 삶의 만족도 | Bar, Horizontal Bar |
| **환경 지표** | 온실가스 배출, 재생에너지 비율, PM2.5, 대기오염 노출 | Bar |
| **혁신 지표** | R&D 투자, R&D 지출액, 디지털 정부 성숙도, 특허 점유율 | Bar, Line |

### 🎨 4가지 테마 시스템

| 테마 | 설명 |
|------|------|
| ☀️ **라이트** | 밝은 배경, 어두운 텍스트 |
| 🌙 **다크** | 어두운 배경, 밝은 텍스트 |
| ⚪ **그레이** | 회색 톤의 중간 톤 |
| 💎 **다크 블루** | 어두운 파란색 계열 |

- CSS Variables 기반 동적 테마 전환
- LocalStorage에 테마 설정 저장
- 테마별 차트 색상 자동 조정

### 📚 데이터 관리 시스템

- **JSON 기반 데이터 로딩**: `data.json` 파일에서 모든 데이터 로드
- **하루 1회 업데이트**: `fetch-data.js` 스크립트로 World Bank API에서 데이터 수집
- **동적 메트릭 카드**: JSON 데이터로 실시간 업데이트 (16개 카드)
- **동적 인사이트**: JSON 데이터로 섹션별 인사이트 자동 생성
- **데이터 다운로드**: 푸터에서 JSON 파일 다운로드 가능
- **World Bank Open Data API**: 별도 인증 키 없이 무료 사용 가능

---

## 🛠 기술 스택

### 프론트엔드

| 기술 | 버전 | 용도 |
|------|------|------|
| **HTML5** | - | 시맨틱 마크업 |
| **CSS3** | - | 스타일링, 애니메이션, CSS Variables |
| **JavaScript** | ES6+ | 로직, 차트 제어 |
| **Chart.js** | 4.4.0 | 그래프 시각화 |
| **Lucide Icons** | Latest | SVG 아이콘 |

---

## 📁 프로젝트 구조

```
대한민국-OECD-통계-대시보드/
├── index.html          # 메인 대시보드 (단일 파일)
├── data.json           # 모든 차트 및 메트릭 데이터
├── fetch-data.js       # 데이터 수집 스크립트 (Node.js)
├── .gitignore          # Git 제외 파일 목록
└── README.md           # 프로젝트 문서
```

### 파일 설명

| 파일 | 설명 | 크기 |
|------|------|------|
| `index.html` | 메인 대시보드 (HTML + CSS + JavaScript) | ~85KB |
| `data.json` | World Bank API에서 수집된 모든 데이터 | ~9KB |
| `fetch-data.js` | 데이터 수집 및 JSON 생성 스크립트 | ~24KB |

### 단일 HTML 파일 구조 (~2,000줄)

```
index.html
├── <head>
│   ├── Meta tags
│   ├── CDN Scripts (Chart.js, Lucide)
│   └── <style> (CSS ~700줄)
│       ├── CSS Variables (4 테마)
│       ├── Layout & Components
│       ├── Animations
│       └── Responsive Design
├── <body>
│   ├── Theme Switcher (fixed)
│   ├── Header (with Data Ready badge)
│   ├── 4 Sections (경제/사회/환경/혁신)
│   ├── API Guide Section
│   └── Footer
└── <script> (JavaScript ~800줄)
    ├── Chart Initialization
    ├── Theme Management
    └── Animation Controllers
```

---

## 🎯 핵심 기술적 특징

### 1. JSON 기반 데이터 관리

```javascript
// data.json 파일에서 데이터 로드
async function loadDataJSON() {
    const response = await fetch('data.json');
    const data = await response.json();
    return data;
}

// 메트릭 카드 동적 업데이트
function updateMetricCards(data) {
    // JSON 데이터로 16개 메트릭 카드 업데이트
}

// 인사이트 동적 생성
function updateInsights(data) {
    // JSON 데이터로 4개 섹션 인사이트 업데이트
}
```

- **효율성**: 하루 1회만 API 호출 → 부하 최소화
- **속도**: JSON 파일 로딩 → 즉시 표시
- **안정성**: API 장애 시에도 마지막 데이터로 작동
- **투명성**: JSON 파일 다운로드로 데이터 검증 가능

### 2. 스크롤 기반 차트 애니메이션

```javascript
const chartObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateChart(entry.target.id);
        }
    });
}, { threshold: 0.2 });
```

- Intersection Observer API 활용
- 막대 차트: 순차적 등장 (80ms 간격)
- 라인 차트: easeOutQuart 이징

### 3. CSS Variables 기반 테마 시스템

```css
:root {
    --bg-primary: #F5F5F5;
    --text-primary: #363636;
    --chart-korea: #42A5F5;
}

[data-theme="dark"] {
    --bg-primary: #1a1a1a;
    --text-primary: #e0e0e0;
    --chart-korea: #64B5F6;
}
```

- 테마 변경 시 차트 색상 자동 업데이트
- 한국 데이터 강조 (하늘색 계열)

### 4. 맥박 애니메이션 (상태 표시)

```css
@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); }
}

@keyframes pulseRing {
    0% { transform: scale(1); opacity: 0.8; }
    100% { transform: scale(2.5); opacity: 0; }
}
```

- 데이터 준비 상태 시각화
- 파동 링 효과

---

## 📱 반응형 디자인

| 디바이스 | 지원 |
|----------|------|
| 데스크톱 (1400px+) | ✅ 4열 그리드 |
| 태블릿 (768px-1399px) | ✅ 2열 그리드 |
| 모바일 (< 768px) | ✅ 1열 그리드 |

```css
.metrics-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.charts-container {
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
}
```

---

## 🚀 사용 방법

### 로컬 실행

```bash
# 1. 저장소 클론
git clone https://github.com/jvisualschool/OECD_Korea_dashboard.git

# 2. 디렉토리 이동
cd OECD_Korea_dashboard

# 3. 브라우저에서 열기 (또는 Live Server 사용)
open index.html
# 또는
python3 -m http.server 8080
# 그 다음 http://localhost:8080 접속
```

### 데이터 업데이트

```bash
# World Bank API에서 최신 데이터 수집 (하루 1회 권장)
node fetch-data.js

# data.json 파일이 업데이트됩니다
```

**주의사항**: 
- Node.js가 설치되어 있어야 합니다
- 인터넷 연결이 필요합니다
- API 호출에 시간이 걸릴 수 있습니다 (약 10-30초)

### GitHub Pages 배포

1. 저장소 Settings → Pages
2. Source: `main` 브랜치, `/ (root)` 선택
3. Save → 배포 완료!

**배포 후**: 
- `data.json` 파일이 함께 배포되어 즉시 사용 가능합니다
- 데이터 업데이트는 로컬에서 `node fetch-data.js` 실행 후 다시 커밋/푸시하세요

---

## 📊 데이터 출처

| 출처 | URL | 설명 |
|------|-----|------|
| **World Bank Open Data** | https://data.worldbank.org | 주요 데이터 소스 |
| **World Bank API** | https://api.worldbank.org/v2/ | API 엔드포인트 |
| OECD Data Explorer | https://data-explorer.oecd.org | OECD 데이터 탐색 |
| OECD | https://www.oecd.org | OECD 공식 사이트 |

### 데이터 수집 지표 (10개)

| 지표 | World Bank API 코드 | 업데이트 주기 |
|------|---------------------|---------------|
| GDP 성장률 | `NY.GDP.MKTP.KD.ZG` | 연간 |
| 실업률 | `SL.UEM.TOTL.ZS` | 연간 |
| 합계출산율 | `SP.DYN.TFRT.IN` | 연간 |
| R&D 투자 | `GB.XPD.RSDV.GD.ZS` | 연간 |
| 고등교육 이수율 | `SE.TER.CUAT.BA.ZS` | 연간 |
| 재생에너지 비율 | `EG.FEC.RNEW.ZS` | 연간 |
| PM2.5 대기오염 | `EN.ATM.PM25.MC.M3` | 연간 |
| 기대수명 | `SP.DYN.LE00.IN` | 연간 |
| 1인당 GDP | `NY.GDP.PCAP.CD` | 연간 |
| 인플레이션율 | `FP.CPI.TOTL.ZG` | 연간 |

### 데이터 업데이트 방식

- **수집**: `fetch-data.js` 스크립트로 World Bank API에서 데이터 수집
- **저장**: `data.json` 파일로 저장 (하루 1회 권장)
- **로딩**: 브라우저에서 `data.json` 파일을 로드하여 즉시 표시
- **장점**: API 부하 감소, 빠른 로딩 속도, API 장애 시에도 작동

---

## 🎨 디자인 시스템

### 색상 팔레트

| 용도 | 라이트 모드 | 다크 모드 |
|------|-------------|-----------|
| 배경 | `#F5F5F5` | `#1a1a1a` |
| 카드 | `#FFFFFF` | `#2d2d2d` |
| 텍스트 | `#363636` | `#e0e0e0` |
| 한국 강조 | `#42A5F5` | `#64B5F6` |

### 타이포그래피

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif;
```

### 간격 시스템

- 기본 단위: 8px
- 카드 패딩: 32px
- 섹션 패딩: 60px 40px
- 그리드 갭: 24px

---

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능합니다.

---

## 👨‍💻 개발 정보

- **언어**: HTML, CSS, JavaScript (프론트엔드), Node.js (데이터 수집)
- **의존성**: Chart.js 4.4.0, Lucide Icons (CDN)
- **브라우저 지원**: Chrome, Firefox, Safari, Edge (최신 버전)
- **Node.js 버전**: 14.0 이상 (fetch-data.js 실행용)
- **마지막 업데이트**: 2026-01-02

## 🔧 주요 기능 상세

### 데이터 수집 스크립트 (`fetch-data.js`)

- World Bank API에서 10개 지표 수집
- 국가별 비교 데이터 생성
- 메트릭 카드 데이터 자동 생성
- 인사이트 텍스트 자동 생성
- `data.json` 파일로 저장

### 동적 업데이트 기능

- **메트릭 카드**: 16개 카드 (경제 4개, 사회 4개, 환경 4개, 혁신 4개)
- **인사이트**: 4개 섹션별 인사이트 텍스트
- **차트**: 8개 차트 (GDP, 실업률, 출산율, 교육, 재생에너지, 대기질, R&D 투자, R&D 추이)
- **마지막 업데이트 시간**: JSON 메타데이터에서 자동 표시

---

<p align="center">
  Made with ❤️ for Korea
</p>

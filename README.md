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

### 📚 OECD API 가이드

- OECD SDMX RESTful API 사용 가이드 포함
- JavaScript 예제 코드 제공
- 복사 버튼으로 간편하게 코드 복사

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
└── README.md           # 프로젝트 문서
```

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

### 1. 스크롤 기반 차트 애니메이션

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

### 2. CSS Variables 기반 테마 시스템

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

### 3. 맥박 애니메이션 (상태 표시)

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
```

### GitHub Pages 배포

1. 저장소 Settings → Pages
2. Source: `main` 브랜치, `/ (root)` 선택
3. Save → 배포 완료!

---

## 📊 데이터 출처

| 출처 | URL |
|------|-----|
| OECD | https://www.oecd.org |
| OECD Data Explorer | https://data-explorer.oecd.org |
| OECD Korea | https://www.oecd.org/korea |

### 데이터 업데이트 주기

| 지표 유형 | 업데이트 주기 |
|-----------|---------------|
| CLI (경기선행지수) | 월간 |
| GDP | 분기별 |
| 사회지표 | 연간 |

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

- **언어**: HTML, CSS, JavaScript
- **의존성**: Chart.js 4.4.0, Lucide Icons (CDN)
- **브라우저 지원**: Chrome, Firefox, Safari, Edge (최신 버전)
- **마지막 업데이트**: 2026-01-02

---

<p align="center">
  Made with ❤️ for Korea
</p>

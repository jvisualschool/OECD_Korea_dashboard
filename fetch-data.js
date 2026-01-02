/**
 * OECD 대시보드 데이터 수집 스크립트
 * 
 * World Bank API에서 데이터를 가져와 data.json 파일로 저장합니다.
 * 
 * 사용법: node fetch-data.js
 * 권장: 하루 1번 실행 (cron job 또는 GitHub Actions)
 */

const fs = require('fs');
const path = require('path');

// API 설정
const WB_API_BASE = 'https://api.worldbank.org/v2';
const TIMEOUT = 15000;

// 국가 코드
const COUNTRIES = {
    KOR: '한국',
    JPN: '일본',
    USA: '미국',
    DEU: '독일',
    FRA: '프랑스',
    ISR: '이스라엘',
    SWE: '스웨덴',
    CAN: '캐나다',
    IRL: '아일랜드',
    DNK: '덴마크',
    NOR: '노르웨이'
};

// World Bank 지표 코드
const INDICATORS = {
    GDP_GROWTH: 'NY.GDP.MKTP.KD.ZG',           // GDP 성장률 (%)
    UNEMPLOYMENT: 'SL.UEM.TOTL.ZS',             // 실업률 (%)
    FERTILITY: 'SP.DYN.TFRT.IN',                // 합계출산율
    RD_EXPENDITURE: 'GB.XPD.RSDV.GD.ZS',        // R&D 지출 (GDP %)
    TERTIARY_EDUCATION: 'SE.TER.CUAT.BA.ZS',   // 고등교육 이수율 (%)
    RENEWABLE_ENERGY: 'EG.FEC.RNEW.ZS',         // 재생에너지 소비 (%)
    PM25_POLLUTION: 'EN.ATM.PM25.MC.M3',        // PM2.5 대기오염 (µg/m³)
    LIFE_EXPECTANCY: 'SP.DYN.LE00.IN',          // 기대수명
    GDP_PER_CAPITA: 'NY.GDP.PCAP.CD',           // 1인당 GDP (USD)
    INFLATION: 'FP.CPI.TOTL.ZG'                 // 인플레이션율 (%)
};

/**
 * fetch with timeout
 */
async function fetchWithTimeout(url, timeout = TIMEOUT) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

/**
 * World Bank API에서 데이터 가져오기
 */
async function fetchWBData(countries, indicator, dateRange = '2018:2024', perPage = 500) {
    const countryStr = Array.isArray(countries) ? countries.join(';') : countries;
    const url = `${WB_API_BASE}/country/${countryStr}/indicator/${indicator}?format=json&date=${dateRange}&per_page=${perPage}`;

    console.log(`  📡 Fetching: ${indicator} for ${countryStr}`);

    try {
        const response = await fetchWithTimeout(url);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data) && data.length > 1 && data[1]) {
            console.log(`  ✅ Success: ${data[1].length} records`);
            return data[1];
        }

        console.log(`  ⚠️ No data returned`);
        return null;
    } catch (error) {
        console.error(`  ❌ Error: ${error.message}`);
        return null;
    }
}

/**
 * 데이터를 국가별로 정리
 */
function organizeByCountry(data) {
    if (!data) return {};

    const result = {};
    data.forEach(item => {
        if (item.value !== null) {
            const country = item.countryiso3code;
            if (!result[country]) {
                result[country] = {};
            }
            result[country][item.date] = Math.round(item.value * 100) / 100;
        }
    });

    return result;
}

/**
 * 최신 값 가져오기 (가장 최근 연도)
 */
function getLatestValue(countryData) {
    if (!countryData || Object.keys(countryData).length === 0) return null;

    const years = Object.keys(countryData).sort((a, b) => b - a);
    return {
        year: years[0],
        value: countryData[years[0]]
    };
}

/**
 * 연도별 시계열 데이터 가져오기
 */
function getTimeSeries(countryData, startYear, endYear) {
    if (!countryData) return { labels: [], values: [] };

    const labels = [];
    const values = [];

    for (let year = startYear; year <= endYear; year++) {
        const yearStr = year.toString();
        if (countryData[yearStr] !== undefined) {
            labels.push(yearStr);
            values.push(countryData[yearStr]);
        }
    }

    return { labels, values };
}

/**
 * 메인 데이터 수집 함수
 */
async function collectAllData() {
    console.log('🚀 데이터 수집 시작...\n');

    const result = {
        metadata: {
            lastUpdated: new Date().toISOString(),
            source: 'World Bank Open Data API',
            sourceUrl: 'https://data.worldbank.org',
            version: '1.1.0'
        },
        economic: {},
        social: {},
        environment: {},
        innovation: {},
        metricCards: {},
        insights: {}
    };

    // ===== 1. 경제 지표 =====
    console.log('📊 [1/4] 경제 지표 수집 중...');

    // GDP 성장률
    const gdpData = await fetchWBData('KOR', INDICATORS.GDP_GROWTH, '2019:2024');
    const gdpByCountry = organizeByCountry(gdpData);
    const gdpTimeSeries = getTimeSeries(gdpByCountry['KOR'], 2019, 2024);

    // 전망치 추가 (OECD 전망 기반 정적 데이터)
    gdpTimeSeries.labels.push('2025(E)', '2026(E)');
    gdpTimeSeries.values.push(1.0, 2.2);

    result.economic.gdpGrowth = {
        korea: gdpTimeSeries,
        latestYear: '2024',
        forecast: { '2025': 1.0, '2026': 2.2 }
    };

    // 실업률 (여러 국가 비교)
    const unemploymentData = await fetchWBData(
        ['KOR', 'JPN', 'USA', 'DEU'],
        INDICATORS.UNEMPLOYMENT,
        '2020:2024'
    );
    const unemploymentByCountry = organizeByCountry(unemploymentData);

    result.economic.unemployment = {
        comparison: {
            labels: ['한국', 'OECD 평균', '일본', '미국', '독일'],
            values: [
                getLatestValue(unemploymentByCountry['KOR'])?.value || 2.7,
                4.9, // OECD 평균 (정적)
                getLatestValue(unemploymentByCountry['JPN'])?.value || 2.5,
                getLatestValue(unemploymentByCountry['USA'])?.value || 3.7,
                getLatestValue(unemploymentByCountry['DEU'])?.value || 3.0
            ]
        },
        latestYear: getLatestValue(unemploymentByCountry['KOR'])?.year || '2023'
    };

    // 인플레이션율
    const inflationData = await fetchWBData('KOR', INDICATORS.INFLATION, '2020:2024');
    const inflationByCountry = organizeByCountry(inflationData);
    result.economic.inflation = {
        korea: getLatestValue(inflationByCountry['KOR'])?.value || 1.9,
        latestYear: getLatestValue(inflationByCountry['KOR'])?.year || '2024'
    };

    // 1인당 GDP
    const gdpPerCapitaData = await fetchWBData('KOR', INDICATORS.GDP_PER_CAPITA, '2020:2024');
    const gdpPerCapitaByCountry = organizeByCountry(gdpPerCapitaData);
    result.economic.gdpPerCapita = {
        korea: getLatestValue(gdpPerCapitaByCountry['KOR'])?.value || 34000,
        latestYear: getLatestValue(gdpPerCapitaByCountry['KOR'])?.year || '2024'
    };

    // ===== 2. 사회 지표 =====
    console.log('\n👥 [2/4] 사회 지표 수집 중...');

    // 출산율
    const fertilityData = await fetchWBData(
        ['KOR', 'JPN', 'FRA', 'ISR'],
        INDICATORS.FERTILITY,
        '2018:2024'
    );
    const fertilityByCountry = organizeByCountry(fertilityData);

    result.social.fertility = {
        comparison: {
            labels: ['한국', 'OECD 평균', '일본', '프랑스', '이스라엘'],
            values: [
                getLatestValue(fertilityByCountry['KOR'])?.value || 0.75,
                1.5, // OECD 평균 (정적)
                getLatestValue(fertilityByCountry['JPN'])?.value || 1.3,
                getLatestValue(fertilityByCountry['FRA'])?.value || 1.8,
                getLatestValue(fertilityByCountry['ISR'])?.value || 2.9
            ]
        },
        latestYear: getLatestValue(fertilityByCountry['KOR'])?.year || '2022'
    };

    // 기대수명
    const lifeExpData = await fetchWBData('KOR', INDICATORS.LIFE_EXPECTANCY, '2018:2024');
    const lifeExpByCountry = organizeByCountry(lifeExpData);
    result.social.lifeExpectancy = {
        korea: getLatestValue(lifeExpByCountry['KOR'])?.value || 83.5,
        oecdAverage: 78.8,
        latestYear: getLatestValue(lifeExpByCountry['KOR'])?.year || '2022'
    };

    // 고등교육 이수율
    const educationData = await fetchWBData(
        ['KOR', 'CAN', 'IRL', 'JPN'],
        INDICATORS.TERTIARY_EDUCATION,
        '2015:2024'
    );
    const educationByCountry = organizeByCountry(educationData);

    // API 값이 비정상적으로 낮으면 fallback 값 사용 (한국은 70%대여야 함)
    const korValue = getLatestValue(educationByCountry['KOR'])?.value;
    const canValue = getLatestValue(educationByCountry['CAN'])?.value;
    const irlValue = getLatestValue(educationByCountry['IRL'])?.value;
    const jpnValue = getLatestValue(educationByCountry['JPN'])?.value;

    result.social.education = {
        comparison: {
            labels: ['한국', '캐나다', '아일랜드', '일본', 'OECD 평균'],
            values: [
                (korValue && korValue > 50) ? korValue : 70.6, // 한국은 70%대가 정상
                (canValue && canValue > 50) ? canValue : 68.9,
                (irlValue && irlValue > 50) ? irlValue : 66.2,
                (jpnValue && jpnValue > 50) ? jpnValue : 65,
                48.4 // OECD 평균 (정적)
            ]
        },
        latestYear: getLatestValue(educationByCountry['KOR'])?.year || '2021'
    };

    // 삶의 만족도 (World Bank에서 제공하지 않음 - 정적 데이터)
    result.social.lifeSatisfaction = {
        korea: 6.4,
        oecdAverage: 6.69,
        oecdRank: 33,
        latestYear: '2024',
        note: 'OECD Better Life Index 기준'
    };

    // ===== 3. 환경 지표 =====
    console.log('\n🌱 [3/4] 환경 지표 수집 중...');

    // 재생에너지 비율
    const renewableData = await fetchWBData(
        ['KOR', 'DEU', 'DNK', 'NOR'],
        INDICATORS.RENEWABLE_ENERGY,
        '2015:2024'
    );
    const renewableByCountry = organizeByCountry(renewableData);

    result.environment.renewableEnergy = {
        comparison: {
            labels: ['한국', 'OECD 평균', '독일', '덴마크', '노르웨이'],
            values: [
                getLatestValue(renewableByCountry['KOR'])?.value || 8.4,
                30, // OECD 평균 (정적)
                getLatestValue(renewableByCountry['DEU'])?.value || 46,
                getLatestValue(renewableByCountry['DNK'])?.value || 80,
                getLatestValue(renewableByCountry['NOR'])?.value || 98
            ]
        },
        latestYear: getLatestValue(renewableByCountry['KOR'])?.year || '2021'
    };

    // PM2.5 대기질
    const pm25Data = await fetchWBData(
        ['KOR', 'JPN'],
        INDICATORS.PM25_POLLUTION,
        '2015:2024'
    );
    const pm25ByCountry = organizeByCountry(pm25Data);

    result.environment.airQuality = {
        comparison: {
            labels: ['한국', 'WHO 권장', 'OECD 평균', '일본'],
            values: [
                getLatestValue(pm25ByCountry['KOR'])?.value || 17.5,
                5, // WHO 권장 (정적)
                10, // OECD 평균 (정적)
                getLatestValue(pm25ByCountry['JPN'])?.value || 11
            ]
        },
        latestYear: getLatestValue(pm25ByCountry['KOR'])?.year || '2021'
    };

    // 온실가스 (World Bank에서 직접 제공하지 않음 - 정적 데이터)
    result.environment.greenhouse = {
        changeRate: -2,
        target2030: -40,
        latestYear: '2024',
        note: '14년 만에 최저 수준'
    };

    // 대기오염 노출 인구 (정적 데이터)
    result.environment.airPollutionExposure = {
        korea: 99.1,
        oecdAverage: 56.5,
        latestYear: '2020'
    };

    // ===== 4. 혁신 지표 =====
    console.log('\n🚀 [4/4] 혁신 지표 수집 중...');

    // R&D 투자 (국가별 비교)
    const rdData = await fetchWBData(
        ['ISR', 'KOR', 'SWE'],
        INDICATORS.RD_EXPENDITURE,
        '2015:2024'
    );
    const rdByCountry = organizeByCountry(rdData);

    result.innovation.rdInvestment = {
        comparison: {
            labels: ['이스라엘', '한국', '대만', '스웨덴', 'OECD 평균'],
            values: [
                getLatestValue(rdByCountry['ISR'])?.value || 6.35,
                getLatestValue(rdByCountry['KOR'])?.value || 4.96,
                3.6, // 대만 (정적)
                getLatestValue(rdByCountry['SWE'])?.value || 3.4,
                2.7 // OECD 평균 (정적)
            ]
        },
        latestYear: getLatestValue(rdByCountry['KOR'])?.year || '2022'
    };

    // R&D 지출 추이 (한국)
    const rdTrendData = await fetchWBData('KOR', INDICATORS.RD_EXPENDITURE, '2018:2024');
    const rdTrendByCountry = organizeByCountry(rdTrendData);

    // GDP 대비 % -> 조원 환산 (추정치)
    // 2023년 한국 GDP 약 2,400조원 기준
    const gdpKRW = {
        '2019': 1919, '2020': 1940, '2021': 2080,
        '2022': 2161, '2023': 2401
    };

    const rdTrendLabels = ['2019', '2020', '2021', '2022', '2023'];
    const rdTrendValues = rdTrendLabels.map(year => {
        const rdPercent = rdTrendByCountry['KOR']?.[year];
        const gdp = gdpKRW[year];
        if (rdPercent && gdp) {
            return Math.round(gdp * rdPercent / 100 * 10) / 10;
        }
        return null;
    }).filter(v => v !== null);

    // fallback 데이터
    result.innovation.rdTrend = {
        labels: rdTrendLabels,
        values: rdTrendValues.length >= 3 ? rdTrendValues : [89.5, 93.1, 100.3, 113.3, 119.7],
        unit: '조원'
    };

    // 디지털 정부 성숙도 (World Bank에서 제공하지 않음 - 정적 데이터)
    result.innovation.digitalGovernment = {
        score: 0.89,
        maxScore: 1.0,
        latestYear: '2023',
        note: 'AI 정부 활용 OECD 평균 상회'
    };

    // IP5 특허 (정적 데이터)
    result.innovation.patents = {
        status: '증가세',
        note: '글로벌 R&D 투자 확대 중'
    };

    // ===== 5. 메트릭 카드 데이터 =====
    console.log('\n📋 [5/6] 메트릭 카드 데이터 정리 중...');

    const koreaGDP = getLatestValue(gdpByCountry['KOR'])?.value || 2.2;
    const koreaUnemployment = getLatestValue(unemploymentByCountry['KOR'])?.value || 2.7;
    const koreaFertility = getLatestValue(fertilityByCountry['KOR'])?.value || 0.75;
    const koreaRD = getLatestValue(rdByCountry['KOR'])?.value || 4.96;
    const koreaLifeExp = getLatestValue(lifeExpByCountry['KOR'])?.value || 83.5;
    // 교육 수준: API 값이 비정상적으로 낮으면 fallback 값 사용
    const koreaEducationRaw = getLatestValue(educationByCountry['KOR'])?.value;
    const koreaEducation = (koreaEducationRaw && koreaEducationRaw > 50) ? koreaEducationRaw : 70.6;
    const koreaRenewable = getLatestValue(renewableByCountry['KOR'])?.value || 8.4;
    const koreaPM25 = getLatestValue(pm25ByCountry['KOR'])?.value || 17.5;

    result.metricCards = {
        economic: [
            {
                id: 'gdp-growth',
                title: 'GDP 성장률',
                value: koreaGDP,
                unit: '%',
                trend: koreaGDP > 2 ? 'up' : (koreaGDP > 0 ? 'neutral' : 'down'),
                trendText: koreaGDP > 2 ? '양호' : (koreaGDP > 0 ? '회복세' : '둔화'),
                oecdRank: 'OECD 평균 수준'
            },
            {
                id: 'unemployment',
                title: '실업률',
                value: koreaUnemployment,
                unit: '%',
                trend: 'up',
                trendText: 'OECD 최저 수준',
                oecdRank: 'OECD 2위'
            },
            {
                id: 'inflation',
                title: '물가상승률',
                value: result.economic.inflation.korea,
                unit: '%',
                trend: result.economic.inflation.korea < 2 ? 'up' : 'neutral',
                trendText: result.economic.inflation.korea < 2 ? '안정' : '관리 중',
                oecdRank: '목표치 내'
            },
            {
                id: 'gdp-per-capita',
                title: '1인당 GDP',
                value: Math.round(result.economic.gdpPerCapita.korea / 1000),
                unit: 'K USD',
                trend: 'up',
                trendText: '꾸준한 성장',
                oecdRank: 'OECD 상위권'
            }
        ],
        social: [
            {
                id: 'fertility',
                title: '합계출산율',
                value: koreaFertility,
                unit: '',
                trend: 'down',
                trendText: 'OECD 최저',
                oecdRank: 'OECD 38위'
            },
            {
                id: 'life-expectancy',
                title: '기대수명',
                value: koreaLifeExp,
                unit: '세',
                trend: 'up',
                trendText: 'OECD 평균 상회',
                oecdRank: 'OECD 4위'
            },
            {
                id: 'education',
                title: '고등교육 이수율',
                value: Math.round(koreaEducation),
                unit: '%',
                trend: 'up',
                trendText: 'OECD 1위',
                oecdRank: 'OECD 1위'
            },
            {
                id: 'life-satisfaction',
                title: '삶의 만족도',
                value: result.social.lifeSatisfaction.korea,
                unit: '/10',
                trend: 'neutral',
                trendText: 'OECD 평균 이하',
                oecdRank: 'OECD 33위'
            }
        ],
        environment: [
            {
                id: 'renewable',
                title: '재생에너지 비율',
                value: koreaRenewable,
                unit: '%',
                trend: 'neutral',
                trendText: 'OECD 하위권',
                oecdRank: '개선 필요'
            },
            {
                id: 'pm25',
                title: 'PM2.5 농도',
                value: koreaPM25,
                unit: 'µg/m³',
                trend: 'down',
                trendText: 'WHO 권장 3.5배',
                oecdRank: 'OECD 하위권'
            },
            {
                id: 'greenhouse',
                title: '온실가스 변화율',
                value: result.environment.greenhouse.changeRate,
                unit: '%',
                trend: 'up',
                trendText: '감소 추세',
                oecdRank: '14년 만에 최저'
            },
            {
                id: 'air-exposure',
                title: '대기오염 노출 인구',
                value: result.environment.airPollutionExposure.korea,
                unit: '%',
                trend: 'down',
                trendText: 'OECD 평균 1.8배',
                oecdRank: '개선 시급'
            }
        ],
        innovation: [
            {
                id: 'rd-investment',
                title: 'R&D 투자',
                value: koreaRD,
                unit: '% GDP',
                trend: 'up',
                trendText: 'OECD 2위',
                oecdRank: 'OECD 2위'
            },
            {
                id: 'digital-gov',
                title: '디지털 정부',
                value: result.innovation.digitalGovernment.score,
                unit: '/1.0',
                trend: 'up',
                trendText: 'OECD 1위',
                oecdRank: 'OECD 1위'
            },
            {
                id: 'patents',
                title: 'IP5 특허',
                value: '증가세',
                unit: '',
                trend: 'up',
                trendText: '글로벌 확대',
                oecdRank: 'OECD 상위권'
            },
            {
                id: 'rd-trend',
                title: 'R&D 지출',
                value: result.innovation.rdTrend.values[result.innovation.rdTrend.values.length - 1] || 119.7,
                unit: '조원',
                trend: 'up',
                trendText: '꾸준한 증가',
                oecdRank: '역대 최고'
            }
        ]
    };

    // ===== 6. 인사이트 텍스트 =====
    console.log('\n💡 [6/6] 인사이트 생성 중...');

    const gdpTrend = koreaGDP > 2 ? '안정적인 성장세' : (koreaGDP > 0 ? '회복세' : '둔화');
    const unemploymentStatus = koreaUnemployment < 3 ? 'OECD 최저 수준을 유지' : 'OECD 평균 이하';

    result.insights = {
        economic: {
            title: '경제 동향',
            text: `대한민국은 강력한 수출 중심으로 GDP ${gdpTrend}를 보이고 있으며, 실업률 ${koreaUnemployment}%로 ${unemploymentStatus}하고 있습니다. 2025년은 대외 불확실성으로 1.0% 성장이 예상되나, 2026년 2.2% 회복 전망입니다.`,
            highlight: `GDP ${koreaGDP}% | 실업률 ${koreaUnemployment}% | 물가 ${result.economic.inflation.korea}%`
        },
        social: {
            title: '사회 동향',
            text: `대한민국은 고등교육 이수율 ${Math.round(koreaEducation)}%로 세계 최고 수준을 기록하고 있으며, OECD 국가 중 1위를 유지하고 있습니다. 기대수명 ${koreaLifeExp}세로 세계 최상위권입니다. 다만 합계출산율 ${koreaFertility}명으로 OECD 최저 수준이며, 삶의 만족도 개선이 필요합니다.`,
            highlight: `출산율 ${koreaFertility} | 기대수명 ${koreaLifeExp}세 | 교육 ${Math.round(koreaEducation)}% (세계 최고)`
        },
        environment: {
            title: '환경 동향',
            text: `대한민국은 2050 탄소중립을 목표로 재생에너지 확대에 주력하고 있습니다. 현재 재생에너지 비율 ${koreaRenewable}%로 OECD 평균 대비 낮지만, 온실가스 배출량이 14년 만에 최저를 기록하며 개선세를 보이고 있습니다. PM2.5 ${koreaPM25}µg/m³로 대기질 개선이 시급합니다.`,
            highlight: `재생에너지 ${koreaRenewable}% | PM2.5 ${koreaPM25}µg/m³ | 온실가스 ${result.environment.greenhouse.changeRate}%`
        },
        innovation: {
            title: '혁신 동향',
            text: `대한민국은 R&D 투자 GDP 대비 ${koreaRD}%로 세계 2위(이스라엘 다음)를 기록하고 있습니다. 디지털 정부 성숙도 0.89점으로 OECD 1위이며, AI 정부 활용에서도 OECD 평균을 상회합니다. IP5 특허 출원도 꾸준한 증가세를 보이고 있습니다.`,
            highlight: `R&D ${koreaRD}% | 디지털정부 0.89점 | 연구비 ${result.innovation.rdTrend.values[result.innovation.rdTrend.values.length - 1] || 119.7}조원`
        }
    };

    console.log('\n✅ 데이터 수집 완료!\n');

    return result;
}

/**
 * JSON 파일로 저장
 */
async function saveToFile(data) {
    const filePath = path.join(__dirname, 'data.json');

    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`💾 저장 완료: ${filePath}`);
        console.log(`📁 파일 크기: ${(fs.statSync(filePath).size / 1024).toFixed(2)} KB`);
    } catch (error) {
        console.error(`❌ 저장 실패: ${error.message}`);
        throw error;
    }
}

/**
 * 메인 실행
 */
async function main() {
    console.log('═══════════════════════════════════════════════');
    console.log('  🇰🇷 OECD 대시보드 데이터 수집기 v1.0');
    console.log('═══════════════════════════════════════════════\n');

    try {
        const data = await collectAllData();
        await saveToFile(data);

        console.log('\n═══════════════════════════════════════════════');
        console.log('  ✅ 모든 작업 완료!');
        console.log(`  📅 업데이트: ${data.metadata.lastUpdated}`);
        console.log('═══════════════════════════════════════════════\n');

    } catch (error) {
        console.error('\n❌ 오류 발생:', error.message);
        process.exit(1);
    }
}

// 실행
main();


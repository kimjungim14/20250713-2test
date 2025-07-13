// WeatherAPI 설정
const API_KEY = '996ed61462264229a7921515251307';
const BASE_URL = 'https://api.weatherapi.com/v1';

// DOM 요소들
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const cityElement = document.getElementById('city');
const tempElement = document.getElementById('temp');
const descriptionElement = document.getElementById('description');
const feelsLikeElement = document.getElementById('feels-like');
const humidityElement = document.getElementById('humidity');
const windSpeedElement = document.getElementById('wind-speed');
const visibilityElement = document.getElementById('visibility');
const forecastContainer = document.getElementById('forecast-container');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');

// 이벤트 리스너 등록
searchBtn.addEventListener('click', getWeather);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getWeather();
    }
});

// 페이지 로드 시 서울 날씨 표시
window.addEventListener('load', () => {
    getWeather('Seoul');
});

// 날씨 정보 가져오기
async function getWeather(city = null) {
    const searchCity = city || searchInput.value.trim();
    
    if (!searchCity) {
        showError('도시명을 입력해주세요.');
        return;
    }

    // 로딩 상태 표시
    setLoadingState(true);
    hideError();

    try {
        // 현재 날씨 정보 가져오기
        const currentWeather = await fetchWeatherData(`${BASE_URL}/current.json?key=${API_KEY}&q=${searchCity}&aqi=no`);
        
        // 3일 예보 정보 가져오기
        const forecast = await fetchWeatherData(`${BASE_URL}/forecast.json?key=${API_KEY}&q=${searchCity}&days=3&aqi=no`);
        
        // UI 업데이트
        updateCurrentWeather(currentWeather);
        updateForecast(forecast);
        
        // 검색 입력창 초기화
        if (!city) {
            searchInput.value = '';
        }
        
    } catch (error) {
        console.error('날씨 정보를 가져오는 중 오류가 발생했습니다:', error);
        showError('도시를 찾을 수 없거나 네트워크 오류가 발생했습니다.');
    } finally {
        setLoadingState(false);
    }
}

// API 호출 함수
async function fetchWeatherData(url) {
    const response = await fetch(url);
    
    if (!response.ok) {
        if (response.status === 400) {
            throw new Error('도시를 찾을 수 없습니다.');
        } else {
            throw new Error('서버 오류가 발생했습니다.');
        }
    }
    
    return await response.json();
}

// 현재 날씨 정보 업데이트
function updateCurrentWeather(data) {
    const current = data.current;
    const location = data.location;
    
    // 도시명 업데이트
    cityElement.textContent = `${location.name}, ${location.country}`;
    
    // 온도 업데이트
    tempElement.textContent = Math.round(current.temp_c);
    
    // 날씨 설명 업데이트
    descriptionElement.textContent = current.condition.text;
    
    // 상세 정보 업데이트
    feelsLikeElement.textContent = `${Math.round(current.feelslike_c)}°C`;
    humidityElement.textContent = `${current.humidity}%`;
    windSpeedElement.textContent = `${Math.round(current.wind_kph)} km/h`;
    visibilityElement.textContent = `${current.vis_km} km`;
}

// 예보 정보 업데이트
function updateForecast(data) {
    const forecastDays = data.forecast.forecastday;
    
    // 기존 예보 정보 제거
    forecastContainer.innerHTML = '';
    
    // 각 날짜별 예보 정보 추가
    forecastDays.forEach(day => {
        const forecastItem = createForecastItem(day);
        forecastContainer.appendChild(forecastItem);
    });
}

// 예보 아이템 생성
function createForecastItem(day) {
    const forecastItem = document.createElement('div');
    forecastItem.className = 'forecast-item';
    
    const date = new Date(day.date);
    const dayName = getDayName(date.getDay());
    
    forecastItem.innerHTML = `
        <div class="forecast-day">${dayName}</div>
        <div class="forecast-temp">${Math.round(day.day.avgtemp_c)}°C</div>
        <div class="forecast-desc">${day.day.condition.text}</div>
    `;
    
    return forecastItem;
}

// 요일 이름 가져오기
function getDayName(dayIndex) {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[dayIndex];
}

// 로딩 상태 설정
function setLoadingState(isLoading) {
    if (isLoading) {
        searchBtn.innerHTML = '<div class="loading"></div>';
        searchBtn.disabled = true;
    } else {
        searchBtn.innerHTML = '<i class="fas fa-search"></i>';
        searchBtn.disabled = false;
    }
}

// 에러 메시지 표시
function showError(message) {
    errorText.textContent = message;
    errorMessage.style.display = 'flex';
}

// 에러 메시지 숨기기
function hideError() {
    errorMessage.style.display = 'none';
}

// 날씨 아이콘 가져오기 (WeatherAPI 조건 코드 기반)
function getWeatherIcon(conditionCode) {
    const iconMap = {
        1000: '☀️', // 맑음
        1003: '⛅', // 구름 조금
        1006: '☁️', // 흐림
        1009: '☁️', // 흐림
        1030: '🌫️', // 안개
        1063: '🌦️', // 가벼운 비
        1066: '🌨️', // 가벼운 눈
        1069: '🌨️', // 가벼운 진눈깨비
        1087: '⛈️', // 천둥번개
        1114: '🌨️', // 눈
        1117: '❄️', // 폭설
        1135: '🌫️', // 안개
        1147: '🌫️', // 짙은 안개
        1150: '🌦️', // 가벼운 이슬비
        1153: '🌦️', // 가벼운 이슬비
        1168: '🌧️', // 이슬비
        1171: '🌧️', // 강한 이슬비
        1180: '🌦️', // 가벼운 비
        1183: '🌧️', // 비
        1186: '🌧️', // 비
        1189: '🌧️', // 비
        1192: '🌧️', // 강한 비
        1195: '🌧️', // 폭우
        1224: '🌨️', // 가벼운 눈
        1227: '🌨️', // 눈
        1230: '🌨️', // 눈
        1233: '❄️', // 강한 눈
        1236: '❄️', // 폭설
        1240: '🌦️', // 가벼운 소나기
        1243: '🌧️', // 소나기
        1246: '🌧️', // 강한 소나기
        1249: '🌨️', // 가벼운 진눈깨비
        1252: '🌨️', // 진눈깨비
        1255: '❄️', // 강한 진눈깨비
        1258: '❄️', // 강한 진눈깨비
        1261: '🌨️', // 가벼운 우박
        1264: '🧊', // 우박
        1273: '⛈️', // 가벼운 비와 천둥번개
        1276: '⛈️', // 비와 천둥번개
        1279: '⛈️', // 가벼운 눈과 천둥번개
        1282: '⛈️', // 눈과 천둥번개
    };
    
    return iconMap[conditionCode] || '🌤️';
}

// 날씨에 따른 배경 그라데이션 변경
function updateBackground(conditionCode) {
    const body = document.body;
    
    // 날씨 조건에 따른 배경 변경
    if (conditionCode >= 1000 && conditionCode <= 1003) {
        // 맑음
        body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    } else if (conditionCode >= 1006 && conditionCode <= 1009) {
        // 흐림
        body.style.background = 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)';
    } else if (conditionCode >= 1063 && conditionCode <= 1195) {
        // 비
        body.style.background = 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)';
    } else if (conditionCode >= 1066 && conditionCode <= 1282) {
        // 눈
        body.style.background = 'linear-gradient(135deg, #dfe6e9 0%, #b2bec3 100%)';
    } else {
        // 기본
        body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
}

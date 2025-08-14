// --- Глобальные переменные и константы ---
// --- Глобальные переменные и константы ---
let currentMapData = null;
let activeFilters = new Set();
const colors = { T: '#ffae00', CT: '#00bfff' };

// --- Получение элементов DOM ---
const header = document.querySelector('header');
const mapSelectionView = document.getElementById('map-selection');
const mapView = document.getElementById('map-view');
const mapOverlay = document.getElementById('map-overlay');
const backToSelectionBtn = document.getElementById('back-to-selection-btn');
const mapTitle = document.getElementById('map-title');
const mapImage = document.getElementById('map-image');
const infoPanelContent = document.getElementById('info-panel-content');

// --- ФУНКЦИИ РЕНДЕРИНГА ---
function generateNadeTitle(nade) {
    return `[${nade.type}] ${nade.to}`;
}

// Новая функция для отрисовки ВСЕХ траекторий
function drawAllTrajectories(nades) {
    mapOverlay.innerHTML = '';
    if (!nades) return;

    const { width, height } = mapOverlay.getBoundingClientRect();

    nades.forEach(nade => {
        if (!nade.trajectory || nade.trajectory.length < 2) return;

        const color = colors[nade.side] || '#ffffff';
        const startPoint = nade.trajectory[0];
        const endPoint = nade.trajectory[nade.trajectory.length - 1];

        // Создаем группу для каждого лайнапа
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.classList.add('nade-trajectory-group');
        group.dataset.nadeId = nade.id;
        group.style.opacity = '0.7'; // Делаем все траектории полупрозрачными по умолчанию

        // 1. Рисуем линию
        const pathData = 'M ' + nade.trajectory.map(p => `${(p.x / 100) * width} ${(p.y / 100) * height}`).join(' L ');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', '2');
        path.setAttribute('stroke-dasharray', '5 5');
        path.setAttribute('fill', 'none');
        group.appendChild(path);

        // 2. Рисуем точку "откуда"
        const startCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        startCircle.setAttribute('cx', `${startPoint.x}%`);
        startCircle.setAttribute('cy', `${startPoint.y}%`);
        startCircle.setAttribute('r', '8');
        startCircle.setAttribute('fill', color);
        startCircle.setAttribute('stroke', 'white');
        startCircle.setAttribute('stroke-width', '2');
        group.appendChild(startCircle);

        // 3. Рисуем иконку "куда"
        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        icon.setAttribute('href', `assets/icons/${nade.type}.svg`);
        const iconSize = nade.type === 'Флеш' ? 32 : 28;
        icon.setAttribute('x', `calc(${endPoint.x}% - ${iconSize/2}px)`);
        icon.setAttribute('y', `calc(${endPoint.y}% - ${iconSize/2}px)`);
        icon.setAttribute('width', `${iconSize}px`);
        icon.setAttribute('height', `${iconSize}px`);
        group.appendChild(icon);

        // Добавляем обработчик клика на всю группу
        group.addEventListener('click', () => renderNadeDetails(nade));
        mapOverlay.appendChild(group);
    });
}

function renderNadeList() {
    const nades = currentMapData.nades;
    const filteredNades = activeFilters.size === 0 ? nades : nades.filter(nade => activeFilters.has(nade.type));
    
    // Рисуем отфильтрованные траектории на карте
    drawAllTrajectories(filteredNades);

    // Рендерим список справа
    infoPanelContent.innerHTML = '';
    filteredNades.forEach(nade => {
        const item = document.createElement('div');
        item.className = 'nade-list-item';
        item.textContent = generateNadeTitle(nade);

        // Подсветка на карте при наведении на элемент списка
        item.addEventListener('mouseenter', () => {
            document.querySelectorAll('.nade-trajectory-group').forEach(g => g.style.opacity = '0.1');
            const group = document.querySelector(`.nade-trajectory-group[data-nade-id="${nade.id}"]`);
            if (group) group.style.opacity = '1';
        });
        item.addEventListener('mouseleave', () => {
             document.querySelectorAll('.nade-trajectory-group').forEach(g => g.style.opacity = '0.7');
        });
        
        item.addEventListener('click', () => renderNadeDetails(nade));
        infoPanelContent.appendChild(item);
    });
}

function renderNadeDetails(nade) {
    // Проверяем наличие хоть каких-то медиа
    const hasLineup = nade.lineup && (nade.lineup.video && nade.lineup.video !== "") || (nade.lineup.images && nade.lineup.images.length > 0);

    let mediaHTML;
    if (hasLineup) {
        const videoHTML = (nade.lineup.video && nade.lineup.video !== "") ? `<video src="${nade.lineup.video}" controls autoplay loop muted></video>` : '';
        const imagesHTML = nade.lineup.images && nade.lineup.images.length > 0
            ? nade.lineup.images.map(src => `<img src="${src}" alt="Скриншот лайнапа">`).join('')
            : '';
        mediaHTML = `${videoHTML}<div class="nade-details-images">${imagesHTML}</div>`;
    } else {
        mediaHTML = '<p>Медиафайлы для этой гранаты еще не добавлены.</p>';
    }

    infoPanelContent.innerHTML = `
        <div class="nade-details-container">
            <button class="back-to-list-btn">‹ Назад к списку гранат</button>
            <h3>${generateNadeTitle(nade)}</h3>
            <div class="nade-meta-details">
                <p><strong>Откуда:</strong> ${nade.from}</p>
                <p><strong>Тип броска:</strong> ${nade.throwType}</p>
            </div>
            ${mediaHTML}
        </div>
    `;
    document.querySelector('.back-to-list-btn').addEventListener('click', () => {
        renderNadeList();
    });
}

// --- ФУНКЦИИ УПРАВЛЕНИЯ ВИДОМ ---
async function showMapView(mapId) {
    try {
        const module = await import(`./data/${mapId}.js`);
        currentMapData = module.default;
    } catch (error) {
        console.error(`Не удалось загрузить данные для карты "${mapId}":`, error);
        alert(`Не удалось загрузить данные для карты. Проверьте консоль.`);
        return;
    }

    mapTitle.textContent = currentMapData.name;
    mapImage.src = currentMapData.image;

    // Ждем загрузки изображения карты, чтобы получить правильные размеры оверлея
    mapImage.onload = () => {
        renderNadeList();
    };

    const filterContainer = document.getElementById('filter-container');
    filterContainer.innerHTML = '';
    const nadeTypes = ["Дым", "Флеш", "Молотов", "HE"];
    nadeTypes.forEach(type => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.textContent = type;
        btn.dataset.type = type;
        btn.addEventListener('click', () => {
            if (activeFilters.has(type)) {
                activeFilters.delete(type);
                btn.classList.remove('active');
            } else {
                activeFilters.add(type);
                btn.classList.add('active');
            }
            renderNadeList(); // Перерисовываем и список, и карту
        });
        filterContainer.appendChild(btn);
    });

    document.body.classList.add('map-view-active');
    header.style.display = 'none';
    document.body.style.overflow = 'hidden';
    mapSelectionView.style.display = 'none';
    mapView.style.display = 'flex';
}

function showMapSelection() {
    document.body.classList.remove('map-view-active');
    header.style.display = 'block';
    document.body.style.overflow = 'auto';
    mapView.style.display = 'none';
    mapSelectionView.style.display = 'block';
    mapOverlay.innerHTML = ''; // Очищаем SVG
    currentMapData = null;
    activeFilters.clear();
}

// --- ИНИЦИАЛИЗАЦИЯ И ГЛАВНЫЕ ОБРАБОТЧИКИ ---
document.querySelectorAll('.map-card').forEach(card => {
    card.addEventListener('click', () => showMapView(card.dataset.map));
});

backToSelectionBtn.addEventListener('click', showMapSelection);

showMapSelection();
console.log("App ready with interactive map display.");

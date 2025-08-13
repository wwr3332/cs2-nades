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

function drawTrajectory(nade) {
    mapOverlay.innerHTML = '';
    if (!nade || !nade.trajectory || nade.trajectory.length < 2) return;

    const { width, height } = mapOverlay.getBoundingClientRect();
    const color = colors[nade.side] || '#ffffff';
    const startPoint = nade.trajectory[0];
    const endPoint = nade.trajectory[nade.trajectory.length - 1];

    const pathData = 'M ' + nade.trajectory.map(p => `${(p.x / 100) * width} ${(p.y / 100) * height}`).join(' L ');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', '2');
    path.setAttribute('stroke-dasharray', '5 5');
    path.setAttribute('fill', 'none');
    mapOverlay.appendChild(path);

    const startCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    startCircle.setAttribute('cx', `${startPoint.x}%`);
    startCircle.setAttribute('cy', `${startPoint.y}%`);
    startCircle.setAttribute('r', '8');
    startCircle.setAttribute('fill', color);
    startCircle.setAttribute('stroke', 'white');
    startCircle.setAttribute('stroke-width', '2');
    mapOverlay.appendChild(startCircle);

    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    icon.setAttribute('href', `assets/icons/${nade.type}.svg`);
    const iconSize = nade.type === 'Флеш' ? 32 : 28;
    icon.setAttribute('x', `calc(${endPoint.x}% - ${iconSize/2}px)`);
    icon.setAttribute('y', `calc(${endPoint.y}% - ${iconSize/2}px)`);
    icon.setAttribute('width', `${iconSize}px`);
    icon.setAttribute('height', `${iconSize}px`);
    mapOverlay.appendChild(icon);
}

function renderNadeList() {
    const nades = currentMapData.nades;
    const filteredNades = activeFilters.size === 0 ? nades : nades.filter(nade => activeFilters.has(nade.type));
    infoPanelContent.innerHTML = '';
    filteredNades.forEach(nade => {
        const item = document.createElement('div');
        item.className = 'nade-list-item';
        item.textContent = generateNadeTitle(nade);
        item.addEventListener('mouseenter', () => drawTrajectory(nade));
        item.addEventListener('mouseleave', () => drawTrajectory(null));
        item.addEventListener('click', () => renderNadeDetails(nade));
        infoPanelContent.appendChild(item);
    });
}

function renderNadeDetails(nade) {
    let videoHTML = nade.lineup && nade.lineup.video && nade.lineup.video !== ""
        ? `<video src="${nade.lineup.video}" controls autoplay loop muted></video>` 
        : '<p>Видео для этой гранаты еще не добавлено.</p>';
    infoPanelContent.innerHTML = `
        <div class="nade-details-container">
            <button class="back-to-list-btn">‹ Назад к списку гранат</button>
            <h3>${generateNadeTitle(nade)}</h3>
            <div class="nade-meta-details">
                <p><strong>Откуда:</strong> ${nade.from}</p>
                <p><strong>Тип броска:</strong> ${nade.throwType}</p>
            </div>
            ${videoHTML}
        </div>
    `;
    document.querySelector('.back-to-list-btn').addEventListener('click', renderNadeList);
}

// --- ФУНКЦИИ УПРАВЛЕНИЯ ВИДОМ ---
async function showMapView(mapId) {
    try {
        // Динамически импортируем файл с данными для выбранной карты
        const module = await import(`./data/${mapId}.js`);
        currentMapData = module.default;
    } catch (error) {
        console.error(`Не удалось загрузить данные для карты "${mapId}":`, error);
        alert(`Не удалось загрузить данные для карты. Проверьте консоль.`);
        return;
    }

    if (!currentMapData || !currentMapData.nades) {
        alert(`Данные для карты "${mapId}" загружены, но некорректны.`);
        return;
    }

    mapTitle.textContent = currentMapData.name;
    mapImage.src = currentMapData.image;
    mapImage.alt = `Карта ${currentMapData.name}`;

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
            renderNadeList();
        });
        filterContainer.appendChild(btn);
    });
    
    renderNadeList();

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
    drawTrajectory(null);
    currentMapData = null;
    activeFilters.clear();
}

// --- ИНИЦИАЛИЗАЦИЯ И ГЛАВНЫЕ ОБРАБОТЧИКИ ---
document.querySelectorAll('.map-card').forEach(card => {
    card.addEventListener('click', () => showMapView(card.dataset.map));
});

backToSelectionBtn.addEventListener('click', showMapSelection);

showMapSelection(); // Показываем главный экран при старте
console.log("App ready. Core logic separated from data.");

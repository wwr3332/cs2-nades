// --- Глобальные переменные и константы ---
// --- Глобальные переменные и константы ---
let currentMapData = null;
let activeFilters = new Set();
const colors = { T: '#ffae00', CT: '#00bfff' };

// --- Аудио эффекты ---
// Поместите ваши файлы в папку /assets/sounds/
const zoomInSound = new Audio('assets/sounds/zoom-in.mp3');
const zoomOutSound = new Audio('assets/sounds/zoom-out.mp3');

// --- Получение элементов DOM ---
const header = document.querySelector('header');
const mapSelectionView = document.getElementById('map-selection');
const mapView = document.getElementById('map-view');
const mapOverlay = document.getElementById('map-overlay');
const backToSelectionBtn = document.getElementById('back-to-selection-btn');
const mapTitle = document.getElementById('map-title');
const mapImage = document.getElementById('map-image');
const infoPanelContent = document.getElementById('info-panel-content');

const nadeListOnMap = document.getElementById('nade-list-on-map');

// --- ФУНКЦИИ РЕНДЕРИНГА ---
function generateNadeTitle(nade) {
    return `[${nade.type}] ${nade.to}`;
}

// Новая функция для отрисовки ВСЕХ траекторий
// Новая функция для отрисовки ВСЕХ траекторий
function drawAllTrajectories(nades) {
    mapOverlay.innerHTML = '';
    if (!nades) return;

    // --- Определяем SVG-фильтр для тени ---
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', 'icon-shadow');
    filter.setAttribute('x', '-50%');
    filter.setAttribute('y', '-50%');
    filter.setAttribute('width', '200%');
    filter.setAttribute('height', '200%');
    
    const feDropShadow = document.createElementNS('http://www.w3.org/2000/svg', 'feDropShadow');
    feDropShadow.setAttribute('dx', '0');
    feDropShadow.setAttribute('dy', '0');
    feDropShadow.setAttribute('stdDeviation', '1.5'); // Радиус размытия тени
    feDropShadow.setAttribute('flood-color', '#000000'); // Цвет тени
    feDropShadow.setAttribute('flood-opacity', '1'); // Непрозрачность тени
    
    filter.appendChild(feDropShadow);
    defs.appendChild(filter);
    mapOverlay.appendChild(defs);
    // --- Конец определения фильтра ---

    const { width, height } = mapOverlay.getBoundingClientRect();

    nades.forEach(nade => {
        if (!nade.trajectory || nade.trajectory.length < 2) return;

        const color = colors[nade.side] || '#ffffff';
        const startPoint = nade.trajectory[0];
        const endPoint = nade.trajectory[nade.trajectory.length - 1];

        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.classList.add('nade-trajectory-group');
        group.dataset.nadeId = nade.id;
        group.style.opacity = '0.85';
        group.setAttribute('filter', 'url(#icon-shadow)'); // Применяем фильтр ко всей группе

        const pathData = 'M ' + nade.trajectory.map(p => `${(p.x / 100) * width} ${(p.y / 100) * height}`).join(' L ');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', '2');
        path.setAttribute('stroke-dasharray', '5 5');
        path.setAttribute('fill', 'none');
        group.appendChild(path);

        const startCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        startCircle.setAttribute('cx', `${startPoint.x}%`);
        startCircle.setAttribute('cy', `${startPoint.y}%`);
        startCircle.setAttribute('r', '8');
        startCircle.setAttribute('fill', color);
        startCircle.setAttribute('stroke', 'white');
        startCircle.setAttribute('stroke-width', '2');
        group.appendChild(startCircle);

        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        icon.setAttribute('href', `assets/icons/${nade.type}.svg`);
        const iconSize = nade.type === 'Флеш' ? 32 : 28;
        icon.setAttribute('x', `calc(${endPoint.x}% - ${iconSize/2}px)`);
        icon.setAttribute('y', `calc(${endPoint.y}% - ${iconSize/2}px)`);
        icon.setAttribute('width', `${iconSize}px`);
        icon.setAttribute('height', `${iconSize}px`);
        group.appendChild(icon);

        group.addEventListener('click', () => renderNadeDetails(nade));
        mapOverlay.appendChild(group);
    });
}

function renderNadeList() {
    // Очищаем панель деталей, на случай если она была открыта при смене фильтра
    infoPanelContent.innerHTML = '';
    // Очищаем старый список гранат
    nadeListOnMap.innerHTML = '';

    const nades = currentMapData.nades;
    const filteredNades = activeFilters.size === 0 ?
        nades : nades.filter(nade => activeFilters.has(nade.type));

    // Рисуем отфильтрованные траектории на карте
    drawAllTrajectories(filteredNades);

    // Рендерим список над картой
    const typeToClass = {
        'Дым': 'nade-type-smoke',
        'Флеш': 'nade-type-flash',
        'Молотов': 'nade-type-molotov',
        'HE': 'nade-type-he'
    };
    // ## Определяем порядок сортировки
    const sortOrder = ['Дым', 'Флеш', 'Молотов', 'HE'];
    // ## Сортируем массив гранат
    filteredNades.sort((a, b) => {
        return sortOrder.indexOf(a.type) - sortOrder.indexOf(b.type);
    });
    filteredNades.forEach(nade => {
        const item = document.createElement('div');
        item.className = 'nade-list-item';
        item.dataset.id = nade.id; // Добавляем ID для легкого поиска
        // ## Добавляем класс в зависимости от типа гранаты
        if (typeToClass[nade.type]) {
            item.classList.add(typeToClass[nade.type]);
        }
        item.textContent = generateNadeTitle(nade);

        // Подсветка на карте при наведении на элемент списка
        item.addEventListener('mouseenter', () => {
            // Не подсвечивать, если элемент уже активен
            if(item.classList.contains('active-nade')) return;
            document.querySelectorAll('.nade-trajectory-group:not(.active-nade)').forEach(g => g.style.opacity = '0.1');
            const group = document.querySelector(`.nade-trajectory-group[data-nade-id="${nade.id}"]`);
            if (group) group.style.opacity = '1';
        });
        item.addEventListener('mouseleave', () => {
            document.querySelectorAll('.nade-trajectory-group:not(.active-nade)').forEach(g => g.style.opacity = '0.7');
        });

        item.addEventListener('click', () => renderNadeDetails(nade));
        nadeListOnMap.appendChild(item);
    });
}

async function renderNadeDetails(nade) {
    // --- Логика выделения активной гранаты ---
    // Снимаем старое выделение
    document.querySelectorAll('.active-nade').forEach(el => el.classList.remove('active-nade'));
    
    // Находим и выделяем новую кнопку в списке и траекторию на карте
    const listItem = document.querySelector(`.nade-list-item[data-id="${nade.id}"]`);
    const trajectoryGroup = document.querySelector(`.nade-trajectory-group[data-nade-id="${nade.id}"]`);
    if (listItem) listItem.classList.add('active-nade');
    if (trajectoryGroup) trajectoryGroup.classList.add('active-nade');


    const hasVideo = nade.lineup && nade.lineup.video && nade.lineup.video !== "";
    const hasImages = nade.lineup && nade.lineup.images && nade.lineup.images.length > 0;

    let mediaHTML;

    if (!hasVideo && !hasImages) {
        mediaHTML = '<p>Медиафайлы для этой гранаты еще не добавлены.</p>';
    } else {
        const mainViewContent = hasVideo 
            ? `<video src="${nade.lineup.video}" controls autoplay loop muted></video>`
            : `<img src="${nade.lineup.images[0]}" alt="Просмотр лайнапа">`;

        const videoThumbnailHTML = hasVideo ? `<div class="thumbnail" data-media-type="video"><img id="video-thumb-img" src="assets/icons/video_thumbnail.svg" alt="Видео"></div>` : '';
        const imageThumbnailsHTML = hasImages ? nade.lineup.images.map((src, i) => `<div class="thumbnail" data-media-type="image" data-media-src="${src}"><img src="${src}" alt="Скриншот ${i + 1}"></div>`).join('') : '';
        
        mediaHTML = `
            <div class="media-gallery">
                <div id="main-media-view" class="main-media-view">${mainViewContent}</div>
                <div class="gallery-spacer"></div>
                ${ (hasVideo && hasImages) || (nade.lineup.images && nade.lineup.images.length > 1) ? `
                    <div class="thumbnail-strip">
                        ${videoThumbnailHTML}
                        ${imageThumbnailsHTML}
                    </div>` : ''
                }
            </div>`;
    }

    infoPanelContent.innerHTML = `
        <div class="nade-details-container">
            <div class="details-header">
                <button class="back-to-list-btn header-plate">‹ Назад</button>
                <div class="header-plate header-plate--title"><h3>${generateNadeTitle(nade)}</h3></div>
                <div class="nade-meta-details header-plate">
                    <span class="meta-item"><strong>Откуда:</strong> ${nade.from}</span>
                    <span class="meta-item-separator"></span>
                    <span class="meta-item"><strong>Тип броска:</strong> ${nade.throwType}</span>
                </div>
                <div class="header-spacer"></div>
                <div class="header-plate zoom-controls-plate-controls">
                    <span>Зум:</span>
                    <input type="range" id="zoom-slider" class="zoom-slider" min="1" max="8" step="0.3" value="1">
                    <button id="zoom-media-btn" title="Включить/выключить зум">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                            <path d="M6.5 4a.5.5 0 0 1 .5.5v1.5H8.5a.5.5 0 0 1 0 1H7v1.5a.5.5 0 0 1-1 0V7H4.5a.5.5 0 0 1 0-1H6V4.5a.5.5 0 0 1 .5-.5z"/>
                        </svg>
                    </button>
                </div>
            </div>
            ${mediaHTML}
        </div>`;
    
    // --- ПРИВЯЗКА СОБЫТИЙ ПОСЛЕ РЕНДЕРА ---

    const mainMediaView = document.getElementById('main-media-view');
    const zoomSlider = document.getElementById('zoom-slider');
    const zoomBtn = document.getElementById('zoom-media-btn');
    let currentMediaElement = mainMediaView ? mainMediaView.querySelector('video, img') : null;

    // --- Логика Зума ---
    let savedZoomLevel = 4.0; // Запоминаем предпочтительный уровень зума

    const updateTransform = (scale) => {
        if (currentMediaElement) {
            currentMediaElement.style.transform = `scale(${scale})`;
        }
    };

    // Слайдер напрямую управляет масштабом и запоминает значение
    if (zoomSlider) {
        zoomSlider.addEventListener('input', () => {
            const newZoom = zoomSlider.value;
            updateTransform(newZoom);
            // Запоминаем уровень, только если он не 1.0
            if (parseFloat(newZoom) > 1.0) {
                savedZoomLevel = newZoom;
            }
        });
    }

    // Кнопка переключает между 1.0 и запомненным уровнем
    // Кнопка переключает между 1.0 и запомненным уровнем
    if (zoomBtn && zoomSlider) {
        zoomBtn.addEventListener('click', () => {
            const currentZoom = parseFloat(zoomSlider.value);
            if (currentZoom > 1.0) { // Если зум включен, выключаем
                zoomOutSound.currentTime = 0; // Сбрасываем звук на начало
                zoomOutSound.play();
                zoomSlider.value = 1.0;
                updateTransform(1.0);
            } else { // Если зум выключен, включаем
                zoomInSound.currentTime = 0; // Сбрасываем звук на начало
                zoomInSound.play();
                zoomSlider.value = savedZoomLevel;
                updateTransform(savedZoomLevel);
            }
        });
    }
    
    // Кнопка "Назад"
    document.querySelector('.back-to-list-btn').addEventListener('click', () => {
        // Снимаем выделение со всех элементов
        document.querySelectorAll('.active-nade').forEach(el => el.classList.remove('active-nade'));
        // Очищаем панель
        infoPanelContent.innerHTML = '';
    });

    // Интерактивность галереи
    if (hasVideo || hasImages) {
        const thumbnails = document.querySelectorAll('.thumbnail');
        const videoSrc = nade.lineup.video;

        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', (e) => {
                thumbnails.forEach(t => t.classList.remove('active'));
                e.currentTarget.classList.add('active');

                const mediaType = e.currentTarget.dataset.mediaType;
                if (mediaType === 'video') {
                    mainMediaView.innerHTML = `<video src="${videoSrc}" controls autoplay loop muted></video>`;
                } else if (mediaType === 'image') {
                    mainMediaView.innerHTML = `<img src="${e.currentTarget.dataset.mediaSrc}" alt="Просмотр лайнапа">`;
                }
                currentMediaElement = mainMediaView.querySelector('video, img');
                // Применяем к новому медиа текущее значение зума с ползунка
                updateTransform(zoomSlider.value);
            });
        });
    }

    // Генерация кадра из видео
    if (hasVideo) {
        try {
            const videoThumbImg = document.getElementById('video-thumb-img');
            if (videoThumbImg) {
                const thumbnailUrl = await generateVideoThumbnail(nade.lineup.video);
                videoThumbImg.src = thumbnailUrl;
                videoThumbImg.parentElement.classList.add('video-thumb-loaded');
            }
        } catch (error) {
            console.error("Не удалось сгенерировать миниатюру для видео:", error);
        }
    }
    
    // Устанавливаем начальное состояние: зум выключен
    updateTransform(1.0);
}

    // --- Логика для кнопки зума ---
    const zoomBtn = document.getElementById('zoom-media-btn');
    const mainMediaView = document.getElementById('main-media-view');

    if (zoomBtn && mainMediaView) {
        zoomBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Предотвращаем всплытие события
            mainMediaView.classList.toggle('zoomed');
        });
    }

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
async function generateVideoThumbnail(videoSrc) {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.crossOrigin = 'anonymous'; // На случай, если видео будет с другого домена
        video.preload = 'metadata';
        video.muted = true;

        // Как только метаданные загружены, переходим на 0.1 секунду
        video.onloadedmetadata = () => {
            video.currentTime = 0.1;
        };

        // Когда кадр готов, "фотографируем" его на canvas
        video.onseeked = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg'));
        };

        video.onerror = (e) => {
            reject(`Ошибка загрузки видео для создания миниатюры: ${e}`);
        };

        video.src = videoSrc;
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
    // Ждем загрузки изображения карты, чтобы получить правильные размеры
    mapImage.onload = () => {
        // Устанавливаем ширину контейнера списка гранат равной ширине карты.
        // Это гарантирует, что список не будет вылезать за правый край карты.
        const mapWidth = mapImage.getBoundingClientRect().width;
        if (nadeListOnMap) {
            nadeListOnMap.style.width = `${mapWidth}px`;
        }

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

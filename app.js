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

const nadeListOnMap = document.getElementById('nade-list-on-map');

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
        // ## Добавляем класс в зависимости от типа гранаты
        if (typeToClass[nade.type]) {
            item.classList.add(typeToClass[nade.type]);
        }
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
        nadeListOnMap.appendChild(item);
    });
}

async function renderNadeDetails(nade) {
    const hasVideo = nade.lineup && nade.lineup.video && nade.lineup.video !== "";
    const hasImages = nade.lineup && nade.lineup.images && nade.lineup.images.length > 0;

    let mediaHTML;

    if (!hasVideo && !hasImages) {
        mediaHTML = '<p>Медиафайлы для этой гранаты еще не добавлены.</p>';
    } else {
        const mainViewContent = hasVideo 
            ? `<video src="${nade.lineup.video}" controls autoplay loop muted></video>`
            : `<img src="${nade.lineup.images[0]}" alt="Просмотр лайнапа">`;

        // Добавляем ID для img тега видео-миниатюры, чтобы его потом найти и заменить src
        const videoThumbnailHTML = hasVideo ? `
            <div class="thumbnail ${!hasImages ? 'active' : ''}" data-media-type="video">
                <img id="video-thumb-img" src="assets/icons/video_thumbnail.svg" alt="Видео">
            </div>` : '';

        const imageThumbnailsHTML = hasImages ? nade.lineup.images.map((src, i) => `
            <div class="thumbnail ${!hasVideo && i === 0 ? 'active' : ''}" data-media-type="image" data-media-src="${src}">
                <img src="${src}" alt="Скриншот ${i + 1}">
            </div>`).join('') : '';
        
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
                <button class="back-to-list-btn">‹ Назад</button>
                <h3>${generateNadeTitle(nade)}</h3>
                <div class="nade-meta-details">
                    <p><strong>Откуда:</strong> ${nade.from}</p>
                    <p><strong>Тип броска:</strong> ${nade.throwType}</p>
                </div>
            </div>
            ${mediaHTML}
        </div>`;
    
    document.querySelector('.back-to-list-btn').addEventListener('click', () => {
        infoPanelContent.innerHTML = '';
    });

    if (hasVideo || hasImages) {
        const mainMediaView = document.getElementById('main-media-view');
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
            });
        });
    }

    // После того как вся структура вставлена в DOM, генерируем и подставляем кадр из видео
    if (hasVideo) {
        try {
            const videoThumbImg = document.getElementById('video-thumb-img');
            const thumbnailUrl = await generateVideoThumbnail(nade.lineup.video);
            if (videoThumbImg) {
                videoThumbImg.src = thumbnailUrl;
            }
        } catch (error) {
            console.error("Не удалось сгенерировать миниатюру для видео:", error);
            // Если произошла ошибка, пользователь просто увидит серую иконку-заглушку
        }
    }
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

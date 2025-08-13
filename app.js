document.addEventListener('DOMContentLoaded', () => {
    // --- ДАННЫЕ ---
    const nadesData = {
        dust2: {
            name: "Dust II",
            image: "assets/images/dust2_map.png",
            nades: [
                { 
                    id: "d2_smoke_ctcross_from_tspawn", 
                    from: "Т-спавн, у машины",
                    to: "КТ-перетяжка на Б",
                    type: "Дым",
                    throwType: "Стандартный",
                    spot: { x: 51, y: 58 }, 
                    lineup: { video: "assets/lineups/d2_smoke_ct_cross.mp4", images: ["assets/lineups/d2_smoke_ct_cross_1.jpg"] }
                },
                { 
                    id: "d2_smoke_xbox_from_tspawn", 
                    from: "Т-спавн, за бочками",
                    to: "Иксбокс (шорт)",
                    type: "Дым",
                    throwType: "Jump-throw",
                    spot: { x: 50.5, y: 39 },
                    lineup: { video: "", images: [] }
                },
                { 
                    id: "d2_molly_longcorner_from_plat", 
                    from: "Длина, за ящиком",
                    to: "Угол у точки А",
                    type: "Молотов",
                    throwType: "Стандартный",
                    spot: { x: 81.5, y: 19 },
                    lineup: { video: "", images: [] }
                }
            ]
        },
        mirage: { name: "Mirage", image: "assets/images/mirage_map.png", nades: [] }
    };

    // --- ЭЛЕМЕНТЫ DOM ---
    const header = document.querySelector('header');
    const mapSelectionView = document.getElementById('map-selection');
    const mapView = document.getElementById('map-view');
    const mapContainer = document.getElementById('map-container');
    const backToSelectionBtn = document.getElementById('back-to-selection-btn');
    const mapTitle = document.getElementById('map-title');
    const mapImage = document.getElementById('map-image');
    const infoPanelContent = document.getElementById('info-panel-content');

    let currentMapData = null;
    let activeFilters = new Set(); // ## Храним активные фильтры здесь

    // --- ФУНКЦИИ РЕНДЕРИНГА ---
    function generateNadeTitle(nade) {
        return `[${nade.type}] ${nade.to}`;
    }

    function renderNadeList() {
        const nades = currentMapData.nades;
        // ## Фильтруем гранаты. Если фильтров нет, показываем все.
        const filteredNades = activeFilters.size === 0
            ? nades
            : nades.filter(nade => activeFilters.has(nade.type));

        infoPanelContent.innerHTML = '';
        filteredNades.forEach(nade => {
            const item = document.createElement('div');
            item.className = 'nade-list-item';
            item.textContent = generateNadeTitle(nade);
            item.addEventListener('mouseenter', () => createHighlight(nade.spot));
            item.addEventListener('mouseleave', removeHighlight);
            item.addEventListener('click', () => renderNadeDetails(nade));
            infoPanelContent.appendChild(item);
        });
    }

    function renderNadeDetails(nade) {
        if (!nade.lineup || (!nade.lineup.video && nade.lineup.images.length === 0)) {
            alert("Для этой гранаты пока нет материалов.");
            return;
        }

        let imagesHTML = nade.lineup.images.map(src => `<img src="${src}" alt="Скриншот лайнапа">`).join('');
        let videoHTML = nade.lineup.video ? `<video src="${nade.lineup.video}" controls autoplay loop muted></video>` : '';

        infoPanelContent.innerHTML = `
            <div class="nade-details-container">
                <button class="back-to-list-btn">‹ Назад к списку гранат</button>
                <h3>${generateNadeTitle(nade)}</h3>
                <div class="nade-meta-details">
                    <p><strong>Откуда:</strong> ${nade.from}</p>
                    <p><strong>Тип броска:</strong> ${nade.throwType}</p>
                </div>
                ${videoHTML}
                <div class="nade-details-images">${imagesHTML}</div>
            </div>
        `;

        document.querySelector('.back-to-list-btn').addEventListener('click', () => {
             renderNadeList(currentMapData.nades);
             removeHighlight();
        });
    }

    // --- ФУНКЦИИ УПРАВЛЕНИЯ ВИДОМ ---
    function showMapView(mapId) {
        currentMapData = nadesData[mapId];
        if (!currentMapData || currentMapData.nades.length === 0) {
            alert(`Для карты "${nadesData[mapId]?.name || mapId}" пока не добавлено ни одной гранаты.`);
            return;
        }

        mapTitle.textContent = currentMapData.name;
        mapImage.src = currentMapData.image;
        mapImage.alt = `Карта ${currentMapData.name}`;

        // ## Создаем и настраиваем кнопки фильтров
        const filterContainer = document.getElementById('filter-container');
        filterContainer.innerHTML = '';
        const nadeTypes = ["Дым", "Флеш", "Молотов", "HE"]; // Возможные типы гранат

        nadeTypes.forEach(type => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.textContent = type;
            btn.dataset.type = type;

            btn.addEventListener('click', () => {
                // Переключаем фильтр
                if (activeFilters.has(type)) {
                    activeFilters.delete(type);
                    btn.classList.remove('active');
                } else {
                    activeFilters.add(type);
                    btn.classList.add('active');
                }
                // Перерисовываем список гранат с учетом фильтров
                renderNadeList();
            });
            filterContainer.appendChild(btn);
        });
        
        renderNadeList(); // Первый рендер списка

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
        removeHighlight();
        currentMapData = null;
        activeFilters.clear(); // ## Сбрасываем фильтры при выходе на главный экран
    }
    
    // --- ФУНКЦИИ ПОДСВЕТКИ ---
    function createHighlight(spot) {
        removeHighlight();
        const dot = document.createElement('div');
        dot.className = 'highlight-spot';
        dot.style.left = `${spot.x}%`;
        dot.style.top = `${spot.y}%`;
        mapContainer.appendChild(dot);
    }

    function removeHighlight() {
        const existingDot = document.querySelector('.highlight-spot');
        if (existingDot) existingDot.remove();
    }

    // --- ОБРАБОТЧИКИ СОБЫТИЙ ---
    document.querySelectorAll('.map-card').forEach(card => {
        card.addEventListener('click', () => showMapView(card.dataset.map));
    });

    backToSelectionBtn.addEventListener('click', showMapSelection);

    // --- ИНИЦИАЛИЗАЦИЯ ---
    showMapSelection();
    console.log("App ready. Data model updated.");
});

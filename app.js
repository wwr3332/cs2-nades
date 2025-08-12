document.addEventListener('DOMContentLoaded', () => {
    // --- ДАННЫЕ (без изменений) ---
    const nadesData = {
        dust2: {
            name: "Dust II",
            image: "assets/images/dust2_map.png",
            nades: [
                { id: "d2_smoke_ct_cross", name: "Смок на КТ спавн (для прохода на Б)", spot: { x: 51, y: 58 }, lineup: { video: "assets/lineups/d2_smoke_ct_cross.mp4", images: ["assets/lineups/d2_smoke_ct_cross_1.jpg"] } },
                { id: "d2_smoke_xbox", name: "Смок на Иксбокс (с Т-спавна)", spot: { x: 50.5, y: 39 }, lineup: { video: "", images: [] } },
                { id: "d2_molly_long_corner", name: "Молотов за угол (длина)", spot: { x: 81.5, y: 19 }, lineup: { video: "", images: [] } }
            ]
        },
        mirage: { name: "Mirage", image: "assets/images/mirage_map.png", nades: [] }
    };

    // --- ЭЛЕМЕНТЫ DOM ---
    const header = document.querySelector('header'); // ## Получаем доступ к заголовку
    const mapSelectionView = document.getElementById('map-selection');
    const mapView = document.getElementById('map-view');
    const mapContainer = document.getElementById('map-container');
    const backToSelectionBtn = document.getElementById('back-to-selection-btn');
    const mapTitle = document.getElementById('map-title');
    const mapImage = document.getElementById('map-image');
    const infoPanelContent = document.getElementById('info-panel-content');

    let currentMapData = null;

    // --- ФУНКЦИИ РЕНДЕРИНГА ---
    function renderNadeList(nades) {
        infoPanelContent.innerHTML = '';
        nades.forEach(nade => {
            const item = document.createElement('div');
            item.className = 'nade-list-item';
            item.textContent = nade.name;
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
                <h3>${nade.name}</h3>
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
        
        renderNadeList(currentMapData.nades);

        header.style.display = 'none'; // ## Скрываем заголовок
        document.body.style.overflow = 'hidden';
        mapSelectionView.style.display = 'none';
        mapView.style.display = 'flex';
    }

    function showMapSelection() {
        header.style.display = 'block'; // ## Показываем заголовок снова
        document.body.style.overflow = 'auto';
        mapView.style.display = 'none';
        mapSelectionView.style.display = 'block';
        removeHighlight();
        currentMapData = null;
    }
    
    // --- ФУНКЦИИ ПОДСВЕТКИ (без изменений) ---
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
    console.log("App ready with new two-column layout and header logic.");
});

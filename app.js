document.addEventListener('DOMContentLoaded', () => {
    // --- ДАННЫЕ ---
    // В будущем это можно будет вынести в отдельный JSON файл
    const nadesData = {
        dust2: {
            name: "Dust II",
            image: "assets/images/dust2_map.png",
            nades: [
                { id: "d2_smoke_ct_cross", name: "Смок на КТ спавн (для прохода на Б)", spotId: "ct-spawn" },
                { id: "d2_smoke_xbox", name: "Смок на Иксбокс (с Т-спавна)", spotId: "xbox" },
                { id: "d2_molly_long_corner", name: "Молотов за угол (длина)", spotId: "long-corner" }
            ]
        },
        mirage: {
            name: "Mirage",
            image: "assets/images/mirage_map.png", // Вам нужно будет добавить это изображение
            nades: []
        }
    };

    // --- ЭЛЕМЕНТЫ DOM ---
    const mapSelectionView = document.getElementById('map-selection');
    const mapView = document.getElementById('map-view');
    const backButton = document.getElementById('back-to-selection-btn');
    const mapTitle = document.getElementById('map-title');
    const mapImage = document.getElementById('map-image');
    const nadeButtonsContainer = document.getElementById('nade-buttons');

    // --- ФУНКЦИИ ---
    function showMapView(mapId) {
        const mapData = nadesData[mapId];
        if (!mapData) {
            console.error(`Нет данных для карты: ${mapId}`);
            alert(`Для карты "${mapId}" пока не создана страница.`);
            return;
        }

        // Обновляем контент
        mapTitle.textContent = mapData.name;
        mapImage.src = mapData.image;
        mapImage.alt = `Карта ${mapData.name}`;

        // Создаем кнопки гранат
        nadeButtonsContainer.innerHTML = ''; // Очищаем старые кнопки
        mapData.nades.forEach(nade => {
            const btn = document.createElement('button');
            btn.className = 'nade-btn';
            btn.textContent = nade.name;
            btn.dataset.nadeId = nade.id;
            nadeButtonsContainer.appendChild(btn);
        });
        
        // Переключаем видимость
        mapSelectionView.style.display = 'none';
        mapView.style.display = 'block';
    }

    function showMapSelection() {
        mapView.style.display = 'none';
        mapSelectionView.style.display = 'block';
    }

    // --- ОБРАБОТЧИКИ СОБЫТИЙ ---
    document.querySelectorAll('.map-card').forEach(card => {
        card.addEventListener('click', () => {
            const mapId = card.dataset.map;
            showMapView(mapId);
        });
    });

    backButton.addEventListener('click', showMapSelection);

    // --- ИНИЦИАЛИЗАЦИЯ ---
    showMapSelection(); // Показываем выбор карты при загрузке
    console.log("App ready. Current view: map selection.");
});

document.addEventListener('DOMContentLoaded', () => {
    // --- ДАННЫЕ ---
    const nadesData = {
        dust2: {
            name: "Dust II",
            image: "assets/images/dust2_map.png",
            nades: [
                { 
                    id: "d2_smoke_ct_cross", 
                    name: "Смок на КТ спавн (для прохода на Б)", 
                    spot: { x: 51, y: 58 }, // Координаты в % от левого верхнего угла
                    lineup: {
                        video: "assets/lineups/d2_smoke_ct_cross.mp4",
                        images: ["assets/lineups/d2_smoke_ct_cross_1.jpg"]
                    }
                },
                { 
                    id: "d2_smoke_xbox", 
                    name: "Смок на Иксбокс (с Т-спавна)", 
                    spot: { x: 50.5, y: 39 },
                    lineup: { video: "", images: [] } // Оставьте пустым, если контента пока нет
                },
                { 
                    id: "d2_molly_long_corner", 
                    name: "Молотов за угол (длина)", 
                    spot: { x: 81.5, y: 19 },
                    lineup: { video: "", images: [] }
                }
            ]
        },
        mirage: {
            name: "Mirage",
            image: "assets/images/mirage_map.png",
            nades: []
        }
    };

    // --- ЭЛЕМЕНТЫ DOM ---
    const mapSelectionView = document.getElementById('map-selection');
    const mapView = document.getElementById('map-view');
    const mapContainer = document.getElementById('map-container');
    const backButton = document.getElementById('back-to-selection-btn');
    const mapTitle = document.getElementById('map-title');
    const mapImage = document.getElementById('map-image');
    const nadeButtonsContainer = document.getElementById('nade-buttons');
    const nadeDetailsView = document.getElementById('nade-details');

    // --- ФУНКЦИИ ---
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
        if (existingDot) {
            existingDot.remove();
        }
    }

    function showNadeDetails(nade) {
        if (!nade.lineup || (!nade.lineup.video && nade.lineup.images.length === 0)) {
            alert("Для этой гранаты пока нет материалов.");
            return;
        }

        let imagesHTML = nade.lineup.images.map(src => `<img src="${src}" alt="Скриншот лайнапа">`).join('');
        let videoHTML = nade.lineup.video ? `<video src="${nade.lineup.video}" controls autoplay loop muted></video>` : '';

        nadeDetailsView.innerHTML = `
            <div class="nade-details-content">
                <button id="close-details-btn">&times;</button>
                <h3>${nade.name}</h3>
                ${videoHTML}
                <div class="nade-details-images">${imagesHTML}</div>
            </div>
        `;
        nadeDetailsView.style.display = 'flex';

        document.getElementById('close-details-btn').addEventListener('click', hideNadeDetails);
    }

    function hideNadeDetails() {
        nadeDetailsView.style.display = 'none';
        nadeDetailsView.innerHTML = '';
    }

    function showMapView(mapId) {
        const mapData = nadesData[mapId];
        if (!mapData || mapData.nades.length === 0) {
            alert(`Для карты "${nadesData[mapId]?.name || mapId}" пока не добавлено ни одной гранаты.`);
            return;
        }

        mapTitle.textContent = mapData.name;
        mapImage.src = mapData.image;
        mapImage.alt = `Карта ${mapData.name}`;

        nadeButtonsContainer.innerHTML = '';
        mapData.nades.forEach(nade => {
            const btn = document.createElement('button');
            btn.className = 'nade-btn';
            btn.textContent = nade.name;
            
            btn.addEventListener('mouseenter', () => createHighlight(nade.spot));
            btn.addEventListener('mouseleave', removeHighlight);
            btn.addEventListener('click', () => showNadeDetails(nade));

            nadeButtonsContainer.appendChild(btn);
        });
        
        mapSelectionView.style.display = 'none';
        mapView.style.display = 'block';
    }

    function showMapSelection() {
        mapView.style.display = 'none';
        mapSelectionView.style.display = 'block';
        removeHighlight();
        hideNadeDetails();
    }

    // --- ОБРАБОТЧИКИ СОБЫТИЙ ---
    document.querySelectorAll('.map-card').forEach(card => {
        card.addEventListener('click', () => showMapView(card.dataset.map));
    });

    backButton.addEventListener('click', showMapSelection);
    
    nadeDetailsView.addEventListener('click', (e) => {
        if (e.target.id === 'nade-details') {
             hideNadeDetails();
        }
    });

    // --- ИНИЦИАЛИЗАЦИЯ ---
    showMapSelection();
    console.log("App ready with full functionality.");
});

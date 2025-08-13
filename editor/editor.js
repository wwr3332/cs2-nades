document.addEventListener('DOMContentLoaded', () => {
    console.log('Редактор лайнапов загружен.');

    // --- Получение элементов DOM ---
    // --- Получение элементов DOM ---
    // --- Получение элементов DOM ---
    const canvas = document.getElementById('map-canvas');
    const ctx = canvas.getContext('2d');
    const sideSelect = document.getElementById('side-select');
    const typeSelect = document.getElementById('type-select'); // ## Добавили селектор типа гранаты
    const undoButton = document.getElementById('undo-button');
    const clearButton = document.getElementById('clear-button');

    // --- Изображение карты ---
    const mapImage = new Image();
    mapImage.src = '../assets/images/dust2_map.png';

    // --- Состояние (State) ---
    let points = [];
    let currentSide = sideSelect.value;
    let currentNadeType = typeSelect.value; // ## Добавили состояние для типа гранаты

    // ## Предварительная загрузка иконок
    const nadeIcons = {};
    const iconTypes = ["Дым", "Флеш", "Молотов", "HE"];
    let iconsLoaded = 0;
    
    iconTypes.forEach(type => {
        const img = new Image();
        img.src = `icons/${type}.svg`; // ИЗМЕНЕНО: теперь .svg
        img.onload = () => {
            iconsLoaded++;
            // Если все иконки загружены, можно один раз перерисовать холст
            if (iconsLoaded === iconTypes.length) {
                redrawCanvas();
            }
        };
        nadeIcons[type] = img;
    });

    // --- Цвета ---
    const colors = {
        T: 'rgba(255, 165, 0, 0.9)', // Оранжевый
        CT: 'rgba(0, 191, 255, 0.9)', // Синий
        pointStroke: '#ffffff'
    };

    // --- Функции отрисовки ---
    function drawGrid(step = 32) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 0.5;
        for (let x = 0; x <= canvas.width; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); }
        for (let y = 0; y <= canvas.height; y += step) { ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); }
        ctx.stroke();
    }

    function redrawCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);
        drawGrid(32);

        const lineColor = colors[currentSide];

        // 1. Рисуем ЛИНИИ траектории
        if (points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 3; // ИЗМЕНЕНО: Линия стала толще
            ctx.setLineDash([8, 8]); // ИЗМЕНЕНО: Штрихи стали длиннее и ближе
            ctx.stroke();
        }

        // 2. Рисуем точки и иконки
        if (points.length > 0) {
            ctx.setLineDash([]);
            ctx.strokeStyle = colors.pointStroke;
            
            // Начальная точка ('откуда')
            const startPoint = points[0];
            ctx.fillStyle = lineColor;
            ctx.lineWidth = 2; // Обводка для точек остается прежней
            ctx.beginPath();
            ctx.arc(startPoint.x, startPoint.y, 10, 0, 2 * Math.PI); // ИЗМЕНЕНО: Кружок стал больше
            ctx.fill();
            ctx.stroke();

            // Конечная точка ('куда') - рисуем иконку
            // Конечная точка ('куда') - рисуем иконку
            if (points.length > 1) {
                const endPoint = points[points.length - 1];
                const icon = nadeIcons[currentNadeType];
                
                if (icon && icon.complete && icon.width > 0) {
                    // ## Устанавливаем размер в зависимости от типа гранаты
                    const isFlash = currentNadeType === 'Флеш';
                    const targetHeight = isFlash ? 48 : 40; // Флешка чуть больше остальных
                    
                    const ratio = icon.width / icon.height;
                    const targetWidth = targetHeight * ratio;

                    // ## Добавляем белый контур для флешки
                    if (isFlash) {
                        ctx.filter = 'drop-shadow(0 0 1.5px white)';
                    }

                    ctx.drawImage(
                        icon, 
                        endPoint.x - targetWidth / 2,
                        endPoint.y - targetHeight / 2,
                        targetWidth, 
                        targetHeight
                    );

                    // ## Сбрасываем фильтр, чтобы он не применялся к другим элементам
                    if (isFlash) {
                        ctx.filter = 'none';
                    }
                }
            }
        }
    }

    // --- Обработчики событий ---
    mapImage.onload = () => {
        console.log('Изображение карты загружено на холст.');
        redrawCanvas();
    };
    mapImage.onerror = () => console.error('Не удалось загрузить изображение карты.');

    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        points.push({ x, y });
        console.log(`Добавлена точка: x=${x.toFixed(0)}, y=${y.toFixed(0)}`);
        redrawCanvas();
    });

    sideSelect.addEventListener('change', (e) => {
        currentSide = e.target.value;
        redrawCanvas();
    });

    typeSelect.addEventListener('change', (e) => {
        currentNadeType = e.target.value;
        redrawCanvas();
    });

    undoButton.addEventListener('click', () => {
        points.pop();
        redrawCanvas();
    });

    clearButton.addEventListener('click', () => {
        points = [];
        redrawCanvas();
    });
});

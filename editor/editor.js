document.addEventListener('DOMContentLoaded', () => {
    console.log('Редактор лайнапов загружен.');

    // --- Получение элементов DOM ---
    // --- Получение элементов DOM ---
    const canvas = document.getElementById('map-canvas');
    const ctx = canvas.getContext('2d');
    const sideSelect = document.getElementById('side-select');
    const undoButton = document.getElementById('undo-button');
    const clearButton = document.getElementById('clear-button');

    // --- Изображение карты ---
    const mapImage = new Image();
    mapImage.src = '../assets/images/dust2_map.png';

    // --- Состояние (State) ---
    let points = []; // Массив для хранения координат точек
    let currentSide = sideSelect.value; // T или CT

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

        // 1. Рисуем ЛИНИИ траектории (всегда прямые)
        if (points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 10]);
            ctx.stroke();
        }

        // 2. Рисуем ТОЛЬКО первую и последнюю точки
        if (points.length > 0) {
            ctx.setLineDash([]);
            ctx.strokeStyle = colors.pointStroke;
            
            // Начальная точка ('откуда') - большая
            const startPoint = points[0];
            ctx.fillStyle = lineColor;
            ctx.beginPath();
            ctx.arc(startPoint.x, startPoint.y, 8, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();

            // Конечная точка ('куда') - если она не первая
            if (points.length > 1) {
                const endPoint = points[points.length - 1];
                ctx.fillStyle = 'rgba(0, 255, 0, 0.8)'; // Зеленый цвет для конечной точки
                ctx.beginPath();
                ctx.arc(endPoint.x, endPoint.y, 6, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
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

    undoButton.addEventListener('click', () => {
        points.pop();
        redrawCanvas();
    });

    clearButton.addEventListener('click', () => {
        points = [];
        redrawCanvas();
    });
});

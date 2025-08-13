document.addEventListener('DOMContentLoaded', () => {
    console.log('Редактор лайнапов загружен.');

    // --- Получение элементов DOM ---
    const canvas = document.getElementById('map-canvas');
    const ctx = canvas.getContext('2d');
    const sideSelect = document.getElementById('side-select');
    const lineTypeSelect = document.getElementById('line-type-select');
    const undoButton = document.getElementById('undo-button');
    const clearButton = document.getElementById('clear-button');

    // --- Изображение карты ---
    const mapImage = new Image();
    mapImage.src = '../assets/images/dust2_map.png';

    // --- Состояние (State) ---
    let points = []; // Массив для хранения координат точек
    let currentSide = sideSelect.value; // T или CT
    let currentLineType = lineTypeSelect.value; // Прямая или Кривая

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
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 10]);
            
            if (currentLineType === 'Прямая') {
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) {
                    ctx.lineTo(points[i].x, points[i].y);
                }
                ctx.stroke();
            } else if (currentLineType === 'Кривая') {
                // Рисуем кривые Безье через каждые 3 точки (старт, контроль, конец)
                for (let i = 0; i < points.length - 2; i += 2) {
                    ctx.beginPath();
                    ctx.moveTo(points[i].x, points[i].y);
                    ctx.quadraticCurveTo(points[i+1].x, points[i+1].y, points[i+2].x, points[i+2].y);
                    ctx.stroke();
                }
            }
        }

        // 2. Рисуем ТОЧКИ
        ctx.setLineDash([]);
        ctx.strokeStyle = colors.pointStroke;
        points.forEach((point, index) => {
            // Начальная точка ('откуда') - большая
            if (index === 0) {
                ctx.fillStyle = lineColor;
                ctx.beginPath();
                ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            } else {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.beginPath();
                ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
                ctx.fill();
            }
        });
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

    lineTypeSelect.addEventListener('change', (e) => {
        currentLineType = e.target.value;
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

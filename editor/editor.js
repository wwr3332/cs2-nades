document.addEventListener('DOMContentLoaded', () => {
    console.log('Редактор лайнапов загружен.');

    const canvas = document.getElementById('map-canvas');
    const ctx = canvas.getContext('2d');
    const mapImage = new Image();
    mapImage.src = '../assets/images/dust2_map.png';

    let points = []; // ## Массив для хранения координат точек

    function drawGrid(step = 32) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 0.5;
        for (let x = 0; x <= canvas.width; x += step) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
        }
        for (let y = 0; y <= canvas.height; y += step) {
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
        }
        ctx.stroke();
    }

    // ## Функция для полной перерисовки холста
    function redrawCanvas() {
        // Очищаем все
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Рисуем карту и сетку
        ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);
        drawGrid(32);

        // Рисуем все точки из массива
        ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI); // Рисуем кружок
            ctx.fill();
            ctx.stroke();
        });
    }

    mapImage.onload = () => {
        console.log('Изображение карты загружено на холст.');
        redrawCanvas(); // ## Первая отрисовка через новую функцию
    };

    mapImage.onerror = () => {
        console.error('Не удалось загрузить изображение карты. Проверьте путь: ' + mapImage.src);
    };

    // ## Обработчик клика по холсту
    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        points.push({ x, y }); // Добавляем новую точку в массив
        console.log(`Добавлена точка: x=${x.toFixed(0)}, y=${y.toFixed(0)}`);

        redrawCanvas(); // Перерисовываем холст с новой точкой
    });
});

document.addEventListener('DOMContentLoaded', () => {
    console.log('Редактор лайнапов загружен.');

    const canvas = document.getElementById('map-canvas');
    const ctx = canvas.getContext('2d');

    const mapImage = new Image();
    // Мы используем относительный путь от editor/index.html к файлу карты в основном проекте
    mapImage.src = '../assets/images/dust2_map.png';

    // ## Новая функция для отрисовки сетки
    function drawGrid(step = 32) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; // Цвет сетки
        ctx.lineWidth = 0.5;

        // Вертикальные линии
        for (let x = 0; x <= canvas.width; x += step) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
        }

        // Горизонтальные линии
        for (let y = 0; y <= canvas.height; y += step) {
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
        }
        ctx.stroke(); // Отрисовываем все линии одним вызовом
    }

    mapImage.onload = () => {
        // Отрисовываем карту как фон холста
        ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);
        console.log('Изображение карты загружено на холст.');

        // ## Вызываем отрисовку сетки после загрузки карты
        drawGrid(32); // Шаг сетки в 32 пикселя. Можно легко поменять.
    };

    mapImage.onerror = () => {
        console.error('Не удалось загрузить изображение карты. Проверьте путь: ' + mapImage.src);
    };
});

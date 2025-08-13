document.addEventListener('DOMContentLoaded', () => {
    console.log('Редактор лайнапов загружен.');

    const canvas = document.getElementById('map-canvas');
    const ctx = canvas.getContext('2d');

    const mapImage = new Image();
    // Мы используем относительный путь от editor/index.html к файлу карты в основном проекте
    mapImage.src = '../assets/images/dust2_map.png'; 

    mapImage.onload = () => {
        // Отрисовываем карту как фон холста
        ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);
        console.log('Изображение карты загружено на холст.');
    };

    mapImage.onerror = () => {
        console.error('Не удалось загрузить изображение карты. Проверьте путь: ' + mapImage.src);
    };
});
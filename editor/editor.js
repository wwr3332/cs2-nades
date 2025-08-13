document.addEventListener('DOMContentLoaded', () => {
    console.log('Редактор лайнапов загружен.');

    // --- Получение элементов DOM ---
    // --- Получение элементов DOM ---
    // --- Получение элементов DOM ---
    // --- Получение элементов DOM ---
    // --- Получение элементов DOM ---
    const canvas = document.getElementById('map-canvas');
    const ctx = canvas.getContext('2d');
    // Поля ввода
    const fromInput = document.getElementById('from-input');
    const toInput = document.getElementById('to-input');
    const typeSelect = document.getElementById('type-select');
    const throwTypeSelect = document.getElementById('throw-type-select');
    const imageCountSelect = document.getElementById('image-count-select');
    const sideSelect = document.getElementById('side-select');
    // Кнопки
    const undoButton = document.getElementById('undo-button');
    const clearButton = document.getElementById('clear-button');
    const copyButton = document.getElementById('copy-button');
    // Вывод
    const outputCode = document.getElementById('output-code');

    // --- Изображение карты ---
    const mapImage = new Image();
    mapImage.src = '../assets/images/dust2_map.png';

    // --- Состояние (State) ---
    let points = [];
    let currentSide = sideSelect.value;
    let currentNadeType = typeSelect.value;

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

        // ## Вычисляем масштаб, с которым холст отображается на странице
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        // ## Масштабируем координаты клика до реальных координат холста (1024x1024)
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

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
        fromInput.value = '';
        toInput.value = '';
        redrawCanvas();
    });

    // ## Функция для генерации и копирования данных
    // ## Функция для транслитерации и создания безопасных имен файлов
    function generateSafeFilename(text) {
        const translit = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
            'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
            'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
            'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
        };
        return text.toLowerCase()
            .split('')
            .map(char => translit[char] || char)
            .join('')
            .replace(/[^a-z0-9_]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }

    // ## Функция для генерации и копирования данных
    // ## Новая функция для отображения имен файлов и настройки их копирования
    function displayGeneratedFilenames(videoPath, imagePaths) {
        const container = document.getElementById('filenames-output');
        container.innerHTML = ''; // Очищаем

        const allPaths = [videoPath, ...imagePaths];

        allPaths.forEach(path => {
            // Извлекаем только имя файла из полного пути
            const filename = path.split('/').pop();

            const row = document.createElement('div');
            row.className = 'filename-row';

            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'filename-input';
            input.value = filename;
            input.readOnly = true;

            const btn = document.createElement('button');
            btn.className = 'copy-filename-btn';
            btn.textContent = 'Копировать';
            btn.addEventListener('click', () => {
                navigator.clipboard.writeText(filename).then(() => {
                    btn.textContent = 'Ok!';
                    setTimeout(() => { btn.textContent = 'Копировать'; }, 1000);
                });
            });

            row.appendChild(input);
            row.appendChild(btn);
            container.appendChild(row);
        });
    }

    // ## Функция для генерации и копирования данных
    copyButton.addEventListener('click', () => {
        if (points.length < 2) {
            alert('Нужно как минимум 2 точки (старт и конец).');
            return;
        }
        if (!fromInput.value || !toInput.value) {
            alert('Заполните поля "Откуда" и "Куда".');
            return;
        }

        // 1. Генерируем базовое имя файла
        const mapName = 'dust2';
        const fromSafe = generateSafeFilename(fromInput.value);
        const toSafe = generateSafeFilename(toInput.value);
        const baseFilename = `${fromSafe}_to_${toSafe}`;

        // 2. Генерируем пути для видео и картинок
        const videoPath = `assets/lineups/${mapName}/${baseFilename}.mp4`;
        const imagePaths = [];
        const imageCount = parseInt(imageCountSelect.value, 10);
        for (let i = 1; i <= imageCount; i++) {
            imagePaths.push(`assets/lineups/${mapName}/${baseFilename}_${i}.jpg`);
        }
        const lineup = { video: videoPath, images: imagePaths };

        // 3. Отображаем сгенерированные имена в новом UI
        displayGeneratedFilenames(videoPath, imagePaths);

        // 4. Конвертируем координаты в проценты
        const trajectory = points.map(p => ({
            x: parseFloat((p.x / canvas.width * 100).toFixed(2)),
            y: parseFloat((p.y / canvas.height * 100).toFixed(2))
        }));

        // 5. Собираем все данные в один объект
        const nadeObject = {
            id: `${mapName}_${baseFilename}`, // Убрали timestamp
            from: fromInput.value,
            to: toInput.value,
            type: typeSelect.value,
            throwType: throwTypeSelect.value,
            side: sideSelect.value,
            trajectory: trajectory,
            lineup: lineup
        };

        // 6. Превращаем объект в красивую строку
        const jsonString = JSON.stringify(nadeObject, null, 4);

        // 7. Выводим в textarea и копируем в буфер обмена
        outputCode.value = jsonString;
        navigator.clipboard.writeText(jsonString).then(() => {
            copyButton.textContent = 'Скопировано!';
            setTimeout(() => {
                copyButton.textContent = 'Копировать JSON';
            }, 1500);
        }).catch(err => {
            console.error('Ошибка копирования: ', err);
            alert('Не удалось скопировать текст.');
        });
    });
});

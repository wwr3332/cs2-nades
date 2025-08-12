document.addEventListener('DOMContentLoaded', () => {
    console.log("Map selection page ready!");

    const mapCards = document.querySelectorAll('.map-card');

    mapCards.forEach(card => {
        card.addEventListener('click', () => {
            const mapName = card.dataset.map;
            console.log(`Карта выбрана: ${mapName}`);
            
            // В будущем здесь будет логика перехода на страницу карты
            alert(`Вы выбрали карту: ${mapName}. Скоро здесь будет страница с гранатами!`);
        });
    });
});

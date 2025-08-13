export default {
    name: "Dust II",
    image: "assets/images/dust2_map.png",
    nades: [
        {
            "id": "d2_ct_cross_from_tspawn_example",
            "from": "Т-спавн, у машины",
            "to": "КТ-перетяжка на Б",
            "type": "Дым",
            "throwType": "Стандартный",
            "side": "T",
            "trajectory": [
                { "x": 31.84, "y": 88.38 },
                { "x": 50.88, "y": 58.5 }
            ],
            "lineup": { "video": "assets/lineups/dust2/video.mp4", "images": [] }
        },
        {
            "id": "d2_xbox_from_tspawn_example",
            "from": "Т-спавн, за бочками",
            "to": "Иксбокс (шорт)",
            "type": "Дым",
            "throwType": "Jump-throw",
            "side": "CT",
            "trajectory": [
                { "x": 37.01, "y": 91.02 },
                { "x": 50.49, "y": 38.96 }
            ],
            "lineup": { "video": "", "images": [] }
        }
    ]
};
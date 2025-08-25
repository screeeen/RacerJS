//TODO: Multiplicador para startIndex + endIndex
export const roadParam = {
    curvy: 2.0, // Significantly increased curve frequency
    mountainy: 8.5, // Maintained elevation changes
    maxHeight: 20000, // Maintained height changes
    maxCurve: 800, // Increased curve intensity
    // los intervalos de transicion se determinan: ejemplo:  startIndex: 5000,endIndex: 6000,
    zoneSection: 2000, // Shorter sections for even more frequent changes
    length: 15, // Maintained track length
};

export const getZoneSections = (stages) =>
    stages.map((stage) => stage.zoneSection);

// descriptor de fases
export const getStages = (alternate) => [
    {
        position: 0,
        isBackground: true,
        backgroundImg: 'clouds',
        name: 'normal',
        zoneSection: 600,
        startIndex: 200, // comienzo de la transi
        endIndex: 600, // final de la transi
        colors: {
            background: [136, 136, 136],
            grass: alternate ? [136, 136, 136] : [102, 102, 102],
            border: alternate ? [238, 238, 238] : [204, 204, 204],
            road: alternate ? [34, 34, 34] : [34, 34, 34],
            lane: alternate ? [170, 170, 170] : [34, 34, 34],
        },
    },
    {
        position: 1,
        isBackground: true,
        backgroundImg: 'clouds',
        name: 'casas',
        zoneSection: 1000,
        startIndex: 600,
        endIndex: 1000,
        colors: {
            background: [231, 224, 230],
            grass: [231, 224, 204],
            road: [212, 201, 166],
            lane: [212, 201, 166],
            border: [231, 224, 204],
        },
    },
    {
        position: 2,
        name: 'towers',
        zoneSection: 2000,
        isBackground: false,
        backgroundImg: 'clouds',
        startIndex: 1000,
        endIndex: 2000,
        colors: {
            background: [194, 178, 128],
            grass: [194, 178, 128],
            road: [212, 201, 166],
            lane: [212, 201, 166],
            border: [231, 224, 204],
        },
    },
    {
        position: 3,
        name: 'desert',
        zoneSection: 3000,
        isBackground: true,
        backgroundImg: 'clouds',
        startIndex: 2000,
        endIndex: 3000,
        colors: {
            background: [70, 91, 203],
            grass: [30, 26, 117],
            border: alternate ? [50, 75, 161] : [45, 70, 156],
            road: alternate ? [45, 70, 156] : [50, 75, 161],
            lane: alternate ? [45, 70, 156] : [110, 110, 190],
        },
    },
    {
        position: 4,
        name: 'palms',
        zoneSection: 4000,
        isBackground: true,
        backgroundImg: 'clouds',
        startIndex: 3100,
        endIndex: 4000,
        colors: {
            background: [114, 158, 128],
            grass: [14, 178, 128],
            road: [9, 201, 166],
            lane: [212, 201, 166],
            border: [15, 201, 166],
        },
    },
    {
        position: 5,
        name: 'tundra',
        zoneSection: 5000,
        isBackground: true,
        backgroundImg: 'clouds',
        startIndex: 4100,
        endIndex: 5000,
        colors: {
            background: [0, 0, 0],
            grass: [0, 0, 0],
            border: alternate ? [10, 10, 10] : [20, 20, 20],
            road: alternate ? [0, 0, 0] : [5, 5, 5],
            lane: alternate ? [10, 10, 10] : [20, 20, 20],
        },
    },
    {
        position: 6,
        name: 'tunel',
        zoneSection: 6000,
        isBackground: false,
        backgroundImg: 'clouds',
        startIndex: 5100,
        endIndex: 6000,
        colors: {
            background: [200, 190, 195],
            grass: alternate ? [180, 170, 175] : [170, 160, 165],
            border: alternate ? [220, 210, 215] : [210, 200, 205],
            road: alternate ? [150, 140, 145] : [160, 150, 155],
            lane: alternate ? [230, 220, 225] : [220, 210, 215],
        },
    },
    {
        position: 7,
        name: 'flat houses',
        zoneSection: 7000,
        isBackground: true,
        backgroundImg: 'clouds',
        startIndex: 6100,
        endIndex: 7000,
        colors: {
            background: [136, 136, 136],
            grass: alternate ? [136, 136, 136] : [102, 102, 102],
            border: alternate ? [238, 238, 238] : [204, 204, 204],
            road: alternate ? [34, 34, 34] : [34, 34, 34],
            lane: alternate ? [170, 170, 170] : [34, 34, 34],
        },
    },
];

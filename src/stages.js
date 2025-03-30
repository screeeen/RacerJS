//TODO: Multiplicador para startIndex + endIndex

// descriptor de fases
export const getStages = (alternate) => [
    {
        position: 0,
        isBackground: true,
        backgroundImg: 'clouds',
        name: 'normal',
        startIndex: 1000, // comienzo de la transi
        endIndex: 2000, // final de la transi
        colors: {
            background: [136, 136, 136],
            grass: alternate ? [136, 136, 136] : [102, 102, 102],
            border: alternate ? [238, 238, 238] : [204, 204, 204],
            road: alternate ? [34, 34, 34] : [34, 34, 34],
            lane: alternate ? [170, 170, 170] : [34, 34, 34]    
        },
    },
    {
        position: 1,
        isBackground: true,
        backgroundImg: 'clouds',
        name: 'casas',
        startIndex: 1000,
        endIndex: 2000,
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
        name: 'desierto',
        isBackground: false,
        backgroundImg: 'clouds',
        startIndex: 3000,
        endIndex: 4000,
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
        name: 'palmeras',
        isBackground: true,
        backgroundImg: 'clouds',
        startIndex: 5000,
        endIndex: 6000,
        colors: {
            background: [70,91,203],
            grass: [30,26,117],
            border: alternate ? [50,75,161] : [45,70,156],
            road: alternate ? [45,70,156] : [50,75,161],
            lane: alternate ? [45,70,156] : [110, 110, 190],
        },
    },
    {
        position: 4,
        name: 'tundra',
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
        name: 'tunel',
        isBackground: true,
        backgroundImg: 'clouds',
        startIndex: 4100,
        endIndex: 5000,
        colors: {
            background: [0,0,0],
            grass:  [0,0,0],
            border: alternate ? [10, 10,10] : [20,20,20],
            road: alternate ? [0,0,0] : [5,5,5],
            lane: alternate ? [10, 10,10] : [20,20,20]
        },
    },
    {
        position: 6,
        name: 'monument',
        isBackground: true,
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
];

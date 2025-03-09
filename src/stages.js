//TODO: Multiplicador para startIndex + endIndex

// descriptor de fases
export const getStages = (alternate) => [
    {
        position: 0,
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
        name: 'sandy',
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
        name: 'water',
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
        name: 'rocky',
        startIndex: 5000,
        endIndex: 6000,
        colors: {
            background: [90, 90, 100],
            grass: alternate ? [10, 10, 10] : [0, 10, 12],
            border: alternate ? [0, 0, 0] : [200, 200, 200],
            road: alternate ? [58, 58, 58] : [68, 68, 68],
            lane: alternate ? [170, 170, 170] : [170, 170, 170],
        },
    },
    {
        position: 4,
        name: 'palm',
        startIndex: 3100,
        endIndex: 4000,
        colors: {
            background: [10, 0, 0],
            grass: alternate ? [10, 10, 10] : [10, 10, 10],
            border: alternate ? [0, 0, 0] : [0, 0, 0],
            road: alternate ? [10, 34, 34] : [34, 34, 34],
            lane: alternate ? [10, 170, 170] : [170, 170, 170],
        },
    },
    {
        position: 5,
        name: 'industrial',
        startIndex: 4100,
        endIndex: 5000,
        colors: {
            background: [180, 180, 180],
            grass: alternate ? [160, 160, 160] : [150, 150, 150],
            border: alternate ? [200, 200, 200] : [190, 190, 190],
            road: alternate ? [100, 100, 100] : [120, 120, 120],
            lane: alternate ? [220, 220, 220] : [210, 210, 210],
        },
    },
    {
        position: 6,
        name: 'monument',
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

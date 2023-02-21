//TODO: Multiplicador para startIndex + endIndex

export const getStages = (alternate) => [
    {
        position: 0,
        name: 'normal',
        startIndex: 0, // comienzo de la transi
        endIndex: 100, // final de la transi
        colors: {
            background: [136, 136, 136],
            grass: alternate ? [136, 136, 136] : [102, 102, 102],
            border: alternate ? [238, 238, 238] : [204, 204, 204],
            road: alternate ? [34, 34, 34] : [68, 68, 68],
            lane: alternate ? [170, 170, 170] : [238, 238, 238],
        },
    },
    {
        position: 1,
        name: 'sandy',
        startIndex: 100,
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
        name: 'water',
        startIndex: 1100,
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
        name: 'rocky',
        startIndex: 2100,
        endIndex: 3000,
        colors: {
            background: [10, 10, 100],
            grass: alternate ? [10, 10, 10] : [0, 10, 102],
            border: alternate ? [0, 0, 0] : [200, 200, 200],
            road: alternate ? [34, 34, 34] : [68, 68, 68],
            lane: alternate ? [170, 170, 170] : [238, 238, 238],
        },
    },
    {
        position: 4,
        name: 'palm',
        startIndex: 3100,
        endIndex: 4000,
        colors: {
            background: [255, 0, 0],
            grass: alternate ? [255, 10, 10] : [10, 10, 10], //: [0, 10, 102],
            border: alternate ? [0, 0, 0] : [0, 0, 0], //: [200, 200, 200],
            road: alternate ? [255, 34, 34] : [34, 34, 34], //: [68, 68, 68],
            lane: alternate ? [255, 170, 170] : [170, 170, 170], //: [238, 238, 238],
        },
    },
];

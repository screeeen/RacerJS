export const STAGESLENGTH = 400;

//TODO: Multiplicador para startIndex + endIndex

export const getStages = (alternate) => [
    {
        position: 0,
        name: 'normal',
        startIndex: 0,
        endIndex: 400,
        colors: {
            background: [136, 136, 236],
            grass: alternate ? [136, 136, 136] : [102, 102, 102],
            border: alternate ? [238, 238, 238] : [204, 204, 204],
            road: alternate ? [34, 34, 34] : [68, 68, 68],
            lane: alternate ? [170, 170, 170] : [238, 238, 238],
        },
    },
    {
        position: 1,
        name: 'sandy',
        startIndex: 300,
        endIndex: 400,
        colors: {
            background: [231, 224, 255],
            grass: [231, 224, 204],
            road: [212, 201, 166],
            lane: [212, 201, 166],
            border: [231, 224, 204],
        },
    },
    {
        position: 2,
        name: 'water',
        startIndex: 700,
        endIndex: 800,
        colors: {
            background: [0, 0, 60],
            grass: [0, 0, 204],
            road: [212, 201, 166],
            lane: [212, 201, 166],
            border: [231, 224, 204],
        },
    },
    {
        position: 3,
        name: 'rocky',
        startIndex: 1190,
        endIndex: 1200,
        colors: {
            background: [10, 10, 100],
            grass: alternate ? [10, 10, 10] : [0, 10, 102],
            border: alternate ? [0, 0, 0] : [200, 200, 200],
            road: alternate ? [34, 34, 34] : [68, 68, 68],
            lane: alternate ? [170, 170, 170] : [238, 238, 238],
        },
    },
];

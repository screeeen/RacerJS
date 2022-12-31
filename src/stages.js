export const getStages = (alternate) => [
    {
        position: 0,
        name: 'normal',
        startIndex: 0,
        endIndex: 100,
        colors: {
            grass: alternate ? [136, 136, 136] : [102, 102, 102],
            border: alternate ? [238, 238, 238] : [204, 204, 204],
            road: alternate ? [34, 34, 34] : [68, 68, 68],
            lane: alternate ? [170, 170, 170] : [238, 238, 238],
        },
    },
    {
        position: 1,
        name: 'sandy',
        startIndex: 90,
        endIndex: 100,
        colors: {
            grass: [231, 224, 204],
            road: [212, 201, 166],
            lane: [212, 201, 166],
            border: [231, 224, 204],
        },
    },
    {
        position: 2,
        name: 'water',
        startIndex: 190,
        endIndex: 200,
        colors: {
            grass: [0, 0, 204],
            road: [212, 201, 166],
            lane: [212, 201, 166],
            border: [231, 224, 204],
        },
    },
    {
        position: 3,
        name: 'rocky',
        startIndex: 290,
        endIndex: 300,
        colors: {
            grass: alternate ? [10, 10, 10] : [0, 10, 102],
            border: alternate ? [0, 0, 0] : [200, 200, 200],
            road: alternate ? [34, 34, 34] : [68, 68, 68],
            lane: alternate ? [170, 170, 170] : [238, 238, 238],
        },
    },
]

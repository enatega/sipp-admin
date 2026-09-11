export const orderTrendChartSeriesData = [
    {
        key: 'totalOrders',
        label: 'Total Orders',
        axis: 'y',
        unit: 'count',
        points: [
            { t: '2017', v: 140 },
            { t: '2018', v: 310 },
            { t: '2019', v: 560 },
            { t: '2020', v: 430 }, // dip
            { t: '2021', v: 880 },
            { t: '2022', v: 1250 },
            { t: '2023', v: 1180 }, // slowdown
            { t: '2024', v: 1650 },
            { t: '2025', v: 2400 },
            { t: '2026', v: 2150 }, // correction
        ],
    },

    {
        key: 'totalInProgressOrders',
        label: 'Total InProgress Orders',
        axis: 'y',
        unit: 'count',
        points: [
            { t: '2017', v: 100 },
            { t: '2018', v: 260 },
            { t: '2019', v: 490 },
            { t: '2020', v: 380 }, // dip
            { t: '2021', v: 740 },
            { t: '2022', v: 1100 },
            { t: '2023', v: 980 }, // ops issues
            { t: '2024', v: 1420 },
            { t: '2025', v: 2100 },
            { t: '2026', v: 1900 },
        ],
    },

    {
        key: 'totalPendingOrders',
        label: 'Total Pending Orders',
        axis: 'y',
        unit: 'count',
        points: [
            { t: '2017', v: 40 },
            { t: '2018', v: 50 },
            { t: '2019', v: 70 },
            { t: '2020', v: 120 }, // backlog spike
            { t: '2021', v: 140 },
            { t: '2022', v: 150 },
            { t: '2023', v: 200 }, // staffing issue
            { t: '2024', v: 230 },
            { t: '2025', v: 300 },
            { t: '2026', v: 250 }, // stabilization
        ],
    },

    {
        key: 'totalCompletedOrders',
        label: 'Total Completed Orders',
        axis: 'y',
        unit: 'currency',
        points: [
            { t: '2017', v: 15000 },
            { t: '2018', v: 34000 },
            { t: '2019', v: 61000 },
            { t: '2020', v: 47000 }, // drop
            { t: '2021', v: 118000 },
            { t: '2022', v: 182000 },
            { t: '2023', v: 165000 }, // churn
            { t: '2024', v: 255000 },
            { t: '2025', v: 395000 },
            { t: '2026', v: 360000 }, // market pressure
        ],
    },


];


export const orderTrendChartMetaData = {
    granularity: 'year',
    currency: 'USD',
};

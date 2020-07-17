export const DATA_PARAMETERS = [
    {
        // Confirmed
        cardDisplay: true,
        mapDisplay: true,
        tableDisplay: true,
        pieChartDisplay: false,
        percent: false,

        id: "C",
        name: "Confirmed",
        color: "#C62828",
        totalKey: "cases",
        todayKey: "todayCases",
        historicalKey: "todayCases",
        interpolateColor: "interpolateReds"
    },
    {
        // Active
        cardDisplay: false,
        mapDisplay: true,
        tableDisplay: true,
        pieChartDisplay: true,
        percent: false,

        id: "A",
        name: "Active",
        color: "#FF6F00",
        totalKey: "active",
        interpolateColor: "interpolateOranges"
    },
    {
        // Recovered
        cardDisplay: true,
        mapDisplay: true,
        tableDisplay: true,
        pieChartDisplay: true,
        percent: false,

        id: "R",
        name: "Recovered",
        color: "#82b74b",
        totalKey: "recovered",
        todayKey: "todayRecovered",
        historicalKey: "todayRecovered",
        interpolateColor: "interpolateGreens"
    },
    {
        // Deaths
        cardDisplay: true,
        mapDisplay: true,
        tableDisplay: true,
        pieChartDisplay: true,
        percent: false,

        id: "D",
        name: "Deaths",
        color: "#2C3E50",
        totalKey: "deaths",
        todayKey: "todayDeaths",
        historicalKey: "todayDeaths",
        interpolateColor: "interpolateGreys"
    },
    {
        // Recovery Rate
        cardDisplay: false,
        mapDisplay: true,
        tableDisplay: false,
        pieChartDisplay: false,
        percent: true,

        id: "RR",
        name: "Recovery Rate",
        color: "darkgreen",
        totalKey: "recoveryRate",
        interpolateColor: "interpolateGreens"
    },
    {
        // Death Rate
        cardDisplay: false,
        mapDisplay: true,
        tableDisplay: false,
        pieChartDisplay: false,
        percent: true,

        id: "DR",
        name: "Death Rate",
        color: "black",
        totalKey: "deathRate",
        interpolateColor: "interpolateGreys"
    },
    {
        // Testing
        cardDisplay: false,
        mapDisplay: false,
        tableDisplay: false,
        pieChartDisplay: false,
        percent: false,

        id: "T",
        name: "Testing",
        color: "#4554d4",
        totalKey: "tests",
    }
]
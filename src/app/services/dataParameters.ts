export const DATA_PARAMETERS = [
    {
        // Confirmed
        cardDisplay: true,
        mapDisplay: true,
        tableDisplay: true,
        pieChartDisplay: false,
        percent: false,
        category: "General",

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
        category: "General",

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
        category: "General",

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
        category: "General",

        id: "D",
        name: "Deaths",
        color: "#2C3E50",
        totalKey: "deaths",
        todayKey: "todayDeaths",
        historicalKey: "todayDeaths",
        interpolateColor: "interpolateGreys"
    },
    {
        // Active Rate
        cardDisplay: false,
        mapDisplay: true,
        tableDisplay: false,
        pieChartDisplay: false,
        percent: true,
        category: "Percentage",

        id: "AR",
        name: "Active Rate",
        color: "#FF4500",
        totalKey: "activeRate",
        interpolateColor: "interpolateOranges"
    },
    {
        // Recovery Rate
        cardDisplay: false,
        mapDisplay: true,
        tableDisplay: false,
        pieChartDisplay: false,
        percent: true,
        category: "Percentage",

        id: "RR",
        name: "Recovery Rate",
        color: "#006400",
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
        category: "Percentage",

        id: "DR",
        name: "Death Rate",
        color: "#000000",
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
        category: "NA",

        id: "T",
        name: "Testing",
        color: "#4554d4",
        totalKey: "tests",
    }
]
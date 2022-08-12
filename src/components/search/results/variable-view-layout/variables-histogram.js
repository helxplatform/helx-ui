export const variableHistogramConfigStatic = {
    xField: 'id',
    yField: 'score',
    xAxis: {
        label: ""
    },
    animation: {
        appear: {
            duration: 800,
            delay: 100
        }
    },
    brush: {
        enabled: true,
        type: 'x-rect',
    },
    tooltip: {
        showTitle: false,
        fields: ['name', 'id', 'description', 'study_name', 'score'],
    },
    state: {
        active: {
            style: {
                lineWidth: 0,
                fill: '#3CCEA0',
                strokeStyle: "#3CCEA0",
                fillOpacity: 1,
            },
        },
    }
}

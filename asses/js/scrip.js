async function cargarCSV(url) {
    const response = await fetch(url);
    const data = await response.text();
    return data;
}

function procesarCSV(data) {
    const lineas = data.split('\n');
    const equipos = [];

    lineas.forEach((linea, index) => {
        if (index > 0) { // Ignorar la primera línea
            const [equipo, PTS_por_juego] = linea.split(',');
            if (equipo && PTS_por_juego) {
                equipos.push({ 
                    equipo, 
                    PTS_por_juego: parseFloat(PTS_por_juego) 
                });
            }
        }
    });

    return equipos;
}

function crearGrafico(equipos) {
    const ctx = document.getElementById('chart').getContext('2d');

    const top10 = equipos.slice(0, 10);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: top10.map(item => item.equipo),
            datasets: [{
                label: 'Promedio de Puntos',
                data: top10.map(item => item.PTS_por_juego),
                backgroundColor: 'skyblue',
                borderColor: 'blue',
                borderWidth: 1,
                hoverBackgroundColor: 'oeange',
                /*
                colores:
                blue
                oeange
                */
            }]
        },
        options: {
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: { 
                    onClick: null,
                },
                datalabels: { // dsp borrar ?
                    anchor: 'end', 
                    align: 'end',  
                    formatter: (value, context) => {
                        return value; 
                    },
                    color: 'black', 
                },

                tooltip: { // dsp borrar
                    enabled: false,
                }
            }

        },
        plugins: [ChartDataLabels] 
    });
}

async function init() {
    const csvData = await cargarCSV('Datasett/EquiposTemporada23_24.csv'); 
    const equipos = procesarCSV(csvData);
    crearGrafico(equipos);
}

init();

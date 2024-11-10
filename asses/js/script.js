let myChart; // variable grafico

// cargar datos
async function cargarCSV(url) {
    const response = await fetch(url);
    const data = await response.text();
    return data;
}

// filtrar datos
function procesarCSV(data, Division) {
    const lineas = data.split('\n');
    const equiposData = {};

    lineas.forEach((linea, index) => {
        if (index > 0) { 
            const [fecha, equipo, PTS, div] = linea.split(',');
        
            // Solo equipos que están en la lista filtrada
            if (div && div.includes(Division) && PTS) {
                if (!equiposData[equipo]) {
                    equiposData[equipo] = { fechas: [], PTS: [] };
                }
                // dsp aca hay un if
                equiposData[equipo].fechas.push(fecha);
                equiposData[equipo].PTS.push(parseFloat(PTS));
            }
        }
    });

    return equiposData;
}

// función onClick
function handleLegendClick(e, legendItem) {
    const index = legendItem.datasetIndex;

    // Si el equipo seleccionado ya esta
    const allHidden = myChart.data.datasets.every(dataset => dataset.hidden || dataset === myChart.data.datasets[index]);
    
    if (allHidden) { // ver todo los equipos
        myChart.data.datasets.forEach((dataset) => {
            dataset.hidden = false;
        });

    } else { // ocultar todos los equipos menos el seleccionado
        myChart.data.datasets.forEach((dataset) => {
            dataset.hidden = true;
        });

        myChart.data.datasets[index].hidden = false;
    }

    myChart.update();
}

// Crear gráfico
function crearGrafico(equipos) {
    const ctx = document.getElementById('myChart').getContext('2d');

    if (myChart) {
        myChart.destroy();
    }

    const datasets = [];
    let annotations = [];

    const colores = ['blue', 'orange', 'pink', 'purple', 'turquoise'];

    let colorIndex = 0; //  para los colores

    for (const equipo in equipos) {
        datasets.push({
            label: equipo,
            data: equipos[equipo].PTS,
            borderWidth: 4,
            pointRadius: 2,
            pointBackgroundColor: '#D3D3D3', 
            borderColor: colores[colorIndex],
        });

        colorIndex++; 
    }

    // Crear gráfico
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: equipos[Object.keys(equipos)[0]].fechas,
            datasets: datasets,
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 10,
                    },
                    grid: {
                        display: false,
                    },
                },
                y: {
                    min: 95,
                    max: 130,
                    ticks: {
                        stepSize: false,
                    },
                    title: {
                        display: true,
                        text: 'Puntos Promedio',
                    },
                    beginAtZero: true,
                    grid: {
                        display: false,
                    },
                }
            },
            plugins: {
                legend: {
                    position: 'left',
                    align: 'start',
                    onClick: handleLegendClick, // cuando uno apreta un equipo
                    labels: {
                        usePointStyle: true,
                        padding: 35, 
                    },
                },
                annotation: {
                    annotations: annotations,
                },
                tooltip: {
                    enabled: true
                }
            }
        }
    });
}

//  cambiar conferencia y actualizar grafico
document.getElementById('Conferencias').addEventListener('change', async (event) => {
    const selectedOption = event.target.value;
    console.log(`Opción seleccionada: ${selectedOption}`);

    const csvData = await cargarCSV('Datasett/juegos.csv'); 
    const equipos = procesarCSV(csvData, selectedOption);
    crearGrafico(equipos);
});

// Inicializar el grafico al cargar la página
async function init() {
    const csvData = await cargarCSV('Datasett/juegos.csv'); 
    const equipos = procesarCSV(csvData, "Central");
    crearGrafico(equipos);
}

init();

async function cargarCSV(url) {
    const response = await fetch(url);
    const data = await response.text();
    return data;
}

function procesarCSV(data) {
    const lineas = data.split('\n');
    const equiposData = {};

    // Lista de equipos 
    const equiposFiltrados = [  "Boston Celtics", "Dallas Mavericks", 
                            "Atlanta Hawks", "Denver Nuggets", "Miami Heat"];

    lineas.forEach((linea, index) => {
        if (index > 0) { 
            const [fecha, equipo, PTS , PTS_acumulados] = linea.split(',');
            
            // Solo equipos que estan en la lista filtrada
            if (equiposFiltrados.includes(equipo) && PTS) {
                if (!equiposData[equipo]) {
                    equiposData[equipo] = { fechas: [], PTS: [] };
                }
                equiposData[equipo].fechas.push(fecha);
                equiposData[equipo].PTS.push(parseFloat(PTS));
            }
        }
    });

    return equiposData;
}


function crearGrafico(equipos) {
    const ctx = document.getElementById('myChart').getContext('2d');
    const datasets = [];

    for (const equipo in equipos) {
        datasets.push({
            label: equipo,
            data: equipos[equipo].PTS,
            borderColor: getRandomColor(),
            borderWidth: 3,
            fill: false,
            pointRadius:  2, 
        });
    }

    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: equipos[Object.keys(equipos)[0]].fechas, 
            datasets: datasets,
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Fecha',
                    },
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 10,
                    },
                },
                y: {
                    min: 100,
                    max: 130,
                    ticks: {
                        stepSize: 2
                    },
                    title: {
                        display: true,
                        text: 'Puntos Promedio',
                    },
                    beginAtZero: true,
                }
            },
            plugins: {
                legend: {
                    position: 'left',  // Coloca la leyenda a la izquierda
                    align: 'start',    // Alinea la leyenda con el gráfico
                    onClick: null,

                    labels: {
                        usePointStyle: true, 
                    },

                    title: {
                        display: true,
                        text: 'Equipos',
                    },
                },
                tooltip: { // quitar tooltip?
                    //enabled: false
                }
            }
        }
    });
}


// Función para generar colores aleatorios
function getRandomColor() { // modificar
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Inicializar el gráfico
async function init() {
    const csvData = await cargarCSV('Datasett/juegos.csv'); 
    const equipos = procesarCSV(csvData);
    crearGrafico(equipos);
}

init();

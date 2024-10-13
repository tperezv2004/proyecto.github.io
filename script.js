async function cargarCSV(url) {
    const response = await fetch(url);
    const data = await response.text();
    return data;
}

function procesarCSV(data) {
    const lineas = data.split('\n');
    const equiposData = {};

    // Lista de equipos que queremos mostrar
    const equiposFiltrados = [ "Indiana Pacers", "Oklahoma City Thunder", "Boston Celtics",
                            "Dallas Mavericks", "Golden State Warriors", "Sacramento Kings"  ];

    lineas.forEach((linea, index) => {
        if (index > 0) { // Ignorar la primera línea
            const [fecha, equipo, PTS , PTS_acumulados] = linea.split(',');
            
            // Solo procesar equipos que están en la lista filtrada
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
            borderWidth: 2,
            fill: false,
            pointRadius: 0 // Sin puntos en las líneas
        });
    }

    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: equipos[Object.keys(equipos)[0]].fechas, // Usar las fechas del primer equipo
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
                    title: {
                        display: true,
                        text: 'PTS promedio por mes',
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
                        usePointStyle: true,  // Opcional: para que los "botones" sean círculos
                    }
                },
                tooltip: {
                    enabled: false
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

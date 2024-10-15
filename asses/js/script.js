async function cargarCSV(url) {
    const response = await fetch(url);
    const data = await response.text();
    return data;
}

function procesarCSV(data) {
    const lineas = data.split('\n');
    const equiposData = {};

    // Lista de equipos 
    const equiposFiltrados = [  "Boston Celtics", "Dallas Mavericks", "Promedio", 
                            "Atlanta Hawks", "Miami Heat", "Memphis Grizzlies"];

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

const coloresEquipos = {
    "Boston Celtics": '#552583',     // Morado
    "Dallas Mavericks": '#94DD0B ',    // Morado
    "Promedio": '#000000',            // Negro
    "Atlanta Hawks": '#F05D23',       // Naranja
    "Miami Heat": '#F9A800',          // Amarillo
    "Memphis Grizzlies": '#5D76A9'    // violeta
};

function crearGrafico(equipos) {
    const ctx = document.getElementById('myChart').getContext('2d');
    const datasets = [];
    let annotations = [];  // Array para almacenar las anotaciones

    for (const equipo in equipos) {
        datasets.push({
            label: equipo,
            data: equipos[equipo].PTS,
            borderColor: coloresEquipos[equipo] || getRandomColor(), // Usa el color específico o uno aleatorio si no está definido
            borderWidth: equipo === "Promedio" ? 7 : 3, // Línea negra más gruesa para "Promedio"
            pointRadius: equipo === "Promedio" ? 4 : 2, // Línea negra más gruesa para "Promedio"
            fill: false,
            pointBackgroundColor: '#D3D3D3', // Gris claro
        });

        // Anotaciones para Boston Celtics
        if (equipo === "Boston Celtics") {
            const targetPTS = 126;
            const targetIndex = equipos[equipo].PTS.indexOf(targetPTS);

            if (targetIndex !== -1) {
                datasets[datasets.length - 1].pointBackgroundColor = equipos[equipo].PTS.map((pts, index) => index === targetIndex ? 'red' : '#D3D3D3');
                datasets[datasets.length - 1].pointRadius = equipos[equipo].PTS.map((pts, index) => index === targetIndex ? 6 : 2);

                annotations.push({
                    type: 'label',
                    xValue: targetIndex,
                    yValue: targetPTS,
                    content: ['Máximo'],
                    yAdjust: -15,
                });
            }
        }

        // Anotaciones para Memphis Grizzlies
        if (equipo === "Memphis Grizzlies") {
            const targetPTS = 102;
            const targetIndex = 4;

            if (targetIndex !== -1) {
                datasets[datasets.length - 1].pointBackgroundColor = equipos[equipo].PTS.map((pts, index) => index === targetIndex ? 'red' : '#D3D3D3');
                datasets[datasets.length - 1].pointRadius = equipos[equipo].PTS.map((pts, index) => index === targetIndex ? 6 : 2);

                annotations.push({
                    type: 'label',
                    xValue: targetIndex,
                    yValue: targetPTS,
                    content: ['Mínimo'],
                    yAdjust: 18,
                });
            }
        }
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
                    grid: {
                        display: false,
                    },
                },
                y: {
                    min: 100,
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
                    onClick: null,
                    labels: {
                        usePointStyle: true,
                    },
                    title: {
                        display: true,
                        text: 'Equipos',
                    },
                },
                annotation: {
                    annotations: annotations,
                },
                tooltip: {
                    //enabled: false
                }
            }
        }
    });
}




function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color;

    do {
        color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
    } while (color === '#000000'); // Verifica que no sea negro

    return color;
}


// Inicializar el gráfico
async function init() {
    const csvData = await cargarCSV('Datasett/juegos.csv'); 
    const equipos = procesarCSV(csvData);
    crearGrafico(equipos);
}

init();

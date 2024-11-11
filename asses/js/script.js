let myChart; 
let equipoSeleccionado = null; // equipo seleccionado
let audioPlaying = false; // audio está sonando

function reproducirSonido(volumen) {
    audio.volume = volumen;  
    audio.currentTime = 0;  
    audio.play();
}

function calcularVolumen(posicionY, alturaCanvas) {
    const volumen = 1 - (posicionY / alturaCanvas)* 1.5;  
    return Math.max(0, Math.min(volumen, 1));  // 
}

function agregarEventosMouse() {
    const canvas = document.getElementById('myChart');

    canvas.addEventListener('mousemove', (event) => {
        const points = myChart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);
        
        if (points.length) {
            const point = points[0]; // Obtiene el primer punto seleccionado
            const posicionY = point.element.y; // Posición Y del punto
            const alturaCanvas = canvas.clientHeight;
            const volumen = calcularVolumen(posicionY, alturaCanvas); // Calcula el volumen

            // Solo reproduce sonido si hay una única línea visible
            const visibleDatasets = myChart.data.datasets.filter(dataset => !dataset.hidden);
            if (visibleDatasets.length === 1 && !audioPlaying) {
                reproducirSonido(volumen); // Reproduce el sonido si no se está reproduciendo
                audioPlaying = true;
            }
        } else {
            if (audioPlaying) {
                audio.pause(); // Pausa el audio si no hay puntos bajo el mouse
                audioPlaying = false;
            }
        }
    });


}


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

async function procesarCSVDetalles() {
    const data = await cargarCSV('Datasett/equipos.csv')
    const lineas = data.split('\n');
    const equiposDetalles = {};

    lineas.forEach((linea, index) => {
        if (index > 0) {
            const [equipo, campeonatos, ciudad, posicion, conferencia,PTS_por_juego, player, puntos, rebotes, asistencias] = linea.split(',');

            // Guardamos los detalles de cada equipo
            if (equipo) {
                if (!equiposDetalles[equipo]) {
                    equiposDetalles[equipo] = {
                        campeonatos: campeonatos,
                        ciudad: ciudad,
                        posicion: posicion,
                        PTS_por_juego: parseFloat(PTS_por_juego),
                        players: []
                    };
                }

                // Agregar los jugadores y sus estadísticas
                equiposDetalles[equipo].players.push({
                    player: player,
                    puntos: parseFloat(puntos),
                    rebotes: parseFloat(rebotes),
                    asistencias: parseFloat(asistencias)
                });
            }
        }
    });

    return equiposDetalles;
}

async function handleLegendClick(e, legendItem) {
    const index = legendItem.datasetIndex;
    equipoSeleccionado = myChart.data.datasets[index].label; // Guarda el equipo seleccionado
    // Agregar eventos de mouse
    const allHidden = myChart.data.datasets.every(dataset => dataset.hidden || dataset === myChart.data.datasets[index]);

    if (allHidden) { // Ver todos los equipos
        myChart.data.datasets.forEach((dataset) => {
            dataset.hidden = false;
        });
    } else { // Ocultar todos los equipos menos el seleccionado
        myChart.data.datasets.forEach((dataset) => {
            dataset.hidden = true;
        });
        myChart.data.datasets[index].hidden = false;
        agregarEventosMouse();
    }
    
    // Cargar los detalles de los equipos
    const equiposDetalles = await procesarCSVDetalles();

    // Verificar si el equipo existe en los detalles
    if (equiposDetalles[equipoSeleccionado] && allHidden == false) {
        const equipoInfo = equiposDetalles[equipoSeleccionado];  // Detalles del equipo

        // Actualizar la información del equipo en el DOM
        const equipoContainer = document.getElementById('team-info'); // Contenedor donde mostrar la info
        equipoContainer.innerHTML = '';  // Limpiar el contenedor de información

        const nombreEquipo = document.createElement('h2');
        nombreEquipo.innerText = equipoSeleccionado;
        equipoContainer.appendChild(nombreEquipo);

        const campeonatos = document.createElement('p');
        campeonatos.innerText = `Campeonatos: ${equipoInfo.campeonatos}`;
        equipoContainer.appendChild(campeonatos);

        const ciudad = document.createElement('p');
        ciudad.innerText = `Ciudad: ${equipoInfo.ciudad}`;
        equipoContainer.appendChild(ciudad);

        const posicion = document.createElement('p');
        posicion.innerText = `Posición: ${equipoInfo.posicion}`;
        equipoContainer.appendChild(posicion);

        const puntosPorJuego = document.createElement('p');
        puntosPorJuego.innerText = `PTS por Juego: ${equipoInfo.PTS_por_juego}`;
        equipoContainer.appendChild(puntosPorJuego);

        // Título para el jugador destacado
        const playersTitle = document.createElement('h3');
        playersTitle.innerText = `Jugador destacado: ${equipoInfo.players[0].player}`;
        equipoContainer.appendChild(playersTitle);

        // Información del jugador
        const playerInfo = document.createElement('p');
        playerInfo.innerText = `Puntos: ${equipoInfo.players[0].puntos}, Rebotes: ${equipoInfo.players[0].rebotes}, Asistencias: ${equipoInfo.players[0].asistencias}`;
        equipoContainer.appendChild(playerInfo);
    
    } else {
        console.log('No hay información disponible para este equipo');

        const equipoContainer = document.getElementById('team-info'); // Contenedor donde mostrar la info
        equipoContainer.innerHTML = '';  // Limpiar el contenedor de información
    }

    myChart.update();
}




// Crear grafico
function crearGrafico(equipos) {
    const ctx = document.getElementById('myChart').getContext('2d');

    if (myChart) {
        myChart.destroy();
    }

    const datasets = [];
    const colores = ['blue', 'orange', 'pink', 'purple', 'turquoise'];
    let colorIndex = 0; // para los colores

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

    // Crear grafico
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
                    ticks: { autoSkip: true, maxTicksLimit: 10 },
                    grid: { display: false },
                },
                y: {
                    min: 95,
                    max: 130,
                    title: { display: true, text: 'Puntos Promedio' },
                    beginAtZero: true,
                    grid: { display: false },
                }
            },
            plugins: {
                legend: {
                    position: 'left',
                    align: 'start',
                    onClick: handleLegendClick, // evento al hacer clic en un equipo
                    labels: { usePointStyle: true, padding: 35 },
                },
                tooltip: { enabled: true }            
            }
        }
    });


}

// Cambiar conferencia y actualizar grafico
document.getElementById('Conferencias').addEventListener('change', async (event) => {
    const selectedOption = event.target.value;
    const csvData = await cargarCSV('Datasett/juegos.csv'); 
    const equipos = procesarCSV(csvData, selectedOption);

    const equipoContainer = document.getElementById('team-info'); // Contenedor donde mostrar la info
    equipoContainer.innerHTML = '';  // Limpiar el contenedor de información
    
    crearGrafico(equipos);
});

// Inicializar el grafico al cargar la página
async function init() {
    const csvData = await cargarCSV('Datasett/juegos.csv'); 
    const equipos = procesarCSV(csvData, "Central");
    crearGrafico(equipos);
}

init();
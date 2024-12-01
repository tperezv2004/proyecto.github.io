let myChart; // variable grafico
let equipoSeleccionado = null; // equipo seleccionado
let conferencia = ""; // conferencia seleccionada
let ejecucionCamara = ""; // camara ejecutandose
let audioPlaying = null; // Para rastrear el audio en reproducción


const mejorEquipo = new Audio('audio/mejorEquipo.mp4');
const peorEquipo = new Audio('audio/peorEquipo.mp4');


const startButton = document.getElementById('startButton');
let cam = document.getElementById('camara-equipo');
let equipoContainer = document.getElementById('team-info');



//----------------------------------------------- DATOS -----------------------------------------------//
// cargar datos
async function cargarCSV(url) {
    const response = await fetch(url);
    const data = await response.text();
    return data;
}

// datos conferencias
function procesarCSV(data, Division) {
    const lineas = data.split('\n');
    const equiposData = {};

    lineas.forEach((linea, index) => {
        if (index > 0) { 
            const [fecha, equipo, PTS, div, pos] = linea.split(',');
        
            // Solo equipos que estan en la lista filtrada
            if (div && div.includes(Division) && PTS) {
                if (!equiposData[equipo]) {
                    equiposData[equipo] = { fechas: [], PTS: [] };
                }
                // dsp aca hay un if
                equiposData[equipo].fechas.push(fecha);
                equiposData[equipo].PTS.push(parseFloat(PTS));
                equiposData[equipo].pos = pos;
            }
        }
    });

    return equiposData;
}

// datos del equipos
async function procesarCSVDetalles() {
    const data = await cargarCSV('Datasett/equipos.csv')
    const lineas = data.split('\n');
    const equiposDetalles = {};

    lineas.forEach((linea, index) => {
        if (index > 0) {
            const [equipo, campeonatos, ciudad, posicion, conferencia, PTS_por_juego, player, puntos, rebotes, asistencias] = linea.split(',');

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


//---------------------------------------------- EQUIPOS ----------------------------------------------//

async function handleLegendClick(e, legendItem,) {

    
    if (ejecucionCamara == "") { // Solo si no se esta ejecutando la camara
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

        const equiposDetalles = await procesarCSVDetalles();

        // Verificar si el equipo existe en los detalles
        if (equiposDetalles[equipoSeleccionado] && !allHidden) {
            
            const equipoInfo = equiposDetalles[equipoSeleccionado];  // Detalles del equipo

            const equipoContainer = document.getElementById('team-info'); // Contenedor donde esta la info
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

            const puntosPorJuego = document.createElement('p');
            puntosPorJuego.innerText = `Promedio PTS por Juego: ${equipoInfo.PTS_por_juego}`;
            equipoContainer.appendChild(puntosPorJuego);

            // titulo para el jugador destacado
            const playersTitle = document.createElement('h3');
            playersTitle.innerText = `Jugador destacado: ${equipoInfo.players[0].player}`;
            equipoContainer.appendChild(playersTitle);

            // Información del jugador
            const playerInfo = document.createElement('p');
            playerInfo.innerText = `Puntos: ${equipoInfo.players[0].puntos} Rebotes: ${equipoInfo.players[0].rebotes} Asistencias: ${equipoInfo.players[0].asistencias}`;
            equipoContainer.appendChild(playerInfo);

        } else {
            equipoContainer.innerHTML = '';  
        }

        myChart.update();
    }
}


//---------------------------------------------- SONIDO -----------------------------------------------//

function reproducirSonido(audio, volumen) {
    audio.volume = volumen;
    audio.currentTime = 0;
    audio.play();
}

function agregarEventosMouse() {
    const canvas = document.getElementById('myChart');
    const audios = [
        new Audio('audio/audio1.mp4'), 
        new Audio('audio/audio2.mp4'),
        new Audio('audio/audio3.mp4'),
        new Audio('audio/audio4.mp4'), 
        new Audio('audio/audio5.mp4'),
        new Audio('audio/audio6.mp4'),
        new Audio('audio/audio7.mp4')  
    ];

    canvas.addEventListener('mousemove', (event) => {
        const points = myChart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);

        if (points.length) {
            const point = points[0]; // Obtenemos el punto más cercano al cursor
            const posicionY = point.element.y; // Posición vertical del punto
            const alturaCanvas = canvas.clientHeight;

            // Determinar el índice del audio según la posición Y
            let index;
            if (posicionY < alturaCanvas / 7) {
                index = 6; 
            } else if (posicionY < 2 * alturaCanvas / 7) {
                index = 5;
            } else if (posicionY < 3 * alturaCanvas / 7) {
                index = 4;
            } else if (posicionY < 4 * alturaCanvas / 7) {
                index = 3; 
            } else if (posicionY < 5 * alturaCanvas / 7) {
                index = 2;
            } else if (posicionY < 6 * alturaCanvas / 7) {
                index = 1;
            } else {
                index = 0; 
            }
            const audio = audios[index]; 

            const volumen = 1;

            // Reproduce el audio correspondiente si no está ya reproduciendo
            if (audioPlaying !== audio) {
                if (audioPlaying) {
                    audioPlaying.pause();
                    audioPlaying.currentTime = 0;
                }

                reproducirSonido(audio, volumen);
                audioPlaying = audio;
            }
        } else {
            // Detener el audio si no hay puntos seleccionados
            if (audioPlaying) {
                audioPlaying.pause();
                audioPlaying.currentTime = 0;
                audioPlaying = null;
            }
        }
    });

    // Detener el audio cuando el cursor sale del canvas
    canvas.addEventListener('mouseout', () => {
        if (audioPlaying) {
            audioPlaying.pause();
            audioPlaying.currentTime = 0;
            audioPlaying = null;
        }
    });
}


//---------------------------------------------- GRAFICO ----------------------------------------------//

function crearGrafico(equipos, camara) {
    const ctx = document.getElementById('myChart').getContext('2d');

    if (myChart) {
        myChart.destroy();
    }

    const datasets = [];
    const colores = ['blue', 'orange', 'pink', 'purple', 'turquoise'];
    let colorIndex = 0; // para los colores

    for (const equipo in equipos) {

        const CamaraEquipo = equipos[equipo].pos == camara; // camara -1 (peor) 1 (mejor)

        // Si camara es true, ajustamos la opacidad y grosor dinámicamente
        const borderColor = CamaraEquipo ? colores[colorIndex] : `rgba(200, 200, 200, 0.3)`; // Color opaco para otros
        const borderWidth = CamaraEquipo ? 6 : (camara ? 2 : 4); // Más grueso si es mejor_equipo y camara es true
        const pointBackgroundColor = CamaraEquipo ? colores[colorIndex] : '#D3D3D3';

        if (camara != 0) {
            datasets.push({
                label: equipo,
                data: equipos[equipo].PTS,
                borderWidth: borderWidth,
                pointRadius: CamaraEquipo ? 4 : 2,
                pointBackgroundColor: pointBackgroundColor,
                borderColor: borderColor,
            });

            if (equipos[equipo].pos == 1 && camara == 1) {
                cam.innerHTML = `MEJOR EQUIPO<br>${equipo}`; // Uso de template literals para concatenar
            }            
            if (equipos[equipo].pos == - 1 && camara == - 1) {
                cam.innerHTML = `PEOR EQUIPO<br>${equipo}`;
            }

        } else {
            cam.innerHTML = ``;
        
            datasets.push({
                label: equipo,
                data: equipos[equipo].PTS,
                borderWidth: 4,
                pointRadius: 2,
                pointBackgroundColor: '#D3D3D3', 
                borderColor: colores[colorIndex],
            });
        }
        colorIndex++;

    }

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: equipos[Object.keys(equipos)[0]].fechas,
            datasets: datasets,
        },
        options: {
            responsive: true,
            animation: { // IMPRORTANTE
                duration: 1000, // Tiempo de animación (1 segundo)
                easing: 'easeInOutQuad', // Tipo de animación
            },
            scales: {
                x: {
                    ticks: { autoSkip: true, maxTicksLimit: 10 },
                    grid: { display: false },
                    borderColor: 'black',  
                    borderWidth: 1, 
                },
                y: {
                    min: 95,
                    max: 130,
                    title: { display: true, text: 'Puntos Promedio' },
                    beginAtZero: true,
                    grid: { display: false },
                    borderColor: 'black',  // Cambiar el color de la linea del eje Y
                    borderWidth: 1, // Ajusta el grosor de la linea del eje Y
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


//------------------------------------------- CAMARA (BOTON) ------------------------------------------//

startButton.addEventListener('click', async () => { // Cambiado a async
    startButton.disabled = true;

    detectionWindow = window.open(
        '',
        'HandDistanceDetection',
        'width=300,height=200'
    );

    if (!detectionWindow) {
        alert('Failed to open the detection window. Please allow pop-ups.');
        startButton.disabled = false;
        return;
    }

    detectionWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Mover Mano</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background-color: black;
                }
                #video {
                    width: 100%;
                    height: 100%;
                }
            </style>
        </head>
        <body>
            <video id="video" autoplay></video>
            <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs"></script>
            <script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/handpose"></script>
            <script>
                const video = document.getElementById('video');

                async function setupCamera() {
                    try {
                        const stream = await navigator.mediaDevices.getUserMedia({
                            video: { width: 640, height: 480 },
                        });
                        video.srcObject = stream;
                        return new Promise((resolve) => {
                            video.onloadedmetadata = () => {
                                resolve(video);
                            };
                        });
                    } catch (error) {
                        console.error('Error accessing the camera:', error);
                    }
                }

                async function main() {
                    await setupCamera();
                    const model = await handpose.load();
                    video.play();

                    const detectHand = async () => {
                        const predictions = await model.estimateHands(video);
                        if (predictions.length > 0) {
                            const hand = predictions[0];
                            const wrist = hand.landmarks[0];
                            const middleFingerTip = hand.landmarks[12];

                            const distance = Math.sqrt(
                                Math.pow(middleFingerTip[0] - wrist[0], 2) +
                                Math.pow(middleFingerTip[1] - wrist[1], 2) +
                                Math.pow(middleFingerTip[2] - wrist[2], 2)
                            );

                            if (window.opener && !window.opener.closed) {
                                window.opener.updateDistance(distance.toFixed(2));
                            }
                        }
                        requestAnimationFrame(detectHand);
                    };

                    detectHand();
                }

                main();
            </script>
        </body>
        </html>
    `);

    // Detecta si la ventana se cierra y reinicia el botón
    const interval = setInterval(async () => { 
        if (detectionWindow.closed) {
            clearInterval(interval);
            startButton.disabled = false;

            const csvData = await cargarCSV('Datasett/juegos.csv');     
            const equipos = procesarCSV(csvData, conferencia);
            ejecucionCamara = "";
            if (audioPlaying == mejorEquipo || audioPlaying == peorEquipo) {
                if (audioPlaying) {
                    audioPlaying.pause();  
                    audioPlaying.currentTime = 0; 
                    audioPlaying = null; 
                }
            }

            crearGrafico(equipos, 0);
        }

    }, 500);
});

// Función en la ventana principal distancia
window.updateDistance = async function (distacia) {
    
    // Cargar el CSV y procesarlo
    const csvData = await cargarCSV('Datasett/juegos.csv'); 
    const equipos = procesarCSV(csvData, conferencia);
    console.log(conferencia);
    equipoContainer.innerHTML = '';  

    if (distacia <= 250 && ejecucionCamara != "peor") { // peor equipo
        crearGrafico(equipos, - 1);
        ejecucionCamara = "peor";

        if (audioPlaying != peorEquipo) {
            if (audioPlaying) {
                audioPlaying.pause();  
                audioPlaying.currentTime = 0; 
                audioPlaying = null; 
            }
            reproducirSonido(peorEquipo, 1); // Reproducir audio1 con volumen 1
            audioPlaying = peorEquipo; // Guardar el audio actualmente en reproducción
        }


    } else if (distacia > 250 && ejecucionCamara != "mejor") { // mejor equipo
        crearGrafico(equipos, 1);
        ejecucionCamara = "mejor";

        if (audioPlaying != mejorEquipo) {
            if (audioPlaying) {
                audioPlaying.pause();  
                audioPlaying.currentTime = 0; 
                audioPlaying = null; 
            }
            reproducirSonido(mejorEquipo, 1); // Reproducir audio1 con volumen 1
            audioPlaying = mejorEquipo; // Guardar el audio actualmente en reproducción
        }
    }
};


//---------------------------------------------- EXTRA ----------------------------------------------//

// Cambiar conferencia y actualizar grafico
document.getElementById('Conferencias').addEventListener('change', async (event) => {
    const selectedOption = event.target.value;
    const csvData = await cargarCSV('Datasett/juegos.csv'); 
    const equipos = procesarCSV(csvData, selectedOption);
    const equipoContainer = document.getElementById('team-info'); 

    equipoContainer.innerHTML = '';  
    conferencia = selectedOption;
    ejecucionCamara = "";
    if (audioPlaying == mejorEquipo || audioPlaying == peorEquipo) {
        if (audioPlaying) {
            audioPlaying.pause();  
            audioPlaying.currentTime = 0; 
            audioPlaying = null; 
        }
    }

    crearGrafico(equipos, 0);
});

// Inicializar el grafico
async function init() {
    const csvData = await cargarCSV('Datasett/juegos.csv'); 
    const equipos = procesarCSV(csvData, "Central");
    conferencia = "Central";

    crearGrafico(equipos, 0);
}

init();
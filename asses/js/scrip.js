async function cargarCSV(url) {
    const response = await fetch(url);
    const data = await response.text();
    return data;
}

function procesarCSV(data) {
    const lineas = data.split('\n');
    const imagenes = [];

    lineas.forEach((linea, index) => {
        if (index > 0) { // Ignorar primera línea
            const [ruta, mensaje, x, y, width, height] = linea.split(',');
            if (ruta && mensaje && x && y) {
                imagenes.push({ 
                    ruta, 
                    mensaje, 
                    x: parseInt(x), 
                    y: parseInt(y), 
                    width: parseInt(width), 
                    height: parseInt(height) 
                });
            }
        }
    });

    return imagenes;
}

// funcion que cuenta
function contar(){
    for (let i = 1; i <= 10; i++) {
        console.log(i);
    }
}


function crearImagenes(imagenes) {
    const container = document.getElementById('imagenesContainer');

    imagenes.forEach(imagen => {
        const imgElement = document.createElement('img');
        imgElement.src = imagen.ruta;
        imgElement.alt = imagen.mensaje;
        imgElement.style.position = 'absolute';

        imgElement.style.left = `${imagen.x}px`; // posición x
        imgElement.style.top = `${imagen.y}px`;  // posición y

        imgElement.style.width = `${imagen.width}px`;
        imgElement.style.height = `${imagen.height}px`;

        imgElement.addEventListener('click', () => console.log(imagen.mensaje));
        container.appendChild(imgElement);
    });
}



// Cargar el CSV y crear las imágenes
async function init() {
    const csvData = await cargarCSV('Datasett/logos.csv'); 
    const imagenes = procesarCSV(csvData);
    crearImagenes(imagenes);
}

init();

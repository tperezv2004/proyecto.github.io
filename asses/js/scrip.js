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
                    width: width ? parseInt(width) : null, // Si hay width en el CSV, úsalo, de lo contrario null
                    height: height ? parseInt(height) : null // Si hay height en el CSV, úsalo, de lo contrario null
                });
            }
        }
    });

    return imagenes;
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

        // Si hay un valor para width o height, aplícalo
        if (imagen.width) {
            imgElement.style.width = `${imagen.width}px`;
        }
        if (imagen.height) {
            imgElement.style.height = `${imagen.height}px`;
        }

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

// Función para cargar el CSV
async function cargarCSV(url) {
    const response = await fetch(url);
    const data = await response.text();
    return data;
}

// Función para procesar el CSV
function procesarCSV(data) {
    const lineas = data.split('\n');
    const imagenes = [];

    lineas.forEach((linea, index) => {
        if (index > 0) { // Ignora la cabecera
            const [ruta, mensaje, x, y] = linea.split(',');
            if (ruta && mensaje && x && y) {
                imagenes.push({ ruta, mensaje, x: parseInt(x), y: parseInt(y) });
            }
        }
    });

    return imagenes;
}

// Función para crear las imágenes en el HTML
function crearImagenes(imagenes) {
    const container = document.getElementById('imagenesContainer');

    imagenes.forEach(imagen => {
        const imgElement = document.createElement('img');
        imgElement.src = imagen.ruta;
        imgElement.alt = imagen.mensaje;
        imgElement.style.left = `${imagen.x}px`; // Establece la posición x
        imgElement.style.top = `${imagen.y}px`;  // Establece la posición y
        imgElement.addEventListener('click', () => console.log(imagen.mensaje));
        container.appendChild(imgElement);
    });
}

// Cargar el CSV y crear las imágenes
async function init() {
    const csvData = await cargarCSV('Datasett/logos.csv'); // Cambia el nombre si es necesario
    const imagenes = procesarCSV(csvData);
    crearImagenes(imagenes);
}

// Iniciar el script
init();

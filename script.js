const startButton = document.getElementById('startButton');
const distanceDisplay = document.getElementById('distance');
let detectionWindow = null;

startButton.addEventListener('click', () => {
    startButton.disabled = true;
    distanceDisplay.innerText = "Distance: -1"; // Mostrar -1 cuando el botón está desactivado

    detectionWindow = window.open(
        '',
        'HandDistanceDetection',
        'width=500,height=400'
    );

    if (!detectionWindow) {
        alert('Failed to open the detection window. Please allow pop-ups.');
        startButton.disabled = false;
        distanceDisplay.innerText = "Distance: N/A"; // Resetear si falla
        return;
    }

    detectionWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Hand Distance Detection</title>
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
                    width: 2009x;
                    height: 300px;
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
                                window.opener.updateDistance(\`Distance: \${distance.toFixed(2)}\`);
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
    const interval = setInterval(() => {
        if (detectionWindow.closed) {
            clearInterval(interval);
            startButton.disabled = false;
            distanceDisplay.innerText = "Distance: N/A"; // Restablecer cuando se cierra la ventana
        }
    }, 500);
});

// Función en la ventana principal para actualizar la distancia
window.updateDistance = function (distanceText) {
    console.log(distanceText);
    distanceDisplay.innerText = distanceText;
};

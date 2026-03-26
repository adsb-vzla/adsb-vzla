// Manejador que recibe instrucciones del hilo principal (qué URL traer)
onmessage = (e) => {
    // Extrae la dirección (URL) enviada por el hilo principal
    const url = e.data;
    // Inicia la petición para traer datos desde esa URL
    fetch(new Request(url))
        // Cuando llega la respuesta HTTP, procesarla
        .then((response) => {
            // Si la respuesta HTTP no es correcta, crear un error con código y URL
            if (!response.ok) {
                // Lanza el error para que la cadena de promesas lo capture
                throw new Error(`HTTP error! Status: ${response.status} ${response.url}`);
            }
            // Convertir el cuerpo de la respuesta a JSON para su uso
            return response.json();
        })
        // Cuando el JSON ya está disponible, enviarlo de vuelta al hilo principal
        .then((data) => {
            //console.log("worker posting data with url: " + url);
            // Enviar un mensaje al hilo principal con la URL y los datos JSON
            postMessage({ url: url, json: data });
        })
};

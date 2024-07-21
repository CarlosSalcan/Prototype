//------------------------------------------------------> Nuevo Parametro
async function guardarNuevoParametro() {
    const tabla = document.getElementById('tablas').value;
    const nombreParametro = document.getElementById('nombreParametro').value;

    try {
        const response = await fetch(`http://localhost:3000/tics/nuevoParametro/${tabla}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombreParametro: nombreParametro 
            })
        });

        const data = await response.json();
        if (data.success) {
            console.log('Nuevo parámetro guardado correctamente');
            // Aquí puedes realizar alguna acción adicional si el guardado es exitoso
        } else {
            console.error('Error al guardar el nuevo parámetro:', data.message);
            // Aquí puedes manejar el caso en que ocurra un error durante el guardado
        }
    } catch (error) {
        console.error('Error al enviar datos al servidor:', error);
        // Aquí puedes manejar el caso en que ocurra un error al enviar datos al servidor
    }
}
// Evento 'submit' al formulario para capturar el envío del mismo
document.getElementById('nuevoParametroForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    await guardarNuevoParametro();
});

//------------------------------------------------------> Mostrar nuevo id Equipo
async function mostrarProximoCodEquipo() {
    try {
        const response = await fetch(`http://localhost:3000/tics/nextCodEquipo`);
        const data = await response.json();

        if (data.success) {
            document.getElementById('newCod').textContent = data.nextCodEquipo;
        } else {
            console.error('Error al obtener el próximo código de equipo:', data.message);
        }
    } catch (error) {
        console.error('Error al obtener el próximo código de equipo:', error);
    }
}

//------------------------------------------------------> FechaActual para nuevo Equipo
function setearFechaActual() {
    const spanFecha = document.getElementById('newFecha');
    const fechaActual = new Date().toISOString().split('T')[0];
    spanFecha.textContent = fechaActual;
}

//------------------------------------------------------> Obtener Ocpciones SLECT
async function getOptionsFrom(tabla, campo, selectId) {
    try {
        const response = await fetch(`http://localhost:3000/tics/options/${tabla}/${campo}`);
        const data = await response.json();

        if (data.success) {
            const options = data.options;
            const select = document.getElementById(selectId);

            // Limpiar select antes de agregar nuevas opciones
            select.innerHTML = "";

            // Crear y agregar las opciones al select de manera eficiente
            const fragment = document.createDocumentFragment();
            options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.textContent = option;
                fragment.appendChild(optionElement);
            });
            select.appendChild(fragment);
        } else {
            console.error('Error al obtener opciones:', data.message);
        }
    } catch (error) {
        console.error('Error al obtener opciones:', error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    mostrarProximoCodEquipo();
    setearFechaActual();
    //-------------------------------> Selects NEW Equipo
    getOptionsFrom('param_tipo_equipo', 'nom_te', 'newTipoEquipo');
    getOptionsFrom('param_piso', 'nom_piso', 'newPisos');
    getOptionsFrom('param_servicio', 'nom_servicio', 'newDepartamentos');
});




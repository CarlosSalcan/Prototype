async function mostrarContenidoTabla(tipEquipo, mostrar, modalID) {
    const resultsElement = document.getElementById(mostrar);

    if (!resultsElement) {
        console.error(`Tabla with ID '${mostrar}' not encontrada`);
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/tics/equipos?tip_equipo=${tipEquipo}`);
        const data = await response.json();

        if (data.success && data.equipos.length > 0) {
            const equipos = data.equipos;
            const html = equipos.map(equipo => {
                const fecha = new Date(equipo.fec_reg).toISOString().split('T')[0]; // Obtener solo la parte de la fecha
                return `<tr>
                            <td>${equipo.cod_equipo}</td>
                            <td>${fecha}</td>
                            <td>${equipo.cod_almacen}</td>
                            <td>${equipo.tip_equipo}</td>
                            <td>${equipo.piso_ubic}</td>
                            <td>${equipo.serv_depar}</td>
                            <td>${equipo.nom_custodio}</td>
                            <td>${equipo.nom_usua}</td>
                            <td><button class="edit-btn" id="openModalBtn" 
                                    onclick="llenarCampos('${equipo.cod_equipo}', 
                                                            '${fecha}', 
                                                            '${equipo.cod_almacen}', 
                                                            '${equipo.tip_equipo}', 
                                                            '${equipo.piso_ubic}', 
                                                            '${equipo.serv_depar}', 
                                                            '${equipo.nom_custodio}', 
                                                            '${equipo.nom_usua}'), 
                                                mostrarVentanaEmergente('${modalID}')">Equipo</button>
                            </td>
                        </tr>`;
            }).join('');
            resultsElement.innerHTML = `<table>${html}</table>`;
        } else {
            resultsElement.innerHTML = '<p>No se encontraron equipos.</p>';
        }
    } catch (error) {
        resultsElement.innerHTML = '<p>Ocurrió un error al cargar el contenido de la tabla.</p>';
    }
}

async function getOptionsFrom(tabla, campo, selectId) {
    const select = document.getElementById(selectId);

    if (!select) {
        console.error(`Element with ID '${selectId}' not found`);
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/tics/options/${tabla}/${campo}`);
        const data = await response.json();

        if (data.success) {
            const options = data.options;
            const select = document.getElementById(selectId);

            if (!select) {
                console.error(`Element with ID '${selectId}' no encontrado`);
                return;
            }

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

function llenarCampos(codEquipo, fecha, codAlmacen, tipoEquipo, piso, departamento, titular, tecnico) {
    document.getElementById('cod').textContent = codEquipo;
    document.getElementById('fecha').textContent = fecha;
    document.getElementById('codAlmacen').value = codAlmacen;
    document.getElementById('tipoEquipo').value = tipoEquipo;
    document.getElementById('pisos').value = piso;
    document.getElementById('departamentos').value = departamento;
    document.getElementById('titularEq').value = titular;
    document.getElementById('tecnico').textContent = tecnico;
}

function guardarCambiosEq() {
    const codEquipo = document.getElementById('cod').textContent;
    const newCodAlmacen = document.getElementById('codAlmacen').value;
    const newTipoEquipo = document.getElementById('tipoEquipo').value;
    const newPiso = document.getElementById('pisos').value;
    const newDepartamento = document.getElementById('departamentos').value;
    const newTitular = document.getElementById('titularEq').value;

    // Mostrar ventana de confirmación al usuario
    const confirmacion = confirm(`¿Estás seguro de guardar los siguientes cambios?
        Código de Equipo: ${codEquipo}
        Código de Almacén: ${newCodAlmacen}
        Tipo de Equipo: ${newTipoEquipo}
        Piso: ${newPiso}
        Departamento: ${newDepartamento}
        Titular: ${newTitular}`
    );

    if (!confirmacion) {
        return; // Si el usuario cancela, no hacemos nada
    }

    fetch(`http://localhost:3000/tics/editEquipos/${codEquipo}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            codEquipo: codEquipo,
            nuevoCodAlmacen: newCodAlmacen,
            nuevoTipoEquipo: newTipoEquipo,
            nuevoPiso: newPiso,
            nuevoDepartamento: newDepartamento,
            nuevoTitular: newTitular
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al guardar cambios en el equipo');
            }
            return response.json();
        })
        .then(data => {
            console.log(data.message);
            mostrarMensaje('Equipo Modificado Correctamente', 3000);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

async function enviarBodega() {
    const codEquipo = document.getElementById('cod').innerText;
    try {
        // Obtener información del equipo
        const equipoResponse = await fetch(`http://localhost:3000/tics/equipoB/${codEquipo}`);
        const equipoData = await equipoResponse.json();

        // Mostrar ventana de confirmación al usuario
        const confirmacion = confirm(`¿Estás seguro de enviar a bodega el siguiente equipo?
            Código: ${equipoData.equipo.cod_equipo}
            Ubicación Actual: ${equipoData.equipo.piso_ubic}
            Serv/Depar Actual: ${equipoData.equipo.serv_depar}
            Custodio Actual: ${equipoData.equipo.nom_custodio}

            El equipo será modificado a:
            Nueva Ubicación: SUBSUELO
            Serv/Depar Nuevo: BODEGA / ACTIVOS FIJOS
            Nuevo Custodio: LIBRE`
        );
        if (!confirmacion) {
            return; // Si el usuario cancela, no hacemos nada
        }

        // Actualizar información del equipo
        const response = await fetch(`http://localhost:3000/tics/enviarBodega/${codEquipo}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                piso_ubic: 'SUBSUELO',
                serv_depar: 'BODEGA / ACTIVOS FIJOS',
                nom_custodio: 'LIBRE'
            })
        });

        const data = await response.json();
        if (data.success) {
            console.log('Equipo Guardado en Bodega Correctamente');
            mostrarMensaje('Equipo Guardado en Bodega Correctamente', 3000);
        } else {
            console.error('Error al editar equipo:', data.message);
        }
    } catch (error) {
        console.error('Error al editar equipo:', error);
    }
}

function marcarCheckBoxes(data, mapping) {
    Object.keys(mapping).forEach(key => {
        const checkbox = document.getElementById(mapping[key]);
        if (checkbox) {
            checkbox.checked = data[key] === 'SI';
        }
    });
}

//-------------------------------> PC DE ESCRITORIO
function actualizarCamposAntivirus() {
    const nuevoPoseeAntivirus = document.getElementById('poseeAntivirus').value;
    const antivirusCPU = document.getElementById('antivirus');
    const verAntivirus = document.getElementById('verAntivirus');

    if (nuevoPoseeAntivirus === 'NO') {
        antivirusCPU.value = ''; // Establecer en blanco
        verAntivirus.value = ''; // Establecer en blanco
    }
}

const escritorioMapping = {
    red_fija: 'redFija',
    red_inalam: 'redInalam',
    bluetooth: 'bluetooth',
    lec_tarjeta: 'lectorTarjeta'
};

function mostrarDatosCPU(cpu) {
    document.getElementById('nombreHost').value = cpu.nom_hots;
    document.getElementById('nomUsuario').value = cpu.nom_usuario;
    document.getElementById('generacion').value = cpu.ip_equipo;

    document.getElementById('poseeAntivirus').value = cpu.antivirus;
    document.getElementById('antivirus').value = cpu.nom_antivirus;
    document.getElementById('verAntivirus').value = cpu.ver_antivirus;
    actualizarCamposAntivirus();

    document.getElementById('tec').textContent = cpu.nom_usua;
    document.getElementById('codigo').textContent = cpu.cod_cpu;
    document.getElementById('codigoEq').value = cpu.cod_equipo;
    document.getElementById('codigotics').value = cpu.cod_tics_cpu;
    document.getElementById('marcas').value = cpu.mar_cpu;

    document.getElementById('numSerie').value = cpu.ser_cpu;
    document.getElementById('Mainboard').value = cpu.tar_madre;
    document.getElementById('procesador').value = cpu.procesador;
    document.getElementById('velocidadProce').value = cpu.velocidad;
    document.getElementById('ram').value = cpu.memoria;
    document.getElementById('hdd').value = cpu.tam_hdd;
    document.getElementById('disOpticos').value = cpu.disp_optico;

    document.getElementById('sisOperativo').value = cpu.sis_ope;
    document.getElementById('office').value = cpu.office;

    document.getElementById('condicion').value = cpu.con_cpu;
    document.getElementById('observacionTxt').value = cpu.observacion;

    marcarCheckBoxes(cpu, escritorioMapping);
}

function mostrarDatosMTR(mtr) {
    document.getElementById('codigoMTR').textContent = mtr.cod_monitor;
    document.getElementById('codigoticsMTR').value = mtr.cod_tics_monitor;
    document.getElementById('codigoEqMTR').value = mtr.cod_equipo;
    document.getElementById('tecMTR').textContent = mtr.nom_usua;
    document.getElementById('marcasMTR').value = mtr.mar_monitor;
    document.getElementById('modeloMTR').value = mtr.mod_monitor;
    document.getElementById('tamanoMTR').value = mtr.tam_monitor;
    document.getElementById('serieMTR').value = mtr.ser_monitor;
    document.getElementById('condicionMTR').value = mtr.con_monitor;
    document.getElementById('estadoMTR').value = mtr.est_monitor;
    document.getElementById('observacionTxtM').value = mtr.observacion;
}

function mostrarDatosTCD(tcd) {
    document.getElementById('codigoTCD').textContent = tcd.cod_teclado;
    document.getElementById('codigoticsTCD').value = tcd.cod_tics_teclado;
    document.getElementById('codigoEqTCD').value = tcd.cod_equipo;
    document.getElementById('tecTCD').textContent = tcd.nom_usua;
    document.getElementById('marcasTCD').value = tcd.mar_teclado;
    document.getElementById('puertoTCD').value = tcd.pue_teclado;
    document.getElementById('tipoTCD').value = tcd.tip_teclado;
    document.getElementById('serieTCD').value = tcd.ser_teclado;
    document.getElementById('modeloTCD').value = tcd.mod_teclado;
    document.getElementById('condicionTCD').value = tcd.con_teclado;
    document.getElementById('estadoTCD').value = tcd.est_teclado;
    document.getElementById('observacionTxtTCD').value = tcd.obs_teclado;
}

function mostrarDatosMS(ms) {
    document.getElementById('codigoMS').textContent = ms.cod_mouse;
    document.getElementById('codigoticsMS').value = ms.cod_tics_mouse;
    document.getElementById('codigoEqMS').value = ms.cod_equipo;
    document.getElementById('tecMS').textContent = ms.nom_usua;
    document.getElementById('marcasMS').value = ms.mar_mouse;
    document.getElementById('puertoMS').value = ms.puerto;
    document.getElementById('tipoMS').value = ms.tip_mouse;
    document.getElementById('serieMS').value = ms.ser_mouse;
    document.getElementById('modeloMS').value = ms.mod_mouse;
    document.getElementById('condicionMS').value = ms.con_mouse;
    document.getElementById('estadoMS').value = ms.est_mouse;
    document.getElementById('observacionTxtMS').value = ms.obs_mouse;
}

async function obtenerDatosTabla(tabla, codEquipo) {
    try {
        const response = await fetch(`http://localhost:3000/tics/datosTabla/${tabla}/${codEquipo}`);
        const data = await response.json();

        if (data.success) {
            const componente = data[tabla]; // Acceder correctamente a los datos del componente
            console.log("Datos de la tabla:", componente);
            // Verificar la tabla y llamar a la función correspondiente
            if (tabla === "cpu_equipo") {
                mostrarDatosCPU(componente);
            } else if (tabla === "monitor") {
                mostrarDatosMTR(componente);
            } else if (tabla === "mouse") {
                mostrarDatosMS(componente);
            } else if (tabla === "teclado") {
                mostrarDatosTCD(componente);
            } else if (tabla === "laptop") {
                mostrarDatosPLT(componente);
            } else if (tabla === "impresora") {
                mostrarDatosIMP(componente);
            } else if (tabla === "telefono") {
                mostrarDatosTLF(componente);
            } else {
                console.error("Tabla desconocida:", tabla);
            }
        } else {
            console.error('Error al obtener datos de la tabla:', data.message);
        }
    } catch (error) {
        console.error('Error al obtener datos de la tablaa:', error);
    }
}

async function guardarCambiosCPU() {
    try {
        const codCPU = document.getElementById('codigo').textContent;
        const codEquipo = document.getElementById('codigoEq').value;
        const codTicsCPU = document.getElementById('codigotics').value;
        const nuevaMarcaCPU = document.getElementById('marcas').value;
        const nuevoNumSerieCPU = document.getElementById('numSerie').value;
        const nuevoMainboard = document.getElementById('Mainboard').value;
        const nuevoProcesador = document.getElementById('procesador').value;
        const nuevaVelocidadProcesador = document.getElementById('velocidadProce').value;
        const nuevaRam = document.getElementById('ram').value;
        const nuevoHDD = document.getElementById('hdd').value;
        const nuevoDispositivoOptico = document.getElementById('disOpticos').value;

        // Verifica el estado de los checkboxs
        const redFija = document.getElementById('redFija').checked ? 'SI' : 'NO';
        const redInalambrica = document.getElementById('redInalam').checked ? 'SI' : 'NO';
        const bluetooth = document.getElementById('bluetooth').checked ? 'SI' : 'NO';
        const lectorTarjeta = document.getElementById('lectorTarjeta').checked ? 'SI' : 'NO';

        const nuevoSisOperativo = document.getElementById('sisOperativo').value;
        const nuevoOffice = document.getElementById('office').value;

        const nuevoPoseeAntivirus = document.getElementById('poseeAntivirus').value;
        let nuevoNomAntivirus = document.getElementById('antivirus').value;
        let nuevaVerAntivirus = document.getElementById('verAntivirus').value;

        // Verifica si nuevoPoseeAntivirus es "NO" y ajusta los campos correspondientes
        if (nuevoPoseeAntivirus === 'NO') {
            nuevoNomAntivirus = '';
            nuevaVerAntivirus = '';
        }

        const nuevoHost = document.getElementById('nombreHost').value;
        const nuevoUsuario = document.getElementById('nomUsuario').value;
        const nuevaGeneracion = document.getElementById('generacion').value;
        const nuevaCondicion = document.getElementById('condicion').value;
        const nuevoEstado = document.getElementById('estado').value;
        const nuevaObservacion = document.getElementById('observacionTxt').value;

        // Mostrar ventana de confirmación al usuario
        const confirmacion = confirm(`¿Estás seguro de guardar los siguientes cambios?
\u2022 Cod CPU: ${codCPU}         \u2022 Cod Equipo: ${codEquipo}         \u2022 TICS: ${codTicsCPU}
\u2022 Titular: ${nuevoUsuario}     \u2022 Host: ${nuevoHost}
\u2022 Condicion: ${nuevaCondicion}     \u2022 Estado: ${nuevoEstado}\n
\u2022 Num Serie: ${nuevoNumSerieCPU}         
\u2022 Marca: ${nuevaMarcaCPU}
\u2022 Tar Madre: ${nuevoMainboard}         
\u2022 HDD: ${nuevoHDD}                     \u2022 RAM: ${nuevaRam}
\u2022 Procesador: ${nuevoProcesador}         \u2022 Velocidad: ${nuevaVelocidadProcesador}
\u2022 Sis Ope: ${nuevoSisOperativo}        \u2022 Office: ${nuevoOffice}\n
\u2022 Red Fija: ${redFija}         \u2022 Bluetoot: ${bluetooth}
\u2022 Red Inalam: ${redInalambrica}         \u2022 Lec. Tarjeta:${lectorTarjeta}
\u2022 Disp Opt: ${nuevoDispositivoOptico}\n
\u2022 Posee Antivirus: ${nuevoPoseeAntivirus}   \u2022 Nombre: ${nuevoNomAntivirus}   \u2022 Version: ${nuevaVerAntivirus}`
        );

        if (!confirmacion) {
            return; // Si el usuario cancela, no hacemos nada
        }

        // Envía los datos al servidor
        const response = await fetch(`http://localhost:3000/tics/cpuModificado/${codEquipo}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                codCPU: codCPU,
                codEquipo: codEquipo,
                codTicsCPU: codTicsCPU,
                nuevaMarcaCPU: nuevaMarcaCPU,
                nuevoNumSerieCPU: nuevoNumSerieCPU,
                nuevoMainboard: nuevoMainboard,
                nuevoProcesador: nuevoProcesador,
                nuevaVelocidadProcesador: nuevaVelocidadProcesador,
                nuevaRam: nuevaRam,
                nuevoHDD: nuevoHDD,
                nuevoDispositivoOptico: nuevoDispositivoOptico,
                redFija: redFija,
                redInalambrica: redInalambrica,
                bluetooth: bluetooth,
                lectorTarjeta: lectorTarjeta,
                sistemaOperativo: nuevoSisOperativo,
                office: nuevoOffice,
                antivirus: nuevoPoseeAntivirus,
                nomAntivirus: nuevoNomAntivirus,
                verAntivirus: nuevaVerAntivirus,
                nomHost: nuevoHost,
                nomUsuario: nuevoUsuario,
                generacion: nuevaGeneracion,
                condicion: nuevaCondicion,
                estado: nuevoEstado,
                observacion: nuevaObservacion
            })
        });

        // Maneja la respuesta del servidor aquí
        const data = await response.json();
        if (data.success) {
            console.log('Cambios guardados correctamente');
        } else {
            console.error('Error al guardar los cambios:', data.message);
        }
    } catch (error) {
        console.error('Error al guardar los cambios:', error);
    }
}

async function guardarCambiosMTR() {
    try {
        const codMTR = document.getElementById('codigoMTR').textContent;
        const codEquipo = document.getElementById('codigoEqMTR').value;
        const codTicsMTR = document.getElementById('codigoticsMTR').value;
        const nuevaMarcaMTR = document.getElementById('marcasMTR').value;
        const nuevoModeloMTR = document.getElementById('modeloMTR').value;
        const nuevoNumSerieMTR = document.getElementById('serieMTR').value;
        const nuevoTamMTR = document.getElementById('tamanoMTR').value;

        const nuevaConMTR = document.getElementById('condicionMTR').value;
        const nuevoEstMTR = document.getElementById('estadoMTR').value;
        const nuevaObservacionMTR = document.getElementById('observacionTxtM').value;

        // Mostrar ventana de confirmación al usuario
        const confirmacion = confirm(`¿Estás seguro de guardar los siguientes cambios?\n
\u2022 Cod MTR: ${codMTR}         \u2022 Cod Eq: ${codEquipo}          \u2022 TICS: ${codTicsMTR}
\u2022 Condicion: ${nuevaConMTR}     \u2022 Estado: ${nuevoEstMTR}\n
\u2022 Num Serie: ${nuevoNumSerieMTR}         \u2022 Modelo: ${nuevoModeloMTR} 
\u2022 Marca: ${nuevaMarcaMTR}         \u2022 Tamaño: ${nuevoTamMTR}`
        );

        if (!confirmacion) {
            return; // Si el usuario cancela, no hacemos nada
        }

        // Envía los datos al servidor
        const response = await fetch(`http://localhost:3000/tics/mtrModificado/${codEquipo}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                codMTR: codMTR,
                codEquipo: codEquipo,
                codTicsMTR: codTicsMTR,
                nuevaMarcaMTR: nuevaMarcaMTR,
                nuevoModeloMTR: nuevoModeloMTR,
                nuevoNumSerieMTR: nuevoNumSerieMTR,
                nuevoTamMTR: nuevoTamMTR,
                nuevaConMTR: nuevaConMTR,
                nuevoEstMTR: nuevoEstMTR,
                nuevaObservacionMTR: nuevaObservacionMTR
            })
        });

        // Maneja la respuesta del servidor aquí
        const data = await response.json();
        if (data.success) {
            console.log('Cambios guardados correctamente');
            console.log('CONSULTA EJECUTA VER:', data);
        } else {
            console.error('Error al guardar los cambios MTR:', data.message);
            console.log('CONSULTA EJECUTA VER:', data);
        }
    } catch (error) {
        console.error('Error al guardar los cambios mtr:', error);
    }
}

async function guardarCambiosTCD() {
    try {
        const cod = document.getElementById('codigoTCD').textContent;
        const codEq = document.getElementById('codigoEqTCD').value;
        const codTics = document.getElementById('codigoticsTCD').value;
        const marca = document.getElementById('marcasTCD').value;
        const modelo = document.getElementById('modeloTCD').value;
        const serie = document.getElementById('serieTCD').value;
        const tipo = document.getElementById('tipoTCD').value;
        const puerto = document.getElementById('puertoTCD').value;

        const condicion = document.getElementById('condicionTCD').value;
        const estado = document.getElementById('estadoTCD').value;
        const observacion = document.getElementById('observacionTxtTCD').value;

        const confirmacion = confirm(`¿Estás seguro de guardar los siguientes cambios?\n
\u2022 Cod TCD: ${cod}         \u2022 Cod Eq: ${codEq}          \u2022 TICS: ${codTics}
\u2022 Condicion: ${condicion}     \u2022 Estado: ${estado}\n
\u2022 Num Serie: ${serie}
\u2022 Puerto: ${puerto}       \u2022 Modelo: ${modelo} 
\u2022 Marca: ${marca}         \u2022 Tipo: ${tipo}`
        );

        if (!confirmacion) {
            return; // Si el usuario cancela, no hacemos nada
        }

        // Envía los datos al servidor
        const response = await fetch(`http://localhost:3000/tics/tcdModificado/${codEq}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                codTCD: cod,
                codEquipo: codEq,
                codTicsTCD: codTics,
                nuevaMarcaTCD: marca,
                nuevoModeloTCD: modelo,
                nuevoNumSerieTCD: serie,
                nuevoTipoTCD: tipo,
                nuevoPuertoTCD: puerto,
                nuevaConTCD: condicion,
                nuevoEstTCD: estado,
                nuevaObservacionTCD: observacion
            })
        });

        // Maneja la respuesta del servidor aquí
        const data = await response.json();
        if (data.success) {
            console.log('Cambios guardados correctamente');
        } else {
            console.error('Error al guardar los cambios:', data.message);
        }
    } catch (error) {
        console.error('Error al guardar los cambios:', error);
    }
}

async function guardarCambiosMS() {
    try {
        const cod = document.getElementById('codigoMS').textContent;
        const codEq = document.getElementById('codigoEqMS').value;
        const codTics = document.getElementById('codigoticsMS').value;
        const marca = document.getElementById('marcasMS').value;
        const modelo = document.getElementById('modeloMS').value;
        const serie = document.getElementById('serieMS').value;
        const tipo = document.getElementById('tipoMS').value;
        const puerto = document.getElementById('puertoMS').value;

        const condicion = document.getElementById('condicionMS').value;
        const estado = document.getElementById('estadoMS').value;
        const observacion = document.getElementById('observacionTxtMS').value;

        const confirmacion = confirm(`¿Estás seguro de guardar los siguientes cambios?\n
\u2022 Cod MS: ${cod}         \u2022 Cod Eq: ${codEq}          \u2022 TICS: ${codTics}
\u2022 Condicion: ${condicion}     \u2022 Estado: ${estado}\n
\u2022 Num Serie: ${serie}
\u2022 Puerto: ${puerto}       \u2022 Modelo: ${modelo} 
\u2022 Marca: ${marca}         \u2022 Tipo: ${tipo}`
        );

        if (!confirmacion) {
            return; // Si el usuario cancela, no hacemos nada
        }

        // Envía los datos al servidor
        const response = await fetch(`http://localhost:3000/tics/msModificado/${codEq}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                codMS: cod,
                codEquipo: codEq,
                codTicsMS: codTics,
                nuevaMarcaMS: marca,
                nuevoModeloMS: modelo,
                nuevoNumSerieMS: serie,
                nuevoTipoMS: tipo,
                nuevoPuertoMS: puerto,
                nuevaConMS: condicion,
                nuevoEstMS: estado,
                nuevaObservacionMS: observacion
            })
        });

        // Maneja la respuesta del servidor aquí
        const data = await response.json();
        if (data.success) {
            console.log('Cambios guardados correctamente');
        } else {
            console.error('Error al guardar los cambios:', data.message);
        }
    } catch (error) {
        console.error('Error al guardar los cambios:', error);
    }
}

//-------------------------------> PORTATIL
const portatilMapping = {
    red_laptop: 'redFija',
    wif_laptop: 'redInalam',
    blu_laptop: 'bluetooth',
    tar_laptop: 'lectorTarjeta'
};

function mostrarDatosPLT(plt) {
    document.getElementById('nombreHost').value = plt.nom_hots_laptop;
    document.getElementById('nomUsuario').value = plt.nom_usuario_laptop;

    document.getElementById('poseeAntivirus').value = plt.antv_laptop;
    document.getElementById('antivirus').value = plt.nom_antv_laptop;
    document.getElementById('verAntivirus').value = plt.ver_antv_laptop;
    actualizarCamposAntivirus();

    document.getElementById('tec').textContent = plt.nom_usua;
    document.getElementById('codigo').textContent = plt.cod_laptop;
    document.getElementById('codigoEq').value = plt.cod_equipo;
    document.getElementById('codigotics').value = plt.cod_tics_laptop;
    document.getElementById('marcas').value = plt.mar_laptop;

    document.getElementById('numSerie').value = plt.ser_laptop;
    document.getElementById('modelo').value = plt.mod_laptop;
    document.getElementById('procesador').value = plt.pro_laptop;
    document.getElementById('velocidadProce').value = plt.vel_laptop;
    document.getElementById('ram').value = plt.mem_laptop;
    document.getElementById('hdd').value = plt.hdd_laptop;
    document.getElementById('disOpticos').value = plt.dop_laptop;

    document.getElementById('sisOperativo').value = plt.so_laptop;
    document.getElementById('office').value = plt.off_laptop;

    document.getElementById('estado').value = plt.est_laptop;
    document.getElementById('observacionTxt').value = plt.observacion_laptop;

    marcarCheckBoxes(plt, portatilMapping);
}

async function guardarCambiosPTL() {
    try {
        const cod = document.getElementById('codigo').textContent;
        const codEquipo = document.getElementById('codigoEq').value;
        const codTics = document.getElementById('codigotics').value;
        const nuevaMarca = document.getElementById('marcas').value;
        const nuevoNumSerie = document.getElementById('numSerie').value;
        const nuevoModelo = document.getElementById('modelo').value;
        const nuevoProcesador = document.getElementById('procesador').value;
        const nuevaVelocidad = document.getElementById('velocidadProce').value;
        const nuevaRam = document.getElementById('ram').value;
        const nuevoHDD = document.getElementById('hdd').value;
        const nuevoDispOptico = document.getElementById('disOpticos').value;

        // Verifica el estado de los checkboxs
        const redFija = document.getElementById('redFija').checked ? 'SI' : 'NO';
        const redInalambrica = document.getElementById('redInalam').checked ? 'SI' : 'NO';
        const bluethooth = document.getElementById('bluetooth').checked ? 'SI' : 'NO';
        const lectorTarjeta = document.getElementById('lectorTarjeta').checked ? 'SI' : 'NO';

        const nuevoSisOperativo = document.getElementById('sisOperativo').value;
        const nuevoOffice = document.getElementById('office').value;

        const nuevoPoseeAntivirus = document.getElementById('poseeAntivirus').value;
        let nuevoNomAntivirus = document.getElementById('antivirus').value;
        let nuevaVerAntivirus = document.getElementById('verAntivirus').value;

        const nuevoHost = document.getElementById('nombreHost').value;
        const nuevoUsuario = document.getElementById('nomUsuario').value;
        const nuevoEstado = document.getElementById('estado').value;
        const nuevaObservacion = document.getElementById('observacionTxt').value;

        // Verifica si nuevoPoseeAntivirus es "NO" y ajusta los campos correspondientes
        if (nuevoPoseeAntivirus === 'NO') {
            nuevoNomAntivirus = '';
            nuevaVerAntivirus = '';
        }

        const confirmacion = confirm(`¿Estás seguro de guardar los siguientes cambios?\n
\u2022 Cod PTL: ${cod}         \u2022 Cod Eq: ${codEquipo}          \u2022 TICS: ${codTics}
\u2022 Titular: ${nuevoUsuario}     \u2022 Host: ${nuevoHost}     \u2022 Estado: ${nuevoEstado}\n
\u2022 Num Serie: ${nuevoNumSerie}                     \u2022 Modelo: ${nuevoModelo}
\u2022 Marca: ${nuevaMarca}
\u2022 HDD: ${nuevoHDD}                     \u2022 RAM: ${nuevaRam}
\u2022 Procesador: ${nuevoProcesador}         \u2022 Velocidad: ${nuevaVelocidad}
\u2022 Sis Ope: ${nuevoSisOperativo}        \u2022 Office: ${nuevoOffice}\n
\u2022 Red Fija: ${redFija}           \u2022 Bluetoot: ${bluethooth}
\u2022 Red Inalam: ${redInalambrica}         \u2022 Lec. Tarjeta:${lectorTarjeta}
\u2022 Disp Opt: ${nuevoDispOptico}\n
\u2022 Posee Antivirus: ${nuevoPoseeAntivirus}   \u2022 Nombre: ${nuevoNomAntivirus}   \u2022 Version: ${nuevaVerAntivirus}`
        );

        if (!confirmacion) {
            return; // Si el usuario cancela, no hacemos nada
        }

        // Envía los datos al servidor
        const response = await fetch(`http://localhost:3000/tics/laptopModificada/${codEquipo}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                codPTL: cod, codEquipo: codEquipo, codTics: codTics, marca: nuevaMarca,
                modelo: nuevoModelo, serie: nuevoNumSerie, procesador: nuevoProcesador,
                velocidad: nuevaVelocidad, memoria: nuevaRam, hdd: nuevoHDD, dispOpt: nuevoDispOptico,
                red: redFija, wifi: redInalambrica, bluethooth: bluethooth, tarjeta: lectorTarjeta,
                sisOpe: nuevoSisOperativo, office: nuevoOffice, antivirus: nuevoPoseeAntivirus,
                nomAnt: nuevoNomAntivirus, verAnt: nuevaVerAntivirus, host: nuevoHost, usuario: nuevoUsuario,
                estado: nuevoEstado, observacion: nuevaObservacion
            })
        });

        // Maneja la respuesta del servidor aquí
        const data = await response.json();
        if (data.success) {
            console.log('Cambios guardados correctamente');
        } else {
            console.error('Error al guardar los cambios PTL:', data.message);
        }
    } catch (error) {
        console.error('Error al guardar los cambios PTL:', error);
    }
}

//-------------------------------> IMPRESORA
function mostrarDatosIMP(imp) {
    document.getElementById('tec').textContent = imp.nom_usua;
    document.getElementById('codigo').textContent = imp.cod_impresora;
    document.getElementById('codigoEq').value = imp.cod_equipo;
    document.getElementById('codigotics').value = imp.cod_tics_impresora;
    document.getElementById('marcas').value = imp.mar_imp;
    document.getElementById('numSerie').value = imp.ser_imp;
    document.getElementById('tipoIMP').value = imp.tip_imp;
    document.getElementById('puerto').value = imp.pue_imp;
    document.getElementById('modelo').value = imp.mod_imp;
    document.getElementById('estado').value = imp.est_imp;
    document.getElementById('condicion').value = imp.con_imp;
    document.getElementById('observacionTxt').value = imp.obs_imp;
}

async function guardarCambiosIMP() {
    try {
        const cod = document.getElementById('codigo').textContent;
        const codEquipo = document.getElementById('codigoEq').value;
        const codTics = document.getElementById('codigotics').value;
        const nuevoNumSerie = document.getElementById('numSerie').value;
        const nuevaCondi = document.getElementById('condicion').value;
        const nuevoEstado = document.getElementById('estado').value;
        const nuevoTipo = document.getElementById('tipoIMP').value;
        const nuevoModelo = document.getElementById('modelo').value;
        const nuevaMarca = document.getElementById('marcas').value;
        const nuevoPuerto = document.getElementById('puerto').value;

        const nuevaIP = document.getElementById('ip').value;
        const nuevaObservacion = document.getElementById('observacionTxt').value;

        const confirmacion = confirm(`¿Estás seguro de guardar los siguientes cambios?\n
\u2022 Cod IMP: ${cod}         \u2022 Cod Eq: ${codEquipo}          \u2022 TICS: ${codTics}
\u2022 Condicion: ${nuevaCondi}     \u2022 Estado: ${nuevoEstado}\n
\u2022 Num Serie: ${nuevoNumSerie}     \u2022 IP: ${nuevaIP}
\u2022 Puerto: ${nuevoPuerto}       \u2022 Modelo: ${nuevoModelo} 
\u2022 Marca: ${nuevaMarca}         \u2022 Tipo: ${nuevoTipo}`
        );

        if (!confirmacion) {
            return; // Si el usuario cancela, no hacemos nada
        }

        // Envía los datos al servidor
        const response = await fetch(`http://localhost:3000/tics/impresoraModificada/${codEquipo}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                codIMP: cod, codEquipo: codEquipo, codTics: codTics, marca: nuevaMarca, modelo: nuevoModelo,
                serie: nuevoNumSerie, tipo: nuevoTipo, puerto: nuevoPuerto, condicion: nuevaCondi, ip: nuevaIP,
                estado: nuevoEstado, observacion: nuevaObservacion
            })
        });

        // Maneja la respuesta del servidor aquí
        const data = await response.json();
        if (data.success) {
            console.log('Cambios guardados correctamente');
        } else {
            console.error('Error al guardar los cambios IMP:', data.message);
        }
    } catch (error) {
        console.error('Error al guardar los cambios IMP:', error);
    }
}

//-------------------------------> TELEFONO
function mostrarDatosTLF(imp) {
    document.getElementById('tec').textContent = imp.nom_usua;
    document.getElementById('codigo').textContent = imp.cod_telf;
    document.getElementById('codigoEq').value = imp.cod_equipo;
    document.getElementById('codigotics').value = imp.cod_tics_telf;
    document.getElementById('marcas').value = imp.mar_telf;
    document.getElementById('numSerie').value = imp.ser_telf;
    document.getElementById('modelo').value = imp.mod_telf;
    document.getElementById('estado').value = imp.est_telf;
    document.getElementById('condicion').value = imp.con_telf;
    document.getElementById('observacionTxt').value = imp.obs_telf;
}

async function guardarCambiosTLF() {
    try {
        const cod = document.getElementById('codigo').textContent;
        const codEquipo = document.getElementById('codigoEq').value;
        const codTics = document.getElementById('codigotics').value;
        const nuevoNumSerie = document.getElementById('numSerie').value;
        const nuevaCondi = document.getElementById('condicion').value;
        const nuevoEstado = document.getElementById('estado').value;
        const nuevoModelo = document.getElementById('modelo').value;
        const nuevaMarca = document.getElementById('marcas').value;

        const nuevaObservacion = document.getElementById('observacionTxt').value;

        const confirmacion = confirm(`¿Estás seguro de guardar los siguientes cambios?\n
\u2022 Cod MS: ${cod}         \u2022 Cod Eq: ${codEquipo}          \u2022 TICS: ${codTics}
\u2022 Condicion: ${nuevaCondi}     \u2022 Estado: ${nuevoEstado}\n
\u2022 Num Serie: ${nuevoNumSerie}       \u2022 Modelo: ${nuevoModelo} 
\u2022 Marca: ${nuevaMarca}`
        );

        if (!confirmacion) {
            return; // Si el usuario cancela, no hacemos nada
        }

        // Envía los datos al servidor
        const response = await fetch(`http://localhost:3000/tics/telefonoModificado/${codEquipo}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                codTLF: cod, codEquipo: codEquipo, codTics: codTics, marca: nuevaMarca, modelo: nuevoModelo,
                serie: nuevoNumSerie, condicion: nuevaCondi, estado: nuevoEstado, observacion: nuevaObservacion
            })
        });

        // Maneja la respuesta del servidor aquí
        const data = await response.json();
        if (data.success) {
            console.log('Cambios guardados correctamente');
        } else {
            console.error('Error al guardar los cambios TLF:', data.message);
        }
    } catch (error) {
        console.error('Error al guardar los cambios TLF:', error);
    }
}

//-------------------------------> Funcion Principal
document.addEventListener('DOMContentLoaded', async () => {
    //-------------------------------> Verificar y llamar a mostrarContenidoTabla solo si el elemento existe
    if (document.getElementById('results')) {
        mostrarContenidoTabla('Escritorio', 'results', 'modal1');
    }
    if (document.getElementById('resultsPortatil')) {
        mostrarContenidoTabla('Portatil', 'resultsPortatil', 'modal4');
    }
    if (document.getElementById('resultsImpresora')) {
        mostrarContenidoTabla('Impresora', 'resultsImpresora', 'modal5');
    }
    if (document.getElementById('resultsTelefono')) {
        mostrarContenidoTabla('Teléfono', 'resultsTelefono', 'modal6');
    }

    //-------------------------------> Verificar y llamar a getOptionsFrom solo si el elemento existe
    const optionMappings = [
        { table: 'param_condicion', field: 'nom_condicion', id: 'condicionMTR' },
        { table: 'param_condicion', field: 'nom_condicion', id: 'condicionTCD' },
        { table: 'param_condicion', field: 'nom_condicion', id: 'condicionMS' },
        { table: 'param_condicion', field: 'nom_condicion', id: 'condicion' },

        { table: 'param_sis_ope', field: 'nom_sis_ope', id: 'sisOperativo' },
        { table: 'param_procesador', field: 'nom_proce', id: 'procesador' },
        { table: 'param_dis_opt', field: 'nom_dis_opt', id: 'disOpticos' },
        { table: 'param_tamano_hdd', field: 'nom_tam_hdd', id: 'hdd' },
        { table: 'param_office', field: 'nom_office', id: 'office' },
        { table: 'param_memoria', field: 'nom_memoria', id: 'ram' },

        { table: 'param_marcas', field: 'nom_marcas', id: 'marcasMTR' },
        { table: 'param_marcas', field: 'nom_marcas', id: 'marcasTCD' },
        { table: 'param_marcas', field: 'nom_marcas', id: 'marcasMS' },
        { table: 'param_marcas', field: 'nom_marcas', id: 'marcas' },

        { table: 'param_estado', field: 'nom_estado', id: 'estadoMTR' },
        { table: 'param_estado', field: 'nom_estado', id: 'estadoTCD' },
        { table: 'param_estado', field: 'nom_estado', id: 'estadoMS' },
        { table: 'param_estado', field: 'nom_estado', id: 'estado' },

        { table: 'param_puertos', field: 'nom_puerto', id: 'puertoTCD' },
        { table: 'param_puertos', field: 'nom_puerto', id: 'puertoMS' },
        { table: 'param_puertos', field: 'nom_puerto', id: 'puerto' },

        { table: 'param_tipo_mt', field: 'nom_tmt', id: 'tipoTCD' },
        { table: 'param_tipo_mt', field: 'nom_tmt', id: 'tipoMS' },

        { table: 'param_tamano_monitor', field: 'nom_tam_mon', id: 'tamanoMTR' },
        { table: 'param_servicio', field: 'nom_servicio', id: 'departamentos' },
        { table: 'param_antivirus', field: 'nom_antivirus', id: 'antivirus' },
        { table: 'param_tipo_impresora', field: 'nom_ti', id: 'tipoIMP' },
        { table: 'param_tipo_equipo', field: 'nom_te', id: 'tipoEquipo' },
        { table: 'param_piso', field: 'nom_piso', id: 'pisos' }
    ];

    optionMappings.forEach(mapping => {
        if (document.getElementById(mapping.id)) {
            getOptionsFrom(mapping.table, mapping.field, mapping.id);
        }
    });
});

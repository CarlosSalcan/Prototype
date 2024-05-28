const express=require('express')
const router=express.Router();

const equipo=require('../controllers/equipo.controller.js');
const parametro=require('../controllers/parametro.controller.js');

//--------------------------> Obtener equipos de BDD
//--------------------------> Obtener datos de BDD (Select)
//--------------------------> Tomar IDpara Enviar a Bodega (1)
//--------------------------> Obtener parametros
//--------------------------> Obtener datos de Componentes del equipo (CPU, MONITOR, TECLADO, MOUSE)     
router.get('/equipos', equipo.getEquipos);
router.get('/options/:tabla/:campo', equipo.obtenerOpcSelect);
router.get('/equipoB/:id',equipo.getEquipoById)
router.get('/parametros/:tabla', parametro.getParametros);
router.get('/datosTabla/:tabla/:codEquipo', equipo.obtenerDatosComponentes);

//--------------------------> Modificar Datos Equipo
//--------------------------> Enviar a Bodega (2)
//--------------------------> Modificar Nombre Parametro
//--------------------------> Modificar CPU
//--------------------------> Modificar Monitor
//--------------------------> Modificar Teclado
//--------------------------> Modificar Mouse
//--------------------------> Modificar Laptop
//--------------------------> Modificar Impresora
//--------------------------> Modificar Telfono
router.put('/editEquipos/:codEquipo', equipo.modificarEquipo);
router.put('/enviarBodega/:id',equipo.enviarBodegaEquipo)
router.put('/modificarNombre/:tabla/:campo/:valor/:nuevoNombre', parametro.editarNombreParametro);
router.put('/cpuModificado/:codEquipo', equipo.guardarCambiosCPU);
router.put('/mtrModificado/:codEquipo', equipo.guardarCambiosMTR);
router.put('/tcdModificado/:codEquipo', equipo.guardarCambiosTCD);
router.put('/msModificado/:codEquipo', equipo.guardarCambiosMS);
router.put('/laptopModificada/:codEquipo', equipo.guardarCambiosLaptop);
router.put('/impresoraModificada/:codEquipo', equipo.guardarCambiosImpresora);
router.put('/telefonoModificado/:codEquipo', equipo.guardarCambiosTelefono);

//--------------------------> Agregar nuevo Parametro
//--------------------------> Obtener nuevo codigo para nuevo Equipo
router.post('/nuevoParametro/:tabla', parametro.nuevoParametro);
router.get('/nextCodEquipo', equipo.getNextCodEquipo);

module.exports = router;
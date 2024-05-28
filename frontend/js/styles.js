//-------------------------------> MENU RESPONSIVE
const showMenu = (toggleId, navId) => {
  const toggle = document.getElementById(toggleId),
    nav = document.getElementById(navId)

  toggle.addEventListener('click', () => {
    // Add show-menu class to nav menu
    nav.classList.toggle('show-menu')

    // Add show-icon to show and hide the menu icon
    toggle.classList.toggle('show-icon')
  })
}

showMenu('nav-toggle', 'nav-menu')

//-------------------------------> VENTANA EMERGENTE
function mostrarVentanaEmergente(idModal) {
  var modal = document.getElementById(idModal);
  modal.style.display = "block";

  // Cerrar con click afuera de la ventana
  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
      limpiezaArea();
    }
  });
}

function cerrarVentanaEmergente(idModal) {
  var modal = document.getElementById(idModal);
  modal.style.display = "none";
  limpiezaArea();
}

//-------------------------------> MOSTRAR FORMULARIO SEGUN LA ELECCION
function mostrarFormulario(formulario) {
  const forms = document.querySelectorAll('.form-container');
  const codEquipo = document.getElementById('cod').textContent;

  forms.forEach(form => form.style.display = 'none');

  switch (formulario) {
    case 'cpu':
      document.getElementById('formCPU').style.display = 'block';
      obtenerDatosTabla('cpu_equipo', codEquipo);
      break;
    case 'monitor':
      document.getElementById('formMonitor').style.display = 'block';
      obtenerDatosTabla('monitor', codEquipo);
      break;
    case 'teclado':
      document.getElementById('formTeclado').style.display = 'block';
      obtenerDatosTabla('teclado', codEquipo);
      break;
    case 'mouse':
      document.getElementById('formMouse').style.display = 'block';
      obtenerDatosTabla('mouse', codEquipo);
      break;
    case 'laptop':
      document.getElementById('formLaptop').style.display = 'block';
      obtenerDatosTabla('laptop', codEquipo);
      break;
    case 'impresora':
      document.getElementById('formImpresora').style.display = 'block';
      obtenerDatosTabla('impresora', codEquipo);
      break;
    case 'telefono':
      document.getElementById('formTelefono').style.display = 'block';
      obtenerDatosTabla('telefono', codEquipo);
      break;
    default:
      break;
  }
}

//-------------------------------> LIMPIAR AREA DONDE SE MUESTRAN FORMULARIOS
function limpiezaArea() {
  const forms = document.querySelectorAll('.form-container');
  forms.forEach(form => form.style.display = 'none');
}

//-------------------------------> MENSAJE DURANTE Nseg
function mostrarMensaje(mensaje, duracion) {
  const div = document.createElement('div');
  div.textContent = mensaje;
  div.style.position = 'fixed';
  div.style.top = '50%';
  div.style.left = '50%';
  div.style.transform = 'translate(-50%, -50%)';
  div.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  div.style.color = 'white';
  div.style.padding = '20px';
  div.style.borderRadius = '10px';
  div.style.zIndex = '9999';
  document.body.appendChild(div);

  setTimeout(() => {
    div.remove();
    window.location.reload()
  }, duracion);
}





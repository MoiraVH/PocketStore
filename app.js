// app.js - Lógica de PocketStore

const api_users = 'https://jsonplaceholder.typicode.com/users';
const contenedor = document.getElementById('contenedor');
const estado = document.getElementById('estado-conexion');

// I. Registro del Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then((reg) => console.log('[App] SW registrado. Scope:', reg.scope))
      .catch((err) => console.error('[App] Error al registrar SW:', err));
  });
}

// II. Indicador de conexión
function actualizarEstado() {
  const online = navigator.onLine;
  estado.textContent = online ? 'En línea' : 'Sin conexión';
  estado.className = 'badge ' + (online ? 'badge-online' : 'badge-offline');
}
window.addEventListener('online', actualizarEstado);
window.addEventListener('offline', actualizarEstado);
actualizarEstado();

// III. Fetch a la API
async function cargarUsuarios() {
  try {
    const respuesta = await fetch(api_users);
    if (!respuesta.ok) throw new Error('Respuesta no válida: ' + respuesta.status);
    const usuarios = await respuesta.json();
    if (!usuarios.length) throw new Error('Sin datos');
    mostrarUsuarios(usuarios);
  } catch (error) {
    console.error('[App] Error al cargar usuarios:', error);
    contenedor.innerHTML =
      '<p class="mensaje error">No se pudo cargar el catálogo. Conéctate a internet al menos una vez.</p>';
  }
}

function mostrarUsuarios(usuarios) {
  contenedor.innerHTML = usuarios.map((u) => `
    <article class="tarjeta">
      <h2>${u.name}</h2>
      <p>
        <img class="icon" src="icons/mail.svg" alt="">
        ${u.email}</p>
      <p>
        <img class="icon" src="icons/phone.svg" alt="">
        ${u.phone}</p>
      <p>
        <img class="icon" src="icons/location.svg" alt="">
        ${u.address.city}</p>
      <p class="empresa">
        <img class="icon" src="icons/domain.svg" alt="">
        ${u.company.name}</p>
    </article>
  `).join('');
}

cargarUsuarios();

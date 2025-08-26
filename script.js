// API Configuration
const API_BASE_URL = "http://127.0.0.1:8014"; // Cambia esta URL por la de tu API

// Variables globales para CRUD
let currentEditId = null;
let currentTable = null;
let deleteCallback = null;

// DOM Elements
const sidebar = document.getElementById("sidebar");
const mainContent = document.getElementById("mainContent");
const toggleSidebarBtn = document.getElementById("toggleSidebar");
const closeSidebarBtn = document.getElementById("closeSidebar");
const sidebarLinks = document.querySelectorAll(".sidebar-link");
const contentSections = document.querySelectorAll(".content-section");

// Bootstrap initialization
const bootstrap = window.bootstrap;

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  initializeEventListeners();
  loadAllData();
  showSection("home");
  initializeChatbot();
});

// Event Listeners
function initializeEventListeners() {
  // Sidebar toggle
  if (toggleSidebarBtn) {
    toggleSidebarBtn.addEventListener("click", toggleSidebar);
  }
  if (closeSidebarBtn) {
    closeSidebarBtn.addEventListener("click", closeSidebar);
  }

  // Sidebar navigation
  sidebarLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      // Check if it's a submenu toggle
      if (this.classList.contains("has-submenu")) {
        const submenuId = this.getAttribute("data-submenu") + "-submenu";
        const submenu = document.getElementById(submenuId);

        if (submenu) {
          submenu.classList.toggle("active");
          this.classList.toggle("active");
        }
        return;
      }

      const section = this.getAttribute("data-section");
      if (section) {
        showSection(section);
        closeSidebar();
      }
    });
  });

  // CRUD Event Listeners
  initializeCRUDEventListeners();

  // Login form
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      handleLogin();
    });
  }

  // Close sidebar when clicking outside
  document.addEventListener("click", (e) => {
    if (
      sidebar &&
      !sidebar.contains(e.target) &&
      toggleSidebarBtn &&
      !toggleSidebarBtn.contains(e.target)
    ) {
      closeSidebar();
    }
  });
}

// CRUD Event Listeners
function initializeCRUDEventListeners() {
  // Save buttons
  document
    .getElementById("saveTrabajador")
    ?.addEventListener("click", saveTrabajador);
  document
    .getElementById("saveAlmacen")
    ?.addEventListener("click", saveAlmacen);
  document.getElementById("saveGasto")?.addEventListener("click", saveGasto);
  document
    .getElementById("saveAsistencia")
    ?.addEventListener("click", saveAsistencia);
  document.getElementById("savePago")?.addEventListener("click", savePago);
  document
    .getElementById("saveHorario")
    ?.addEventListener("click", saveHorario);
  document.getElementById("saveTarea")?.addEventListener("click", saveTarea);
  document
    .getElementById("saveCliente")
    ?.addEventListener("click", saveCliente);
  document.getElementById("saveMenu")?.addEventListener("click", saveMenu);
  document.getElementById("saveVenta")?.addEventListener("click", saveVenta);

  // Delete confirmation
  document
    .getElementById("confirmDelete")
    ?.addEventListener("click", confirmDelete);
}

// Sidebar functions
function toggleSidebar() {
  if (sidebar) {
    sidebar.classList.toggle("active");
  }
  if (mainContent) {
    mainContent.classList.toggle("shifted");
  }
}

function closeSidebar() {
  if (sidebar) {
    sidebar.classList.remove("active");
  }
  if (mainContent) {
    mainContent.classList.remove("shifted");
  }
}

// Navigation functions
function showSection(sectionId) {
  // Hide all sections
  contentSections.forEach((section) => {
    section.classList.remove("active");
  });

  // Show selected section
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add("active");
    targetSection.classList.add("fade-in");
  }

  // Update active sidebar link
  sidebarLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("data-section") === sectionId) {
      link.classList.add("active");
    }
  });
}

// API Functions
async function apiRequest(endpoint, method = "GET", data = null) {
  try {
    const config = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Check if response has content
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  } catch (error) {
    console.error("API Error:", error);
    showNotification(`Error: ${error.message}`, "error");
    throw error;
  }
}

// Data Loading Functions
async function loadAllData() {
  try {
    await Promise.all([
      loadTrabajadores(),
      loadAlmacenes(),
      loadGastos(),
      loadAsistencias(),
      loadPagos(),
      loadHorarios(),
      loadTareas(),
      loadClientes(),
      loadMenu(),
      loadVentas(),
    ]);
  } catch (error) {
    console.error("Error loading data:", error);
    showNotification("Error cargando datos", "error");
  }
}

// Variables del carrito
let cart = [];

// Función para cargar el menú como tarjetas
async function loadMenu() {
  try {
    const menu = await apiRequest("/menu");
    populateMenuCards(menu);
    populateMenuTable(menu);
    updateMenuDashboard(menu);
  } catch (error) {
    console.error("Error loading menu:", error);
    const container = document.getElementById("menuCards");
    if (container) {
      container.innerHTML =
        '<div class="col-12 text-center text-danger">Error cargando menú</div>';
    }
  }
}

// Función para mostrar las tarjetas del menú
function populateMenuCards(menu) {
  const container = document.getElementById("menuCards");
  if (!container) return;

  if (!menu || menu.length === 0) {
    container.innerHTML =
      '<div class="col-12 text-center">No hay productos disponibles</div>';
    return;
  }

  container.innerHTML = menu
    .map((item) => {
      const ingredientes = [];
      if (item.tortilla_maiz) ingredientes.push("Tortilla Maíz");
      if (item.tortilla_harina) ingredientes.push("Tortilla Harina");
      if (item.carne_res) ingredientes.push("Carne Res");
      if (item.carne_puerco) ingredientes.push("Carne Puerco");
      if (item.aguacate) ingredientes.push("Aguacate");
      if (item.longaniza) ingredientes.push("Longaniza");
      if (item.cecina) ingredientes.push("Cecina");
      if (item.chorizo_argentino) ingredientes.push("Chorizo Argentino");
      if (item.chicharron) ingredientes.push("Chicharrón");
      if (item.salsa_quemada) ingredientes.push("Salsa Quemada");
      if (item.chimichurri) ingredientes.push("Chimichurri");

      return `
        <div class="col-md-6">
          <div class="menu-card">
            <div class="menu-card-image" style="background-image: url('/placeholder.svg?height=200&width=300&text=${encodeURIComponent(
              item.nombre_m
            )}')">
              <div class="menu-card-price">$${item.precio}</div>
            </div>
            <div class="menu-card-body">
              <h5 class="menu-card-title">${item.nombre_m}</h5>
              <p class="menu-card-description">${item.descripcion}</p>
              <div class="menu-card-ingredients">
                ${ingredientes
                  .map((ing) => `<span class="badge">${ing}</span>`)
                  .join("")}
              </div>
              <div class="menu-card-actions">
                <div class="quantity-controls">
                  <button class="quantity-btn" onclick="decreaseQuantity(${
                    item.producto_id
                  })">-</button>
                  <span class="quantity-display" id="qty-${
                    item.producto_id
                  }">1</span>
                  <button class="quantity-btn" onclick="increaseQuantity(${
                    item.producto_id
                  })">+</button>
                </div>
                <button class="btn btn-primary flex-fill" onclick="addToCart(${
                  item.producto_id
                }, '${item.nombre_m}', ${item.precio}, '${item.descripcion}')">
                  <i class="fas fa-cart-plus me-2"></i>Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

// Funciones del carrito
function increaseQuantity(productId) {
  const qtyElement = document.getElementById(`qty-${productId}`);
  if (qtyElement) {
    const qty = Number.parseInt(qtyElement.textContent);
    qtyElement.textContent = qty + 1;
  }
}

function decreaseQuantity(productId) {
  const qtyElement = document.getElementById(`qty-${productId}`);
  if (qtyElement) {
    const qty = Number.parseInt(qtyElement.textContent);
    if (qty > 1) {
      qtyElement.textContent = qty - 1;
    }
  }
}

function addToCart(productId, name, price, description) {
  const qtyElement = document.getElementById(`qty-${productId}`);
  const quantity = qtyElement ? Number.parseInt(qtyElement.textContent) : 1;

  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id: productId,
      name: name,
      price: Number.parseFloat(price),
      description: description,
      quantity: quantity,
    });
  }

  updateCartDisplay();
  showNotification(`${name} agregado al carrito`, "success");

  // Reset quantity to 1
  if (qtyElement) {
    qtyElement.textContent = "1";
  }
}

function updateCartDisplay() {
  const cartItems = document.getElementById("cartItems");
  const cartCountBadge = document.getElementById("cartCountBadge");
  const cartTotal = document.getElementById("cartTotal");
  const checkoutBtn = document.getElementById("checkoutBtn");

  if (!cartItems) return;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-cart"></i>
        <p>Tu carrito está vacío</p>
        <small>Agrega productos para comenzar tu pedido</small>
      </div>
    `;
    cartCountBadge.textContent = "0";
    cartTotal.textContent = "0.00";
    checkoutBtn.disabled = true;
    return;
  }

  cartItems.innerHTML = cart
    .map(
      (item) => `
    <div class="cart-item">
      <div class="cart-item-image" style="background-image: url('/placeholder.svg?height=60&width=60&text=${encodeURIComponent(
        item.name
      )}')"></div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${item.price.toFixed(2)} c/u</div>
      </div>
      <div class="cart-item-quantity">
        <button onclick="decreaseCartQuantity(${item.id})">-</button>
        <span>${item.quantity}</span>
        <button onclick="increaseCartQuantity(${item.id})">+</button>
      </div>
      <button class="btn btn-sm btn-outline-danger ms-2" onclick="removeFromCart(${
        item.id
      })">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `
    )
    .join("");

  cartCountBadge.textContent = totalItems;
  cartTotal.textContent = totalPrice.toFixed(2);
  checkoutBtn.disabled = false;
}

function increaseCartQuantity(productId) {
  const item = cart.find((item) => item.id === productId);
  if (item) {
    item.quantity += 1;
    updateCartDisplay();
  }
}

function decreaseCartQuantity(productId) {
  const item = cart.find((item) => item.id === productId);
  if (item && item.quantity > 1) {
    item.quantity -= 1;
    updateCartDisplay();
  }
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  updateCartDisplay();
  showNotification("Producto eliminado del carrito", "info");
}

// Función para actualizar dashboard del menú
function updateMenuDashboard(menu) {
  if (!menu || menu.length === 0) return;

  const totalProductos = document.getElementById("totalProductos");
  const precioPromedio = document.getElementById("precioPromedio");
  const masPopular = document.getElementById("masPopular");
  const especialidades = document.getElementById("especialidades");

  if (totalProductos) totalProductos.textContent = menu.length;

  if (precioPromedio) {
    const promedio =
      menu.reduce((sum, item) => sum + Number.parseFloat(item.precio), 0) /
      menu.length;
    precioPromedio.textContent = `$${promedio.toFixed(2)}`;
  }

  if (masPopular) {
    // Asumiendo que el primer producto es el más popular
    masPopular.textContent = menu[0]?.nombre_m || "-";
  }

  if (especialidades) {
    // Contar productos con ingredientes especiales
    const especiales = menu.filter(
      (item) => item.chorizo_argentino || item.cecina
    ).length;
    especialidades.textContent = especiales;
  }
}

// Función para actualizar dashboard de trabajadores
function updateTrabajadoresDashboard(trabajadores) {
  if (!trabajadores || trabajadores.length === 0) return;

  const totalTrabajadores = document.getElementById("totalTrabajadores");
  const trabajadoresActivos = document.getElementById("trabajadoresActivos");
  const puestosPrincipales = document.getElementById("puestosPrincipales");
  const documentosCompletos = document.getElementById("documentosCompletos");

  if (totalTrabajadores) totalTrabajadores.textContent = trabajadores.length;

  if (trabajadoresActivos) {
    // Asumiendo que todos están activos por ahora
    trabajadoresActivos.textContent = trabajadores.length;
  }

  if (puestosPrincipales) {
    // Encontrar el puesto más común
    const puestos = trabajadores.map((t) => t.puesto);
    const puestoMasComun = puestos
      .sort(
        (a, b) =>
          puestos.filter((v) => v === a).length -
          puestos.filter((v) => v === b).length
      )
      .pop();
    puestosPrincipales.textContent = puestoMasComun || "-";
  }

  if (documentosCompletos) {
    const completos = trabajadores.filter(
      (t) => t.curp && t.ine && t.acta_nacimiento
    ).length;
    documentosCompletos.textContent = completos;
  }
}

// Actualizar la función loadTrabajadores para incluir dashboard
async function loadTrabajadores() {
  try {
    const trabajadores = await apiRequest("/trabajadores");
    populateTrabajadoresTable(trabajadores);
    populateWorkerSelects(trabajadores);
    updateTrabajadoresDashboard(trabajadores);
  } catch (error) {
    console.error("Error loading trabajadores:", error);
    const table = document.getElementById("trabajadoresTable");
    if (table) {
      table.innerHTML =
        '<tr><td colspan="7" class="text-center text-danger">Error cargando datos</td></tr>';
    }
  }
}

async function loadAlmacenes() {
  try {
    const almacenes = await apiRequest("/almacenes");
    populateAlmacenesTable(almacenes);
    populateProductSelects(almacenes);
  } catch (error) {
    console.error("Error loading almacenes:", error);
    const table = document.getElementById("almacenesTable");
    if (table) {
      table.innerHTML =
        '<tr><td colspan="7" class="text-center text-danger">Error cargando datos</td></tr>';
    }
  }
}

async function loadGastos() {
  try {
    const gastos = await apiRequest("/gastos");
    populateGastosTable(gastos);
  } catch (error) {
    console.error("Error loading gastos:", error);
    const table = document.getElementById("gastosTable");
    if (table) {
      table.innerHTML =
        '<tr><td colspan="8" class="text-center text-danger">Error cargando datos</td></tr>';
    }
  }
}

async function loadAsistencias() {
  try {
    const asistencias = await apiRequest("/asistencias");
    populateAsistenciasTable(asistencias);
  } catch (error) {
    console.error("Error loading asistencias:", error);
    const table = document.getElementById("asistenciasTable");
    if (table) {
      table.innerHTML =
        '<tr><td colspan="9" class="text-center text-danger">Error cargando datos</td></tr>';
    }
  }
}

async function loadPagos() {
  try {
    const pagos = await apiRequest("/pagos");
    populatePagosTable(pagos);
  } catch (error) {
    console.error("Error loading pagos:", error);
    const table = document.getElementById("pagosTable");
    if (table) {
      table.innerHTML =
        '<tr><td colspan="7" class="text-center text-danger">Error cargando datos</td></tr>';
    }
  }
}

async function loadHorarios() {
  try {
    const horarios = await apiRequest("/horarios");
    populateHorariosTable(horarios);
  } catch (error) {
    console.error("Error loading horarios:", error);
    const table = document.getElementById("horariosTable");
    if (table) {
      table.innerHTML =
        '<tr><td colspan="9" class="text-center text-danger">Error cargando datos</td></tr>';
    }
  }
}

async function loadTareas() {
  try {
    const tareas = await apiRequest("/tareas");
    populateTareasTable(tareas);
  } catch (error) {
    console.error("Error loading tareas:", error);
    const table = document.getElementById("tareasTable");
    if (table) {
      table.innerHTML =
        '<tr><td colspan="7" class="text-center text-danger">Error cargando datos</td></tr>';
    }
  }
}

async function loadClientes() {
  try {
    const clientes = await apiRequest("/clientes");
    populateClientesTable(clientes);
    populateClientSelects(clientes);
  } catch (error) {
    console.error("Error loading clientes:", error);
    const table = document.getElementById("clientesTable");
    if (table) {
      table.innerHTML =
        '<tr><td colspan="4" class="text-center text-danger">Error cargando datos</td></tr>';
    }
  }
}

async function loadVentas() {
  try {
    const ventas = await apiRequest("/ventas");
    populateVentasTable(ventas);
  } catch (error) {
    console.error("Error loading ventas:", error);
    const table = document.getElementById("ventasTable");
    if (table) {
      table.innerHTML =
        '<tr><td colspan="5" class="text-center text-danger">Error cargando datos</td></tr>';
    }
  }
}

// Table Population Functions
function populateTrabajadoresTable(trabajadores) {
  const tbody = document.getElementById("trabajadoresTable");
  if (!tbody) return;

  if (!trabajadores || trabajadores.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="7" class="text-center">No hay trabajadores registrados</td></tr>';
    return;
  }

  tbody.innerHTML = trabajadores
    .map(
      (trabajador) => `
        <tr>
            <td>${trabajador.user_id}</td>
            <td>${trabajador.nombre_t}</td>
            <td>${trabajador.apellido_p} ${trabajador.apellido_m}</td>
            <td>${trabajador.puesto}</td>
            <td>${trabajador.fecha_nacimiento || "N/A"}</td>
            <td>
                <div class="d-flex flex-wrap gap-1">
                    ${
                      trabajador.curp
                        ? '<span class="badge bg-success">CURP</span>'
                        : ""
                    }
                    ${
                      trabajador.ine
                        ? '<span class="badge bg-success">INE</span>'
                        : ""
                    }
                    ${
                      trabajador.acta_nacimiento
                        ? '<span class="badge bg-success">Acta</span>'
                        : ""
                    }
                </div>
            </td>
            <td class="table-actions">
                <button class="btn btn-sm btn-outline-primary" onclick="openTrabajadorModal(${
                  trabajador.user_id
                })">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteTrabajador(${
                  trabajador.user_id
                })">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `
    )
    .join("");
}

function populateAlmacenesTable(almacenes) {
  const tbody = document.getElementById("almacenesTable");
  if (!tbody) return;

  if (!almacenes || almacenes.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="7" class="text-center">No hay productos en almacén</td></tr>';
    return;
  }

  tbody.innerHTML = almacenes
    .map(
      (almacen) => `
        <tr>
            <td>${almacen.producto_id}</td>
            <td>${almacen.nombre_a}</td>
            <td>${almacen.unidades}</td>
            <td>${almacen.tipo}</td>
            <td>${almacen.responsable}</td>
            <td>
                <span class="status-badge ${
                  almacen.unidades > 10 ? "status-active" : "status-low"
                }">
                    ${almacen.unidades > 10 ? "Disponible" : "Bajo"}
                </span>
            </td>
            <td class="table-actions">
                <button class="btn btn-sm btn-outline-primary" onclick="openAlmacenModal(${
                  almacen.producto_id
                })">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteAlmacen(${
                  almacen.producto_id
                })">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `
    )
    .join("");
}

function populateGastosTable(gastos) {
  const tbody = document.getElementById("gastosTable");
  if (!tbody) return;

  if (!gastos || gastos.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="8" class="text-center">No hay gastos registrados</td></tr>';
    return;
  }

  tbody.innerHTML = gastos
    .map(
      (gasto) => `
        <tr>
            <td>${gasto.gasto_id}</td>
            <td>${gasto.fecha}</td>
            <td>${gasto.nombre_a}</td>
            <td>${gasto.unidades}</td>
            <td>$${gasto.costo}</td>
            <td><span class="badge bg-secondary">${gasto.tipo}</span></td>
            <td>${gasto.responsable}</td>
            <td class="table-actions">
                <button class="btn btn-sm btn-outline-primary" onclick="openGastoModal(${gasto.gasto_id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteGasto(${gasto.gasto_id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `
    )
    .join("");
}

function populateAsistenciasTable(asistencias) {
  const tbody = document.getElementById("asistenciasTable");
  if (!tbody) return;

  if (!asistencias || asistencias.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="9" class="text-center">No hay asistencias registradas</td></tr>';
    return;
  }

  tbody.innerHTML = asistencias
    .map(
      (asistencia) => `
        <tr>
            <td>${asistencia.id}</td>
            <td>${asistencia.nombre_t} ${asistencia.apellido_p}</td>
            <td>${asistencia.fecha}</td>
            <td>${asistencia.entrada}</td>
            <td>${asistencia.salida}</td>
            <td>${asistencia.retardo}</td>
            <td>${asistencia.descuento}</td>
            <td>${asistencia.mes}</td>
            <td class="table-actions">
                <button class="btn btn-sm btn-outline-primary" onclick="openAsistenciaModal(${asistencia.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteAsistencia(${asistencia.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `
    )
    .join("");
}

function populatePagosTable(pagos) {
  const tbody = document.getElementById("pagosTable");
  if (!tbody) return;

  if (!pagos || pagos.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="7" class="text-center">No hay pagos registrados</td></tr>';
    return;
  }

  tbody.innerHTML = pagos
    .map(
      (pago) => `
        <tr>
            <td>${pago.id}</td>
            <td>${pago.nombre_t}</td>
            <td>${pago.puesto}</td>
            <td>$${pago.pago}</td>
            <td>${pago.mes}</td>
            <td>
                <span class="status-badge ${
                  pago.pagado ? "status-paid" : "status-pending"
                }">
                    ${pago.pagado ? "Pagado" : "Pendiente"}
                </span>
            </td>
            <td class="table-actions">
                <button class="btn btn-sm btn-outline-primary" onclick="openPagoModal(${
                  pago.id
                })">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deletePago(${
                  pago.id
                })">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `
    )
    .join("");
}

function populateHorariosTable(horarios) {
  const tbody = document.getElementById("horariosTable");
  if (!tbody) return;

  if (!horarios || horarios.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="9" class="text-center">No hay horarios registrados</td></tr>';
    return;
  }

  tbody.innerHTML = horarios
    .map(
      (horario) => `
        <tr>
            <td><strong>${horario.nombre_t}</strong></td>
            <td>${horario.lunes || "Descanso"}</td>
            <td>${horario.martes || "Descanso"}</td>
            <td>${horario.miercoles || "Descanso"}</td>
            <td>${horario.jueves || "Descanso"}</td>
            <td>${horario.viernes || "Descanso"}</td>
            <td>${horario.sabado || "Descanso"}</td>
            <td>${horario.domingo || "Descanso"}</td>
            <td class="table-actions">
                <button class="btn btn-sm btn-outline-primary" onclick="openHorarioModal(${
                  horario.user
                })">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteHorario(${
                  horario.user
                })">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `
    )
    .join("");
}

function populateTareasTable(tareas) {
  const tbody = document.getElementById("tareasTable");
  if (!tbody) return;

  if (!tareas || tareas.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="7" class="text-center">No hay tareas registradas</td></tr>';
    return;
  }

  tbody.innerHTML = tareas
    .map(
      (tarea) => `
        <tr>
            <td>${tarea.id}</td>
            <td>${tarea.nombre_t}</td>
            <td>${tarea.puesto}</td>
            <td>${tarea.tarea}</td>
            <td><span class="badge bg-info">${tarea.turno}</span></td>
            <td>
                <span class="status-badge ${
                  tarea.realizado ? "status-completed" : "status-pending"
                }">
                    ${tarea.realizado ? "Completada" : "Pendiente"}
                </span>
            </td>
            <td class="table-actions">
                <button class="btn btn-sm btn-outline-primary" onclick="openTareaModal(${
                  tarea.id
                })">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteTarea(${
                  tarea.id
                })">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `
    )
    .join("");
}

function populateClientesTable(clientes) {
  const tbody = document.getElementById("clientesTable");
  if (!tbody) return;

  if (!clientes || clientes.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="4" class="text-center">No hay clientes registrados</td></tr>';
    return;
  }

  tbody.innerHTML = clientes
    .map(
      (cliente) => `
        <tr>
            <td>${cliente.cliente_id}</td>
            <td>${cliente.nombre}</td>
            <td>${cliente.numero}</td>
            <td class="table-actions">
                <button class="btn btn-sm btn-outline-primary" onclick="openClienteModal(${cliente.cliente_id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteCliente(${cliente.cliente_id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `
    )
    .join("");
}

function populateMenuTable(menu) {
  const tbody = document.getElementById("menuTable");
  if (!tbody) return;

  if (!menu || menu.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="6" class="text-center">No hay productos en el menú</td></tr>';
    return;
  }

  tbody.innerHTML = menu
    .map((item) => {
      const ingredientes = [];
      if (item.tortilla_maiz) ingredientes.push("Tortilla Maíz");
      if (item.tortilla_harina) ingredientes.push("Tortilla Harina");
      if (item.carne_res) ingredientes.push("Carne Res");
      if (item.carne_puerco) ingredientes.push("Carne Puerco");
      if (item.aguacate) ingredientes.push("Aguacate");

      return `
            <tr>
                <td>${item.producto_id}</td>
                <td>${item.nombre_m}</td>
                <td>$${item.precio}</td>
                <td>${item.descripcion}</td>
                <td>
                    <div class="d-flex flex-wrap gap-1">
                        ${ingredientes
                          .slice(0, 3)
                          .map(
                            (ing) =>
                              `<span class="badge bg-secondary">${ing}</span>`
                          )
                          .join("")}
                        ${
                          ingredientes.length > 3
                            ? `<span class="badge bg-light text-dark">+${
                                ingredientes.length - 3
                              }</span>`
                            : ""
                        }
                    </div>
                </td>
                <td class="table-actions">
                    <button class="btn btn-sm btn-outline-primary" onclick="openMenuModal(${
                      item.producto_id
                    })">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteMenu(${
                      item.producto_id
                    })">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    })
    .join("");
}

function populateVentasTable(ventas) {
  const tbody = document.getElementById("ventasTable");
  if (!tbody) return;

  if (!ventas || ventas.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5" class="text-center">No hay ventas registradas</td></tr>';
    return;
  }

  tbody.innerHTML = ventas
    .map(
      (venta) => `
        <tr>
            <td>${venta.venta_id}</td>
            <td>${venta.nombre_m}</td>
            <td>$${venta.precio}</td>
            <td>Cliente #${venta.cliente_id}</td>
            <td class="table-actions">
                <button class="btn btn-sm btn-outline-primary" onclick="openVentaModal(${venta.venta_id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteVenta(${venta.venta_id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `
    )
    .join("");
}

// Populate Select Options
function populateWorkerSelects(trabajadores) {
  const selects = [
    "almacen_user_id",
    "gasto_user_id",
    "asistencia_user_id",
    "pago_user_id",
    "horario_user",
    "tarea_user_id",
  ];

  selects.forEach((selectId) => {
    const select = document.getElementById(selectId);
    if (select && trabajadores) {
      select.innerHTML =
        '<option value="">Seleccionar trabajador</option>' +
        trabajadores
          .map(
            (t) =>
              `<option value="${t.user_id}">${t.nombre_t} ${t.apellido_p}</option>`
          )
          .join("");
    }
  });
}

function populateProductSelects(almacenes) {
  const select = document.getElementById("gasto_producto_id");
  if (select && almacenes) {
    select.innerHTML =
      '<option value="">Seleccionar producto</option>' +
      almacenes
        .map((a) => `<option value="${a.producto_id}">${a.nombre_a}</option>`)
        .join("");
  }
}

function populateClientSelects(clientes) {
  const select = document.getElementById("venta_cliente_id");
  if (select && clientes) {
    select.innerHTML =
      '<option value="">Seleccionar cliente</option>' +
      clientes
        .map((c) => `<option value="${c.cliente_id}">${c.nombre}</option>`)
        .join("");
  }
}

// Modal Functions
async function openTrabajadorModal(id = null) {
  const modal = new bootstrap.Modal(document.getElementById("trabajadorModal"));
  const title = document.getElementById("trabajadorModalTitle");

  if (id) {
    try {
      const trabajador = await apiRequest(`/trabajador/${id}`);
      title.textContent = "Editar Trabajador";

      document.getElementById("trabajador_user_id").value = trabajador.user_id;
      document.getElementById("trabajador_nombre_t").value =
        trabajador.nombre_t;
      document.getElementById("trabajador_apellido_p").value =
        trabajador.apellido_p;
      document.getElementById("trabajador_apellido_m").value =
        trabajador.apellido_m;
      document.getElementById("trabajador_puesto").value = trabajador.puesto;
      document.getElementById("trabajador_fecha_nacimiento").value =
        trabajador.fecha_nacimiento || "";
      document.getElementById("trabajador_contrasena").value =
        trabajador.contrasena;

      // Set checkboxes
      document.getElementById("trabajador_curp").checked = trabajador.curp;
      document.getElementById("trabajador_acta_nacimiento").checked =
        trabajador.acta_nacimiento;
      document.getElementById("trabajador_ine").checked = trabajador.ine;
      document.getElementById("trabajador_constancia_sf").checked =
        trabajador.constancia_sf;
      document.getElementById("trabajador_constancia_ht").checked =
        trabajador.constancia_ht;
      document.getElementById("trabajador_fotos").checked = trabajador.fotos;
      document.getElementById("trabajador_uniforme").checked =
        trabajador.uniforme;
      document.getElementById("trabajador_correo").checked = trabajador.correo;
      document.getElementById("trabajador_numero").checked = trabajador.numero;

      currentEditId = id;
    } catch (error) {
      showNotification("Error cargando datos del trabajador", "error");
      return;
    }
  } else {
    title.textContent = "Agregar Trabajador";
    document.getElementById("trabajadorForm").reset();
    currentEditId = null;
  }

  currentTable = "trabajadores";
  modal.show();
}

async function saveTrabajador() {
  const form = document.getElementById("trabajadorForm");
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const data = {
    nombre_t: document.getElementById("trabajador_nombre_t").value,
    apellido_p: document.getElementById("trabajador_apellido_p").value,
    apellido_m: document.getElementById("trabajador_apellido_m").value,
    puesto: document.getElementById("trabajador_puesto").value,
    fecha_nacimiento:
      document.getElementById("trabajador_fecha_nacimiento").value || null,
    contrasena: document.getElementById("trabajador_contrasena").value,
    curp: document.getElementById("trabajador_curp").checked,
    acta_nacimiento: document.getElementById("trabajador_acta_nacimiento")
      .checked,
    ine: document.getElementById("trabajador_ine").checked,
    constancia_sf: document.getElementById("trabajador_constancia_sf").checked,
    constancia_ht: document.getElementById("trabajador_constancia_ht").checked,
    fotos: document.getElementById("trabajador_fotos").checked,
    uniforme: document.getElementById("trabajador_uniforme").checked,
    correo: document.getElementById("trabajador_correo").checked,
    numero: document.getElementById("trabajador_numero").value,
  };

  try {
    if (currentEditId) {
      await apiRequest(`/trabajador/${currentEditId}`, "PUT", data);
      showNotification("Trabajador actualizado exitosamente", "success");
    } else {
      await apiRequest("/trabajador", "POST", data);
      showNotification("Trabajador creado exitosamente", "success");
    }

    bootstrap.Modal.getInstance(
      document.getElementById("trabajadorModal")
    ).hide();
    await loadTrabajadores();
  } catch (error) {
    showNotification("Error guardando trabajador", "error");
  }
}

async function deleteTrabajador(id) {
  currentEditId = id;
  deleteCallback = async () => {
    try {
      await apiRequest(`/trabajador/${id}`, "DELETE");
      showNotification("Trabajador eliminado exitosamente", "success");
      await loadTrabajadores();
    } catch (error) {
      showNotification("Error eliminando trabajador", "error");
    }
  };

  const modal = new bootstrap.Modal(document.getElementById("deleteModal"));
  modal.show();
}

// Placeholder functions for other modals (implement as needed)
function openAlmacenModal(id = null) {
  console.log("Open Almacen Modal", id);
}

function saveAlmacen() {
  console.log("Save Almacen");
}

function deleteAlmacen(id) {
  console.log("Delete Almacen", id);
}

function openGastoModal(id = null) {
  console.log("Open Gasto Modal", id);
}

function saveGasto() {
  console.log("Save Gasto");
}

function deleteGasto(id) {
  console.log("Delete Gasto", id);
}

function openAsistenciaModal(id = null) {
  console.log("Open Asistencia Modal", id);
}

function saveAsistencia() {
  console.log("Save Asistencia");
}

function deleteAsistencia(id) {
  console.log("Delete Asistencia", id);
}

function openPagoModal(id = null) {
  console.log("Open Pago Modal", id);
}

function savePago() {
  console.log("Save Pago");
}

function deletePago(id) {
  console.log("Delete Pago", id);
}

function openHorarioModal(id = null) {
  console.log("Open Horario Modal", id);
}

function saveHorario() {
  console.log("Save Horario");
}

function deleteHorario(id) {
  console.log("Delete Horario", id);
}

function openTareaModal(id = null) {
  console.log("Open Tarea Modal", id);
}

function saveTarea() {
  console.log("Save Tarea");
}

function deleteTarea(id) {
  console.log("Delete Tarea", id);
}

function openClienteModal(id = null) {
  console.log("Open Cliente Modal", id);
}

function saveCliente() {
  console.log("Save Cliente");
}

function deleteCliente(id) {
  console.log("Delete Cliente", id);
}

function openMenuModal(id = null) {
  console.log("Open Menu Modal", id);
}

function saveMenu() {
  console.log("Save Menu");
}

function deleteMenu(id) {
  console.log("Delete Menu", id);
}

function openVentaModal(id = null) {
  console.log("Open Venta Modal", id);
}

function saveVenta() {
  console.log("Save Venta");
}

function deleteVenta(id) {
  console.log("Delete Venta", id);
}

function confirmDelete() {
  if (deleteCallback) {
    deleteCallback();
    deleteCallback = null;
  }
  bootstrap.Modal.getInstance(document.getElementById("deleteModal")).hide();
}

// Chatbot functionality
function initializeChatbot() {
  const chatInput = document.getElementById("chatInput");
  const sendButton = document.getElementById("sendMessage");

  if (chatInput && sendButton) {
    chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        sendChatMessage();
      }
    });

    sendButton.addEventListener("click", sendChatMessage);
  }
}

async function sendChatMessage() {
  const chatInput = document.getElementById("chatInput");
  const chatMessages = document.getElementById("chatMessages");
  const message = chatInput.value.trim();

  if (!message) return;

  // Add user message
  addChatMessage(message, "user");
  chatInput.value = "";

  // Show typing indicator
  showTypingIndicator();

  try {
    // Call your chatbot API
    const response = await apiRequest("/chatbot", "POST", { message });

    // Remove typing indicator
    removeTypingIndicator();

    // Add bot response
    if (response.response) {
      addChatMessage(response.response, "bot");
    } else if (response.result) {
      // Handle database query results
      const resultText = Array.isArray(response.result)
        ? `Encontré ${response.result.length} resultados:\n${JSON.stringify(
            response.result,
            null,
            2
          )}`
        : JSON.stringify(response.result, null, 2);
      addChatMessage(resultText, "bot");
    } else {
      addChatMessage("Lo siento, no pude procesar tu mensaje.", "bot");
    }
  } catch (error) {
    console.error("Error sending message:", error);
    removeTypingIndicator();
    addChatMessage("Lo siento, hubo un error al procesar tu mensaje.", "bot");
  }
}

function addChatMessage(message, sender) {
  const chatMessages = document.getElementById("chatMessages");
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${sender}-message`;

  const now = new Date();
  const timeString = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  messageDiv.innerHTML = `
    <div class="message-content">
      ${sender === "bot" ? '<i class="fas fa-robot me-2"></i>' : ""}
      ${message}
    </div>
    <div class="message-time">${timeString}</div>
  `;

  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
  const chatMessages = document.getElementById("chatMessages");
  const typingDiv = document.createElement("div");
  typingDiv.className = "message bot-message";
  typingDiv.id = "typing-indicator";

  typingDiv.innerHTML = `
    <div class="typing-indicator">
      <i class="fas fa-robot me-2"></i>
      <div class="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  `;

  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
  const typingIndicator = document.getElementById("typing-indicator");
  if (typingIndicator) {
    typingIndicator.remove();
  }
}

// Login function
function handleLogin() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Simple validation (in a real app, this would be handled by a backend)
  if (email && password) {
    // Close modal
    const loginModal = bootstrap.Modal.getInstance(
      document.getElementById("loginModal")
    );
    loginModal.hide();

    // Show success message
    showNotification("Inicio de sesión exitoso", "success");

    // Update UI to show logged in state
    updateLoginState(true);
  } else {
    showNotification("Por favor completa todos los campos", "error");
  }
}

function updateLoginState(isLoggedIn) {
  const loginBtn = document.querySelector('[data-bs-target="#loginModal"]');
  if (isLoggedIn && loginBtn) {
    loginBtn.innerHTML = '<i class="fas fa-user me-1"></i>Mi Cuenta';
    loginBtn.setAttribute("data-bs-target", "");
    loginBtn.onclick = () => showSection("cuenta");
  }
}

// Notification function
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `alert alert-${
    type === "error" ? "danger" : type
  } alert-dismissible fade show position-fixed`;
  notification.style.cssText =
    "top: 20px; right: 20px; z-index: 9999; min-width: 300px;";
  notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

  document.body.appendChild(notification);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 5000);
}

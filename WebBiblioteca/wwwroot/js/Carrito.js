
$(document).ready(function () {
    $('#offcanvasRight').on('show.bs.offcanvas', function () {
        cargarCarrito();
    });
});

function cargarCarrito() {
    const authToken = sessionStorage.getItem('AuthToken');
    const emailUsuario = sessionStorage.getItem('EmailUsuario');

    if (!authToken) {
        return Swal.fire({
            icon: 'error',
            title: 'ERROR',
            html: 'Haz tenido un error, deslogueate y vuelve a loguearte'
        }).then(() => {
            sessionStorage.removeItem('AuthToken');
            localStorage.removeItem('AuthToken');
            window.location.href = '/Login';
        });
    }

    $.ajax({
        url: 'https://localhost:7003/api/usuarios',
        type: 'GET',
        headers: { 'Authorization': 'Bearer ' + authToken },
        success: function (usuarios) {
            const usuario = usuarios.find(u => u.email === emailUsuario);
            if (!usuario) {
                return Swal.fire('Usuario no encontrado', 'Por favor inicia sesión de nuevo', 'error')
                    .then(() => window.location.href = '/Login');
            }


            const body = $('#offcanvasRight .offcanvas-body').empty();

            const librosArr = JSON.parse(sessionStorage.getItem('carritoLibros') || '[]');
            const productosArr = JSON.parse(sessionStorage.getItem('carritoProducto') || '[]');
            const carrito = [
                ...librosArr.map(l => ({ ...l, type: 'libro' })),
                ...productosArr.map(p => ({ ...p, type: 'producto' }))
            ];

            if (carrito.length === 0) {
                body.append(`<p class="text-center">No hay artículos en el carrito</p>`);
                return;
            }

            carrito.forEach(item => {
                let html;
                if (item.type === 'libro') {
                    html = `
  <div class="d-flex align-items-center mb-3 border-bottom pb-2">
    <img src="${item.foto}" alt="${item.titulo}"
         style="width:50px; height:50px; object-fit:cover;"
         class="me-3"/>
    <div class="flex-grow-1">
      <h6 class="m-0">${item.titulo}</h6>
      <p class="m-0 text-muted">₡${item.precio_alquiler}</p>
      <p class="m-0 text-muted">Cantidad: ${item.cantidad}</p>
      <p class="m-0">Total: ₡${item.precio_Producto_cantidad}</p>
    </div>
    <button class="btn btn-sm btn-danger"
            onclick="eliminarItem('libro', ${item.id_libro})">
      <i class="fa-solid fa-trash"></i>
    </button>
  </div>`;
                } else { // producto
                    html = `
  <div class="d-flex align-items-center mb-3 border-bottom pb-2">
    <img src="${item.fotoPath}" alt="${item.nombre}"
         style="width:50px; height:50px; object-fit:cover;"
         class="me-3"/>
    <div class="flex-grow-1">
      <h6 class="m-0">${item.nombre}</h6>
      <p class="m-0 text-muted">₡${item.precioProducto}</p>
      <p class="m-0 text-muted">Cantidad: ${item.cantidad}</p>
      <p class="m-0">Total: ₡${item.precio_producto_cantidad}</p>
    </div>
    <button class="btn btn-sm btn-danger"
            onclick="eliminarItem('producto', ${item.id_productos})">
      <i class="fa-solid fa-trash"></i>
    </button>
  </div>`;
                }
                body.append(html);
            });

            body.append(`
  <div class="d-flex justify-content-between mt-3">
    <button class="btn btn-sm btn-danger" onclick="eliminarTodos()">
      <i class="fa-solid fa-trash"></i> Vaciar carrito
    </button>
    <button class="btn btn-sm btn-success" onclick="finalizarCompra()">
      <i class="fa-solid fa-book"></i> Comprar artículos
    </button>
  </div>
  `);
        },
        error: function (xhr) {
            if (xhr.status === 401 || xhr.status === 403) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Sesión inválida',
                    text: 'Por favor inicia sesión de nuevo'
                }).then(() => window.location.href = '/Login');
            } else {
                console.error('Error al cargar perfil:', xhr.status, xhr.responseText);
            }
        }
    });
}

function eliminarItem(type, id) {
    if (type === 'libro') {
        let librosArr = JSON.parse(sessionStorage.getItem('carritoLibros') || '[]');
        librosArr = librosArr.filter(l => l.id_libro !== id);
        sessionStorage.setItem('carritoLibros', JSON.stringify(librosArr));
    } else {
        let prodArr = JSON.parse(sessionStorage.getItem('carritoProducto') || '[]');
        prodArr = prodArr.filter(p => p.id_productos !== id);
        sessionStorage.setItem('carritoProducto', JSON.stringify(prodArr));
    }
    cargarCarrito();
}

function eliminarTodos() {
    sessionStorage.removeItem('carritoLibros');
    sessionStorage.removeItem('carritoProducto');
    cargarCarrito();
}

function agregarArticulos() {
    window.location.href = '/Facturacion';
}
              

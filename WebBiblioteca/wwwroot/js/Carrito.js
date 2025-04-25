
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


            const carrito = JSON.parse(sessionStorage.getItem("carritoLibros") || '[]');


            $.each(carrito, function (_, libro) {

                const itemHtml = `
  <div class="d-flex align-items-center mb-3 border-bottom pb-2">
    <img
      src="${libro.foto}" 
      alt="${libro.titulo}" 
      style="width:50px; height:50px; object-fit:cover;" 
      class="me-3" 
    />
    <div class="flex-grow-1">
      <h6 class="m-0">${libro.titulo}</h6>
      <p class="m-0 text-muted">₡${libro.precio_alquiler}</p>
      <p class="m-0 text-muted">Cantidad: ${libro.cantidad}</p>
      <p class="m-0">Precio por cantidad: ₡${libro.precio_Producto_cantidad}</p>
    </div>
    <div>
      <button 
        class="btn btn-sm btn-danger" 
        onclick="eliminarLibro(${libro.id_libro})"
      >
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
  </div>
        `;
                body.append(itemHtml);
            });

            if (carrito.length > 0) {
                body.append(`
                <div class="d-flex justify-content-between">
                <button class="btn btn-sm btn-danger" onclick="eliminarTodosLibros()"><i class="fa-solid fa-trash"></i> Eliminar articulos</button>
                <button class="btn btn-sm btn-success" onclick="agregarArticulos()"><i class="fa-solid fa-book"></i> Comprar articulos</button>
                </div>
                `)
            }

            if (carrito.length == 0) {
                body.append(`<p class="text-center">No hay articulos en el carrito</p>`)
            }

           
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


function eliminarLibro(id) {
    const idParseada = parseInt(id);

    let carrito = JSON.parse(sessionStorage.getItem("carritoLibros") || '[]');
    let carritomodificado = carrito.filter(c => parseInt(c.id_libro) !== idParseada);
    sessionStorage.setItem('carritoLibros', JSON.stringify(carritomodificado));
    cargarCarrito();
}

function eliminarTodosLibros() {
    sessionStorage.removeItem("carritoLibros");
    cargarCarrito();
}

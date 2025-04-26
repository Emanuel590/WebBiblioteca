$(document).ready(function () {
    $('#offcanvasWithBothOptions').on('show.bs.offcanvas', function () {
        cargarReservas();
    });
});

function cargarReservas() {
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

            const body = $('#offcanvasWithBothOptions .offcanvas-body').empty();
            const reservasArr = JSON.parse(sessionStorage.getItem('carritoLibrosR') || '[]');

            if (reservasArr.length === 0) {
                body.append(`<p class="text-center">No tienes reservas pendientes</p>`);
                return;
            }

            reservasArr.forEach(libro => {
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
              <p class="m-0">Total: ₡${libro.precio_Producto_cantidad}</p>
            </div>
            <button
              class="btn btn-sm btn-danger"
              onclick="eliminarLibroR(${libro.id_libro})"
            >
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        `;
                body.append(itemHtml);
            });

            body.append(`
        <div class="d-flex justify-content-between mt-3">
          <button class="btn btn-sm btn-danger" onclick="eliminarTodasReservas()">
            <i class="fa-solid fa-trash"></i> Eliminar todas las reservas
          </button>
          <button class="btn btn-sm btn-success" onclick="confirmarReservas()">
            <i class="fa-solid fa-calendar-check"></i> Confirmar reservas
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
                console.error('Error al cargar reservas:', xhr.status, xhr.responseText);
            }
        }
    });
}

function reservasLibro(id) {
    $.get(`https://localhost:7003/api/Libros/${id}`, function (libro) {
        const libroUnitarioR = {
            id_libro: libro.id_libro,
            foto: libro.fotoPath,
            titulo: libro.titulo,
            precio_alquiler: libro.precio_alquiler,
            stock: libro.stock,
            id_Autor: libro.id_Autor,
            id_Genero: libro.id_Genero,
            cantidad: 1,
            precio_Producto_cantidad: libro.precio_alquiler
        };

        let carritoR = JSON.parse(sessionStorage.getItem('carritoLibrosR') || '[]');
        const idx = carritoR.findIndex(c => c.id_libro === libroUnitarioR.id_libro);

        if (idx !== -1) {
            if (carritoR[idx].cantidad < libroUnitarioR.stock) {
                carritoR[idx].cantidad += 1;
                carritoR[idx].precio_Producto_cantidad =
                    carritoR[idx].precio_alquiler * carritoR[idx].cantidad;
            } else {
                return toastr.error('No hay suficiente stock');
            }
        } else {
            carritoR.push(libroUnitarioR);
        }

        sessionStorage.setItem('carritoLibrosR', JSON.stringify(carritoR));
        toastr.success('¡Reserva agregada!');
        cargarReservas();
    }).fail(() => {
        toastr.error('No se pudo agregar la reserva');
    });
}

function eliminarLibroR(id) {
    let carritoR = JSON.parse(sessionStorage.getItem('carritoLibrosR') || '[]');
    carritoR = carritoR.filter(c => c.id_libro !== id);
    sessionStorage.setItem('carritoLibrosR', JSON.stringify(carritoR));
    cargarReservas();
}

function eliminarTodasReservas() {
    sessionStorage.removeItem('carritoLibrosR');
    cargarReservas();
}

function confirmarReservas() {
    Swal.fire('¡Reservas confirmadas!', '', 'success');
    eliminarTodasReservas();
}


let libros = [];
let usuarios = [];
let tablaReservas;

$(document).ready(function () {
    cargarReservasTabla();
    cargarLibroReserva();
    cargarUsuario();

});


//--------------------
function cargarLibroReserva() {
   $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Libros",
        dataType: "json",
        success: function (response) {
            $.each(response, function (_, libro) {

                libros[libro.id_libro] = libro.titulo;
            });
            if (tablaReservas) {
                tablaReservas.ajax.reload();
            }
        },
        error: function (xhr, status, error) {
            console.log("ERROR cargando estados:", error, xhr, status);
        }
    });
}
function cargarUsuario() {
    const token = localStorage.getItem("AuthToken");

    $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Usuarios",
        dataType: "json",

        headers: {
            'Authorization': 'Bearer ' + token
        },
        success: function (response) {
            $.each(response, function (_, usuario) {
                usuarios[usuario.id_usuario] = usuario.email;
            });

            if (tablaReservas) {
                tablaReservas.ajax.reload(null, false);
            } else {
                cargarReservasTabla();
            }
        },
        error: function (xhr, status, error) {
            console.log("ERROR al cargar usuarios:", error, xhr, status);
        }
    });
}



//Mostrar Reservas ADMIN
function cargarReservasTabla() {
    if (!$.fn.DataTable.isDataTable('#tablaReservas')) {
        tablaReservas = $('#tablaReservas').DataTable({
            ajax: {
            url: "https://localhost:7003/api/Reservas",
            dataSrc: ''
           },
        dom: 'frtip',
        columns: [
            { data: 'id_reservas' },

            {
                data: 'id_Libro',
                render: function (data) {
                    return libros[data] || 'No definido';
                }

            },
            {
                data: 'id_Usuario',
                render: function (data) {
                return usuarios[data] || 'No definido';
                }
            },
            { data: 'fecha' },
            {
                data: null,
                render: function (row) {
                    let botonEstado = row.id_Estado == 1
                        ? `<button class="btn btn-danger rounded px-2 py-1" onclick="actualizarEstadoReserva(${row.id_reservas}, 2,)">
                                    <i class="fa-solid fa-eye-slash"></i> Inactivar
                               </button>`
                        : `<button class="btn btn-success rounded px-2 py-1" onclick="actualizarEstadoReserva(${row.id_reservas},  1)">
                                    <i class="fa-solid fa-eye"></i> Activar
                               </button>`;
                    
                    return botonEstado;
                }
            },
      
            {
                data: null,
                render: function (row) {
                    return ` <button onclick="eliminarReservaAdminId(${row.id_reservas})" class="btn btn-danger rounded px-2 py-1">
                                    <i class="fa-solid fa-trash"></i> Eliminar
                                </button>`;
                    }
                }
            ]
        });
    } else {

        tablaReservas.ajax.reload();
    }
}

   
     

function actualizarEstadoReserva(id_reservas, estado) {
    var datos = {
        id_reservas: id_reservas,
        iD_ESTADO: estado
    };
    $.ajax({
        type: "PUT",
        url: `https://localhost:7003/api/Reservas/estado/${datos.id_reservas}?estado=${datos.iD_ESTADO}`,
        data: JSON.stringify(datos),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            tablaReservas.ajax.reload();
        },
        error: function (xhr, status, error) {
            console.log("ERROR:", error, xhr, status);
        }
    });
}

function eliminarReservaAdminId(idReservas) {
    const idParseadaReserva = parseInt(idReservas)
    Swal.fire({
        title: "¿Estás seguro que deseas eliminar esta reserva?",
        html: "Si lo haces no podrás recuperar la información.",
        showDenyButton: true,
        confirmButtonText: "SI",
        denyButtonText: "CANCELAR"
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                type: "DELETE",
                url: `https://localhost:7003/api/Reservas/${idParseadaReserva}`,
                success: function () {
                    Swal.fire("Eliminado", "Reserva se ha eliminado.", "success");
                    tablaReservas.ajax.reload();
                },
                error: function (xhr, status, error) {
                    console.log("ERROR:", error, xhr.status, xhr.responseText);
                    Swal.fire("Error", "No se pudo eliminar la reserva.", "error");
                }
            });
        } else if (result.isDenied) {
            Swal.fire("Cancelado", "No se eliminó la reserva. ", "info");
        }
    });
}
    
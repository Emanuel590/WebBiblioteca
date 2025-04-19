var tablaAutores;

$(document).ready(function () {
    cargarAutoresTabla();
    agregarAutores();
});

// Método para inicializar la tabla
function cargarAutoresTabla() {
    
    if (!$.fn.DataTable.isDataTable('#tablaAutores')) { // Verifica si la tabla ya está inicializada
        tablaAutores = $('#tablaAutores').DataTable({
            ajax: {
                url: "https://localhost:7003/api/Autores",
                dataSrc: '' // arreglo directo
            },
            dom: 'frtip',
            columns: [
                { data: 'id_Autor' },
                { data: 'nombre' },
                { data: 'apellido' },
                {
                    data: 'id_Estado',
                    render: function (data) {
                        return data == 1
                            ? '<span class="text-success">Activo</span>'
                            : '<span class="text-danger">Inactivo</span>';
                    }
                },
                {
                    data: null,
                    render: function (row) {
                        let botonEstado = row.id_Estado == 1
                            ? `<button class="btn btn-danger rounded px-2 py-1" onclick="actualizarEstadoIdAutor(${row.id_Autor}, '${row.nombre}', '${row.apellido}', 2)">
                                    <i class="fa-solid fa-eye-slash"></i> Inactivar
                               </button>`
                            : `<button class="btn btn-success rounded px-2 py-1" onclick="actualizarEstadoIdAutor(${row.id_Autor}, '${row.nombre}', '${row.apellido}', 1)">
                                    <i class="fa-solid fa-eye"></i> Activar
                               </button>`;
                        let botonEditar = `<button data-bs-toggle="modal" data-bs-target="#exampleModal2" onclick="formActualizar(${row.id_Autor}, '${row.nombre}', '${row.apellido}', ${row.id_Estado})" class="btn btn-primary rounded px-2 py-1">
                                                Editar
                                           </button>`;
                        return botonEstado + ' ' + botonEditar;
                    }
                },
                {
                    data: null,
                    render: function (row) {
                        return `<button onclick="eliminarAutorId(${row.id_Autor})" class="btn btn-danger rounded px-2 py-1">
                                    <i class="fa-solid fa-trash"></i> Eliminar
                                </button>`;
                    }
                }
            ]
        });
    } else {

        tablaAutores.ajax.reload();
    }
}

// Función para mostrar el formulario de actualización
function formActualizar(id, nombre, apellido, estado) {
    $('#id').val(id);
    $('#nombreEditar').val(nombre);
    $('#apellidoEditar').val(apellido);
    $('#estadoEditar').val(estado);
    $('#exampleModal2').modal('show');
}

// Enviar datos para actualizar
$('#AutoresActualizar').on('submit', function (event) {
    event.preventDefault();

    var datos = {
        id_Autor: $('#id').val(),
        nombre: $('#nombreEditar').val(),
        apellido: $('#apellidoEditar').val(),
        id_Estado: $('#estadoEditar').val()
    };

    $.ajax({
        type: "PUT",
        url: `https://localhost:7003/api/Autores/${datos.id_Autor}`,
        data: JSON.stringify(datos),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (datos) {

            tablaAutores.ajax.reload();
            $('#exampleModal2').modal('hide');
        },
        error: function (xhr, status, error) {
            console.log("ERROR:", error, xhr, status);
        }
    });
});

// Método para agregar autores
function agregarAutores() {
    $('#AutoresAgregar').on('submit', function (event) {
        event.preventDefault();

        var datos = {
            nombre: $('#nombre').val(),
            apellido: $('#apellido').val()
        };

        $.ajax({
            type: "POST",
            url: "https://localhost:7003/api/Autores",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(datos),
            success: function (datos) {
                $('#exampleModal').modal('hide');

                tablaAutores.ajax.reload();
            },
            error: function (xhr, status, error) {
                console.log("ERROR: ", error, xhr, status);
            }
        });
    });
}

// Método para actualizar estado (activar/inactivar)
function actualizarEstadoIdAutor(id, nombreEstado, apellidoEstado, estado) {
    var datos = { id_Autor: id, nombre: nombreEstado, apellido: apellidoEstado, id_Estado: estado };
    $.ajax({
        type: "PUT",
        url: `https://localhost:7003/api/Autores/${id}`,
        data: JSON.stringify(datos),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (datos) {

            tablaAutores.ajax.reload();
        },
        error: function (xhr, status, error) {
            console.log("ERROR:", error, xhr, status);
        }
    });
}

// Método para eliminar autores
function eliminarAutorId(id) {
    let idParseada = parseInt(id);
    Swal.fire({
        title: "¿Estás seguro que deseas eliminar este Autor?",
        html: "Si lo haces no podrás recuperar la información.",
        showDenyButton: true,
        confirmButtonText: "SI",
        denyButtonText: "CANCELAR"
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                type: "DELETE",
                url: `https://localhost:7003/api/Autores/${idParseada}`,
                success: function (response) {
                    Swal.fire("Eliminado", "El autor ha sido eliminado.", "success");

                    tablaAutores.ajax.reload();
                },
                error: function (xhr, status, error) {
                    console.log("ERROR:", error, xhr.status, xhr.responseText);
                    Swal.fire("Error", "No se pudo eliminar el autor. Lo más probable es que tengas un autor asociado a otra entidad.", "error");
                }
            });
        } else if (result.isDenied) {
            Swal.fire("Cancelado", "No se eliminó el autor.", "info");
        }
    });
}

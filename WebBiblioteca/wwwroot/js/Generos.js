// Variable global para la instancia del DataTable de géneros
var tablaGeneros;

$(document).ready(function () {
    cargarGenerosTabla();
    cargarGenerosNavbar();
    agregarGenero();
});

// Método para inicializar o recargar la tabla de géneros
function cargarGenerosTabla() {
    if (!$.fn.DataTable.isDataTable('#tablaGenero')) {
        tablaGeneros = $('#tablaGenero').DataTable({
            ajax: {
                url: "https://localhost:7003/api/Generos",
                dataSrc: '' // Se asume que la respuesta es un arreglo directo
            },
            dom: 'frtip',
            columns: [
                { data: 'id_Genero' },
                { data: 'nombre' },
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
                            ? `<button class="btn btn-danger rounded px-2 py-1" onclick="actualizarEstadoId(${row.id_Genero}, '${row.nombre}', 2)">
                                    <i class="fa-solid fa-eye-slash"></i> Inactivar
                               </button>`
                            : `<button class="btn btn-success rounded px-2 py-1" onclick="actualizarEstadoId(${row.id_Genero}, '${row.nombre}', 1)">
                                    <i class="fa-solid fa-eye"></i> Activar
                               </button>`;
                        let botonEditar = `<button data-bs-toggle="modal" data-bs-target="#exampleModal1" onclick="editarGenero(${row.id_Genero}, '${row.nombre}', ${row.id_Estado})" class="btn btn-primary rounded px-2 py-1">
                                                Editar
                                           </button>`;
                        return botonEstado + ' ' + botonEditar;
                    }
                },
                {
                    data: null,
                    render: function (row) {
                        return `<button onclick="eliminarGeneroId(${row.id_Genero})" class="btn btn-danger rounded px-2 py-1">
                                    <i class="fa-solid fa-trash"></i> Eliminar
                                </button>`;
                    }
                }
            ]
        });
    } else {
        tablaGeneros.ajax.reload();
    }
}

// Método para cargar los géneros en el navbar (sin DataTables)
function cargarGenerosNavbar() {
    $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Generos",
        dataType: "json",
        success: function (response) {
            const rowFiltered = response.filter(g => g.id_Estado == 1);
            const ul = $('#ulGeneros');
            ul.empty();
            $.each(rowFiltered, function (_, genero) {
                const row = `<li class="item-dropdown"><a class="dropdown-item" href="/Genero/${genero.id_Genero}">${genero.nombre}</a></li>`;
                ul.append(row);
            });
        },
        error: function (xhr, status, error) {
            console.log("ERROR: ", error, xhr, status);
        }
    });
}

// Método para actualizar el estado de un género (activar/inactivar)
function actualizarEstadoId(id, genero, nuevoEstado) {
    var datos = { id_Genero: id, nombre: genero, id_Estado: nuevoEstado };
    $.ajax({
        type: "PUT",
        url: `https://localhost:7003/api/Generos/${id}`,
        data: JSON.stringify(datos),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (datos) {
            // Recarga la tabla y el navbar
            tablaGeneros.ajax.reload();
            cargarGenerosNavbar();
        },
        error: function (xhr, status, error) {
            console.log("ERROR:", error, xhr, status);
        }
    });
}

// Método para eliminar un género
function eliminarGeneroId(id) {
    const idParseada = parseInt(id);
    Swal.fire({
        title: "¿Estás seguro que deseas eliminar este Género?",
        html: "Si lo haces no podrás recuperar la información.",
        showDenyButton: true,
        confirmButtonText: "SI",
        denyButtonText: "CANCELAR"
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                type: "DELETE",
                url: `https://localhost:7003/api/Generos/${idParseada}`,
                success: function (response) {
                    Swal.fire("Eliminado", "El género ha sido eliminado.", "success");
                    tablaGeneros.ajax.reload();
                    cargarGenerosNavbar();
                },
                error: function (xhr, status, error) {
                    console.log("ERROR:", error, xhr.status, xhr.responseText);
                    Swal.fire("Error", "No se pudo eliminar el género. Lo más probable es que tengas un género asociado a otra entidad.", "error");
                }
            });
        } else if (result.isDenied) {
            Swal.fire("Cancelado", "No se eliminó el género.", "info");
        }
    });
}

// Método para obtener datos y mostrar el formulario de edición
function editarGenero(id, nombre, estado) {
    $('#id_Editar').val(id);
    $('#genero_Editar').val(nombre);
    $('#estado_Editar').val(estado);
    $('#exampleModal1').modal('show');
}

// Enviar formulario de actualización
$('#ActualizarForm').on('submit', function (event) {
    event.preventDefault();
    var datos = {
        id_Genero: $('#id_Editar').val(),
        nombre: $('#genero_Editar').val(),
        id_Estado: $('#estado_Editar').val()
    };
    $.ajax({
        type: "PUT",
        url: `https://localhost:7003/api/Generos/${datos.id_Genero}`,
        data: JSON.stringify(datos),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (datos) {
            tablaGeneros.ajax.reload();
            $('#exampleModal1').modal('hide');
        },
        error: function (xhr, status, error) {
            console.log("ERROR:", error, xhr, status);
        }
    });
});

// Método para agregar un nuevo género
function agregarGenero() {
    $('#BinarioONoBinario').on('submit', function (event) {
        event.preventDefault();
        var datos = {
            nombre: $('#genero').val()
        };
        $.ajax({
            type: "POST",
            url: "https://localhost:7003/api/Generos",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(datos),
            success: function (datos) {
                $('#exampleModal').modal('hide');
                tablaGeneros.ajax.reload();
                cargarGenerosNavbar();
            },
            error: function (xhr, status, error) {
                console.log("ERROR: ", error, xhr, status);
            }
        });
    });
}





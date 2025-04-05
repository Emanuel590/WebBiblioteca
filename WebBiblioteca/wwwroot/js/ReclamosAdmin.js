
let libros = [];
let usuarios = [];

$(document).ready(function () {
    cargarReclamosTabla();
    cargarLibros();
    cargarUsuarios();
    agregarReclamo();
});


function cargarLibros() {
    $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Libros",
        dataType: "json",
        success: function (response) {

            const librosFiltrados = response.filter(libro => libro.id_Estado == 1);

            $.each(librosFiltrados, function (_, libro) {
                libros[libro.id_libro] = libro.titulo;
            });

            const select = $('#librosOption');
            select.empty();
            select.append(`<option selected>Seleccione un libro</option>`);
            $.each(librosFiltrados, function (_, libro) {
                select.append(`<option value="${libro.id_libro}">${libro.titulo}</option>`);
            });

            const selectEdit = $('#librosOptionEdit');
            selectEdit.empty();
            selectEdit.append(`<option selected>Seleccione un libro</option>`);
            $.each(librosFiltrados, function (_, libro) {
                selectEdit.append(`<option value="${libro.id_libro}">${libro.titulo}</option>`);
            });

            cargarReclamosTabla();
        },
        error: function (xhr, status, error) {
            console.log("ERROR al cargar libros:", error);
        }
    });
}



function cargarUsuarios() {
    const token = localStorage.getItem("AuthToken");

    $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Usuarios",
        dataType: "json",

        headers: {
            'Authorization': 'Bearer ' + token
        },success: function (response) {

            const usuariosFiltrados = response.filter(usuario => usuario.id_estado == 1);
            $.each(usuariosFiltrados, function (_, usuario) {

                usuarios[usuario.id_usuario] = usuario.nombre;
            });

            const select = $('#usuariosOption');
            select.empty();
            select.append(`<option selected>Seleccione un usuario</option>`);
            $.each(usuariosFiltrados, function (_, usuario) {
                select.append(`<option value="${usuario.id_usuario}">${usuario.nombre}</option>`);
            });

            const selectEdit = $('#usuariosOptionEdit');
            selectEdit.empty();
            selectEdit.append(`<option selected>Seleccione un usuario</option>`);
            $.each(usuariosFiltrados, function (_, usuario) {
                selectEdit.append(`<option value="${usuario.id_usuario}">${usuario.nombre}</option>`);
            });

            cargarReclamosTabla();
        },
        error: function (xhr, status, error) {
            console.log("ERROR al cargar usuarios:", error);
        }
    });
}


function cargarReclamosTabla() {
    $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Reclamos",
        dataType: "json",
        success: function (response) {
            const tabla = $('#tablaReclamos tbody');
            tabla.empty();
            $.each(response, function (_, reclamo) {

                const tituloLibro = libros[reclamo.id_Libro] || 'No definido';
                const nombreUsuario = usuarios[reclamo.id_Usuario] || 'No definido';
                const row = `
                    <tr>
                        <td>${reclamo.id_Reclamo}</td>
                        <td>${reclamo.descripcion}</td>
                        <td>${tituloLibro}</td>
                        <td>${nombreUsuario}</td>
                        <td>${reclamo.id_Estado == 1 ?
                        `<span class="text-success">Activo</span>` :
                        `<span class="text-danger">Inactivo</span>`
                    }</td>
                        <td>
                            ${reclamo.id_Estado == 1 ?
                        `<button class="btn btn-danger rounded px-2 py-1" onclick="editarEstadoReclamo(${reclamo.id_Reclamo}, '${reclamo.descripcion}', ${reclamo.id_Libro}, ${reclamo.id_Usuario}, 2)">
                                    <i class="fa-solid fa-eye-slash"></i> Inactivar
                                </button>` :
                        `<button class="btn btn-success rounded px-2 py-1" onclick="editarEstadoReclamo(${reclamo.id_Reclamo}, '${reclamo.descripcion}', ${reclamo.id_Libro}, ${reclamo.id_Usuario}, 1)">
                                    <i class="fa-solid fa-eye"></i> Activar
                                </button>`
                    }
                            <button data-bs-toggle="modal" data-bs-target="#exampleModal3" onclick="obtenerDatosActualizadosReclamo(${reclamo.id_Reclamo}, '${reclamo.descripcion}', ${reclamo.id_Libro}, ${reclamo.id_Usuario}, ${reclamo.id_Estado})" class="btn btn-primary rounded px-2 py-1">
                                Editar
                            </button>
                        </td>
                        <td>
                            <button onclick="eliminarReclamoId(${reclamo.id_Reclamo})" class="btn btn-danger rounded px-2 py-1">
                                <i class="fa-solid fa-trash"></i> Eliminar
                            </button>
                        </td>
                    </tr>
                `;
                tabla.append(row);
            });
        },
        error: function (xhr, status, error) {
            console.log("ERROR al cargar reclamos:", error);
        }
    });
}


function editarEstadoReclamo(id_Reclamo, descripcion, id_Libro, id_Usuario, nuevoEstado) {
    const datos = {
        id_Reclamo: id_Reclamo,
        descripcion: descripcion,
        id_Libro: id_Libro,
        id_Usuario: id_Usuario,
        id_Estado: nuevoEstado
    };
    $.ajax({
        type: "PUT",
        url: `https://localhost:7003/api/Reclamos/${id_Reclamo}`,
        data: JSON.stringify(datos),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            cargarReclamosTabla();
        },
        error: function (xhr, status, error) {
            console.log("ERROR al actualizar estado del reclamo:", error);
        }
    });
}


function eliminarReclamoId(id) {
    const idParseada = parseInt(id);
    Swal.fire({
        title: "¿Estás seguro que deseas eliminar este Reclamo?",
        html: "Si lo haces no podrás recuperar la información.",
        showDenyButton: true,
        confirmButtonText: "SI",
        denyButtonText: "CANCELAR"
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                type: "DELETE",
                url: `https://localhost:7003/api/Reclamos/${idParseada}`,
                success: function (response) {
                    Swal.fire("Eliminado", "El reclamo ha sido eliminado.", "success");
                    cargarReclamosTabla();
                },
                error: function (xhr, status, error) {
                    console.log("ERROR al eliminar reclamo:", error);
                    Swal.fire("Error", "No se pudo eliminar el reclamo.", "error");
                }
            });
        } else if (result.isDenied) {
            Swal.fire("Cancelado", "No se eliminó el reclamo.", "info");
        }
    });
}


function agregarReclamo() {
    $('#ReclamosAgregar').on('submit', function (event) {
        event.preventDefault();

        const datos = {
            descripcion: $('#descripcionReclamo').val(),
            id_Libro: $('#librosOption').val(),
            id_Usuario: $('#usuariosOption').val()
        };
        $.ajax({
            type: "POST",
            url: "https://localhost:7003/api/Reclamos",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(datos),
            success: function (response) {
                $('#exampleModal').modal('hide');
                cargarReclamosTabla();
            },
            error: function (xhr, status, error) {
                console.log("ERROR al agregar reclamo:", error);
            }
        });
    });
}


function obtenerDatosActualizadosReclamo(id_Reclamo, descripcion, id_Libro, id_Usuario, id_Estado) {
    $('#idEdit').val(id_Reclamo);
    $('#descripcionEdit').val(descripcion);
    $('#librosOptionEdit').val(id_Libro);
    $('#usuariosOptionEdit').val(id_Usuario);
    $('#estadoEdit').val(id_Estado);
    $('#exampleModal3').modal('show');
}


$('#ReclamosActualizar').on('submit', function (event) {
    event.preventDefault();
    const datos = {
        id_Reclamo: $('#idEdit').val(),
        descripcion: $('#descripcionEdit').val(),
        id_Libro: $('#librosOptionEdit').val(),
        id_Usuario: $('#usuariosOptionEdit').val(),
        id_Estado: $('#estadoEdit').val()
    };
    $.ajax({
        type: "PUT",
        url: `https://localhost:7003/api/Reclamos/${datos.id_Reclamo}`,
        data: JSON.stringify(datos),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            cargarReclamosTabla();
            $('#exampleModal3').modal('hide');
        },
        error: function (xhr, status, error) {
            console.log("ERROR al actualizar reclamo:", error);
        }
    });
});

let libros = [];
let usuarios = [];

$(document).ready(function () {
    cargarResenasTabla();
    cargarLibros();
    cargarUsuarios();
    agregarResena();
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

            cargarResenasTabla();
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
        },
        success: function (response) {
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

            cargarResenasTabla();
        },
        error: function (xhr, status, error) {
            console.log("ERROR al cargar usuarios:", error);
        }
    });
}

function cargarResenasTabla() {
    $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Resenas",
        dataType: "json",
        success: function (response) {
            const tabla = $('#tablaResenas tbody');
            tabla.empty();
            $.each(response, function (_, resena) {

                const tituloLibro = libros[resena.id_Libro] || 'No definido';
                const nombreUsuario = usuarios[resena.id_Usuario] || 'No definido';
                const row = `
                    <tr>
                        <td>${resena.id_Resena}</td>
                        <td>${resena.resena}</td>
                        <td>${tituloLibro}</td>
                        <td>${nombreUsuario}</td>
                        <td>${resena.id_Estado == 1 ?
                        `<span class="text-success">Activo</span>` :
                        `<span class="text-danger">Inactivo</span>`
                    }</td>
                        <td>
                            ${resena.id_Estado == 1 ?
                        `<button class="btn btn-danger rounded px-2 py-1" onclick="editarEstadoResena(${resena.id_Resena}, '${resena.resena}', ${resena.id_Libro}, ${resena.id_Usuario}, 2)">
                                    <i class="fa-solid fa-eye-slash"></i> Inactivar
                                </button>` :
                        `<button class="btn btn-success rounded px-2 py-1" onclick="editarEstadoResena(${resena.id_Resena}, '${resena.resena}', ${resena.id_Libro}, ${resena.id_Usuario}, 1)">
                                    <i class="fa-solid fa-eye"></i> Activar
                                </button>`
                    }
                            <button data-bs-toggle="modal" data-bs-target="#exampleModal3" onclick="obtenerDatosActualizadosResena(${resena.id_Resena}, '${resena.resena}', ${resena.id_Libro}, ${resena.id_Usuario}, ${resena.id_Estado})" class="btn btn-primary rounded px-2 py-1">
                                Editar
                            </button>
                        </td>
                        <td>
                            <button onclick="eliminarResenaId(${resena.id_Resena})" class="btn btn-danger rounded px-2 py-1">
                                <i class="fa-solid fa-trash"></i> Eliminar
                            </button>
                        </td>
                    </tr>
                `;
                tabla.append(row);
            });
        },
        error: function (xhr, status, error) {
            console.log("ERROR al cargar reseñas:", error);
        }
    });
}

function editarEstadoResena(id_Resena, resenaText, id_Libro, id_Usuario, nuevoEstado) {
    const datos = {
        id_Resena: id_Resena,
        resena: resenaText,
        id_Libro: id_Libro,
        id_Usuario: id_Usuario,
        id_Estado: nuevoEstado
    };
    $.ajax({
        type: "PUT",
        url: `https://localhost:7003/api/Resenas/${id_Resena}`,
        data: JSON.stringify(datos),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            cargarResenasTabla();
        },
        error: function (xhr, status, error) {
            console.log("ERROR al actualizar estado de la reseña:", error);
        }
    });
}

function eliminarResenaId(id) {
    const idParseada = parseInt(id);
    Swal.fire({
        title: "¿Estás seguro que deseas eliminar esta Reseña?",
        html: "Si lo haces no podrás recuperar la información.",
        showDenyButton: true,
        confirmButtonText: "SI",
        denyButtonText: "CANCELAR"
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                type: "DELETE",
                url: `https://localhost:7003/api/Resenas/${idParseada}`,
                success: function (response) {
                    Swal.fire("Eliminado", "La reseña ha sido eliminada.", "success");
                    cargarResenasTabla();
                },
                error: function (xhr, status, error) {
                    console.log("ERROR al eliminar reseña:", error);
                    Swal.fire("Error", "No se pudo eliminar la reseña.", "error");
                }
            });
        } else if (result.isDenied) {
            Swal.fire("Cancelado", "No se eliminó la reseña.", "info");
        }
    });
}

function agregarResena() {
    $('#ResenasAgregar').on('submit', function (event) {
        event.preventDefault();

        const datos = {
            resena: $('#resena').val(),
            id_Libro: $('#librosOption').val(),
            id_Usuario: $('#usuariosOption').val()
        };
        $.ajax({
            type: "POST",
            url: "https://localhost:7003/api/Resenas",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(datos),
            success: function (response) {
                $('#exampleModal').modal('hide');
                cargarResenasTabla();
            },
            error: function (xhr, status, error) {
                console.log("ERROR al agregar reseña:", error);
            }
        });
    });
}

function obtenerDatosActualizadosResena(id_Resena, resenaText, id_Libro, id_Usuario, id_Estado) {
    $('#idEdit').val(id_Resena);
    $('#resenaEdit').val(resenaText);
    $('#librosOptionEdit').val(id_Libro);
    $('#usuariosOptionEdit').val(id_Usuario);
    $('#estadoEdit').val(id_Estado);
    $('#exampleModal3').modal('show');
}

$('#ResenasActualizar').on('submit', function (event) {
    event.preventDefault();
    const datos = {
        id_Resena: $('#idEdit').val(),
        resena: $('#resenaEdit').val(),
        id_Libro: $('#librosOptionEdit').val(),
        id_Usuario: $('#usuariosOptionEdit').val(),
        id_Estado: $('#estadoEdit').val()
    };
    $.ajax({
        type: "PUT",
        url: `https://localhost:7003/api/Resenas/${datos.id_Resena}`,
        data: JSON.stringify(datos),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            cargarResenasTabla();
            $('#exampleModal3').modal('hide');
        },
        error: function (xhr, status, error) {
            console.log("ERROR al actualizar reseña:", error);
        }
    });
});

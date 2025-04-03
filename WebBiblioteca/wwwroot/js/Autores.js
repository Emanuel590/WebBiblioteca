//DOM
$(document).ready(function () {
    cargarAutoresTabla();
    agregarAutores();
})








//Metodo obtener Autores
function cargarAutoresTabla()
{
    $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Autores",
        dataType: "json",
        success: function (response) {
            const tabla = $('#tablaAutores tbody');
            tabla.empty();
            $.each(response, function (_, autores) {
                const row = `
                    <tr>
                        <td>${autores.id_Autor}</td>
                        <td>${autores.nombre}</td>
                        <td>${autores.apellido}</td>
                        <td>${autores.id_Estado == 1 ?
                        `<span class="text-success">Activo</span>` :
                        `<span class="text-danger">Inactivo</span>`
                    }</td>
                        <td>
                            ${autores.id_Estado == 1 ?
                    `<button class="btn btn-danger rounded px-2 py-1" onclick="actualizarEstadoIdAutor(${autores.id_Autor}, '${autores.nombre}', '${autores.apellido}', 2)">
                                    <i class="fa-solid fa-eye-slash"></i> Inactivar
                                </button>` :
                    `<button class="btn btn-success rounded px-2 py-1" onclick="actualizarEstadoIdAutor(${autores.id_Autor}, '${autores.nombre}', '${autores.apellido}', 1)">
                                    <i class="fa-solid fa-eye"></i> Activar
                                </button>` }
                                <button  data-bs-toggle="modal" data-bs-target="#exampleModal2" onclick="formActualizar(${autores.id_Autor}, '${autores.nombre}', '${autores.apellido}', ${autores.id_Estado})" class="btn btn-primary rounded px-2 py-1">
                                  Editar
                                </button >
                        </td>
                        <td>
                                <button onclick="eliminarAutorId(${autores.id_Autor})" class="btn btn-danger rounded px-2 py-1">
                                    <i class="fa-solid fa-trash"></i> Eliminar
                                </button >
                        </td>
                    </tr>
                `;
                tabla.append(row);
            });
        },
        error: function (xhr, status, error) {
            console.log("ERROR:", error, xhr, status);
        }
    });



}


function formActualizar(id, nombre, apellido, estado)
{
    $('#id').val(id);
    $('#nombreEditar').val(nombre);
    $('#apellidoEditar').val(apellido);
    $('#estadoEditar').val(estado);

    $('#exampleModal2').modal('show')
}

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

            cargarAutoresTabla();
            $('#exampleModal2').modal('hide');
        },
        error: function (xhr, status, error) {
            console.log("ERROR:", error, xhr, status);
        }
    });
});


//Metodo para agregar Autores
function agregarAutores() {
    $('#AutoresAgregar').on('submit', function (event) {
        event.preventDefault();

        var datos =
        {
            nombre: $('#nombre').val(),
            apellido: $('#apellido').val()
        }

        $.ajax({
            type: "POST",
            url: "https://localhost:7003/api/Autores",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(datos),
            success: function (datos) {
                $('#exampleModal').modal('hide');
                cargarAutoresTabla();
            },
            error: function (xhr, status, error) {
                console.log("ERROR: ", error, xhr, status)
            }

        });



    })

}

//Metodo para Actualizar Estado
function actualizarEstadoIdAutor(id, nombreEstado, apellidoEstado, estado) {
    var datos = { id_Autor: id, nombre: nombreEstado, apellido: apellidoEstado, id_Estado: estado };
    $.ajax({
        type: "PUT",
        url: `https://localhost:7003/api/Autores/${id}`,
        data: JSON.stringify(datos),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (datos) {
            cargarAutoresTabla();
        },
        error: function (xhr, status, error) {
            console.log("ERROR:", error, xhr, status);
        }
    });
}

//Metodo para eliminar Autores
function eliminarAutorId(id) {
    idParseada = parseInt(id)
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
                    Swal.fire("Eliminado", "El género ha sido eliminado.", "success");
                    cargarAutoresTabla();
                },
                error: function (xhr, status, error) {
                    console.log("ERROR:", error, xhr.status, xhr.responseText);
                    Swal.fire("Error", "No se pudo eliminar el autor. Lo mas probable tengas un autor asociado a otra entidad", "error");
                }
            });
        } else if (result.isDenied) {
            Swal.fire("Cancelado", "No se eliminó el autor.", "info");
        }
    });
}
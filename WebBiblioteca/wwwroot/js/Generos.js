//Mostrar los Metodos en el DOM
$(document).ready(function () {
    cargarGenerosTabla();
    cargarGenerosNavbar();
    agregarGenero();
});



//Metodo para cambiar el Estado de Genero
function actualizarEstadoId(id, genero, nuevoEstado) {
    var datos = { id_Genero: id, nombre: genero, id_Estado: nuevoEstado };
    $.ajax({
        type: "PUT",
        url: `https://localhost:7003/api/Generos/${id}`,
        data: JSON.stringify(datos),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (datos) {
            cargarGenerosTabla();
            cargarGenerosNavbar();
        },
        error: function (xhr, status, error) {
            console.log("ERROR:", error, xhr, status);
        }
    });
}


//Metodo para eliminar un Genero para siempre
function eliminarGeneroId(id) {
    idParseada = parseInt(id)
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
                    cargarGenerosTabla();
                    cargarGenerosNavbar();
                },
                error: function (xhr, status, error) {
                    console.log("ERROR:", error, xhr.status, xhr.responseText);
                    Swal.fire("Error", "No se pudo eliminar el género. Lo mas probable tengas un genero asociado a otra entidad", "error");
                }
            });
        } else if (result.isDenied) {
            Swal.fire("Cancelado", "No se eliminó el género.", "info");
        }
    });
}






//Metodo para mostrar los Generos en las tablas
function cargarGenerosTabla() {
    $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Generos",
        dataType: "json",
        success: function (response) {
            const tabla = $('#tablaGenero tbody');
            tabla.empty();
            $.each(response, function (_, genero) {
                const row = `
                    <tr>
                        <td>${genero.id_Genero}</td>
                        <td>${genero.nombre}</td>
                        <td>${genero.id_Estado == 1 ?
                        `<span class="text-success">Activo</span>` :
                        `<span class="text-danger">Inactivo</span>`
                    }</td>
                        <td>
                            ${genero.id_Estado == 1 ?
                        `<button class="btn btn-danger rounded px-2 py-1" onclick="actualizarEstadoId(${genero.id_Genero}, '${genero.nombre}', 2)">
                                    <i class="fa-solid fa-eye-slash"></i> Inactivar
                                </button>` :
                        `<button class="btn btn-success rounded px-2 py-1" onclick="actualizarEstadoId(${genero.id_Genero}, '${genero.nombre}', 1)">
                                    <i class="fa-solid fa-eye"></i> Activar
                                </button>` }
                                <button  data-bs-toggle="modal" data-bs-target="#exampleModal1" onclick="editarGenero(${genero.id_Genero}, '${genero.nombre}', ${genero.id_Estado})" class="btn btn-primary rounded px-2 py-1">
                                  Editar
                                </button >
                        </td>
                        <td>
                                <button onclick="eliminarGeneroId(${genero.id_Genero})" class="btn btn-danger rounded px-2 py-1">
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

//Metodo para cargar los Generos de manera dinamica en el navbar
function cargarGenerosNavbar() {
    $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Generos",
        dataType: "json",
        success: function (response) {
            const rowFiltered = response.filter(g => g.id_Estado == 1);
            const ul = $('#ulGeneros')
            ul.empty();
            $.each(rowFiltered, function (_, genero) {
                const row = `

                     <li class="item-dropdown"><a class="dropdown-item" href="/GenerosAdmin/${genero.id_Genero}">${genero.nombre}</a></li>
                     
                `
                ul.append(row);
            })
            

        },
        error: function (xhr, status, error) {
            console.log("ERROR: ", error, xhr, status)
        }

    });
}

//Metodo para obtener los datos de la tabla y setearlos en los valores del form Actualizar
function editarGenero(id, nombre, estado) {

    $('#id_Editar').val(id);
    $('#genero_Editar').val(nombre);
    $('#estado_Editar').val(estado);


    $('#exampleModal1').modal('show');
}


//Metodo para ActualizarForm
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

            cargarGenerosTabla();
            $('#exampleModal1').modal('hide');
        },
        error: function (xhr, status, error) {
            console.log("ERROR:", error, xhr, status);
        }
    });
});



//Metodo para agregar un nuevo Genero
function agregarGenero() {

    $('#BinarioONoBinario').on('submit', function (event) {
        event.preventDefault();

        var datos = {
            nombre: $('#genero').val()
        }


        $.ajax({
            type: "POST",
            url: "https://localhost:7003/api/Generos",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(datos), 
            success: function (datos) {
                $('#exampleModal').modal('hide');
                cargarGenerosTabla();
                cargarGenerosNavbar();
            },
            error: function (xhr, status, error) {
                console.log("ERROR: ", error, xhr, status)
            }

        });



    })
};




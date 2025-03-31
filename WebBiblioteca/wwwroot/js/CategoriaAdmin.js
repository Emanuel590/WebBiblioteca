//Mostrar los Metodos en el DOM
$(document).ready(function () {
    cargarCategoriaTabla();
    agregarCategoria();
});



//Metodo para cambiar el Estado de Categoria
function actualizarEstadoId(id, categoria, nuevoEstado) {
    var datos = { id_Categoria: id, nombre: categoria, id_Estado: nuevoEstado };
    $.ajax({
        type: "PUT",
        url: `https://localhost:7003/api/Categorias/${id}`,
        data: JSON.stringify(datos),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (datos) {
            cargarCategoriaTabla();
        },
        error: function (xhr, status, error) {
            console.log("ERROR:", error, xhr, status);
        }
    });
}


//Metodo para eliminar un Categoria para siempre
function eliminarCategoriaId(id) {
    idParseada = parseInt(id)
    Swal.fire({
        title: "¿Estás seguro que deseas eliminar esta Categoria?",
        html: "Si lo haces no podrás recuperar la información.",
        showDenyButton: true,
        confirmButtonText: "SI",
        denyButtonText: "CANCELAR"
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                type: "DELETE",
                url: `https://localhost:7003/api/Categorias/${idParseada}`,
                success: function (response) {
                    Swal.fire("Eliminado", "La Categoria ha sido eliminado.", "success");
                    cargarCategoriaTabla();
                   
                },
                error: function (xhr, status, error) {
                    console.log("ERROR:", error, xhr.status, xhr.responseText);
                    Swal.fire("Error", "No se pudo eliminar la categoria. Lo mas probable tengas una categoria asociado a otra entidad", "error");
                }
            });
        } else if (result.isDenied) {
            Swal.fire("Cancelado", "No se eliminó la categoria.", "info");
        }
    });
}






//Metodo para mostrar los Categoria en las tablas
function cargarCategoriaTabla() {
    $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Categorias",
        dataType: "json",
        success: function (response) {
            const tabla = $('#tablaCategoria tbody');
            tabla.empty();
            $.each(response, function (_, categoria) {
                const row = `
                    <tr>
                        <td>${categoria.id_Categoria}</td>
                        <td>${categoria.nombre}</td>
                        <td>${categoria.id_Estado == 1 ?
                        `<span class="text-success">Activo</span>` :
                        `<span class="text-danger">Inactivo</span>`
                    }</td>
                        <td>
                            ${categoria.id_Estado == 1 ?
                    `<button class="btn btn-danger rounded px-2 py-1" onclick="actualizarEstadoId(${categoria.id_Categoria}, '${categoria.nombre}', 2)">
                                    <i class="fa-solid fa-eye-slash"></i> Inactivar
                                </button>` :
                    `<button class="btn btn-success rounded px-2 py-1" onclick="actualizarEstadoId(${categoria.id_Categoria}, '${categoria.nombre}', 1)">
                                    <i class="fa-solid fa-eye"></i> Activar
                                </button>` }
                                <button  data-bs-toggle="modal" data-bs-target="#exampleModal1" onclick="editarCategoria(${categoria.id_Categoria}, '${categoria.nombre}', ${categoria.id_Estado})" class="btn btn-primary rounded px-2 py-1">
                                  Editar
                                </button >
                        </td>
                        <td>
                                <button onclick="eliminarCategoriaId(${categoria.id_Categoria})" class="btn btn-danger rounded px-2 py-1">
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


// function cargarCategoriaNavbar() {
//     $.ajax({
//         type: "GET",
//         url: "https://localhost:7003/api/Categorias",
//         dataType: "json",
//         success: function (response) {
//             const rowFiltered = response.filter(g => g.id_Estado == 1);
//             const ul = $('#ulCategorias')
//             ul.empty();
//             $.each(rowFiltered, function (_, categoria) {
//                 const row = `

//                      <li class="item-dropdown"><a class="dropdown-item" href="/CategoriaAdmin/${categoria.id_Categoria}">${categoria.nombre}</a></li>

//                 `
//                 ul.append(row);
//             })

//         },
//         error: function (xhr, status, error) {
//             console.log("ERROR: ", error, xhr, status)
//         }

//     });
// }


//Metodo para obtener los datos de la tabla y setearlos en los valores del form Actualizar
function editarCategoria(id, nombre, estado) {

    $('#id_Editar').val(id);
    $('#categoria_Editar').val(nombre);
    $('#estado_Editar').val(estado);


    $('#exampleModal1').modal('show');
}


//Metodo para ActualizarForm
$('#ActualizarForm').on('submit', function (event) {
    event.preventDefault();

    var datos = {
        id_Categoria: $('#id_Editar').val(),
        nombre: $('#categoria_Editar').val(),
        id_Estado: $('#estado_Editar').val()
    };


    $.ajax({
        type: "PUT",
        url: `https://localhost:7003/api/Categorias/${datos.id_Categoria}`,
        data: JSON.stringify(datos),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (datos) {

            cargarCategoriaTabla();
            $('#exampleModal1').modal('hide');
        },
        error: function (xhr, status, error) {
            console.log("ERROR:", error, xhr, status);
        }
    });
});



//Metodo para agregar una nuevo Categoria
function agregarCategoria() {

    $('#BinarioONoBinario').on('submit', function (event) {
        event.preventDefault();

        var datos = {
            nombre: $('#categoria').val()
        }


        $.ajax({
            type: "POST",
            url: "https://localhost:7003/api/Categorias",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(datos),
            success: function (datos) {
                $('#exampleModal').modal('hide');
                cargarCategoriaTabla();
            },
            error: function (xhr, status, error) {
                console.log("ERROR: ", error, xhr, status)
            }

        });



    })
};




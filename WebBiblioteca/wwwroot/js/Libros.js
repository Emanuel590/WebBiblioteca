$(document).ready(function () {

    cargarLibrosTabla();
    cargarAutores();
    cargarGeneros();
    agregarAutoresALibros();
    agregarGenerosALibros();
    agregarLibros();
})

let autores = []
let generos = []

function cargarAutores() {
    $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Autores",
        dataType: "json",
        success: function (response) {
            $.each(response, function (_, autor) {
                autores[autor.id_Autor] = autor.nombre + ' ' + autor.apellido
            })

            cargarLibrosTabla();
        },
        error: function (xhr, status, error) {
            console.log("ERROR:", error, xhr, status);
        }
    })
}

function cargarGeneros() {
    $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Generos",
        dataType: "json",
        success: function (response) {
            $.each(response, function (_, genero) {
                generos[genero.id_Genero] = genero.nombre
            })

            cargarLibrosTabla();
        },
        error: function (xhr, status, error) {
            console.log("ERROR:", error, xhr, status);
        }
    })
}


function cargarLibrosTabla() {
    $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Libros",
        dataType: "json",
        success: function (response) {
            const tabla = $('#tablaLibros tbody');
            tabla.empty();
            $.each(response, function (_, Libros) {
                const autorNombre = autores[Libros.id_Autor] || 'No definido'
                const generoNombre = generos[Libros.id_Genero] || 'No definido'
                const row = `
                    <tr>
                        <td>${Libros.id_libro}</td>
                        <td>${Libros.titulo}</td>
                        <td>${Libros.stock}</td>
                        <td>${Libros.precio_alquiler}</td>
                        <td>${autorNombre}</td>
                        <td>${generoNombre}</td>
                        <td>${Libros.id_Estado == 1 ?
                        `<span class="text-success">Activo</span>` :
                        `<span class="text-danger">Inactivo</span>`
                    }</td>
                        <td>
                            ${Libros.id_Estado == 1 ?
                        `<button class="btn btn-danger rounded px-2 py-1" onclick="editarEstadoLibro(${Libros.id_libro}, '${Libros.titulo}', ${Libros.stock}, ${Libros.precio_alquiler}, ${Libros.id_Autor}, ${Libros.id_Genero}, 2)">
                                    <i class="fa-solid fa-eye-slash"></i> Inactivar
                                </button>` :
                    `<button class="btn btn-success rounded px-2 py-1" onclick="editarEstadoLibro(${Libros.id_libro}, '${Libros.titulo}', ${Libros.stock}, ${Libros.precio_alquiler}, ${Libros.id_Autor}, ${Libros.id_Genero}, 1)">
                                    <i class="fa-solid fa-eye"></i> Activar
                                </button>` }
                                <button  data-bs-toggle="modal" data-bs-target="#exampleModal3" onclick="obtenerDatosActualizadosLibro(${Libros.id_libro}, '${Libros.titulo}', ${Libros.stock}, ${Libros.precio_alquiler}, ${Libros.id_Autor}, ${Libros.id_Genero}, ${Libros.id_Estado})" class="btn btn-primary rounded px-2 py-1">
                                  Editar
                                </button >
                        </td>
                        <td>
                                <button onclick="eliminarLibroId(${Libros.id_libro})" class="btn btn-danger rounded px-2 py-1">
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

function editarEstadoLibro(id_libro, titulo, stock, precio_alquiler, autor, genero, estado)
{
    var datos = {
        id_libro: id_libro,
        titulo: titulo,
        stock: stock,
        precio_alquiler: precio_alquiler,
        id_Autor: autor,
        id_Genero: genero,
        id_Estado: estado
    }
    $.ajax({
        type: "PUT",
        url: `https://localhost:7003/api/Libros/${id_libro}`,
        data: JSON.stringify(datos),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (datos) {
            cargarLibrosTabla();
        },
        error: function (xhr, status, error) {
            console.log("ERROR:", error, xhr, status);
        }
    });


}

function eliminarLibroId(id) {
    idParseada = parseInt(id)
    Swal.fire({
        title: "¿Estás seguro que deseas eliminar este Libro?",
        html: "Si lo haces no podrás recuperar la información.",
        showDenyButton: true,
        confirmButtonText: "SI",
        denyButtonText: "CANCELAR"
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                type: "DELETE",
                url: `https://localhost:7003/api/Libros/${idParseada}`,
                success: function (response) {
                    Swal.fire("Eliminado", "El libro ha sido eliminado.", "success");
                    cargarLibrosTabla();
                },
                error: function (xhr, status, error) {
                    console.log("ERROR:", error, xhr.status, xhr.responseText);
                    Swal.fire("Error", "No se pudo eliminar el libro. Lo mas probable tengas un libro asociado a otra entidad", "error");
                }
            });
        } else if (result.isDenied) {
            Swal.fire("Cancelado", "No se eliminó el libro.", "info");
        }
    });
}

function agregarLibros() {
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

function agregarAutoresALibros() {
    $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Autores",
        dataType: "json",
        success: function (response) {
            const autoresFiltered = response.filter(a => a.id_Estado == 1)
            const select = $('#autoresOption');
            select.empty();
            select.append(`<option selected>Ingrese el autor del libro</option>`)
            $.each(autoresFiltered, function (_, autor) {
                const datos = `

                <option value="${autor.id_Autor}">${autor.nombre} ` + ` ${autor.apellido}</option>
                
                `

                select.append(datos)

            });
            const selectEdit = $('#autoresOptionEdit');
            selectEdit.empty();
            selectEdit.append(`<option selected>Ingrese el autor del libro</option>`)
            $.each(autoresFiltered, function (_, autor) {
                const datos = `

                <option value="${autor.id_Autor}">${autor.nombre} ` + ` ${autor.apellido}</option>
                
                `

                selectEdit.append(datos)

            });
        },
        error: function (xhr, status, error) {
            console.log("ERROR:", error, xhr, status);
        }
    });


}

function agregarGenerosALibros() {
    $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Generos",
        dataType: "json",
        success: function (response) {
            const GenerosFiltered = response.filter(g => g.id_Estado == 1)
            const select = $('#GeneroOption');
            select.empty();
            select.append(`<option selected>Ingrese el autor del libro</option>`)
            $.each(GenerosFiltered, function (_, genero) {
                const datos = `

                <option value="${genero.id_Genero}">${genero.nombre}</option>
                
                `

                select.append(datos)

            });
            const selectEdit = $('#GeneroOptionEdit');
            selectEdit.empty();
            selectEdit.append(`<option selected>Ingrese el autor del libro</option>`)
            $.each(GenerosFiltered, function (_, genero) {
                const datos = `

                <option value="${genero.id_Genero}">${genero.nombre}</option>
                
                `

                selectEdit.append(datos)

            });
        },
        error: function (xhr, status, error) {
            console.log("ERROR:", error, xhr, status);
        }
    });


}

function agregarLibros() {
    $('#AutoresAgregar').on('submit', function (event) {
        event.preventDefault();

        var datos =
        {
            "titulo": $('#titulo').val(),
            "stock": $('#stock').val(),
            "precio_alquiler": $('#precioAlquiler').val(),
            "id_Autor": $('#autoresOption').val(),
            "id_Genero": $('#GeneroOption').val()
        }

        $.ajax({
            type: "POST",
            url: "https://localhost:7003/api/Libros",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(datos),
            success: function (datos) {
                $('#exampleModal').modal('hide');
                cargarLibrosTabla();
            },
            error: function (xhr, status, error) {
                console.log("ERROR: ", error, xhr, status)
            }

        });



    })

}


function obtenerDatosActualizadosLibro(id_libro, titulo, stock, precio_alquiler, autor, genero, estado) {
    $('#idEdit').val(id_libro)
    $('#tituloEdit').val(titulo)
    $('#stockEdit').val(stock)
    $('#precioAlquilerEdit').val(precio_alquiler)
    $('#autoresOptionEdit').val(autor)
    $('#GeneroOptionEdit').val(genero)
    $('#estadoEdit').val(estado)

    $('#exampleModal3').modal('show')

}

$('#LibrosActualizar').on('submit', function (event) {
    event.preventDefault();

    var datos = {
        id_libro: $('#idEdit').val(),
        titulo: $('#tituloEdit').val(),
        stock: $('#stockEdit').val(),
        precio_alquiler: $('#precioAlquilerEdit').val(),
        id_Autor: $('#autoresOptionEdit').val(),
        id_Genero: $('#GeneroOptionEdit').val(),
        id_Estado: $('#estadoEdit').val()
    }


    $.ajax({
        type: "PUT",
        url: `https://localhost:7003/api/Libros/${datos.id_libro}`,
        data: JSON.stringify(datos),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (datos) {

            cargarLibrosTabla();
            $('#exampleModal3').modal('hide');
        },
        error: function (xhr, status, error) {
            console.log("ERROR:", error, xhr, status);
        }
    });
});
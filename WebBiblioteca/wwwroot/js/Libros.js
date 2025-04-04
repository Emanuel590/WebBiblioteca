$(document).ready(function () {

    cargarLibrosTabla();
    cargarAutores();
    cargarGeneros();
    agregarAutoresALibros();
    agregarGenerosALibros();
    agregarLibros();
    mostrarLibros();
    ordenarLibro();
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
                        <td><img src="${Libros.fotoPath}" style="width: 75px; height:75px;" class="img-thumbnail" alt="${Libros.titulo}"></td>
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
    $('#LibrosAgregar').on('submit', function (event) {
        event.preventDefault();

        // 1. Crear un FormData y extraer los campos del formulario
        // Opción A: Tomar todos los campos del form automáticamente
        // var formData = new FormData(this);

        // Opción B: Agregar manualmente campo por campo
        var formData = new FormData();
        formData.append("titulo", $('#titulo').val());
        formData.append("stock", $('#stock').val());
        formData.append("precio_alquiler", $('#precioAlquiler').val());
        formData.append("id_Autor", $('#autoresOption').val());
        formData.append("id_Genero", $('#GeneroOption').val());

        // 2. Adjuntar el archivo desde el input tipo file
        // Asumiendo que tu input file tiene id="foto"
        var fileInput = document.getElementById('foto');
        if (fileInput.files.length > 0) {
            formData.append("Foto", fileInput.files[0]); 
            // "Foto" debe coincidir con la propiedad IFormFile Foto en tu modelo C#
        }

        // 3. Hacer la petición AJAX con FormData
        $.ajax({
            type: "POST",
            url: "https://localhost:7003/api/Libros",
            data: formData,

            // IMPORTANTE: Para que jQuery no convierta el FormData a texto
            contentType: false,
            processData: false,

            success: function (datos) {
                $('#exampleModal').modal('hide');
                cargarLibrosTabla();
            },
            error: function (xhr, status, error) {
                console.log("ERROR: ", error, xhr, status);
            }
        });
    });
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



function mostrarLibros() {
    $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Libros",
        dataType: "json",
        success: function (response) {
            const carta = $('#librosMostrar');
            carta.empty();
            $.each(response, function (_, Libros) {
                const autorNombre = autores[Libros.id_Autor] || 'No definido'


                const libro =
                    `
        <div class="col mx-3">
            <div class="card border-0 h-100">
                <a href="/Libro/${Libros.id_libro}" class="text-decoration-none text-center">
                    <img src="${Libros.fotoPath}" alt="Portada" class="card-img-top img-scale " style="height: 220px; object-fit: contain;">
                </a>
                <div class="card-body px-0">
                    <h6 class="fw-semibold text-truncate" title="${Libros.titulo}">
                        ${Libros.titulo}
                    </h6>
                    <p class="text-muted small mb-1 text-uppercase">${autorNombre}</p>
                    <p class="fw-semibold text-dark">₡${Libros.precio_alquiler}</p>
                </div>

            </div>


                    `;
                carta.append(libro);
            });
        },
        error: function (xhr, status, error) {
            console.log("ERROR:", error, xhr, status);
        }
    });




}



function mostrarLibro(id) {
    $.ajax({
        url: `https://localhost:7003/api/Libros/${id}`,
        method: 'GET',
        success: function (libro) {
            $.get(`https://localhost:7003/api/Autores/${libro.id_Autor}`, function (autor) {
                $.get(`https://localhost:7003/api/Generos/${libro.id_Genero}`, function (genero) {

                    const contenedor = $('#contenedorLibro');

                    contenedor.empty(); // Limpiamos el contenedor por si tiene contenido previo

                    contenedor.append(
                        `
                        <div class="row">
                            <div class="col-md-4 text-center">
                                <img src="${libro.fotoPath}" class="img-fluid" style="max-height: 300px;" alt="Portada">
                            </div>
                            <div class="col-md-8">
                                <h2>${libro.titulo}</h2>
                                <p><strong>Autor:</strong> ${autor.nombre}</p>
                                <p><strong>Género:</strong> ${genero.nombre}</p>
                                <p><strong>Precio alquiler:</strong> ₡${libro.precio_alquiler}</p>
                                <div class="mb-3"> 
                                    <button class="btn mt-3" style="background-color: #F25835; border: none; color: white;">
                                        <i class="fa-solid fa-book-open"></i> Comprar
                                    </button>
                                </div>
                            </div>
                        </div>

                        <hr>

                        <!-- Contenedor para las reseñas -->
                        <h4>Reseñas</h4>
                        <div id="contenedorResenas"></div>
`
                    );

                    // Llamamos a la función que carga las reseñas para este libro
                    mostrarResenasPorLibro(libro.id_libro);

                }).fail(() => {
                    $('#contenedorLibro').html('<p class="text-danger">Error al cargar el género</p>');
                });
            }).fail(() => {
                $('#contenedorLibro').html('<p class="text-danger">Error al cargar el autor</p>');
            });
        },
        error: function () {
            $('#contenedorLibro').html('<p class="text-danger">Error al cargar el libro</p>');
        }
    });
}

function mostrarResenasPorLibro(idLibro) {
    $.ajax({
        url: "https://localhost:7003/api/Resenas",
        method: "GET",
        dataType: "json",
        success: function (resenas) {
            // Filtrar reseñas del libro actual
            const resenasDelLibro = resenas.filter(r => r.id_Libro === idLibro);
            const contenedor = $("#contenedorResenas");
            contenedor.empty();

            if (resenasDelLibro.length === 0) {
                contenedor.append("<p>No hay reseñas para este libro.</p>");
                return;
            }

            // Por cada reseña, se obtiene el nombre del usuario y se muestra la tarjeta
            $.each(resenasDelLibro, function (_, resena) {
                $.ajax({
                    url: `https://localhost:7003/api/Usuarios/${resena.id_Usuario}`,
                    method: "GET",
                    dataType: "json",
                    success: function (usuario) {
                        const cardResena = `
                            <div class="card my-3">
                                <div class="card-body">
                                    <p class="card-text"><strong>${usuario.nombre}</strong></p>
                                    <p class="card-text">${resena.resena}</p>
                                </div>
                            </div>
                        `;
                        contenedor.append(cardResena);
                    },
                    error: function () {
                        const cardResena = `
                            <div class="card my-3">
                                <div class="card-body">
                                    <p class="card-text"><strong>Usuario desconocido</strong></p>
                                    <p class="card-text">${resena.resena}</p>
                                </div>
                            </div>
                        `;
                        contenedor.append(cardResena);
                    }
                });
            });
        },
        error: function (xhr, status, error) {
            console.log("ERROR:", error, xhr, status);
            $("#contenedorResenas").html('<p class="text-danger">Error al cargar las reseñas.</p>');
        }
    });
}


function ordenarLibro()
{
    $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Libros",
        dataType: "json",
        success: function (response) {
            const Ordenar = $('#ordenar').val();

            if (Ordenar === "precio_mayor") {


                    const librosMostrar = $('#librosMostrar');
                    librosMostrar.hide();
                    const librosMenor = $('#librosMenor')
                    librosMenor.hide();
                    const librosMayor = $('#librosMayor');
                    librosMayor.show();
                    mostrarLibrosMayor()


            } else if (Ordenar == "precio_menor") {


                    const librosMostrar = $('#librosMostrar');
                    librosMostrar.hide();
                    const librosMayor = $('#librosMayor');
                    librosMayor.hide();
                    const librosMenor = $('#librosMenor')
                    librosMenor.show();
                    mostrarLibrosMenor()

            } else if (Ordenar == "seleccion") {

                const librosMostrar = $('#librosMostrar');
                librosMostrar.show();
                const librosMenor = $('#librosMenor')
                librosMenor.hide();
                const librosMayor = $('#librosMayor');
                librosMayor.hide();

            }






        },
        error: function (xhr, status, error) {
            console.log("ERROR:", error, xhr, status);
        }
    });




}


function mostrarLibrosMayor() {
    $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Libros/MayorAMenor",
        dataType: "json",
        success: function (response) {
            const carta = $('#librosMayor');
            carta.empty();
            $.each(response, function (_, Libros) {
                const autorNombre = autores[Libros.id_Autor] || 'No definido'


                const libro =
                    `
        <div class="col mx-3">
            <div class="card border-0 h-100">
                <a href="/Libro/${Libros.id_libro}" class="text-decoration-none text-center">
                    <img src="${Libros.fotoPath}" alt="Portada" class="card-img-top img-scale " style="height: 220px; object-fit: contain;">
                </a>
                <div class="card-body px-0">
                    <h6 class="fw-semibold text-truncate" title="${Libros.titulo}">
                        ${Libros.titulo}
                    </h6>
                    <p class="text-muted small mb-1 text-uppercase">${autorNombre}</p>
                    <p class="fw-semibold text-dark">₡${Libros.precio_alquiler}</p>
                </div>

            </div>


                    `;
                carta.append(libro);
            });
        },
        error: function (xhr, status, error) {
            console.log("ERROR:", error, xhr, status);
        }
    });




}

function mostrarLibrosMenor() {
    $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Libros/MenorAMayor",
        dataType: "json",
        success: function (response) {
            const carta = $('#librosMenor');
            carta.empty();
            $.each(response, function (_, Libros) {
                const autorNombre = autores[Libros.id_Autor] || 'No definido'


                const libro =
                    `
        <div class="col mx-3">
            <div class="card border-0 h-100">
                <a href="/Libro/${Libros.id_libro}" class="text-decoration-none text-center">
                    <img src="${Libros.fotoPath}" alt="Portada" class="card-img-top img-scale " style="height: 220px; object-fit: contain;">
                </a>
                <div class="card-body px-0">
                    <h6 class="fw-semibold text-truncate" title="${Libros.titulo}">
                        ${Libros.titulo}
                    </h6>
                    <p class="text-muted small mb-1 text-uppercase">${autorNombre}</p>
                    <p class="fw-semibold text-dark">₡${Libros.precio_alquiler}</p>
                </div>

            </div>


                    `;
                carta.append(libro);
            });
        },
        error: function (xhr, status, error) {
            console.log("ERROR:", error, xhr, status);
        }
    });




}


function libroPorGenero(idGenero) {
    $.ajax({
        type: "GET",
        url: `https://localhost:7003/api/Libros/Genero/${idGenero}`,
        dataType: "json",
        success: function (response) {
            const content = $('#ContenedorgeneroPorId')
            const carta = $('#librosMostrarId');
            carta.empty();


            if (response.length === 0) {
                content.append(`

                <div class="text-center">
                <p>No existen libros en este género aún.</p>
                </div>`);
                return;
            }

            $.each(response, function (_, libro) {
                const autorNombre = autores[libro.id_Autor] || 'No definido';

                const libroHTML = `
                    <div class="col mx-3">
                        <div class="card border-0 h-100">
                            <a href="/Libro/${libro.id_libro}" class="text-decoration-none text-center">
                                <img src="${libro.fotoPath}" alt="Portada" class="card-img-top img-scale" style="height: 220px; object-fit: contain;">
                            </a>
                            <div class="card-body px-0">
                                <h6 class="fw-semibold text-truncate" title="${libro.titulo}">
                                    ${libro.titulo}
                                </h6>
                                <p class="text-muted small mb-1 text-uppercase">${autorNombre}</p>
                                <p class="fw-semibold text-dark">₡${libro.precio_alquiler}</p>
                            </div>
                        </div>
                    </div>
                `;
                carta.append(libroHTML);
            });
        },
        error: function (xhr, status, error) {
            const carta = $('#librosMostrarId');
            carta.empty();

            // Si se obtiene un 404, se muestra el mensaje personalizado.
            if (xhr.status === 404) {
                carta.append(`<p>No existen libros en este género aún.</p>`);
            } else {
                // Para otros errores, muestra un mensaje genérico.
                carta.append(`<p>Ocurrió un error al cargar los libros.</p>`);
            }
            console.log("ERROR:", error, xhr, status);
        }
    });
}


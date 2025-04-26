
let autores = [];
let generos = [];
var tablaLibros;

$(document).ready(function () {

    cargarAutores();
    cargarGeneros();


    cargarLibrosTabla();


    agregarAutoresALibros();
    agregarGenerosALibros();


    agregarLibros();
    mostrarLibros();
    ordenarLibro();


});


function cargarAutores() {
    $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Autores",
        dataType: "json",
        success: function (response) {
            $.each(response, function (_, autor) {

                autores[autor.id_Autor] = autor.nombre + ' ' + autor.apellido;
            });

            if (tablaLibros) {
                tablaLibros.ajax.reload();
            }
        },
        error: function (xhr, status, error) {
            console.log("ERROR cargarAutores:", error, xhr, status);
        }
    });
}

function cargarGeneros() {
    $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Generos",
        dataType: "json",
        success: function (response) {
            $.each(response, function (_, genero) {
                generos[genero.id_Genero] = genero.nombre;
            });

            if (tablaLibros) {
                tablaLibros.ajax.reload();
            }
        },
        error: function (xhr, status, error) {
            console.log("ERROR cargarGeneros:", error, xhr, status);
        }
    });
}


function cargarLibrosTabla() {
    if (!$.fn.DataTable.isDataTable('#tablaLibros')) {
        tablaLibros = $('#tablaLibros').DataTable({
            ajax: {
                url: "https://localhost:7003/api/Libros",
                dataSrc: '' 
            },
            dom: 'frtip',
            columns: [
                { data: 'id_libro' },
                {
                    data: 'fotoPath',
                    render: function (data, row) {
                        return `<img src="${data}" style="width:75px; height:75px;" class="img-thumbnail" alt="${row.titulo}">`;
                    }
                },
                { data: 'titulo' },
                { data: 'stock' },
                { data: 'precio_alquiler' },
                {
                    data: 'id_Autor',
                    render: function (data) {
                        return autores[data] || 'No definido';
                    }
                },
                {
                    data: 'id_Genero',
                    render: function (data) {
                        return generos[data] || 'No definido';
                    }
                },
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
                            ? `<button class="btn btn-danger rounded px-2 py-1" onclick="editarEstadoLibro(${row.id_libro}, 2,)">
                                    <i class="fa-solid fa-eye-slash"></i> Inactivar
                               </button>`
                            : `<button class="btn btn-success rounded px-2 py-1" onclick="editarEstadoLibro(${row.id_libro},  1)">
                                    <i class="fa-solid fa-eye"></i> Activar
                               </button>`;
                        let botonEditar = `<button data-bs-toggle="modal" data-bs-target="#exampleModal3" onclick="obtenerDatosActualizadosLibro(${row.id_libro}, '${row.titulo}', ${row.stock}, ${row.precio_alquiler}, ${row.id_Autor}, ${row.id_Genero}, ${row.id_Estado},  '${row.fotoPath}')" class="btn btn-primary rounded px-2 py-1">
                                                Editar
                                           </button>`;
                        return botonEstado + ' ' + botonEditar;
                    }
                },
                {
                    data: null,
                    render: function (row) {
                        return `<button onclick="eliminarLibroId(${row.id_libro})" class="btn btn-danger rounded px-2 py-1">
                                    <i class="fa-solid fa-trash"></i> Eliminar
                                </button>`;
                    }
                }
            ]
        });
    } else {

        tablaLibros.ajax.reload();
    }
}



function editarEstadoLibro(id_libro,estado) {
    var datos = {
        id_libro: id_libro,
        id_Estado: estado,
    };
    $.ajax({
        type: "PUT",
        url: `https://localhost:7003/api/Libros/estado/${datos.id_libro}?estado=${datos.id_Estado}`,
        data: JSON.stringify(datos),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            // Recargamos la tabla sin reinicializar
            tablaLibros.ajax.reload();
        },
        error: function (xhr, status, error) {
            console.log("ERROR editarEstadoLibro:", error, xhr, status);
        }
    });
}

function eliminarLibroId(id) {
    const idParseada = parseInt(id);
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
                    tablaLibros.ajax.reload();
                },
                error: function (xhr, status, error) {
                    console.log("ERROR eliminarLibroId:", error, xhr.status, xhr.responseText);
                    Swal.fire("Error", "No se pudo eliminar el libro. Lo más probable es que tenga vínculos con otra entidad.", "error");
                }
            });
        } else if (result.isDenied) {
            Swal.fire("Cancelado", "No se eliminó el libro.", "info");
        }
    });
}

function agregarLibros() {
    $('#LibrosAgregar').on('submit', function (event) {
        event.preventDefault();
        var formData = new FormData();
        formData.append("titulo", $('#titulo').val());
        formData.append("stock", $('#stock').val());
        formData.append("precio_alquiler", $('#precioAlquiler').val());
        formData.append("id_Autor", $('#autoresOption').val());
        formData.append("id_Genero", $('#GeneroOption').val());

        var fileInput = document.getElementById('foto');
        if (fileInput.files.length > 0) {
            formData.append("Foto", fileInput.files[0]);
        }



        $.ajax({
            type: "POST",
            url: "https://localhost:7003/api/Libros",
            data: formData,
            contentType: false,
            processData: false,
            success: function (response) {
                $('#exampleModal').modal('hide');
                // Recargamos la tabla de libros
                tablaLibros.ajax.reload();
            },
            error: function (xhr, status, error) {
                console.log("ERROR agregarLibros:", error, xhr, status);
            }
        });
    });
}

function obtenerDatosActualizadosLibro(id_libro, titulo, stock, precio_alquiler, autor, genero, estado, fotoPath) {
    $("#idEdit").val(id_libro);
    $("#tituloEdit").val(titulo);
    $("#stockEdit").val(stock);
    $("#precioAlquilerEdit").val(precio_alquiler);
    $("#autoresOptionEdit").val(autor);
    $("#GeneroOptionEdit").val(genero);
    $("#estadoEdit").val(estado);


    $("#fotoPreview").attr("src", fotoPath || "");


    $("#fotoEdit").val("");

    // Mostrar el modal
    $("#exampleModal3").modal("show");
}


$("#LibrosActualizar").on("submit", function (event) {
    event.preventDefault();

    var formData = new FormData();
    formData.append("id_libro", $("#idEdit").val());
    formData.append("titulo", $("#tituloEdit").val());
    formData.append("stock", $("#stockEdit").val());
    formData.append("precio_alquiler", $("#precioAlquilerEdit").val());
    formData.append("id_Autor", $("#autoresOptionEdit").val());
    formData.append("id_Genero", $("#GeneroOptionEdit").val());
    formData.append("id_Estado", $("#estadoEdit").val());


    var fileInput = $('#fotoEdit')[0];
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
        formData.append("foto", fileInput.files[0]);
    }



    $.ajax({
        type: "PUT",
        url: `https://localhost:7003/api/Libros/${$("#idEdit").val()}`,
        data: formData,
        contentType: false,
        processData: false,
        success: function (response) {
            
            tablaLibros.ajax.reload();
            
            $("#exampleModal3").modal("hide");
        },
        error: function (xhr, status, error) {
            console.log("ERROR:", error, xhr, status);
        }
    });
});



function agregarAutoresALibros() {
    $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Autores",
        dataType: "json",
        success: function (response) {
            const autoresFiltered = response.filter(a => a.id_Estado == 1);
            const select = $('#autoresOption');
            select.empty();
            select.append(`<option selected>Ingrese el autor del libro</option>`);
            $.each(autoresFiltered, function (_, autor) {
                select.append(`<option value="${autor.id_Autor}">${autor.nombre} ${autor.apellido}</option>`);
            });
            const selectEdit = $('#autoresOptionEdit');
            selectEdit.empty();
            selectEdit.append(`<option selected>Ingrese el autor del libro</option>`);
            $.each(autoresFiltered, function (_, autor) {
                selectEdit.append(`<option value="${autor.id_Autor}">${autor.nombre} ${autor.apellido}</option>`);
            });
        },
        error: function (xhr, status, error) {
            console.log("ERROR agregarAutoresALibros:", error, xhr, status);
        }
    });
}




function agregarGenerosALibros() {
    $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Generos",
        dataType: "json",
        success: function (response) {
            const generosFiltered = response.filter(g => g.id_Estado == 1);
            const select = $('#GeneroOption');
            select.empty();
            select.append(`<option selected>Ingrese el género del libro</option>`);
            $.each(generosFiltered, function (_, genero) {
                select.append(`<option value="${genero.id_Genero}">${genero.nombre}</option>`);
            });
            const selectEdit = $('#GeneroOptionEdit');
            selectEdit.empty();
            selectEdit.append(`<option selected>Ingrese el género del libro</option>`);
            $.each(generosFiltered, function (_, genero) {
                selectEdit.append(`<option value="${genero.id_Genero}">${genero.nombre}</option>`);
            });
        },
        error: function (xhr, status, error) {
            console.log("ERROR agregarGenerosALibros:", error, xhr, status);
        }
    });
}

function mostrarLibro(id) {
    $.ajax({
        url: `https://localhost:7003/api/Libros/${id}`,
        method: 'GET',
        dataType: 'json',
        success: function (libro) {
            // Obtenemos el autor
            $.get(`https://localhost:7003/api/Autores/${libro.id_Autor}`, function (autor) {
                // Obtenemos el género
                $.get(`https://localhost:7003/api/Generos/${libro.id_Genero}`, function (genero) {
                    const contenedor = $('#contenedorLibro');
                    contenedor.empty();
                    contenedor.append(`
                        <div class="row">
                            <div class="col-md-4 text-center">
                                <img src="${libro.fotoPath}" class="img-fluid" style="max-height: 300px;" alt="Portada">
                            </div>
                            <div class="col-md-8">
                                <h2>${libro.titulo}</h2>
                                <p><strong>Autor:</strong> ${autor.nombre} ${autor.apellido}</p>
                                <p><strong>Género:</strong> ${genero.nombre}</p>
                                <p><strong>Precio de alquiler:</strong> ₡${libro.precio_alquiler}</p>
                                <div class="mb-3">
                                    <button class="btn mt-3 " style="background-color: #F25835; border: none; color: white;" onclick="obtenerLibro(${libro.id_libro})">
                                        <i class="fa-solid fa-book-open"></i> Comprar
                                    </button>                                                                 
                                </div>

                                <div class="mb-3">
                                   <button class="btn mt-3 " style="background-color: #F25835; border: none; color: white;" onclick="reservasLibro(${libro.id_libro})">
                                <i class="fa-solid fa-book-open"></i> Reservar
                                            </button>
                                                                 
                                </div>
                            </div>
                        </div>
                        <hr>
                        <h4>Reseñas</h4>
                        <div id="contenedorResenas"></div>
                    `);

                    mostrarResenasPorLibro(libro.id_libro);
                }).fail(function () {
                    $('#contenedorLibro').html('<p class="text-danger">Error al cargar el género.</p>');
                });
            }).fail(function () {
                $('#contenedorLibro').html('<p class="text-danger">Error al cargar el autor.</p>');
            });
        },
        error: function () {
            $('#contenedorLibro').html('<p class="text-danger">Error al cargar el libro.</p>');
        }
    });
}

function obtenerLibro(id) {
    $.get(`https://localhost:7003/api/Libros/${id}`, function (libro) {


        var libroUnitario = {
            id_libro: libro.id_libro,
            foto: libro.fotoPath,
            titulo: libro.titulo,
            precio_alquiler: libro.precio_alquiler,
            stock: libro.stock,
            id_Autor: libro.id_Autor,
            id_Genero: libro.id_Genero,
            cantidad: 1,
            precio_Producto_cantidad: libro.precio_alquiler * 1
        }

        let carrito = JSON.parse(sessionStorage.getItem('carritoLibros') || '[]')

        const indexExistente = carrito.findIndex(c =>
            c.id_libro == libroUnitario.id_libro
        )

        if (indexExistente !== -1) {
            if (carrito[indexExistente].cantidad < libroUnitario.stock) {
                carrito[indexExistente].cantidad += 1;
                carrito[indexExistente].precio_Producto_cantidad =
                    carrito[indexExistente].precio_alquiler * carrito[indexExistente].cantidad
            } else {
                toastr.error('No hay suficiente stock');
                return;
            }
        } else {
            carrito.push(libroUnitario);
        }


        sessionStorage.setItem('carritoLibros', JSON.stringify(carrito));

        toastr.success('¡Éxito al agregar al carrito!');


    }).fail(function () {
        toastr.error('No se pudo agregar al carrito');
    })

}


function reservasLibro(id) {
    $.get(`https://localhost:7003/api/Libros/${id}`, function (libro) {


        var libroUnitarioR = {
            id_libro: libro.id_libro,
            foto: libro.fotoPath,
            titulo: libro.titulo,
            precio_alquiler: libro.precio_alquiler,
            stock: libro.stock,
            id_Autor: libro.id_Autor,
            id_Genero: libro.id_Genero,
            cantidad: 1,
            precio_Producto_cantidad: libro.precio_alquiler * 1
        }

        let carritoR = JSON.parse(sessionStorage.getItem('carritoLibrosR') || '[]')

        const indexExistenteR = carritoR.findIndex(c =>
            c.id_libro == libroUnitarioR.id_libro
        )

        if (indexExistenteR !== -1) {
            if (carritoR[indexExistenteR].cantidad < libroUnitarioR.stock) {
                carritoR[indexExistenteR].cantidad += 1;
                carritoR[indexExistenteR].precio_Producto_cantidad =
                    carritoR[indexExistenteR].precio_alquiler * carrito[indexExistenteR].cantidad
            } else {
                toastr.error('No hay suficiente stock');
                return;
            }
        } else {
            carritoR.push(libroUnitarioR);
        }


        sessionStorage.setItem('carritoLibrosR', JSON.stringify(carritoR));

        toastr.success('¡Éxito reservar!');


    }).fail(function () {
        toastr.error('No se pudo agregar al carrito');
    })
}

function mostrarLibros() {
    $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Libros",
        dataType: "json",
        success: function (response) {
            const contenedor = $('#librosMostrar');
            contenedor.empty();
            $.each(response, function (_, libro) {
                const autorNombre = autores[libro.id_Autor] || 'No definido';
                const libroHTML = `
                    <div class="col mx-3">
                        <div class="card border-0 h-100">
                            <a href="/Libro/${libro.id_libro}" class="text-decoration-none text-center">
                                <img src="${libro.fotoPath}" alt="Portada" class="card-img-top img-scale" style="height: 220px; object-fit: contain;">
                            </a>
                            <div class="card-body px-0">
                                <h6 class="fw-semibold text-truncate" title="${libro.titulo}">${libro.titulo}</h6>
                                <p class="text-muted small mb-1 text-uppercase">${autorNombre}</p>
                                <p class="fw-semibold text-dark">₡${libro.precio_alquiler}</p>
                            </div>
                        </div>
                    </div>
                `;
                contenedor.append(libroHTML);
            });
        },
        error: function (xhr, status, error) {
            console.log("ERROR mostrarLibros:", error, xhr, status);
        }
    });
}


function ordenarLibro() {
    $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Libros",
        dataType: "json",
        success: function (response) {
            const orden = $('#ordenar').val();
            if (orden === "precio_mayor") {
                $('#librosMostrar').hide();
                $('#librosMenor').hide();
                $('#librosMayor').show();
                mostrarLibrosMayor();
            } else if (orden === "precio_menor") {
                $('#librosMostrar').hide();
                $('#librosMayor').hide();
                $('#librosMenor').show();
                mostrarLibrosMenor();
            } else if (orden === "seleccion") {
                $('#librosMostrar').show();
                $('#librosMenor').hide();
                $('#librosMayor').hide();
            }
        },
        error: function (xhr, status, error) {
            console.log("ERROR ordenarLibro:", error, xhr, status);
        }
    });
}

function mostrarLibrosMayor() {
    $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Libros/MayorAMenor",
        dataType: "json",
        success: function (response) {
            const contenedor = $('#librosMayor');
            contenedor.empty();
            $.each(response, function (_, libro) {
                const autorNombre = autores[libro.id_Autor] || 'No definido';
                const libroHTML = `
                    <div class="col mx-3">
                        <div class="card border-0 h-100">
                            <a href="/Libro/${libro.id_libro}" class="text-decoration-none text-center">
                                <img src="${libro.fotoPath}" alt="Portada" class="card-img-top img-scale" style="height: 220px; object-fit: contain;">
                            </a>
                            <div class="card-body px-0">
                                <h6 class="fw-semibold text-truncate" title="${libro.titulo}">${libro.titulo}</h6>
                                <p class="text-muted small mb-1 text-uppercase">${autorNombre}</p>
                                <p class="fw-semibold text-dark">₡${libro.precio_alquiler}</p>
                            </div>
                        </div>
                    </div>
                `;
                contenedor.append(libroHTML);
            });
        },
        error: function (xhr, status, error) {
            console.log("ERROR mostrarLibrosMayor:", error, xhr, status);
        }
    });
}

function mostrarLibrosMenor() {
    $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Libros/MenorAMayor",
        dataType: "json",
        success: function (response) {
            const contenedor = $('#librosMenor');
            contenedor.empty();
            $.each(response, function (_, libro) {
                const autorNombre = autores[libro.id_Autor] || 'No definido';
                const libroHTML = `
                    <div class="col mx-3">
                        <div class="card border-0 h-100">
                            <a href="/Libro/${libro.id_libro}" class="text-decoration-none text-center">
                                <img src="${libro.fotoPath}" alt="Portada" class="card-img-top img-scale" style="height: 220px; object-fit: contain;">
                            </a>
                            <div class="card-body px-0">
                                <h6 class="fw-semibold text-truncate" title="${libro.titulo}">${libro.titulo}</h6>
                                <p class="text-muted small mb-1 text-uppercase">${autorNombre}</p>
                                <p class="fw-semibold text-dark">₡${libro.precio_alquiler}</p>
                            </div>
                        </div>
                    </div>
                `;
                contenedor.append(libroHTML);
            });
        },
        error: function (xhr, status, error) {
            console.log("ERROR mostrarLibrosMenor:", error, xhr, status);
        }
    });
}

function libroPorGenero(idGenero) {
    $.ajax({
        type: "GET",
        url: `https://localhost:7003/api/Libros/Genero/${idGenero}`,
        dataType: "json",
        success: function (response) {
            const contenedor = $('#librosMostrarId');
            contenedor.empty();
            if (response.length === 0) {
                $('#ContenedorgeneroPorId').append(`
                    <div class="text-center">
                        <p>No existen libros en este género aún.</p>
                    </div>
                `);
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
                                <h6 class="fw-semibold text-truncate" title="${libro.titulo}">${libro.titulo}</h6>
                                <p class="text-muted small mb-1 text-uppercase">${autorNombre}</p>
                                <p class="fw-semibold text-dark">₡${libro.precio_alquiler}</p>
                            </div>
                        </div>
                    </div>
                `;
                contenedor.append(libroHTML);
            });
        },
        error: function (xhr, status, error) {
            const contenedor = $('#librosMostrarId');
            contenedor.empty();
            if (xhr.status === 404) {
                contenedor.append(`<p>No existen libros en este género aún.</p>`);
            } else {
                contenedor.append(`<p>Ocurrió un error al cargar los libros.</p>`);
            }
            console.log("ERROR libroPorGenero:", error, xhr, status);
        }
    });
}

function mostrarResenasPorLibro(idLibro) {
    $.ajax({
        url: "https://localhost:7003/api/Resenas",
        method: "GET",
        dataType: "json",
        success: function (resenas) {
            const resenasDelLibro = resenas.filter(r => r.id_Libro === idLibro);
            const contenedor = $("#contenedorResenas");
            contenedor.empty();

            if (resenasDelLibro.length === 0) {
                contenedor.append("<p>No hay reseñas para este libro.</p>");
                return;
            }

            $.each(resenasDelLibro, function (_, resena) {
                // Obtenemos los datos del usuario que escribió la reseña.
                $.ajax({
                    url: `https://localhost:7003/api/Usuarios/${resena.id_Usuario}`,
                    method: "GET",
                    dataType: "json",
                    success: function (usuario) {
                        const cardResena = `
                            <div class="card my-3 shadow-sm">
                                <div class="card-header bg-light d-flex align-items-center">
                                    <i class="fas fa-user-circle fa-2x me-2 text-secondary"></i>
                                    <h5 class="mb-0">Reseña de ${usuario.nombre}</h5>
                                </div>
                                <div class="card-body">
                                    <h6 class="text-muted">El usuario expresó:</h6>
                                    <p class="card-text">${resena.resena}</p>
                                </div>
                            </div>
                        `;
                        contenedor.append(cardResena);
                    },
                    error: function () {
                        // Si falla la obtención del usuario, mostramos la reseña sin el nombre del autor
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
            $("#contenedorResenas").html('<p class="text-danger">Error al cargar las reseñas.</p>');
            console.log("ERROR mostrarResenasPorLibro:", error, xhr, status);
        }
    });
}

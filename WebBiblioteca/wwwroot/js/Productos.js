$(document).ready(function () {
    cargarProductosTabla();
    CategoriaCargar();
    CategoriaSelect();
    agregarProductoAdmin();
    agregarCategoriaProductos();
    mostrarProductos();
});

let categoriaP = [];
let tablaProductos;

function CategoriaCargar() {
    $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Categorias",
        dataType: "json",
        success: function (response) {
            $.each(response, function (_, categoria) {
                categoriaP[categoria.id_Categoria] = categoria.nombre;
            });
            if (tablaProductos) {
                tablaProductos.ajax.reload(null, false);
            } else {
                cargarProductosTabla();
            }
        },
        error: function (xhr, status, error) {
            console.log("ERROR:", error, xhr, status);
        }
    });
}

function cargarProductosTabla() {
    if ($.fn.DataTable.isDataTable('#tablaProductosAdmin')) {
        tablaProductos.ajax.reload(null, false);
        return;
    }

    tablaProductos = $('#tablaProductosAdmin').DataTable({
        processing: true,
        ajax: {
            url: "https://localhost:7003/api/Productos",
            dataSrc: ''
        },
        columns: [
            { data: 'id_productos' },
            {
                data: 'fotoPath',
                render: function (data, row) {
                    return `<img src="${data}" style="width:75px; height:75px;" class="img-thumbnail" alt="${row.titulo}">`;
                }
            },
            { data: 'stock' },
            { data: 'nombre' },
            { data: 'precioProducto' },

            {
                data: 'id_categoria',
                render: function (data) {
                    return categoriaP[data] || 'No definido';
                }
            },
            {
                data: 'iD_ESTADO',
                render: function (data) {
                    return data == 1
                        ? '<span class="text-success">Activo</span>'
                        : '<span class="text-danger">Inactivo</span>';
                }
            },
            {
                data: null,
                render: function (row) {

                    let botonEstadoP = row.iD_ESTADO == 1
                        ? `<button class="btn btn-danger rounded px-2 py-1" onclick="actualizarEstadoPrAdId(${row.id_productos}, 2,)">
                                    <i class="fa-solid fa-eye-slash"></i> Inactivar
                               </button>`
                        : `<button class="btn btn-success rounded px-2 py-1" onclick="actualizarEstadoPrAdId(${row.id_productos},  1)">
                                    <i class="fa-solid fa-eye"></i> Activar
                               </button>`;
                    let botonEditarP = `<button
      class="btn btn-primary rounded px-2 py-1 me-1"
      onclick="editarProducto(
         ${row.id_productos},
         ${row.stock},
         '${row.nombre}',
         ${row.precioProducto},
          ${row.id_categoria},
         ${row.iD_ESTADO},
         '${row.fotoPath}'
      )"
    >
  <i class="fa-solid fa-edit"></i> Editar
                                           </button>`;
                    return botonEstadoP + ' ' + botonEditarP;
                }
            }
        ],
        dom: 'frtip'
    });
}



function editarProducto(id_productos, stock, nombre, precioProducto, id_categoria, iD_ESTADO, fotoPath) {
    $('#idProductos_Editar').val(id_productos);
    $('#Stock_Editar').val(stock);
    $('#Nombre_Editar').val(nombre);
    $('#Precio_Editar').val(precioProducto);
    $('#idCategoriaP_Editar').val(id_categoria);
    $('#estadoEdit').val(iD_ESTADO);
    $("#fotoPreview").attr("src", fotoPath || "");
    $("#fotoEditP").val("");
    $("#exampleModal6").modal("show");

}

$('#ActualizarFormP').on('submit', function (event) {
    event.preventDefault();

    const id = $('#idProductos_Editar').val();
    console.log(id)

    var formData = new FormData();
    formData.append("id_productos", $("#idProductos_Editar").val());
    formData.append("stock", $("#Stock_Editar").val());
    formData.append("nombre", $("#Nombre_Editar").val());
    formData.append("precioProducto", $("#Precio_Editar").val());
    formData.append("id_categoria", $("#idCategoriaP_Editar").val());
    formData.append("iD_ESTADO", $("#estadoEdit").val());

    var fileInput = $('#fotoEditP')[0];
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
        formData.append("foto", fileInput.files[0]);
    };
    for (var par of formData.entries()) {
        console.log(par[0] + "," + par[1])
    }

    $.ajax({
        type: "PUT",
        url: `https://localhost:7003/api/Productos/${$('#idProductos_Editar').val()}`,
        data: formData,
        contentType: false,
        processData: false,
        success: function (response) {
            tablaProductos.ajax.reload();
            $("#exampleModal6").modal("hide");
        },
        error: function (xhr, status, error) {
            console.log("ERROR:", error, xhr, status);
        }
    });
});


function actualizarEstadoPrAdId(id_productos, estado) {
    var datos = {
        id_productos: id_productos,
        iD_ESTADO: estado
    };
    $.ajax({
        type: "PUT",
        url: `https://localhost:7003/api/Productos/estado/${datos.id_productos}?estado=${datos.iD_ESTADO}`,
        data: JSON.stringify(datos),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            tablaProductos.ajax.reload();
        },
        error: function (xhr, status, error) {
            console.log("ERROR actualizarEstadoPrAdId:", error, xhr, status);
        }
    });
}

function eliminarProductosAdminId(idProductos) {
    const idParseadaPAdmin = parseInt(idProductos);
    Swal.fire({
        title: "¿Estás seguro que deseas eliminar este producto?",
        html: "Si lo haces no podrás recuperar la información.",
        showDenyButton: true,
        confirmButtonText: "SI",
        denyButtonText: "CANCELAR"
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                type: "DELETE",
                url: `https://localhost:7003/api/Productos/${idParseadaPAdmin}`,
                success: function () {
                    Swal.fire("Eliminado", "El producto ha sido eliminado.", "success");
                    tablaProductos.ajax.reload(null, false);
                },
                error: function (xhr, status, error) {
                    console.log("ERROR:", error, xhr.status, xhr.responseText);
                    Swal.fire("Error", "No se pudo eliminar el producto. Lo más probable tengas un género asociado a otra entidad", "error");
                }
            });
        } else if (result.isDenied) {
            Swal.fire("Cancelado", "No se eliminó el producto.", "info");
        }
    });
}

//----AGREGAR----
function agregarProductoAdmin() {
    $('#ProductoAgregar').on('submit', function (event) {
        event.preventDefault();
        var formData = new FormData();
        formData.append("stock", $('#stockP').val());
        formData.append("nombre", $('#nombreP').val());
        formData.append("precioProducto", $('#precioP').val());
        formData.append("id_categoria", $('#categoriaP').val());

        var fileInput = $('#foto')[0];
        if (fileInput && fileInput.files && fileInput.files.length > 0) {
            formData.append("foto", fileInput.files[0]);
        }

        $.ajax({
            type: "POST",
            url: "https://localhost:7003/api/Productos",
            data: formData,
            contentType: false,
            processData: false,
            success: function (response) {
                $('#exampleModalPrAdd').modal('hide');
                tablaProductos.ajax.reload();
            },
            error: function (xhr, status, error) {
                console.log("ERROR: ", error, xhr, status);
            }
        });
    });
}

//-------AGREGAR CATEGORIA ---------
function agregarCategoriaProductos() {
    $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Categorias",
        dataType: "json",
        success: function (response) {
            const categoriaFiltered = response.filter(a => a.id_Estado == 1);
            const select = $('#categoriaP');
            select.empty();
            select.append(`<option selected>Ingrese la categoria</option>`);
            $.each(categoriaFiltered, function (_, categoria) {
                select.append(`<option value="${categoria.id_Categoria}">${categoria.nombre}</option>`);
            });
        },
        error: function (xhr, status, error) {
            console.log("ERROR:", error, xhr, status);
        }
    });
}


//------MOSTRAR CLIENTES--------
function mostrarProductos() {
    $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Productos",
        dataType: "json",
        success: function (response) {
            const contenedor = $('#ProductosMostrar');
            contenedor.empty();
            $.each(response, function (_, productos) {
                const CategoriaNombre = categoriaP[productos.id_categoria] || 'No definido';
                const productHTML = `
                   <div class="col mx-3">
                        <div class="card border-0 h-100">
                            <a href="/Producto/${productos.id_productos}" class="text-decoration-none text-center">
                                <img src="${productos.fotoPath}" alt="Portada" class="card-img-top img-scale" style="height: 220px; object-fit: contain;">
                            </a>
                            <div class="card-body px-0">
                                <h6 class="fw-semibold text-truncate" title="${productos.nombre}">${productos.nombre}</h6>
                                <p class="text-muted small mb-1 text-uppercase">${CategoriaNombre}</p>
                                <p class="fw-semibold text-dark">₡${productos.precioProducto}</p>
                                                                <p class="fw-semibold text-dark">₡${productos.stock}</p>

                            </div>
                        </div>
                    </div>
                `;
                contenedor.append(productHTML);
            });
        },
        error: function (xhr, status, error) {
            console.log("ERROR:", error, xhr, status);
        }
    });
}

//mostrar por id
function mostrarProductoId(id) {
    $.ajax({
        url: `https://localhost:7003/api/Productos/${id}`,
        method: 'GET',
        dataType: 'json',
        success: function (producto) {
            $.get(`https://localhost:7003/api/Categorias/${producto.id_categoria}`, function (categoria) {
                const contenedor = $('#contenedorProducto');
                contenedor.empty();
                contenedor.append(`
                        <div class="row">
                            <div class="col-md-4 text-center">
                                <img src="${producto.fotoPath}" class="img-fluid" style="max-height: 300px;" alt="Producto">
                            </div>
                            <div class="col-md-8">
                                <h2>${producto.nombre}</h2>
                                <p><strong>Producto:</strong> ${categoria.nombre}</p>
                                <p><strong>Precio:</strong> ₡${producto.precioProducto}</p>
                                <div class="mb-3">
                                    <button class="btn mt-3" style="background-color: #F25835; border: none; color: white;">
                                        <i class="fa-solid fa-book-open"></i> Comprar
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                    `);



            }).fail(function () {
                $('#contenedorProducto').html('<p class="text-danger">Error al cargar.</p>');
            });
        },
        error: function () {
            $('#contenedorProducto').html('<p class="text-danger">Error al cargar producto.</p>');
        }
    });
}



//------------
function CategoriaSelect() {
    return $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Categorias",
        dataType: "json",
        success: function (response) {
            const select = $('#idCategoriaP_Editar');
            select.empty();
            select.append(`<option value="">Seleccione una categoría</option>`);
            $.each(response, function (_, categoria) {
                if (categoria.id_Estado == 1) {
                    select.append(`<option value="${categoria.id_Categoria}">${categoria.nombre}</option>`);
                }
            });
        },
        error: function (xhr, status, error) {
            console.log("ERROR cargando categorías:", error, xhr, status);
        }
    });
}

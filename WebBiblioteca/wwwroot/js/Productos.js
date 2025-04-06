$(document).ready(function () {
    cargarProductosTabla();
    CategoriaCargar();
    CategoriaSelect();
    agregarProductoAdmin();
    agregarCategoriaProductos();
    mostrarProductos();
});


let categoriaP = [];
function CategoriaCargar() {
    $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Categorias",
        dataType: "json",
        success: function (response) {
            $.each(response, function (_, categoria) {
                categoriaP[categoria.id_Categoria] = categoria.nombre 
            })

            cargarProductosTabla();
        },
        error: function (xhr, status, error) {
            console.log("ERROR:", error, xhr, status);
        }
    })
}


function cargarProductosTabla() {
    $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Productos",
        dataType: "json",
        success: function (response) {
            const tabla = $('#tablaProductosAdmin tbody');
            tabla.empty();
            $.each(response, function (_, productoAdmin) {
                const categoriaNombre = categoriaP[productoAdmin.id_categoria] || 'No definido'
                const row = `
                <tr>
                        <td>${productoAdmin.id_productos}</td>
                        <td>${productoAdmin.stock}</td>
                         <td>${productoAdmin.nombre}</td>
                           <td>${categoriaNombre}</td>                          
                        <td>${productoAdmin.iD_ESTADO == 1 ?
                        `<span class="text-success">Activo</span>` :
                        `<span class="text-danger">Inactivo</span>`
                         }</td>
                           <td>
                            ${productoAdmin.iD_ESTADO == 1 ?
                    `<button class="btn btn-danger rounded px-2 py-1" onclick="actualizarEstadoPrAdId(${productoAdmin.id_productos}, ${productoAdmin.stock}, '${productoAdmin.nombre}', ${productoAdmin.id_categoria}, 2)">
                                    <i class="fa-solid fa-eye-slash"></i> Inactivar
                                </button>` :

                    `<button class="btn btn-success rounded  px-2 py-1" onclick="actualizarEstadoPrAdId(${productoAdmin.id_productos}, ${productoAdmin.stock}, '${productoAdmin.nombre}', ${productoAdmin.id_categoria}, 1)">
                            <i class="fa-solid fa-eye-slash"></i> Activar
                        </button>` }

                        <button  data-bs-toggle="modal" data-bs-target="#exampleModal6" onclick="editarProducto(${productoAdmin.id_productos}, ${productoAdmin.stock}, '${productoAdmin.nombre}', ${productoAdmin.id_categoria}, ${productoAdmin.iD_ESTADO})" class="btn btn-primary rounded px-2 py-1">
                                  Editar
                                </button >
                      
                        <td>
                                <button onclick="eliminarProductosAdminId(${productoAdmin.id_productos})" class="btn btn-danger rounded px-2 py-1">
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



//*---------------------
function editarProducto(idProductos, Stock, NombreP, idCategoriaP, estado) {

    $('#idProductos_Editar').val(idProductos);
    $('#Stock_Editar').val(Stock);
    $('#Nombre_Editar').val(NombreP);
    $('#estado_EditarP').val(estado);
    CategoriaSelect();

}

$('#ActualizarFormP').on('submit', function (event) {
    event.preventDefault();

    var datos = {
        id_productos: $('#idProductos_Editar').val(),
        stock: $('#Stock_Editar').val(),
        nombre: $('#Nombre_Editar').val(),
        id_categoria: $('#idCategoriaP_Editar').val(),
        iD_ESTADO: $('#estado_EditarP').val()
    };
    $.ajax({
        type: "PUT",
        url: `https://localhost:7003/api/Productos/${datos.id_productos}`,
        data: JSON.stringify(datos),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (datos) {
            cargarProductosTabla();
            $('#exampleModal6').modal('hide');
        },
        error: function (xhr, status, error) {
            console.log("ERROR:", error, xhr, status);
        }
    });
});


//--------------
function CategoriaSelect() {
    return $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Categorias",
        dataType: "json",
        success: function (response) {
            CategoriaProducto = response;

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





//----------------------
function actualizarEstadoPrAdId(idProductos, Stock, NombreP, idCategoriaP, estado) {
    var datos = {
        id_productos: idProductos, stock: Stock, nombre: NombreP, id_categoria: idCategoriaP, iD_ESTADO: estado
    };
    $.ajax({
        type: "PUT",
        url: `https://localhost:7003/api/Productos/${idProductos}`,
        data: JSON.stringify(datos),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (datos) {
            cargarProductosTabla();
        },
        error: function (xhr, status, error) {
            console.log("ERROR:", error, xhr, status);
        }
    });
}





function eliminarProductosAdminId(idProductos) {
    idParseadaPAdmin = parseInt(idProductos)
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
                success: function (response) {
                    Swal.fire("Eliminado", "El producto ha sido eliminado.", "success");
                    cargarProductosTabla();

                },
                error: function (xhr, status, error) {
                    console.log("ERROR:", error, xhr.status, xhr.responseText);
                    Swal.fire("Error", "No se pudo eliminar el producto. Lo mas probable tengas un genero asociado a otra entidad", "error");
                }
            });
        } else if (result.isDenied) {
            Swal.fire("Cancelado", "No se eliminó el género.", "info");
        }
    });
}



function agregarProductoAdmin() {

    $('#BinarioONoBinarioPrAdd').on('submit', function (event) {
        event.preventDefault();

        var datos = {
            stock: $('#stockP').val(),
            nombre: $('#nombreP').val(),
            id_categoria: $('#categoriaP').val()

        }
        $.ajax({
            type: "POST",
            url: "https://localhost:7003/api/Productos",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(datos),
            success: function (datos) {
                $('#exampleModalPrAdd').modal('hide');
                cargarProductosTabla();
            },
            error: function (xhr, status, error) {
                console.log("ERROR: ", error, xhr, status)
            }

        });

    })
};




function agregarCategoriaProductos() {
    $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Categorias",
        dataType: "json",
        success: function (response) {
            const categoriaFiltered = response.filter(a => a.id_Estado == 1)
            const select = $('#categoriaP');
            select.empty();
            select.append(`<option selected>Ingrese la categoria</option>`)
            $.each(categoriaFiltered, function (_, categoria) {
                const datosP = `

                <option value="${categoria.id_Categoria}">${categoria.nombre}</option>              
                `            

                select.append(datosP)

            });
            
        },
        error: function (xhr, status, error) {
            console.log("ERROR:", error, xhr, status);
        }
    });


}

//------------------------------
function mostrarProductos() {
    $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Productos",
        dataType: "json",
        success: function (response) {
            const producto = $('#ProductosMostrar');
            producto.empty();
            $.each(response, function (_, productos) {
                const CategoriaNombre = categoriaP[productos.id_categoria] || 'No definido';
                const product =
                    `
       
            <div class="card" style="width: 18rem;">
<a href="/ProductosMostrar/${productos.id_productos}" class="text-decoration-none text-center">
                                        <img src="${productos.fotoPath}" alt="Portada" class="card-img-top" style="height: 220px; object-fit: contain;">

                </a>  <div class="card-body">


   <div class="card-body px-0">
                    <h6 class="fw-semibold text-truncate" title="${productos.stock}">
                        ${productos.nombre}
                    </h6>
                    <p class="text-muted small mb-1 text-uppercase">${CategoriaNombre}</p>
                </div>

    <a href="#" class="btn btn-primary">Go somewhere</a>
  </div>
</div>


                    `;

                producto.append(product);
            });
        },
        error: function (xhr, status, error) {
            console.log("ERROR:", error, xhr, status);
        }
    });

}

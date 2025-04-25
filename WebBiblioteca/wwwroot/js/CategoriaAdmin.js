
let tablaCategoria;

$(function () {
    tablaCategoria = $('#tablaCategoria').DataTable({
        ajax: { url: 'https://localhost:7003/api/Categorias', dataSrc: '' },
        language: { url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
        columns: [
            { data: 'id_Categoria' },
            { data: 'nombre' },
            {
                data: 'id_Estado',
                render: est => est == 1
                    ? '<span class="text-success">Activo</span>'
                    : '<span class="text-danger">Inactivo</span>'
            },
            {
                data: null,
                render: row => {
                    const btnEstado = row.id_Estado == 1
                        ? `<button class="btn btn-danger rounded px-2 py-1" onclick="actualizarEstadoCategoriaId(${row.id_Categoria}, '${row.nombre}', 2)">Inactivar</button>`
                        : `<button class="btn btn-success rounded px-2 py-1" onclick="actualizarEstadoCategoriaId(${row.id_Categoria}, '${row.nombre}', 1)">Activar</button>`;
                    const btnEditar = `<button class="btn btn-primary rounded px-2 py-1" data-bs-toggle="modal" data-bs-target="#exampleModal1" onclick="editarCategoria(${row.id_Categoria}, '${row.nombre}', ${row.id_Estado})">Editar</button>`;
                    return btnEstado + ' ' + btnEditar;
                }
            },
            {
                data: null,
                render: row => `<button class="btn btn-danger rounded px-2 py-1" onclick="eliminarCategoriaId(${row.id_Categoria})">Eliminar</button>`
            }
        ],
        columnDefs: [
            { targets: [3, 4], orderable: false, searchable: false }
        ]
    });

    $('#formAgregarCategoria').on('submit', function (e) {
        e.preventDefault();
        const nombre = $('#categoriaNueva').val().trim();
        if (!nombre) return;
        $.ajax({
            type: 'POST',
            url: 'https://localhost:7003/api/Categorias',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify({ nombre }),
            success: function () {
                $('#exampleModal').modal('hide');
                tablaCategoria.ajax.reload();
            }
        });
    });

    $('#formActualizarCategoria').on('submit', function (e) {
        e.preventDefault();
        const id = $('#idEditar').val();
        const nombre = $('#categoriaEditar').val().trim();
        const estado = $('#estadoEditar').val();
        $.ajax({
            type: 'PUT',
            url: `https://localhost:7003/api/Categorias/${id}`,
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify({ id_Categoria: id, nombre, id_Estado: estado }),
            success: function () {
                $('#exampleModal1').modal('hide');
                tablaCategoria.ajax.reload();
            }
        });
    });
});

function actualizarEstadoCategoriaId(id, nombre, nuevoEstado) {
    $.ajax({
        type: 'PUT',
        url: `https://localhost:7003/api/Categorias/${id}`,
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify({ id_Categoria: id, nombre, id_Estado: nuevoEstado }),
        success: () => tablaCategoria.ajax.reload()
    });
}

function eliminarCategoriaId(id) {
    Swal.fire({
        title: '¿Estás seguro que deseas eliminar esta Categoría?',
        html: 'Si lo haces no podrás recuperar la información.',
        showDenyButton: true,
        confirmButtonText: 'SI',
        denyButtonText: 'CANCELAR'
    }).then(result => {
        if (result.isConfirmed) {
            $.ajax({
                type: 'DELETE',
                url: `https://localhost:7003/api/Categorias/${id}`,
                success: () => {
                    tablaCategoria.ajax.reload();
                    Swal.fire('Eliminado', 'La Categoría ha sido eliminada.', 'success');
                },
                error: () => Swal.fire('Error', 'No se pudo eliminar la categoría.', 'error')
            });
        }
    });
}

function editarCategoria(id, nombre, estado) {
    $('#idEditar').val(id);
    $('#categoriaEditar').val(nombre);
    $('#estadoEditar').val(estado);
}

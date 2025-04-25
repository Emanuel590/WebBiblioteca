
let libros = [];
let usuarios = [];
let tablaReclamos;

$(function () {
    tablaReclamos = $('#tablaReclamos').DataTable({
        language: {
            url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json'
        },
        columns: [
            { data: 'id_Reclamo' },
            { data: 'descripcion' },
            { data: 'tituloLibro' },
            { data: 'nombreUsuario' },
            { data: 'estadoHtml' },
            { data: 'acciones' },
            { data: 'accionesAdmin' }
        ],
        columnDefs: [
            { targets: [5, 6], orderable: false, searchable: false }
        ]
    });
    cargarLibros();
    cargarUsuarios();
    configurarAgregado();
});

function cargarLibros() {
    $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Libros",
        dataType: "json",
        success: function (response) {
            const activos = response.filter(l => l.id_Estado == 1);
            activos.forEach(l => { libros[l.id_libro] = l.titulo; });
            $('#librosOption, #librosOptionEdit')
                .empty()
                .append('<option selected>Seleccione un libro</option>');
            activos.forEach(l => {
                $('#librosOption, #librosOptionEdit')
                    .append(`<option value="${l.id_libro}">${l.titulo}</option>`);
            });
            cargarReclamosTabla();
        }
    });
}

function cargarUsuarios() {
    const token = localStorage.getItem("AuthToken");
    $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Usuarios",
        dataType: "json",
        headers: { 'Authorization': 'Bearer ' + token },
        success: function (response) {
            const activos = response.filter(u => u.id_estado == 1);
            activos.forEach(u => { usuarios[u.id_usuario] = u.nombre; });
            $('#usuariosOption, #usuariosOptionEdit')
                .empty()
                .append('<option selected>Seleccione un usuario</option>');
            activos.forEach(u => {
                $('#usuariosOption, #usuariosOptionEdit')
                    .append(`<option value="${u.id_usuario}">${u.nombre}</option>`);
            });
            cargarReclamosTabla();
        }
    });
}

function cargarReclamosTabla() {
    $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Reclamos",
        dataType: "json",
        success: function (response) {
            tablaReclamos.clear();
            response.forEach(r => {
                const titulo = libros[r.id_Libro] || 'No definido';
                const usuario = usuarios[r.id_Usuario] || 'No definido';
                const estado = r.id_Estado == 1
                    ? '<span class="text-success">Activo</span>'
                    : '<span class="text-danger">Inactivo</span>';
                const accionEstado = r.id_Estado == 1
                    ? `<button class="btn btn-danger rounded px-2 py-1" onclick="editarEstadoReclamo(${r.id_Reclamo}, '${r.descripcion}', ${r.id_Libro}, ${r.id_Usuario}, 2)">Inactivar</button>`
                    : `<button class="btn btn-success rounded px-2 py-1" onclick="editarEstadoReclamo(${r.id_Reclamo}, '${r.descripcion}', ${r.id_Libro}, ${r.id_Usuario}, 1)">Activar</button>`;
                const botonEditar = `<button data-bs-toggle="modal" data-bs-target="#exampleModal3" onclick="obtenerDatosActualizadosReclamo(${r.id_Reclamo}, '${r.descripcion}', ${r.id_Libro}, ${r.id_Usuario}, ${r.id_Estado})" class="btn btn-primary rounded px-2 py-1">Editar</button>`;
                const botonEliminar = `<button onclick="eliminarReclamoId(${r.id_Reclamo})" class="btn btn-danger rounded px-2 py-1">Eliminar</button>`;
                tablaReclamos.row.add({
                    id_Reclamo: r.id_Reclamo,
                    descripcion: r.descripcion,
                    tituloLibro: titulo,
                    nombreUsuario: usuario,
                    estadoHtml: estado,
                    acciones: accionEstado + ' ' + botonEditar,
                    accionesAdmin: botonEliminar
                });
            });
            tablaReclamos.draw();
        }
    });
}

function configurarAgregado() {
    $('#ReclamosAgregar').on('submit', function (e) {
        e.preventDefault();
        const datos = {
            descripcion: $('#descripcionReclamo').val(),
            id_Libro: $('#librosOption').val(),
            id_Usuario: $('#usuariosOption').val()
        };
        $.ajax({
            type: "POST",
            url: "https://localhost:7003/api/Reclamos",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(datos),
            success: function () {
                $('#exampleModal').modal('hide');
                cargarReclamosTabla();
            }
        });
    });
}

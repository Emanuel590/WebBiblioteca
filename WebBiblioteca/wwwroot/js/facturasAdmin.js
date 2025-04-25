$(document).ready(function () {
    $.getJSON("https://localhost:7003/api/facturas/admin/facturas")
        .done(json => {
            console.log("Ejemplo de factura:", json[0]);
        })
        .fail(err => console.error("Error al obtener facturas:", err));

    let table;
    table =$('#facturasTable').DataTable({
        ajax: {
            url: "https://localhost:7003/api/facturas/admin/facturas",
            dataSrc: ""
        },
        columns: [
            { data: "id_factura", title: "ID" },
            { data: "fecha_factura", title: "Fecha" },
            { data: "total", title: "Total" },
            { data: "usuario", title: "Usuario" },        
            { data: "producto", title: "Producto" },       
            { data: "metodO_PAGO", title: "Método de Pago" }, 
            { data: "estado", title: "Estado" },         
            { data: "reserva", title: "Reserva" },       
            {
                data: null,
                title: "Acciones",
                orderable: false,
                render: (_, __, row) => `
                    <button class="btn btn-warning btn-sm me-2" onclick="editarFactura(${row.id_factura})">
                        <i class="fas fa-edit me-1"></i> Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="eliminarFactura(${row.id_factura})">
                        <i class="fas fa-trash-alt me-1"></i> Eliminar
                    </button>
      `
            }
        ]
    });



    obtenerUsuarios();
    obtenerProductos();
    obtenerMetodosPago();
    obtenerEstados();
    obtenerReservas();

    $('#addFacturaForm').submit(function (e) {
        e.preventDefault();
        const datos = {
            fecha_factura: new Date($('#addFechaFactura').val()).toISOString().split('T')[0],
            total: parseFloat($('#addTotal').val()),
            id_usuario: parseInt($('#addUsuario').val()),
            id_metodo: parseInt($('#addMetodoPago').val()),
            id_producto: parseInt($('#addProducto').val()),
            id_reservas: parseInt($('#addReserva').val()),  
            id_estado: parseInt($('#addEstado').val())
        };

        $.ajax({
            type: "POST",
            url: "https://localhost:7003/api/facturas",
            data: JSON.stringify(datos),
            contentType: "application/json; charset=utf-8",
            success: function () {
                table.ajax.reload();
                $('#addFacturaModal').modal('hide');
            },
            error: function (xhr) {
                console.error("POST error:", xhr.responseText);
                alert('Error al agregar factura');
            }
        });
    });

    $('#editFacturaForm').submit(function (e) {
        e.preventDefault();
        const id = parseInt($('#editIdFactura').val());
        const datos = {
            id_factura: id,
            fecha_factura: $('#editFechaFactura').val(),
            total: parseFloat($('#editTotal').val()),
            id_usuario: parseInt($('#editUsuario').val()),
            id_metodo: parseInt($('#editMetodoPago').val()),
            id_producto: parseInt($('#editProducto').val()),
            id_reservas: parseInt($('#editReserva').val()),  
            id_estado: parseInt($('#editEstado').val())
        };

        $.ajax({
            type: "PUT",
            url: `https://localhost:7003/api/facturas/${id}`,
            data: JSON.stringify(datos),
            contentType: "application/json; charset=utf-8",
            success: function () {
                table.ajax.reload();
                $('#editFacturaModal').modal('hide');
            },
            error: function (xhr) {
                console.error("PUT error:", xhr.responseText);
                alert('Error al editar factura');
            }
        });
    });

    window.eliminarFactura = function (id) {
        if (!confirm("¿Eliminar esta factura?")) return;
        $.ajax({
            type: "DELETE",
            url: `https://localhost:7003/api/facturas/${id}`,
            success: () => table.ajax.reload(),
            error: () => alert('Error al eliminar factura')
        });
    };


    function obtenerUsuarios() {
        $.getJSON("https://localhost:7003/api/facturas/usuarios")
            .done(llenarSelectUsuarios)
            .fail(() => alert('Error al obtener usuarios'));
    }
    function obtenerProductos() {
        $.getJSON("https://localhost:7003/api/facturas/productos")
            .done(llenarSelectProductos)
            .fail(() => alert('Error al obtener productos'));
    }
    function obtenerMetodosPago() {
        $.getJSON("https://localhost:7003/api/facturas/metodosPago")
            .done(llenarSelectMetodosPago)
            .fail(() => alert('Error al obtener métodos de pago'));
    }
    function obtenerEstados() {
        $.getJSON("https://localhost:7003/api/facturas/estados")
            .done(llenarSelectEstados)
            .fail(() => alert('Error al obtener estados'));
    }
    function obtenerReservas() {
        $.getJSON("https://localhost:7003/api/facturas/reserva")
            .done(llenarSelectReservas)
            .fail(() => alert('Error al obtener reservas'));
    }

 
    function llenarSelectUsuarios(data) {
        $('#addUsuario, #editUsuario').empty();
        data.forEach(u => $('#addUsuario, #editUsuario')
            .append(`<option value="${u.id_usuario}">${u.nombre}</option>`));
    }
    function llenarSelectProductos(data) {
        $('#addProducto, #editProducto').empty();
        data.forEach(p => $('#addProducto, #editProducto')
            .append(`<option value="${p.id_productos}">${p.nombre}</option>`));
    }
    function llenarSelectMetodosPago(data) {
        $('#addMetodoPago, #editMetodoPago').empty();
        data.forEach(m => $('#addMetodoPago, #editMetodoPago')
            .append(`<option value="${m.id_metodo}">${m.metodo_Pago}</option>`));
    }
    function llenarSelectEstados(data) {
        $('#addEstado, #editEstado').empty();
        data.forEach(e => $('#addEstado, #editEstado')
            .append(`<option value="${e.id_Estado}">${e.descripcion}</option>`));
    }
    function llenarSelectReservas(data) {
        $('#addReserva, #editReserva').empty();
        data.forEach(r => {
            const txt = new Date(r.fecha).toLocaleDateString();
            $('#addReserva, #editReserva')
                .append(`<option value="${r.id_reservas}">${txt}</option>`);
        });
    }
});

function editarFactura(id) {
    $.getJSON(`https://localhost:7003/api/facturas/${id}`)
        .done(f => {
            $('#editIdFactura').val(f.id_factura);
            $('#editFechaFactura').val(f.fecha_factura.split('T')[0]);
            $('#editTotal').val(f.total);
            $('#editUsuario').val(f.id_usuario);
            $('#editProducto').val(f.id_producto);
            $('#editReserva').val(f.id_reservas);
            $('#editMetodoPago').val(f.id_metodo);
            $('#editEstado').val(f.id_estado);
            $('#editFacturaModal').modal('show');
        })
        .fail(() => alert('Error al cargar los datos de la factura'));
}

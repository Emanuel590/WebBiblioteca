$(document).ready(function () {
    console.log('sessionStorage carritoLibros:', sessionStorage.getItem('carritoLibros'));
    mostrarFactura();  
    cargarDatosFacturacion();
    cargarMetodosPago(); 
    $('#btnGenerarFactura').on('click', generarFactura); 
    $('#btnPagar').on('click', procesarPago); 
});

function mostrarFactura() {
    const carrito = JSON.parse(sessionStorage.getItem('carritoLibros') || '[]');
    const email = sessionStorage.getItem('EmailUsuario') || 'Cliente desconocido';
    const fechaHoy = new Date().toLocaleDateString();
    let total = 0;
    let filas = '';

    carrito.forEach(item => {
        const subtotal = item.precio_alquiler * item.cantidad;
        total += subtotal;
        filas += `
            <tr>
                <td>
                    <span class="text-inverse">${item.titulo}</span><br>
                    <small>Código libro: ${item.id_libro}</small>
                </td>
                <td class="text-center">₡${item.precio_alquiler}</td>
                <td class="text-center">${item.cantidad}</td>
                <td class="text-right">₡${subtotal.toFixed(2)}</td>
            </tr>`;
    });

    const template = `
    <div class="invoice" id="invoiceToPdf">
        <div class="invoice-company text-inverse f-w-600">
            <span class="pull-right hidden-print">
                <button onclick="window.print()" class="btn btn-sm btn-white m-b-10 p-l-5">
                    <i class="fa fa-print fa-fw fa-lg"></i> Imprimir
                </button>
            </span>
            Librería ACME S.A.
        </div>
        <div class="invoice-header">
            <div class="invoice-from">
                <small>De</small>
                <address>
                    <strong class="text-inverse">Librería ACME</strong><br>
                    San José, Costa Rica<br>
                    Email: facturacion@acme.cr<br>
                    Tel: +506 2222-3333
                </address>
            </div>
            <div class="invoice-to">
                <small>Para</small>
                <address>
                    <strong class="text-inverse">${email}</strong><br>
                    Dirección del cliente<br>
                    Costa Rica<br>
                </address>
            </div>
            <div class="invoice-date">
                <small>Factura emitida</small>
                <div class="date text-inverse">${fechaHoy}</div>
                <div class="invoice-detail">
                    #${Math.floor(Math.random() * 1000000)}<br>
                    Alquiler de Libros
                </div>
            </div>
        </div>
        <div class="invoice-content">
            <div class="table-responsive">
                <table class="table table-invoice">
                    <thead>
                        <tr>
                            <th>Descripción</th>
                            <th class="text-center">Precio</th>
                            <th class="text-center">Cantidad</th>
                            <th class="text-right">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filas}
                    </tbody>
                </table>
            </div>
            <div class="invoice-price">
                <div class="invoice-price-left">
                    <div class="invoice-price-row">
                        <div class="sub-price">
                            <small>SUBTOTAL</small>
                            <span class="text-inverse">₡${total.toFixed(2)}</span>
                        </div>
                        <div class="sub-price">
                            <i class="fa fa-plus text-muted"></i>
                        </div>
                        <div class="sub-price">
                            <small>IVA (13%)</small>
                            <span class="text-inverse">₡${(total * 0.13).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                <div class="invoice-price-right">
                    <small>TOTAL</small> <span class="f-w-600">₡${(total * 1.13).toFixed(2)}</span>
                </div>
            </div>
        </div>
        <div class="invoice-note">
            * Si tienes alguna consulta sobre esta factura, escribe a soporte@acme.cr<br>
            * Gracias por confiar en nuestra librería.
        </div>
        <div class="invoice-footer text-center">
            <p class="f-w-600">¡Gracias por tu compra!</p>
            <p>
                <span><i class="fa fa-globe"></i> www.libreria-acme.cr</span> |
                <span><i class="fa fa-envelope"></i> info@acme.cr</span>
            </p>
        </div>
    </div>`;

    const invoiceElement = document.getElementById('invoiceToPdf');
    if (invoiceElement) {
        invoiceElement.innerHTML = template;
        console.log('Factura mostrada correctamente');
    } else {
        console.error('No se encontró el contenedor de la factura (invoiceToPdf)');
    }
}


function generarFactura() {
    const element = document.getElementById('invoiceToPdf');

    if (!element) {
        console.error('No se encontró el elemento de la factura.');
        return; 
    }

    console.log('Generando el PDF...');
    const options = {
        margin: 10,
        filename: 'Factura_Libreria_ACME.pdf',
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(options).save();
}

function cargarDatosFacturacion() {
    const carrito = JSON.parse(sessionStorage.getItem('carritoLibros') || '[]');
    console.log('carrito para facturación:', carrito);
    let total = 0;
    let rows = '';

    carrito.forEach(item => {
        const subtotal = Number(item.precio_Producto_cantidad) || 0;
        total += subtotal;
        rows += `
      <tr>
        <td>${item.titulo}</td>
        <td>${item.cantidad}</td>
        <td>₡${item.precio_alquiler}</td>
        <td>₡${subtotal}</td>
      </tr>`;
    });

    $('#tablaFacturacion').html(rows);
    $('#totalFacturacion').text('₡' + total);
}

function cargarMetodosPago() {
    $.ajax({
        url: 'https://localhost:7003/api/pagos',
        type: 'GET',
        headers: { 'Authorization': 'Bearer ' + authToken },
        success: function (metodos) {
            console.log('Métodos de pago del usuario:', metodos);
            let options = '<option value="" disabled selected>Seleccione...</option>';
            metodos.forEach(m => {
                options += `
                  <option value="${m.id_metodo}">
                    ${m.metodo_Pago} - ${m.n_Tarjeta}
                  </option>`;
            });
            $('#metodoPagoSelect').html(options);
        },
        error: function (xhr) {
            Swal.fire('Error al cargar métodos de pago', xhr.responseText, 'error');
        }
    });
}

function procesarPago() {
    const metodoSeleccionado = $('#metodoPagoSelect').val();
    if (!metodoSeleccionado) {
        Swal.fire('Método de pago requerido', 'Por favor selecciona un método de pago', 'warning');
        return;
    }

    generarFactura();
    sessionStorage.removeItem('carritoLibros');

    Swal.fire({
        icon: 'success',
        title: '¡Pago realizado con éxito!',
        text: 'Tu factura se ha generado correctamente.',
        confirmButtonText: 'Aceptar'
    }).then(() => {
        actualizarStockLibros();
        window.location.href = '/Libros'; 
    });
}
function actualizarStockLibros() {
    const carrito = JSON.parse(sessionStorage.getItem('carritoLibros') || '[]');

    console.log('Carrito de libros:', carrito);

    carrito.forEach(item => {
        const nuevaCantidad = item.stock - item.cantidad;
        console.log(`Actualizando stock para ${item.titulo}: Stock actual: ${item.stock}, Cantidad a restar: ${item.cantidad}, Nuevo stock: ${nuevaCantidad}`);

        if (nuevaCantidad >= 0) {
            $.ajax({
                url: `https://localhost:7003/api/Libros/${item.id_libro}`,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({
                    id_libro: item.id_libro,
                    stock: nuevaCantidad 
                }),
                success: function (response) {
                    console.log(`Stock actualizado correctamente para ${item.titulo}`);
                    console.log('Respuesta del servidor:', response);
                },
                error: function (xhr, status, error) {
                    console.error(`Error al actualizar stock de ${item.titulo}:`, xhr.responseText);
                    console.log('Detalles del error:', xhr.status, error);
                }
            });
        } else {
            console.error(`No hay suficiente stock para ${item.titulo}. Stock insuficiente.`);
        }
    });
}

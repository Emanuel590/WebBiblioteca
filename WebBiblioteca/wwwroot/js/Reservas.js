//Mostrar los Metodos en el DOM
$(document).ready(function () {
    cargarReservasTabla();
});

//Mostrar Reservas ADMIN
function cargarReservasTabla() {
    cargarEstadosReserva().then(function () {    
    $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Reservas",
        dataType: "json",
        success: function (response) {
            const tabla = $('#ReservasTabla tbody')
            tabla.empty();

            $.each(response, function (_, adminReservas) {
                let estadosD = '';

                estadosAlm.forEach(estado => { 
                    estadosD += `
                      <option value="${estado.id_Estado}" ${adminReservas.iD_ESTADO == estado.id_Estado ? 'selected' : ''}> 
                                ${estado.descripcion}
                            </option>`;

                });

                const row = `
                <tr>
                        <td>${adminReservas.id_reservas}</td>
                        <td>${adminReservas.id_Libro}</td>
                        <td>${adminReservas.id_Usuario}</td>
                        <td>${adminReservas.fecha}</td>
                       
 <td>
                                  <select class="form-select form-select-sm" onchange="actualizarEstadoAdminReservasId(${adminReservas.id_reservas}, ${adminReservas.id_Libro}, ${adminReservas.id_Usuario}, '${adminReservas.fecha}', this.value)">
                                    ${estadosD}
                                </select>
                            </td>
                           d
                            <td>
                                <button onclick="eliminarReservaAdminId(${adminReservas.id_reservas})" class="btn btn-danger rounded px-2 py-1">
                                    <i class="fa-solid fa-trash"></i> Eliminar
                                </button>
                            </td>
                        </tr>`;

                tabla.append(row);
            });
        },
        error: function (xhr, status, error) {
            console.log("ERROR:", error, xhr, status);
        }
    });
    });
}

//--------------------------------//
let estadosAlm = [];

function cargarEstadosReserva() {
    return $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Estados",
        dataType: "json",
        success: function (response) {
            estadosAlm = response;
        },
        error: function (xhr, status, error) {
            console.log("ERROR cargando estados:", error, xhr, status);
        }
    });
}

//-----por terminar pasar de int a string ---------//
function cargarLibroReserva() {
    return $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Libros",
        dataType: "json",
        success: function (response) {
            estadosAlm = response;
        },
        error: function (xhr, status, error) {
            console.log("ERROR cargando estados:", error, xhr, status);
        }
    });
}

function cargarUsuariosReserva() {
    return $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Usuarios",
        dataType: "json",
        success: function (response) {
            estadosAlm = response;
        },
        error: function (xhr, status, error) {
            console.log("ERROR cargando estados:", error, xhr, status);
        }
    });
}



function actualizarEstadoAdminReservasId(idReservas, idLibro, idUsuario, Fecha, estado) {
    var datos = { id_reservas: idReservas, id_Libro: idLibro, id_Usuario: idUsuario, fecha: Fecha, iD_ESTADO: estado };
    $.ajax({
        type: "PUT",
        url: `https://localhost:7003/api/Reservas/${idReservas}`,
        data: JSON.stringify(datos),
        contentType: "application/json; charset=utf-8",
 
        success: function () {//llega a datos con undifined pero el resto lo lee bien 
            cargarReservasTabla();
            
        },
        error: function (xhr, status, error) {
            console.log("ERROR:", error, xhr, status);
        }
    });
}

function eliminarReservaAdminId(idReservas) {
    idReEli = parseInt(idReservas)
    Swal.fire({
        title: "¿Estás seguro que deseas eliminar esta reserva?",
        html: "Si lo haces no podrás recuperar la información.",
        showDenyButton: true,
        confirmButtonText: "SI",
        denyButtonText: "CANCELAR"
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                type: "DELETE",
                url: `https://localhost:7003/api/Reservas/${idReEli}`,
                success: function (response) {
                    Swal.fire("Eliminado", "Reserva se ha eliminado.", "success");
                    cargarReservasTabla();
                },
                error: function (xhr, status, error) {
                    console.log("ERROR:", error, xhr.status, xhr.responseText);
                    Swal.fire("Error", "No se pudo eliminar la reserva.", "error");
                }
            });
        } else if (result.isDenied) {
            Swal.fire("Cancelado", "No se eliminó la reserva. ", "info");
        }
    });
}
    
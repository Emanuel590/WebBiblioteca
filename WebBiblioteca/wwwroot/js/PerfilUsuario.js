$(document).ready(function () {
    cargarPerfilUsuario();
});

function cargarPerfilUsuario() {
    var authToken = sessionStorage.getItem('AuthToken');
    var emailUsuario = sessionStorage.getItem('EmailUsuario');

    if (!authToken || authToken.trim() === "") {
        alert("No se encontró el token. Por favor, inicie sesión.");
        window.location.href = "/Index";
        return;
    }

    if (!emailUsuario || emailUsuario.trim() === "") {
        alert("No se encontró el email del usuario. Por favor, inicie sesión.");
        window.location.href = "/Index";
        return;
    }

    console.log('Token enviado:', authToken);
    console.log('Email del usuario en sesión:', emailUsuario);

    $.ajax({
        url: 'https://localhost:7003/api/usuarios',
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + authToken
        },
        success: function (response) {
            var usuarioActual = response.find(u => u.email === emailUsuario);
            if (!usuarioActual) {
                $('#perfilUsuario').html('<p class="text-danger">No se encontró información del usuario.</p>');
                return;
            }

            var rol = usuarioActual.id_role;

            if (rol === 1) {
                mostrarListaUsuariosAdmin(response, emailUsuario);
            } else if (rol === 2) {
                mostrarPerfilCliente(usuarioActual);
            } else if (rol === 3) {
                mostrarListaUsuariosEmpleado(response, emailUsuario);
            } else {
                $('#perfilUsuario').html('<p class="text-info">Tu perfil no requiere acciones específicas.</p>');
            }
        },
        error: function (xhr, status, error) {
            console.error("Error al cargar perfil:", error);
            $('#perfilUsuario').html('<p class="text-danger">Error al cargar los datos del perfil. ' + xhr.responseText + '</p>');
        }
    });
}


function mostrarListaUsuariosAdmin(listaUsuarios, emailUsuario) {
    var usuarioAdmin = listaUsuarios.find(u => u.email === emailUsuario && u.id_role === 1);

    if (!usuarioAdmin) {
        $('#perfilUsuario').html('<p class="text-danger">No se encontró información del usuario administrador.</p>');
        return;
    }

    if ($.fn.DataTable.isDataTable('#tablaAdminUsuarios')) {
        $('#tablaAdminUsuarios').DataTable().destroy();
    }

    var html = `
        <div class="container">
            <div class="main-body">
                <nav aria-label="breadcrumb" class="main-breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="/Index">Inicio</a></li>
                        <li class="breadcrumb-item"><a href="javascript:void(0)">Administrador</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Perfil de Administrador</li>
                    </ol>
                </nav>
                <div class="row gutters-sm">
                    <div class="col-md-4 mb-3">
                        <div class="card">
                            <div class="card-body">
                                <div class="d-flex flex-column align-items-center text-center">
                                    <div class="rounded-circle bg-light d-flex align-items-center justify-content-center" style="width: 150px; height: 150px; font-size: 72px;">
                                        <i class="fa fa-user text-secondary"></i>
                                    </div>
                                    <div class="mt-3">
                                        <h4>${usuarioAdmin.nombre}</h4>
                                        <p class="text-secondary mb-1">Administrador</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-8">
                        <div class="card mb-3">
                            <div class="card-body">
                                <div class="row"><div class="col-sm-3"><h6 class="mb-0">Email</h6></div><div class="col-sm-9 text-secondary">${usuarioAdmin.email}</div></div><hr>
                                <div class="row"><div class="col-sm-3"><h6 class="mb-0">Teléfono</h6></div><div class="col-sm-9 text-secondary">${usuarioAdmin.telefono}</div></div><hr>
                                <div class="row"><div class="col-sm-3"><h6 class="mb-0">Cédula</h6></div><div class="col-sm-9 text-secondary">${usuarioAdmin.cedula}</div></div><hr>
                                <div class="row"><div class="col-sm-3"><h6 class="mb-0">Código Postal</h6></div><div class="col-sm-9 text-secondary"><p class="text-muted font-size-sm">${usuarioAdmin.codigo_postal || 'No disponible'}</p></div></div><hr>
                                <div class="row"><div class="col-sm-12 text-center">
                                    <button class="btn btn-outline-purple me-2" onclick="location.href='/CreateEmpleado'">
                                        <i class="fa fa-user-plus me-1"></i> Crear Usuario Empleado
                                    </button>
                                    <button class="btn btn-outline-purple" onclick="editarUsuario(${usuarioAdmin.id_usuario})">
                                        <i class="fa fa-pen me-1"></i> Editar Mi Información
                                    </button>

                                </div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="container demo">
            <div class="row">
                <div class="col-md-12">
                    <div class="panel">
                        <div class="panel-heading row">
                            <div class="col-sm-3"><h4 class="title">Lista de Usuarios</h4></div>
                        </div>
                        <div class="panel-body table-responsive">
                           <table id="tablaAdminUsuarios" class="table table-striped table-bordered" style="width:100%">
                                <thead>
                                    <tr>
                                        <th>ID</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>`;
    var usuarios = listaUsuarios.filter(u => u.id_role === 2 || u.id_role === 3);
    usuarios.forEach(function (u) {
        var rolText = u.id_role === 2 ? 'Cliente' : 'Empleado';
        html += `
            <tr>
                <td>${u.id_usuario}</td>
                <td>${u.nombre}</td>
                <td>${u.email}</td>
                <td>${rolText}</td>
                <td class="p-1 text-center" style="white-space: nowrap;">
                    <ul class="action-list">
                      <li>
                        <a href="#" class="btn btn-sm btn-primary" onclick="editarUsuario(${u.id_usuario})">
                          <i class="fa fa-edit"></i> Editar
                        </a>
                      </li>
                      <li>
                        <a href="#" class="btn btn-sm btn-danger" onclick="confirmarEliminarUsuario(${u.id_usuario})">
                          <i class="fa fa-trash"></i> Eliminar
                        </a>
                      </li>
                    </ul>
                </td>
            </tr>`;
    });
    html += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    $('#perfilUsuario').html(html);

    $('#tablaAdminUsuarios').DataTable({
        pageLength: 5,
        lengthMenu: [5, 10, 25],
        columnDefs: [
            {
                targets: -1,       
                width: "130px",   
                className: "dt-center"
            }
        ],
        language: {
            search: "Buscar:",
            paginate: { previous: "<", next: ">" },
            info: "Mostrando _START_ a _END_ de _TOTAL_ usuarios"
        }
    });

}

function mostrarListaUsuariosEmpleado(listaUsuarios, emailUsuario) {
    var empleado = listaUsuarios.find(u => u.email === emailUsuario && u.id_role === 3);

    if (!empleado) {
        $('#perfilUsuario').html('<p class="text-danger">No se encontró la información del empleado.</p>');
        return;
    }

    if ($.fn.DataTable.isDataTable('#tablaEmpleadoClientes')) {
        $('#tablaEmpleadoClientes').DataTable().destroy();
    }

    var html = `
        <div class="container">
            <div class="main-body">
                <nav aria-label="breadcrumb" class="main-breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="/Index">Inicio</a></li>
                        <li class="breadcrumb-item"><a href="javascript:void(0)">Empleado</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Perfil de Empleado</li>
                    </ol>
                </nav>
                <div class="row gutters-sm">
                    <div class="col-md-4 mb-3">
                        <div class="card">
                            <div class="card-body">
                                <div class="d-flex flex-column align-items-center text-center">
                                    <div class="rounded-circle bg-light d-flex align-items-center justify-content-center" style="width: 150px; height: 150px; font-size: 72px;">
                                        <i class="fa fa-user text-secondary"></i>
                                    </div>
                                    <div class="mt-3">
                                        <h4>${empleado.nombre}</h4>
                                        <p class="text-secondary mb-1">Empleado</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-8">
                        <div class="card mb-3">
                            <div class="card-body">
                                <div class="row"><div class="col-sm-3"><h6 class="mb-0">Email</h6></div><div class="col-sm-9 text-secondary">${empleado.email}</div></div><hr>
                                <div class="row"><div class="col-sm-3"><h6 class="mb-0">Teléfono</h6></div><div class="col-sm-9 text-secondary">${empleado.telefono}</div></div><hr>
                                <div class="row"><div class="col-sm-3"><h6 class="mb-0">Cédula</h6></div><div class="col-sm-9 text-secondary">${empleado.cedula}</div></div><hr>
                                <div class="row"><div class="col-sm-3"><h6 class="mb-0">Código Postal</h6></div><div class="col-sm-9 text-secondary"><p class="text-muted font-size-sm">${empleado.codigo_postal || 'No disponible'}</p></div></div><hr>
                                <div class="row">
                                    <div class="col-sm-12 text-center">
                                        <button class="btn btn-outline-purple" onclick="editarUsuario(${empleado.id_usuario})">
                                            <i class="fa fa-pen me-1"></i> Editar Mi Información
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="container demo">
            <div class="row">
                <div class="col-md-12">
                    <div class="panel">
                        <div class="panel-heading row">
                            <div class="col-sm-3"><h4 class="title">Lista de Clientes</h4></div>
                        </div>
                        <div class="panel-body table-responsive">
                            <table id="tablaEmpleadoClientes" class="table table-striped table-bordered" style="width:100%">
                                <thead>
                                    <tr>
                                        <th>ID</th><th>Nombre</th><th>Email</th><th>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>`;
    var clientes = listaUsuarios.filter(u => u.id_role === 2);
    clientes.forEach(function (u) {
        html += `
            <tr>
                <td>${u.id_usuario}</td>
                <td>${u.nombre}</td>
                <td>${u.email}</td>
                <td class="p-1 text-center" style="white-space: nowrap;">
                    <ul class="action-list">
                      <li>
                        <a href="#" class="btn btn-sm btn-primary" onclick="editarUsuario(${u.id_usuario})">
                          <i class="fa fa-edit"></i> Editar
                        </a>
                      </li>
                      <li>
                        <a href="#" class="btn btn-sm btn-danger" onclick="confirmarEliminarUsuario(${u.id_usuario})">
                          <i class="fa fa-trash"></i> Eliminar
                        </a>
                      </li>
                    </ul>
                </td>
            </tr>`;
    });
    html += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    $('#perfilUsuario').html(html);

    $('#tablaEmpleadoClientes').DataTable({
        pageLength: 5,
        lengthMenu: [5, 10, 25],
        columnDefs: [
            {
                targets: -1,
                width: "130px",
                className: "dt-center"
            }
        ],
        language: {
            search: "Buscar:",
            paginate: { previous: "<", next: ">" },
            info: "Mostrando _START_ a _END_ de _TOTAL_ clientes"
        }
    });
}



function mostrarPerfilCliente(cliente) {
    var html = `
        <div class="container">
          <div class="main-body">
            <nav aria-label="breadcrumb" class="main-breadcrumb">
              <ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="/Index">Inicio</a></li>
                <li class="breadcrumb-item active" aria-current="page">Perfil de Cliente</li>
              </ol>
            </nav>
            <div class="row gutters-sm">
              <div class="col-md-4 mb-3">
                <div class="card">
                  <div class="card-body text-center">
                    <div class="rounded-circle bg-light d-flex align-items-center justify-content-center" style="width:150px; height:150px; font-size:72px;">
                      <i class="fa fa-user text-secondary"></i>
                    </div>
                    <h4 class="mt-3">${cliente.nombre}</h4>
                    <p class="text-secondary mb-1">Cliente</p>
                  </div>
                </div>
              </div>
              <div class="col-md-8">
                <div class="card mb-3">
                  <div class="card-body">
                    <div class="row"><div class="col-sm-3"><h6>Email</h6></div><div class="col-sm-9 text-secondary">${cliente.email}</div></div><hr>
                    <div class="row"><div class="col-sm-3"><h6>Teléfono</h6></div><div class="col-sm-9 text-secondary">${cliente.telefono || 'No disponible'}</div></div><hr>
                    <div class="row"><div class="col-sm-3"><h6>Cédula</h6></div><div class="col-sm-9 text-secondary">${cliente.cedula || 'No disponible'}</div></div><hr>
                    <div class="row"><div class="col-sm-3"><h6>Código Postal</h6></div><div class="col-sm-9 text-secondary">${cliente.codigo_postal || 'No disponible'}</div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="container mt-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="mb-0">Mis tarjetas</h5>
            <button class="btn btn-sm btn-success" onclick="mostrarFormCrearTarjeta()">
              <i class="fa fa-plus me-1"></i> Nueva tarjeta
            </button>
          </div>
          <div class="row" id="rowTarjetas">
            <!-- Tarjetas se insertarán aquí -->
          </div>
        </div>
    `;
    $('#perfilUsuario').html(html);
    cargarTarjetasCliente();
}

function cargarTarjetasCliente() {
    var authToken = sessionStorage.getItem('AuthToken');
    $.ajax({
        url: 'https://localhost:7003/api/pagos',
        type: 'GET',
        headers: { 'Authorization': 'Bearer ' + authToken },
        success: function (cards) {
            console.log('Respuesta API /api/pagos:', cards);
            var grid = '';
            cards.forEach(function (c) {
                grid += `
                  <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <div class="card tarjeta-card h-100">
                      <div class="card-body d-flex flex-column">
                        <p class="tarjeta-number mb-2">${c.n_Tarjeta}</p>
                        <p class="tarjeta-bank text-muted mb-4">${c.entidad_Bancaria}</p>
                        <div class="mt-auto text-end">
                          <button class="btn btn-sm btn-danger" onclick="confirmarEliminarTarjeta(${c.id_metodo})">
                            <i class="fa fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>`;
            });
            $('#rowTarjetas').html(grid);
        },
        error: function (xhr) {
            alert('Error al cargar tarjetas: ' + xhr.responseText);
        }
    });
}


function mostrarFormCrearTarjeta() {
    $('#tarjetaForm')[0].reset();
    $('#id_metodo').val('');
    $('#tarjetaModalTitle').text('Agregar Nueva Tarjeta');
    new bootstrap.Modal($('#tarjetaModal')).show();
}

function editarTarjeta(id) {
    var authToken = sessionStorage.getItem('AuthToken');
    $.ajax({
        url: 'https://localhost:7003/api/pagos/' + id,
        type: 'GET',
        headers: { 'Authorization': 'Bearer ' + authToken },
        success: function (data) {
            $('#tarjetaModalTitle').text('Editar Tarjeta');
            $('#id_metodo').val(data.id_metodo);
            $('#metodoPago').val(data.metodo_Pago);
            $('#entidadBancaria').val(data.entidad_Bancaria);
            $('#nTarjeta').val(''); // no mostramos el real
            $('#idEstado').val(data.id_estado);
            new bootstrap.Modal($('#tarjetaModal')).show();
        },
        error: function (xhr) {
            alert('Error al obtener tarjeta: ' + xhr.responseText);
        }
    });
}

function guardarTarjeta() {
    var authToken = sessionStorage.getItem('AuthToken');
    var id = $('#id_metodo').val();
    var payload = {
        Id_metodo: id ? parseInt(id) : 0,
        Metodo_Pago: $('#metodoPago').val(),
        Entidad_Bancaria: $('#entidadBancaria').val(),
        N_Tarjeta: $('#nTarjeta').val(),
        ID_ESTADO: parseInt($('#idEstado').val())
    };
    var method = id ? 'PUT' : 'POST';
    var url = 'https://localhost:7003/api/pagos' + (id ? '/' + id : '');

    $.ajax({
        url: url,
        type: method,
        contentType: 'application/json',
        headers: { 'Authorization': 'Bearer ' + authToken },
        data: JSON.stringify(payload),
        success: function () {
            bootstrap.Modal.getInstance($('#tarjetaModal')).hide();
            cargarTarjetasCliente();
        },
        error: function (xhr) {
            alert('Error al guardar tarjeta: ' + xhr.responseText);
        }
    });
}

function confirmarEliminarTarjeta(id) {
    if (confirm('¿Eliminar definitivamente esta tarjeta?')) {
        var authToken = sessionStorage.getItem('AuthToken');
        $.ajax({
            url: 'https://localhost:7003/api/pagos/' + id,
            type: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + authToken },
            success: function () {
                cargarTarjetasCliente();
            },
            error: function (xhr) {
                alert('Error al eliminar tarjeta: ' + xhr.responseText);
            }
        });
    }
}

function crearUsuario() {
    alert('Funcionalidad para crear un nuevo usuario.');
}

function editarUsuario(id) {
    $.ajax({
        url: 'https://localhost:7003/api/usuarios/' + id,
        type: 'GET',
        success: function (data) {
            $('#nombre').val(data.nombre);
            $('#email').val(data.email);
            $('#telefono').val(data.telefono);
            $('#cedula').val(data.cedula);
            $('#codigoPostal').val(data.codigo_postal);
            $('#idUsuario').val(id);
            $('#contra').val(data.contra);
            $('#id_role').val(data.id_role);
            $('#id_estado').val(data.id_estado);

            $('#editarUsuarioModal').modal('show');
        },
        error: function (xhr, status, error) {
            alert('Error al obtener los datos del usuario: ' + error);
        }
    });
}

function guardarEdicionUsuario() {
    var id = parseInt($('#idUsuario').val());
    var usuarioEditado = {
        id_usuario: id,
        nombre: $('#nombre').val(),
        email: $('#email').val(),
        codigo_postal: $('#codigoPostal').val() ? parseInt($('#codigoPostal').val()) : null,
        telefono: parseInt($('#telefono').val()),
        cedula: parseInt($('#cedula').val()),
        contra: $('#contra').val(),
        id_role: parseInt($('#id_role').val()),
        id_estado: parseInt($('#id_estado').val())
    };

    $.ajax({
        url: 'https://localhost:7003/api/usuarios/' + id,
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(usuarioEditado),
        success: function (response) {
            $('#editarUsuarioModal').modal('hide');
            alert('Usuario actualizado exitosamente');
            cargarPerfilUsuario();
        },
        error: function (xhr, status, error) {
            alert('Hubo un error al actualizar el usuario: ' + xhr.responseText);
        }
    });
}

function confirmarEliminarUsuario(id) {
    $('#eliminarUsuarioModal').data('id', id);
    $('#eliminarUsuarioModal').modal('show');
}

function eliminarUsuario() {
    var id = $('#eliminarUsuarioModal').data('id');

    $.ajax({
        url: 'https://localhost:7003/api/Usuarios/' + id,
        type: 'DELETE',
        success: function (response) {
            $('#eliminarUsuarioModal').modal('hide');
            alert('Usuario eliminado exitosamente');
            cargarPerfilUsuario();
        },
        error: function (xhr, status, error) {
            alert('Hubo un error al eliminar el usuario: ' + error);
        }
    });
}

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

    var html = `
        <div class="card mb-4">
            <div class="card-header text-center" style="background-color: #F2A172;">
                <h3>Panel de Administración</h3>
            </div>
            <div class="card-body">
                <h5><strong>Mi Perfil:</strong></h5>
                <p><strong>Nombre:</strong> ${usuarioAdmin.nombre}</p>
                <p><strong>Email:</strong> ${usuarioAdmin.email}</p>
                <p><strong>Código Postal:</strong> ${usuarioAdmin.codigo_postal || 'No disponible'}</p>
                <p><strong>Teléfono:</strong> ${usuarioAdmin.telefono}</p>
                <p><strong>Cédula:</strong> ${usuarioAdmin.cedula}</p>
                <button class="btn btn-success" onclick="location.href='/CreateEmpleado'">Crear Usuario Empleado</button>
                <button class="btn btn-warning" onclick="editarUsuario(${usuarioAdmin.id_usuario})">Editar Mi Información</button>
            </div>
        </div>

        <div class="card mb-4">
            <div class="card-header text-center" style="background-color: #F2A172;">
                <h4>Lista de Empleados y Clientes</h4>
            </div>
            <div class="card-body">
                <table class="table table-bordered">
                    <thead>
                        <tr><th>ID</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Acciones</th></tr>
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
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editarUsuario(${u.id_usuario})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="confirmarEliminarUsuario(${u.id_usuario})">Borrar</button>

                </td>
            </tr>`;
    });

    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;

    $('#perfilUsuario').html(html);
}

function mostrarListaUsuariosEmpleado(listaUsuarios, emailUsuario) {
    var empleado = listaUsuarios.find(u => u.email === emailUsuario && u.id_role === 3);

    if (!empleado) {
        $('#perfilUsuario').html('<p class="text-danger">No se encontró la información del empleado.</p>');
        return;
    }

    var html = `
        <div class="card mb-4">
            <div class="card-header text-center" style="background-color: #F2A172;">
                <h3>Panel de Empleado</h3>
            </div>
            <div class="card-body">
                <p><strong>Nombre:</strong> ${empleado.nombre}</p>
                <p><strong>Email:</strong> ${empleado.email}</p>
                <p><strong>Código Postal:</strong> ${empleado.codigo_postal || 'No disponible'}</p>
                <p><strong>Teléfono:</strong> ${empleado.telefono}</p>
                <p><strong>Cédula:</strong> ${empleado.cedula}</p>
                <button class="btn btn-warning" onclick="editarUsuario()">Editar Mi Información</button>
            </div>
        </div>

        <div class="card mb-4">
            <div class="card-header text-center" style="background-color: #F2A172;">
                <h4>Lista de Clientes</h4>
            </div>
            <div class="card-body">
                <table class="table table-bordered">
                    <thead>
                        <tr><th>ID</th><th>Nombre</th><th>Email</th><th>Acción</th></tr>
                    </thead>
                    <tbody>`;

    var clientes = listaUsuarios.filter(u => u.id_role === 2);
    clientes.forEach(function (u) {
        html += `
            <tr>
                <td>${u.id_usuario}</td>
                <td>${u.nombre}</td>
                <td>${u.email}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editarUsuario(${u.id_usuario})">Editar</button>
                </td>
            </tr>`;
    });

    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;

    $('#perfilUsuario').html(html);
}

function mostrarPerfilCliente(cliente) {
    var html = `
        <div class="card mb-4">
            <div class="card-header text-center" style="background-color: #F2A172;">
                <h3>Perfil de Cliente</h3>
            </div>
            <div class="card-body">
                <p><strong>Nombre:</strong> ${cliente.nombre}</p>
                <p><strong>Email:</strong> ${cliente.email}</p>
                <p><strong>Código Postal:</strong> ${cliente.codigo_postal || 'No disponible'}</p>
                <p><strong>Teléfono:</strong> ${cliente.telefono}</p>
                <p><strong>Cédula:</strong> ${cliente.cedula}</p>
                <button class="btn btn-warning" onclick="editarUsuario(${cliente.id_usuario})">Editar Mi Información</button>
            </div>
        </div>
    `;

    $('#perfilUsuario').html(html);
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

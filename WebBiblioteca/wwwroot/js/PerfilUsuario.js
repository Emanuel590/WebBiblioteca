$(document).ready(function () {
    cargarPerfilUsuario();
});

function cargarPerfilUsuario() {
    var authToken = sessionStorage.getItem('AuthToken'); 

    if (!authToken || authToken.trim() === "") {
        alert("No se encontró el token. Por favor, inicie sesión.");
        window.location.href = "/Index";
        return;
    }

    console.log('Token enviado:', authToken);

    $.ajax({
        url: 'https://localhost:7003/api/usuarios',
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + authToken
        },
        success: function (response) {
            if (response.length === 1) {
                mostrarPerfilCliente(response[0]);
            } else if (response.length > 1) {
                var rol = response[0].id_role;
                if (rol === 1) {
                    mostrarPerfilAdmin(response);
                } else if (rol === 3) {
                    mostrarPerfilEmpleado(response);
                } else {
                    mostrarPerfilCliente(response[0]);
                }
            }
        },
        error: function (xhr, status, error) {
            console.error("Error al cargar perfil:", error);
            console.log('Respuesta del servidor:', xhr.responseText);
            $('#perfilUsuario').html('<p class="text-danger">Error al cargar los datos del perfil. ' + xhr.responseText + '</p>');
        }
    });
}

function mostrarPerfilCliente(usuario) {
    var html = `
        <div class="card mb-4">
            <div class="card-header text-center" style="background-color: #F2A172;">
                <h3>Perfil de Cliente</h3>
            </div>
            <div class="card-body">
                <p><strong>Nombre:</strong> ${usuario.nombre}</p>
                <p><strong>Email:</strong> ${usuario.email}</p>
                <p><strong>Código Postal:</strong> ${usuario.codigo_postal || 'No definido'}</p>
                <p><strong>Teléfono:</strong> ${usuario.telefono}</p>
                <p><strong>Cédula:</strong> ${usuario.cedula}</p>
                <button class="btn" style="background-color: #F25835; color: white;" onclick="editarPerfilCliente()">Editar Información</button>
            </div>
        </div>
    `;
    $('#perfilUsuario').html(html);
}

// Función para mostrar el perfil de administrador: crear, editar y borrar usuarios
function mostrarPerfilAdmin(listaUsuarios) {
    var usuarioAdmin = listaUsuarios.find(u => u.id_role === 1); 
    var html = `
        <div class="card mb-4">
            <div class="card-header text-center" style="background-color: #F2A172;">
                <h3>Perfil de Admin</h3>
            </div>
            <div class="card-body">
                <p><strong>Nombre del Administrador:</strong> ${usuarioAdmin.nombre}</p>
                <p><strong>Email:</strong> ${usuarioAdmin.email}</p>
                <p><strong>Código Postal:</strong> ${usuarioAdmin.codigo_postal || 'No definido'}</p>
                <p><strong>Teléfono:</strong> ${usuarioAdmin.telefono}</p>
                <p><strong>Cédula:</strong> ${usuarioAdmin.cedula}</p>
                <hr>
                <button class="btn btn-success" style="background-color: #F25835; color: white;" onclick="crearUsuario()">Crear Usuario</button>
                <button class="btn btn-warning" style="background-color: #F25835; color: white;" onclick="editarPerfilAdmin(${usuarioAdmin.id_usuario})">Editar Usuario</button> <!-- Botón para editar el perfil del admin -->

            </div>
        </div>

        <div class="card mb-4">
            <div class="card-header text-center" style="background-color: #F2A172;">
                <h4>Lista de Usuarios</h4>
            </div>
            <div class="card-body">
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>ID</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>`;

    // Excluir el administrador de la lista de usuarios
    var usuariosSinAdmin = listaUsuarios.filter(u => u.id_role !== 1);

    usuariosSinAdmin.forEach(function (u) {
        var rolText = u.id_role === 2 ? 'Cliente' : (u.id_role === 3 ? 'Empleado' : 'Admin');
        html += `
            <tr>
                <td>${u.id_usuario}</td>
                <td>${u.nombre}</td>
                <td>${u.email}</td>
                <td>${rolText}</td>
                <td>
                    <button class="btn btn-warning btn-sm" style="background-color: #F25835; color: white;" onclick="editarUsuario(${u.id_usuario})">Editar</button>
                    <button class="btn btn-danger btn-sm" style="background-color: #F25835; color: white;" onclick="eliminarUsuario(${u.id_usuario})">Borrar</button>
                </td>
            </tr>
        `;
    });
    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    $('#perfilUsuario').html(html);
}

// Función para mostrar el perfil de empleado: editar su información y la de clientes
function mostrarPerfilEmpleado(listaUsuarios) {
    var usuarioAutenticado = listaUsuarios.find(u => u.id_role === 3) || listaUsuarios[0];
    var html = `
        <div class="card mb-4">
            <div class="card-header text-center" style="background-color: #F2A172;">
                <h3>Perfil de Empleado</h3>
            </div>
            <div class="card-body">
                <p><strong>Nombre:</strong> ${usuarioAutenticado.nombre}</p>
                <p><strong>Email:</strong> ${usuarioAutenticado.email}</p>
                <p><strong>Código Postal:</strong> ${usuarioAutenticado.codigo_postal || 'No definido'}</p>
                <p><strong>Teléfono:</strong> ${usuarioAutenticado.telefono}</p>
                <p><strong>Cédula:</strong> ${usuarioAutenticado.cedula}</p>
                <button class="btn btn-warning" style="background-color: #F25835; color: white;" onclick="editarPerfilEmpleado()">Editar Mi Información</button>
                <hr>
                <h4>Lista de Clientes</h4>
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>ID</th><th>Nombre</th><th>Email</th><th>Acciones</th>
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
                <td>
                    <button class="btn btn-warning btn-sm" style="background-color: #F25835; color: white;" onclick="editarUsuarioCliente(${u.id_usuario})">Editar</button>
                </td>
            </tr>
        `;
    });
    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    $('#perfilUsuario').html(html);
}

function editarPerfilCliente() {
    alert('Editar perfil cliente.');
}

function crearUsuario() {
    alert('Funcionalidad para crear un nuevo usuario.');
}

function editarUsuario(id) {
    alert('Editar usuario con ID: ' + id);
}

function eliminarUsuario(id) {
    alert('Eliminar usuario con ID: ' + id);
}

function editarPerfilEmpleado() {
    alert('Editar mi información (empleado).');
}

function editarUsuarioCliente(id) {
    alert('Editar información del cliente con ID: ' + id);
}

function editarPerfilAdmin(id) {
}
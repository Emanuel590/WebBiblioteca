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
        <style>
            body {
                margin-top: 20px;
                color: #1a202c;
                text-align: left;
                background-color: #f3e5f5; /* Morado claro */
            }
            .main-body {
                padding: 15px;
            }
            .card {
                box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06);
                margin-bottom: 20px;
                position: relative;
                display: flex;
                flex-direction: column;
                min-width: 0;
                word-wrap: break-word;
                background-color: #fff;
                background-clip: border-box;
                border: 0;
                border-radius: .25rem;
            }
            .card-body {
                padding: 1rem;
            }
            .gutters-sm {
                margin-right: -8px;
                margin-left: -8px;
            }
            .gutters-sm > .col, .gutters-sm > [class*=col-] {
                padding-right: 8px;
                padding-left: 8px;
            }
            .mb-3, .my-3 {
                margin-bottom: 1rem!important;
            }
            .bg-gray-300 {
                background-color: #e2e8f0;
            }
            .h-100 {
                height: 100%!important;
            }
            .shadow-none {
                box-shadow: none!important;
            }
            /* Botón de edición */
            .btn-edit {
                background-color: #FFA500; /* Naranja */
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
            }
            .btn-edit:hover {
                background-color: #FF8C00; /* Naranja más oscuro */
                color: white;
            }
            /* Botón de borrar */
            .btn-danger {
                background-color: #dc3545;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
            }
            .btn-danger:hover {
                background-color: #c82333;
                color: white;
            }
            .demo { font-family: 'Noto Sans', sans-serif; }
            .panel {
                background: linear-gradient(to right, #2980b9, #2c3e50);
                padding: 0;
                border-radius: 10px;
                border: none;
                box-shadow: 0 0 0 5px rgba(0,0,0,0.05), 0 0 0 10px rgba(0,0,0,0.05);
                margin-bottom: 20px;
            }
            .panel .panel-heading {
                padding: 20px 15px;
                border-radius: 10px 10px 0 0;
                margin: 0;
            }
            .panel .panel-heading .title {
                color: #fff;
                font-size: 28px;
                font-weight: 500;
                text-transform: capitalize;
                line-height: 40px;
                margin: 0;
            }
            .panel .panel-body { 
                padding: 15px;
            }
            .panel .panel-body .table {
                width: 100%;
                margin: 0 auto;
                border-collapse: collapse;
            }
            .panel .panel-body .table thead tr th {
                color: #fff;
                background-color: rgba(255, 255, 255, 0.2);
                font-size: 16px;
                font-weight: 500;
                text-transform: uppercase;
                padding: 12px;
                border: none;
            }
            .panel .panel-body .table tbody tr td {
                color: #fff;
                font-size: 15px;
                padding: 10px 12px;
                vertical-align: middle;
                border: none;
            }
            .panel .panel-body .table tbody tr:nth-child(even) { 
                background-color: rgba(255,255,255,0.05); 
            }
            .panel .panel-body .table tbody .action-list {
                padding: 0;
                margin: 0;
                list-style: none;
            }
            .panel .panel-body .table tbody .action-list li {
                display: inline-block;
                margin: 0 5px;
            }
            .panel .panel-body .table tbody .action-list li a {
                color: #fff;
                font-size: 15px;
                position: relative;
                z-index: 1;
                transition: all 0.3s ease 0s;
            }
            .panel .panel-body .table tbody .action-list li a:hover { 
                text-shadow: 3px 3px 0 rgba(255,255,255,0.3); 
            }
            .panel .panel-footer {
                color: #fff;
                background-color: transparent;
                padding: 15px;
                border: none;
            }
            .panel .panel-footer .col { 
                line-height: 35px; 
            }
            .pagination { margin: 0; }
            .pagination li a {
                color: #fff;
                background-color: transparent;
                border: 2px solid transparent;
                font-size: 18px;
                font-weight: 500;
                text-align: center;
                line-height: 31px;
                width: 35px;
                height: 35px;
                padding: 0;
                margin: 0 3px;
                border-radius: 50px;
                transition: all 0.3s ease 0s;
            }
            .pagination li a:hover {
                color: #fff;
                background-color: transparent;
                border-color: rgba(255,255,255,0.2);
            }
            .pagination li a:focus,
            .pagination li.active a,
            .pagination li.active a:hover {
                color: #fff;
                background-color: transparent;
                border-color: #fff;
            }
            .pagination li:first-child a,
            .pagination li:last-child a {
                border-radius: 50%;
            }
            @media only screen and (max-width:767px) {
                .panel .panel-heading .title {
                    text-align: center;
                    margin: 0 0 10px;
                }
                .panel .panel-heading .btn_group { 
                    text-align: center; 
                }
            }
        </style>

        <div class="container">
            <div class="main-body">
                <!-- Breadcrumb -->
                <nav aria-label="breadcrumb" class="main-breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="/Index">Inicio</a></li>
                        <li class="breadcrumb-item"><a href="javascript:void(0)">Administrador</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Perfil de Administrador</li>
                    </ol>
                </nav>
                <!-- /Breadcrumb -->

                <div class="row gutters-sm">
                    <div class="col-md-4 mb-3">
                        <div class="card">
                            <div class="card-body">
                                <div class="d-flex flex-column align-items-center text-center">
                                    <img src="https://bootdey.com/img/Content/avatar/avatar7.png" alt="Profile Image" class="rounded-circle" width="150">
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
                                <div class="row">
                                    <div class="col-sm-3">
                                        <h6 class="mb-0">Email</h6>
                                    </div>
                                    <div class="col-sm-9 text-secondary">
                                        ${usuarioAdmin.email}
                                    </div>
                                </div>
                                <hr>
                                <div class="row">
                                    <div class="col-sm-3">
                                        <h6 class="mb-0">Teléfono</h6>
                                    </div>
                                    <div class="col-sm-9 text-secondary">
                                        ${usuarioAdmin.telefono}
                                    </div>
                                </div>
                                <hr>
                                <div class="row">
                                    <div class="col-sm-3">
                                        <h6 class="mb-0">Cédula</h6>
                                    </div>
                                    <div class="col-sm-9 text-secondary">
                                        ${usuarioAdmin.cedula}
                                    </div>
                                </div>
                                <hr>
                                <!-- Sección Código Postal -->
                                <div class="row">
                                    <div class="col-sm-3">
                                        <h6 class="mb-0">Código Postal</h6>
                                    </div>
                                    <div class="col-sm-9 text-secondary">
                                        <p class="text-muted font-size-sm">${usuarioAdmin.codigo_postal || 'No disponible'}</p>
                                    </div>
                                </div>
                                <hr>
                                <!-- Botones de acción -->
                                <div class="row">
                                    <div class="col-sm-12 text-center">
                                        <button class="btn btn-success" onclick="location.href='/CreateEmpleado'">Crear Usuario Empleado</button>
                                        <button class="btn btn-edit" onclick="editarUsuario(${usuarioAdmin.id_usuario})">Editar Mi Información</button>
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
                        <div class="panel-heading">
                            <div class="row">
                                <div class="col col-sm-3 col-xs-12">
                                    <h4 class="title">Lista de Usuarios</h4>
                                </div>
                                <div class="col-sm-9 col-xs-12 text-right">
                                    <!-- Controles opcionales -->
                                </div>
                            </div>
                        </div>
                        <div class="panel-body table-responsive">
                           <table class="table" style="width: 100%; margin: 0 auto;">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nombre</th>
                                        <th>Email</th>
                                        <th>Rol</th>
                                        <th>Acciones</th>
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
                                        <td>
                                            <ul class="action-list">
                                                <li>
                                                    <a href="#" data-tip="edit" onclick="editarUsuario(${u.id_usuario})">
                                                        <i class="fa fa-edit"></i>
                                                    </a>
                                                </li>
                                                <li>
                                                    <a href="#" data-tip="delete" onclick="confirmarEliminarUsuario(${u.id_usuario})">
                                                        <i class="fa fa-trash"></i>
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
                        <div class="panel-footer">
                            <div class="row">
                                <div class="col col-sm-6 col-xs-6">showing <b>5</b> out of <b>25</b> entries</div>
                                <div class="col-sm-6 col-xs-6">
                                    <ul class="pagination hidden-xs pull-right">
                                        <li><a href="#"><</a></li>
                                        <li class="active"><a href="#">1</a></li>
                                        <li><a href="#">2</a></li>
                                        <li><a href="#">3</a></li>
                                        <li><a href="#">4</a></li>
                                        <li><a href="#">5</a></li>
                                        <li><a href="#">></a></li>
                                    </ul>
                                    
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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
        <style>
            body {
                margin-top: 20px;
                color: #1a202c;
                text-align: left;
                background-color: #f3e5f5; /* Morado claro */
            }
            .main-body {
                padding: 15px;
            }
            .card {
                box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06);
                margin-bottom: 20px; /* Espacio uniforme entre tarjetas */
                position: relative;
                display: flex;
                flex-direction: column;
                min-width: 0;
                word-wrap: break-word;
                background-color: #fff;
                background-clip: border-box;
                border: 0;
                border-radius: .25rem;
            }
            .card-body {
                padding: 1rem;
            }
            .gutters-sm {
                margin-right: -8px;
                margin-left: -8px;
            }
            .gutters-sm > .col, .gutters-sm > [class*=col-] {
                padding-right: 8px;
                padding-left: 8px;
            }
            .mb-3, .my-3 {
                margin-bottom: 1rem!important;
            }
            .bg-gray-300 {
                background-color: #e2e8f0;
            }
            .h-100 {
                height: 100%!important;
            }
            .shadow-none {
                box-shadow: none!important;
            }
            /* Botón naranja */
            .btn-edit {
                background-color: #FFA500; /* Naranja */
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
            }
            .btn-edit:hover {
                background-color: #FF8C00; /* Naranja más oscuro */
                color: white;
            }
            .demo { font-family: 'Noto Sans', sans-serif; }
            .panel {
                background: linear-gradient(to right, #2980b9, #2c3e50);
                padding: 0;
                border-radius: 10px;
                border: none;
                box-shadow: 0 0 0 5px rgba(0,0,0,0.05), 0 0 0 10px rgba(0,0,0,0.05);
                margin-bottom: 20px;
            }
            .panel .panel-heading {
                padding: 20px 15px;
                border-radius: 10px 10px 0 0;
                margin: 0;
            }
            .panel .panel-heading .title {
                color: #fff;
                font-size: 28px;
                font-weight: 500;
                text-transform: capitalize;
                line-height: 40px;
                margin: 0;
            }
            .panel .panel-heading .btn {
                color: rgba(255,255,255,0.5);
                background: transparent;
                font-size: 16px;
                text-transform: capitalize;
                border: 2px solid #fff;
                border-radius: 50px;
                transition: all 0.3s ease 0s;
            }
            .panel .panel-heading .btn:hover {
                color: #fff;
                text-shadow: 3px 3px rgba(255,255,255,0.2);
            }
            .panel .panel-heading .form-control {
                color: #fff;
                background-color: transparent;
                width: 35%;
                height: 40px;
                border: 2px solid #fff;
                border-radius: 20px;
                display: inline-block;
                transition: all 0.3s ease 0s;
            }
            .panel .panel-heading .form-control:focus {
                background-color: rgba(255,255,255,0.2);
                box-shadow: none;
                outline: none;
            }
            .panel .panel-heading .form-control::placeholder {
                color: rgba(255,255,255,0.5);
                font-size: 15px;
                font-weight: 500;
            }
            .panel .panel-body { 
                padding: 15px; /* Ajuste para mayor simetría */
            }
            .panel .panel-body .table {
                width: 100%;
                margin: 0 auto;
                border-collapse: collapse;
            }
            .panel .panel-body .table thead tr th {
                color: #fff;
                background-color: rgba(255, 255, 255, 0.2);
                font-size: 16px;
                font-weight: 500;
                text-transform: uppercase;
                padding: 12px;
                border: none;
            }
            .panel .panel-body .table tbody tr td {
                color: #fff;
                font-size: 15px;
                padding: 10px 12px;
                vertical-align: middle;
                border: none;
            }
            .panel .panel-body .table tbody tr:nth-child(even) { 
                background-color: rgba(255,255,255,0.05); 
            }
            .panel .panel-body .table tbody .action-list {
                padding: 0;
                margin: 0;
                list-style: none;
            }
            .panel .panel-body .table tbody .action-list li {
                display: inline-block;
                margin: 0 5px;
            }
            .panel .panel-body .table tbody .action-list li a {
                color: #fff;
                font-size: 15px;
                position: relative;
                z-index: 1;
                transition: all 0.3s ease 0s;
            }
            .panel .panel-body .table tbody .action-list li a:hover { 
                text-shadow: 3px 3px 0 rgba(255,255,255,0.3); 
            }
            .panel .panel-body .table tbody .action-list li a:before,
            .panel .panel-body .table tbody .action-list li a:after {
                content: attr(data-tip);
                color: #fff;
                background-color: #111;
                font-size: 12px;
                padding: 5px 7px;
                border-radius: 4px;
                text-transform: capitalize;
                display: none;
                transform: translateX(-50%);
                position: absolute;
                left: 50%;
                top: -32px;
                transition: all 0.3s ease 0s;
            }
            .panel .panel-body .table tbody .action-list li a:after {
                content: '';
                height: 15px;
                width: 15px;
                padding: 0;
                border-radius: 0;
                transform: translateX(-50%) rotate(45deg);
                top: -18px;
                z-index: -1;
            }
            .panel .panel-body .table tbody .action-list li a:hover:before,
            .panel .panel-body .table tbody .action-list li a:hover:after {
                display: block;
            }
            .panel .panel-footer {
                color: #fff;
                background-color: transparent;
                padding: 15px;
                border: none;
            }
            .panel .panel-footer .col { 
                line-height: 35px; 
            }
            .pagination { margin: 0; }
            .pagination li a {
                color: #fff;
                background-color: transparent;
                border: 2px solid transparent;
                font-size: 18px;
                font-weight: 500;
                text-align: center;
                line-height: 31px;
                width: 35px;
                height: 35px;
                padding: 0;
                margin: 0 3px;
                border-radius: 50px;
                transition: all 0.3s ease 0s;
            }
            .pagination li a:hover {
                color: #fff;
                background-color: transparent;
                border-color: rgba(255,255,255,0.2);
            }
            .pagination li a:focus,
            .pagination li.active a,
            .pagination li.active a:hover {
                color: #fff;
                background-color: transparent;
                border-color: #fff;
            }
            .pagination li:first-child a,
            .pagination li:last-child a {
                border-radius: 50%;
            }
            @media only screen and (max-width:767px) {
                .panel .panel-heading .title {
                    text-align: center;
                    margin: 0 0 10px;
                }
                .panel .panel-heading .btn_group { 
                    text-align: center; 
                }
            }
        </style>

        <div class="container">
            <div class="main-body">
                <!-- Breadcrumb -->
                <nav aria-label="breadcrumb" class="main-breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="/Index">Inicio</a></li>
                        <li class="breadcrumb-item"><a href="javascript:void(0)">Empleado</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Perfil de Empleado</li>
                    </ol>
                </nav>
                <!-- /Breadcrumb -->

                <div class="row gutters-sm">
                    <div class="col-md-4 mb-3">
                        <div class="card">
                            <div class="card-body">
                                <div class="d-flex flex-column align-items-center text-center">
                                    <img src="https://bootdey.com/img/Content/avatar/avatar7.png" alt="Profile Image" class="rounded-circle" width="150">
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
                                <div class="row">
                                    <div class="col-sm-3">
                                        <h6 class="mb-0">Email</h6>
                                    </div>
                                    <div class="col-sm-9 text-secondary">
                                        ${empleado.email}
                                    </div>
                                </div>
                                <hr>
                                <div class="row">
                                    <div class="col-sm-3">
                                        <h6 class="mb-0">Teléfono</h6>
                                    </div>
                                    <div class="col-sm-9 text-secondary">
                                        ${empleado.telefono}
                                    </div>
                                </div>
                                <hr>
                                <div class="row">
                                    <div class="col-sm-3">
                                        <h6 class="mb-0">Cédula</h6>
                                    </div>
                                    <div class="col-sm-9 text-secondary">
                                        ${empleado.cedula}
                                    </div>
                                </div>
                                <hr>
                                <!-- Sección Código Postal -->
                                <div class="row">
                                    <div class="col-sm-3">
                                        <h6 class="mb-0">Código Postal</h6>
                                    </div>
                                    <div class="col-sm-9 text-secondary">
                                        <p class="text-muted font-size-sm">${empleado.codigo_postal || 'Ubicación no disponible'}</p>
                                    </div>
                                </div>
                                <hr>
                                <!-- Botón de editar -->
                                <div class="row">
                                    <div class="col-sm-12 text-center">
                                        <button class="btn btn-edit" onclick="editarUsuario(${empleado.id_usuario})">Editar Mi Información</button>
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
                        <div class="panel-heading">
                            <div class="row">
                                <div class="col col-sm-3 col-xs-12">
                                    <h4 class="title">Lista de Clientes</h4>
                                </div>
                                <div class="col-sm-9 col-xs-12 text-right">
                                    <!-- Controles opcionales -->
                                </div>
                            </div>
                        </div>
                        <div class="panel-body table-responsive">
                           <table class="table" style="width: 100%; margin: 0 auto;">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nombre</th>
                                        <th>Email</th>
                                        <th>Acción</th>
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
                                            <ul class="action-list">
                                                <li>
                                                    <a href="#" data-tip="edit" onclick="editarUsuario(${u.id_usuario})">
                                                        <i class="fa fa-edit"></i>
                                                    </a>
                                                </li>
                                                <li>
                                                    <a href="#" data-tip="delete" onclick="confirmarEliminarUsuario(${u.id_usuario})">
                                                        <i class="fa fa-trash"></i>
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
                        <div class="panel-footer">
                            <div class="row">
                                <div class="col col-sm-6 col-xs-6">showing <b>5</b> out of <b>25</b> entries</div>
                                <div class="col-sm-6 col-xs-6">
                                    <ul class="pagination hidden-xs pull-right">
                                        <li><a href="#"><</a></li>
                                        <li class="active"><a href="#">1</a></li>
                                        <li><a href="#">2</a></li>
                                        <li><a href="#">3</a></li>
                                        <li><a href="#">4</a></li>
                                        <li><a href="#">5</a></li>
                                        <li><a href="#">></a></li>
                                    </ul>
                                    
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    $('#perfilUsuario').html(html);
}


function mostrarPerfilCliente(cliente) {
    var html = `
        <style>
            body {
                margin-top: 20px;
                color: #1a202c;
                text-align: left;
                background-color: #f3e5f5; /* Morado claro */
            }
            .main-body {
                padding: 15px;
            }
            .card {
                box-shadow: 0 1px 3px 0 rgba(0,0,0,.1), 0 1px 2px 0 rgba(0,0,0,.06);
            }
            .card {
                position: relative;
                display: flex;
                flex-direction: column;
                min-width: 0;
                word-wrap: break-word;
                background-color: #fff;
                background-clip: border-box;
                border: 0 solid rgba(0,0,0,.125);
                border-radius: .25rem;
            }
            .card-body {
                flex: 1 1 auto;
                min-height: 1px;
                padding: 1rem;
            }
            .gutters-sm {
                margin-right: -8px;
                margin-left: -8px;
            }
            .gutters-sm > .col, .gutters-sm > [class*=col-] {
                padding-right: 8px;
                padding-left: 8px;
            }
            .mb-3, .my-3 {
                margin-bottom: 1rem!important;
            }
            .bg-gray-300 {
                background-color: #e2e8f0;
            }
            .h-100 {
                height: 100%!important;
            }
            .shadow-none {
                box-shadow: none!important;
            }
           
            .btn-edit {
                background-color: #FFA500;
                color: white;
                border: none;
            }
            .btn-edit:hover {
                background-color: #FF8C00; 
                color: white;
            }
        </style>

        <div class="container">
            <div class="main-body">
                <!-- Breadcrumb -->
                <nav aria-label="breadcrumb" class="main-breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="/Index">Inicio</a></li>
                        <li class="breadcrumb-item"><a href="javascript:void(0)">Usuario</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Usuario Perfil</li>
                    </ol>
                </nav>
                <!-- /Breadcrumb -->
                
                <div class="row gutters-sm">
                    <div class="col-md-4 mb-3">
                        <div class="card">
                            <div class="card-body">
                                <div class="d-flex flex-column align-items-center text-center">
                                    <img src="https://bootdey.com/img/Content/avatar/avatar7.png" alt="Profile Image" class="rounded-circle" width="150">
                                    <div class="mt-3">
                                        <h4>${cliente.nombre}</h4>
                                        <p class="text-secondary mb-1">Cliente</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-8">
                        <div class="card mb-3">
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-sm-3">
                                        <h6 class="mb-0">Email</h6>
                                    </div>
                                    <div class="col-sm-9 text-secondary">
                                        ${cliente.email}
                                    </div>
                                </div>
                                <hr>
                                <div class="row">
                                    <div class="col-sm-3">
                                        <h6 class="mb-0">Teléfono</h6>
                                    </div>
                                    <div class="col-sm-9 text-secondary">
                                        ${cliente.telefono}
                                    </div>
                                </div>
                                <hr>
                                <div class="row">
                                    <div class="col-sm-3">
                                        <h6 class="mb-0">Cédula</h6>
                                    </div>
                                    <div class="col-sm-9 text-secondary">
                                        ${cliente.cedula}
                                    </div>
                                </div>
                                <hr>

                                <div class="row">
                                    <div class="col-sm-3">
                                        <h6 class="mb-0">Código Postal</h6>
                                    </div>
                                    <div class="col-sm-9 text-secondary">
                                        <p class="text-muted font-size-sm">${cliente.codigo_postal || 'Ubicación no disponible'}</p>
                                    </div>
                                </div>
                                <hr>
                                <div class="row">
                                    <div class="col-sm-12 text-center">
                                        <button class="btn btn-edit" onclick="editarUsuario(${cliente.id_usuario})">Editar Mi Información</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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
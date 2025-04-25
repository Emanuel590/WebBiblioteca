
let libros = [];

$(function () {
    cargarLibros();
    agregar();
});

function cargarLibros() {
    const token = localStorage.getItem("AuthToken") || "";

    $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Usuarios/verificar",
        dataType: "json",
        headers: { "Authorization": "Bearer " + token },
        success(usuario) {
            const idUsuario = usuario.id_usuario;
            $.ajax({
                type: "GET",
                url: "https://localhost:7003/api/Reservas",
                dataType: "json",
                headers: { "Authorization": "Bearer " + token },
                success(reservas) {
                    const reservados = reservas
                        .filter(r => r.id_Usuario === idUsuario && r.iD_ESTADO === 1)
                        .map(r => r.id_Libro);

                    $.ajax({
                        type: "GET",
                        url: "https://localhost:7003/api/Libros",
                        dataType: "json",
                        headers: { "Authorization": "Bearer " + token },
                        success(respuesta) {
                            const $select = $("#seleccionarLibro")
                                .empty()
                                .append('<option value="">-- Selecciona un libro --</option>');
                            respuesta
                                .filter(lib => lib.id_Estado === 1 && reservados.includes(lib.id_libro))
                                .forEach(lib => {
                                    libros[lib.id_libro] = lib.titulo;
                                    $select.append(
                                        `<option value="${lib.id_libro}">${lib.titulo}</option>`
                                    );
                                });
                       
                            mostrarReclamos();
                        },
                        error() {
                            Swal.fire({ icon: "error", title: "Error", text: "No se pudieron cargar los libros." });
                        }
                    });
                },
                error() {
                    Swal.fire({ icon: "error", title: "Error", text: "No se pudieron cargar tus reservas." });
                }
            });
        },
        error() {
            Swal.fire({ icon: "error", title: "Error", text: "No se pudo verificar tu sesión." });
        }
    });
}

function mostrarReclamos() {
    const token = localStorage.getItem("AuthToken") || "";
    $.ajax({
        type: "GET",
        url: "https://localhost:7003/api/Usuarios/verificar",
        dataType: "json",
        headers: { "Authorization": "Bearer " + token },
        success(usuario) {
            const idUsuario = usuario.id_usuario;
            $.ajax({
                type: "GET",
                url: "https://localhost:7003/api/Reclamos",
                dataType: "json",
                headers: { "Authorization": "Bearer " + token },
                success(reclamos) {
                    const $lista = $("#listaReclamos").empty();
                    const propios = reclamos.filter(r => r.id_Usuario === idUsuario);
                    if (!propios.length) {
                        $lista.append('<p class="text-muted mt-3">Aún no has enviado ningún reclamo.</p>');
                        return;
                    }
                    propios.forEach(r => {
                        const fecha = r.createdAt
                            ? new Date(r.createdAt).toLocaleDateString("es-ES")
                            : "";
                        const titulo = libros[r.id_Libro] || "Desconocido";
                        $lista.append(`
                            <div class="list-group-item mb-2">
                                <div class="d-flex w-100 justify-content-between">
                                    <h5 class="mb-1">${titulo}</h5>
                                    ${fecha ? `<small class="text-muted">${fecha}</small>` : ""}
                                </div>
                                <p class="mb-1">${r.descripcion}</p>
                            </div>
                        `);
                    });
                },
                error() {
                    Swal.fire({ icon: "error", title: "Error", text: "No se pudieron cargar tus reclamos." });
                }
            });
        },
        error() {
            Swal.fire({ icon: "error", title: "Error", text: "No se pudo verificar tu sesión." });
        }
    });
}

function agregar() {
    $("#formReclamo").on("submit", function (e) {
        e.preventDefault();
        const token = localStorage.getItem("AuthToken") || "";
        const libroSel = parseInt($("#seleccionarLibro").val(), 10);
        const desc = $("#descripcionReclamo").val().trim();
        if (!libroSel || !desc) {
            return Swal.fire({ icon: "warning", title: "Atención", text: "Debes seleccionar un libro y escribir una descripción." });
        }
        $.ajax({
            type: "GET",
            url: "https://localhost:7003/api/Usuarios/verificar",
            dataType: "json",
            headers: { "Authorization": "Bearer " + token },
            success(usuario) {
                const datos = {
                    id_Libro: libroSel,
                    id_Usuario: usuario.id_usuario,
                    descripcion: desc
                };
                $.ajax({
                    type: "POST",
                    url: "https://localhost:7003/api/Reclamos",
                    contentType: "application/json;charset=utf-8",
                    data: JSON.stringify(datos),
                    headers: { "Authorization": "Bearer " + token },
                    success() {
                        $("#seleccionarLibro").val("");
                        $("#descripcionReclamo").val("");
                        mostrarReclamos();
                        Swal.fire({ icon: "success", title: "Enviado", text: "Tu reclamo ha sido enviado." });
                    },
                    error() {
                        Swal.fire({ icon: "error", title: "Error", text: "No se pudo enviar el reclamo." });
                    }
                });
            },
            error() {
                Swal.fire({ icon: "error", title: "Error", text: "No se pudo verificar tu sesión." });
            }
        });
    });
}

const gatos = {
    error: [
        "/static/i/6.png",
        "/static/i/7.png",
        "/static/i/8.png",
        "/static/i/9.png",
        "/static/i/10.png"
    ],
    exito: [
        "/static/i/1.1.png",
        "/static/i/1.2.png",
        "/static/i/1.3.png"
    ]
};

function gatoAleatorio(tipo) {
    const lista = gatos[tipo] || gatos.error;
    const ultimo = sessionStorage.getItem("ultimo-gato");
    const opciones = lista.length > 1 ? lista.filter((ruta) => ruta !== ultimo) : lista;
    const elegido = opciones[Math.floor(Math.random() * opciones.length)];
    sessionStorage.setItem("ultimo-gato", elegido);
    document.getElementById("mensaje-icono").src = elegido;
}

function mostrarMensaje(titulo, texto, tipo = "error") {
    gatoAleatorio(tipo);
    document.getElementById("mensaje-titulo").textContent = titulo;
    document.getElementById("mensaje-texto").textContent = texto;
    document.getElementById("mensaje").style.display = "flex";
}

function cerrarMensaje() {
    document.getElementById("mensaje").style.display = "none";
}

function mostrarError(campo, mensaje) {
    const contenedor = campo.closest(".campo") || campo;
    let aviso = contenedor.nextElementSibling;
    const existe = aviso && aviso.classList.contains("error");

    if (!existe && mensaje === "") {
        return;
    }

    if (!existe) {
        aviso = document.createElement("small");
        aviso.className = "error";
        contenedor.after(aviso);
    }

    aviso.textContent = mensaje;
    contenedor.classList.toggle("invalido", mensaje !== "");
}

function limpiarAlEscribir(formulario) {
    formulario.querySelectorAll("input").forEach((campo) => {
        campo.addEventListener("input", () => mostrarError(campo, ""));
    });
}

function validarFormulario(formulario, reglas) {
    formulario.noValidate = true;
    limpiarAlEscribir(formulario);

    formulario.addEventListener("submit", (evento) => {
        let primerError = null;

        reglas.forEach(([id, comprobar]) => {
            const campo = document.getElementById(id);
            const mensaje = comprobar(campo.value.trim());
            mostrarError(campo, mensaje);
            if (mensaje && !primerError) {
                primerError = campo;
            }
        });

        if (primerError) {
            evento.preventDefault();
            primerError.focus();
        }
    });
}

const formSesion = document.getElementById("sesion");
if (formSesion) {
    validarFormulario(formSesion, [
        ["usuario", (v) => (v === "" ? "Escribe tu usuario." : "")],
        ["contrasena", (v) => (v === "" ? "Escribe tu contraseña." : "")]
    ]);
}

const formRegistro = document.getElementById("form-registro");
if (formRegistro) {
    validarFormulario(formRegistro, [
        ["reg-usuario", (v) => {
            if (v.length < 3) return "Mínimo 3 caracteres.";
            if (!/^\w+$/.test(v)) return "Solo letras, números y guion bajo.";
            return "";
        }],
        ["reg-contrasena", (v) => (v.length < 6 ? "Mínimo 6 caracteres." : "")],
        ["reg-confirmar", (v) => {
            const clave = document.getElementById("reg-contrasena").value.trim();
            if (v !== clave) {
                mostrarMensaje("¡Ups!", "Las contraseñas no coinciden. Inténtalo de nuevo.");
                return "Las contraseñas no coinciden.";
            }
            return "";
        }]
    ]);
}

const mensaje = document.getElementById("mensaje");

if (mensaje) {
    document.getElementById("mensaje-cerrar").addEventListener("click", cerrarMensaje);

    mensaje.addEventListener("click", (evento) => {
        if (evento.target === mensaje) {
            cerrarMensaje();
        }
    });

    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape") {
            cerrarMensaje();
        }
    });

    if (mensaje.dataset.texto) {
        const tipo = mensaje.dataset.tipo === "error" ? "error" : "exito";
        mostrarMensaje(tipo === "error" ? "¡Ups!" : "¡Listo!", mensaje.dataset.texto, tipo);
    }
}
function dibujarGatos(campo, mascara) {
    const total = campo.value.length;

    if (mascara.childElementCount !== total) {
        mascara.replaceChildren(
            ...Array.from({ length: total }, () => {
                const celda = document.createElement("span");
                celda.className = "gato-celda";

                const ponerEmoji = () => {
                    celda.textContent = "🐱";
                };

                if (mascara.dataset.gato) {
                    const img = document.createElement("img");
                    img.src = mascara.dataset.gato;
                    img.alt = "";
                    img.onerror = () => {
                        img.remove();
                        ponerEmoji();
                    };
                    celda.appendChild(img);
                } else {
                    ponerEmoji();
                }

                return celda;
            })
        );
    }

    mascara.scrollLeft = campo.scrollLeft;
}

function activarGatitos(idCampo, idMascara) {
    const campo = document.getElementById(idCampo);
    const mascara = document.getElementById(idMascara);
    if (!campo || !mascara) return;

    const actualizar = () => dibujarGatos(campo, mascara);

    ["input", "keydown", "keyup", "mouseup", "focus", "select"].forEach((evento) =>
        campo.addEventListener(evento, actualizar)
    );

    actualizar();
}

activarGatitos("contrasena", "mascara-gatos");
activarGatitos("reg-contrasena", "gatos-registro");
activarGatitos("reg-confirmar", "gatos-confirmar");
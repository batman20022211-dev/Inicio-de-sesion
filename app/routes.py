import re
from functools import wraps
from flask import render_template, request, redirect, url_for, flash, session
from werkzeug.security import generate_password_hash, check_password_hash
from . import app
from .base_datos import conectar, ErrorIntegridad


def login_requerido(vista):
    @wraps(vista)
    def envoltura(*args, **kwargs):
        if "usuario_id" not in session:
            return redirect(url_for("sesion"))
        return vista(*args, **kwargs)
    return envoltura
@app.route("/", methods=["GET", "POST"])
def sesion():
    if request.method == "POST":
        usuario = request.form.get("usuario", "").strip()
        contrasena = request.form.get("contrasena", "")
        with conectar() as conexion:
            fila = conexion.execute(
                "SELECT * FROM usuarios WHERE usuario = ?", (usuario,)
            ).fetchone()
        if fila and check_password_hash(fila["contrasena"], contrasena):
            session["usuario_id"] = fila["id"]
            session["usuario"] = fila["usuario"]
            return redirect(url_for("principal"))
        flash("Usuario o contraseña incorrectos.", "error")
        return redirect(url_for("sesion"))
    return render_template("sesion.html")
@app.route("/registrar", methods=["GET", "POST"])
def registrar():
    if request.method == "POST":
        usuario = request.form.get("usuario", "").strip()
        contrasena = request.form.get("contrasena", "")
        if len(usuario) < 3 or len(contrasena) < 6:
            flash("Revisa los datos del formulario.", "error")
            return redirect(url_for("registrar"))
        try:
            with conectar() as conexion:
                conexion.execute(
                    "INSERT INTO usuarios (usuario, contrasena) VALUES (?, ?)",
                    (usuario, generate_password_hash(contrasena)),
                )
        except ErrorIntegridad:
            flash("Ese usuario ya existe. Elige otro.", "error")
            return redirect(url_for("registrar"))
        flash("Cuenta creada. Ya puedes iniciar sesión.", "exito")
        return redirect(url_for("sesion"))
    return render_template("registrar.html")

@app.route("/principal")
@login_requerido
def principal():
    return render_template("principal.html")

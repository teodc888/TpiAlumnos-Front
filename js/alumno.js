function verificarUsuario(){
    var alumnoLocal = localStorage.getItem("tokenSesion");

    if(alumnoLocal == null){
        window.location.href = "/index.html";
    }

    var alumnoObjeto = JSON.parse(alumnoLocal);

    if(alumnoObjeto.Rol != "Alumno"){
        window.location.href = "/index.html";
    }


}

verificarUsuario();

async function ObtenerAlumno() {
    var alumnoLocal = localStorage.getItem("tokenSesion");

    if (alumnoLocal != null) {
        var alumnoObjeto = JSON.parse(alumnoLocal);

        fetch("https://localhost:7146/v1/api/Alumno?legajo=" + alumnoObjeto.userName, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Error en la respuesta: " + response.status);
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('nombreUser').innerHTML = data.nombre + ' ' + data.apellido;
        })
        .catch(error => {
            console.error("Error en la solicitud:", error);
        });
    }
}

// ----------------------------------------------------------------

async function CompletarForm() {
    var alumnoLocal = localStorage.getItem("tokenSesion");

    if (alumnoLocal != null) {
        var alumnoObjeto = JSON.parse(alumnoLocal);

        fetch("https://localhost:7146/v1/api/Alumno?legajo=" + alumnoObjeto.userName, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Error en la respuesta: " + response.status);
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('legajo').value = data.legajo;
            document.getElementById('nombre').value = data.nombre;
            document.getElementById('apellido').value = data.apellido;
            
        })
        .catch(error => {
            console.error("Error en la solicitud:", error);
        });
    }
}


async function ObtenerInfoAlumno() {
    var alumnoLocal = localStorage.getItem("tokenSesion");

    if (alumnoLocal != null) {
        var alumnoObjeto = JSON.parse(alumnoLocal);

        fetch("https://localhost:7146/v1/api/Alumno/info?legajo=" + alumnoObjeto.userName, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Error en la respuesta: " + response.status);
            }
            return response.json();
        })
        .then(data => {
            // Seleccionamos el contenedor donde se agregarán las tarjetas
            const contenedorTarjetas = document.getElementById("contenedorTarjetas");
            contenedorTarjetas.innerHTML = ""; // Limpiamos el contenido anterior

            // Recorremos cada objeto de data y generamos una tarjeta
            data.forEach(alumno => {
                const tarjeta = document.createElement("div");
                tarjeta.className = "col-xl-3 col-md-6 mb-4";
                tarjeta.innerHTML = `
                    <div class="card border-left-primary shadow h-100 py-2">
                        <div class="card-body">
                            <div class="row no-gutters align-items-center">
                                <div class="col mr-2">
                                    <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                        ${alumno.carrera}</div>
                                    <div class="h5 mb-0 font-weight-bold text-gray-800">${alumno.materia}</div>
                                    <div class="text-xs mt-1">Tipo: ${alumno.tipoMateria}</div>
                                    <div class="text-xs">Fecha Inscripción Materia: ${alumno.fechaInscripcionMateria}</div>
                                    <div class="text-xs">Fecha Inscripción Cursado: ${alumno.fechaInscripcionCursado}</div>
                                </div>
                                <div class="col-auto">
                                    <i class="fas fa-calendar fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                // Agregamos la tarjeta al contenedor
                contenedorTarjetas.appendChild(tarjeta);
            });
        })
        .catch(error => {
            console.error("Error en la solicitud:", error);
        });
    }
}

async function ObtenerNotasAlumno() {
    var alumnoLocal = localStorage.getItem("tokenSesion");

    if (alumnoLocal != null) {
        var alumnoObjeto = JSON.parse(alumnoLocal);

        fetch("https://localhost:7146/v1/api/Alumno/info/notas?legajo=" + alumnoObjeto.userName, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Error en la respuesta: " + response.status);
            }
            return response.json();
        })
        .then(data => {
            // Seleccionamos el cuerpo de la tabla
            const tbody = document.querySelector("#dataTable tbody");
            tbody.innerHTML = ""; // Limpiamos el contenido previo en la tabla

            // Recorremos el array de datos para agregar filas
            data.forEach(alumno => {
                const fila = document.createElement("tr");
                fila.innerHTML = `
                    <td>${alumno.legajo}</td>
                    <td>${alumno.curso}</td>
                    <td>${alumno.estado}</td>
                    <td>${alumno.materia}</td>
                    <td>${alumno.nota}</td>
                    <td>${alumno.fechaCursado}</td>
                `;
                
                // Añadimos la fila al cuerpo de la tabla
                tbody.appendChild(fila);
            });
        })
        .catch(error => {
            console.error("Error en la solicitud:", error);
        });
    }
}

// ----------------------------------------------------------------

async function CargarSelect() {
    var alumnoLocal = localStorage.getItem("tokenSesion");

    if (alumnoLocal != null) {
        var alumnoObjeto = JSON.parse(alumnoLocal);

        fetch("https://localhost:7146/v1/api/Alumno/info/notas?legajo=" + alumnoObjeto.userName, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Error en la respuesta: " + response.status);
            }
            return response.json();
        })
        .then(data => {
            const selectMateria = document.getElementById('materia');

            // Limpiar el select y agregar la opción inicial
            selectMateria.innerHTML = '<option value="">Seleccione una materia</option>';


            data.forEach(materia => {
                
                const option = document.createElement('option');
                if (materia.estado == 'REGULAR' || materia.estado == 'PROMOCIONAL') {
                    option.value = materia.id; // Usar el ID de la materia como valor
                    option.textContent = materia.materia// Mostrar el nombre de la materia
                    selectMateria.appendChild(option);
                }
                
            });
        })
        .catch(error => {
            console.error("Error en la solicitud:", error);
        });
    }
}



// ----------------------------------------------------------------


ObtenerNotasAlumno()

ObtenerInfoAlumno();

ObtenerAlumno();

CompletarForm();

CargarSelect();
function verificarSession() {
    var pru = localStorage.getItem("tokenSesion");

    if (pru == null) {
        window.location.href = "/index.html";
    }
}

async function ObtenerDocente() {
    var docenteLocal = localStorage.getItem("tokenSesion");

    if (docenteLocal != null) {
        var docenteObjeto = JSON.parse(docenteLocal);

        fetch("https://localhost:7146/v1/api/Docente?legajo=" + docenteObjeto.userName, {
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
                document.getElementById('nombreDocente').innerHTML = "Bienvenido de vuelta, " + data.nombre + ' ' + data.apellido;
            })
            .catch(error => {
                console.error("Error en la solicitud:", error);
            });
    }
}

async function ObtenerInfoDocente() {
    var docenteLocal = localStorage.getItem("tokenSesion");

    if (docenteLocal != null) {
        var docenteObjeto = JSON.parse(docenteLocal);

        fetch("https://localhost:7146/v1/api/Docente/info?legajo=" + docenteObjeto.userName, {
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
                document.getElementById('promedioNotas').innerHTML = data.promedioNotas;
                document.getElementById('alumnosTotales').innerHTML = data.alumnosTotales;
                document.getElementById('materiasActivas').innerHTML = data.materiaInscriptas;
            })
            .catch(error => {
                console.error("Error en la solicitud:", error);
            });
    }
}

async function obtenerMateriasDocente() {
    var docenteLocal = localStorage.getItem("tokenSesion");

    if (docenteLocal != null) {
        var docenteObjeto = JSON.parse(docenteLocal);

        try {
            const response = await fetch("https://localhost:7146/v1/api/Docente/materia?legajo=" + docenteObjeto.userName, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error("Error en la respuesta: " + response.status);
            }

            const data = await response.json();

            // Seleccionamos el cuerpo de la tabla usando el ID
            const tbody = document.querySelector("#materiasTable tbody");
            tbody.innerHTML = ""; // Limpiamos el contenido previo en la tabla

            data.forEach(materia => {
                const fila = document.createElement("tr");

                fila.innerHTML = `
                    <td>${materia.legajo}</td>
                    <td>${materia.materia}</td>
                    <td>${materia.carrera}</td>
                    <td>${materia.anioPlan}</td>
                    <td><a href="modificar_materia.html?id=${materia.legajo}">Modificar</a></td>
                `;

                tbody.appendChild(fila);
            });
        } catch (error) {
            console.error("Error en la solicitud:", error);
        }
    }
}

async function obtenerDocentesTribunales() {
    var docenteLocal = localStorage.getItem("tokenSesion");

    if (docenteLocal != null) {
        var docenteObjeto = JSON.parse(docenteLocal);
        try {
            const response = await fetch("https://localhost:7146/v1/api/Docente/tribunal?legajo=" + docenteObjeto.userName, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error("Error en la respuesta: " + response.status);
            }

            const data = await response.json();

            const tbody = document.querySelector("#docentesTable tbody");
            tbody.innerHTML = ""; 

            data.forEach(docente => {
                const fila = document.createElement("tr");

                fila.innerHTML = `
                    <td>${docente.legajo}</td>
                    <td>${docente.aula}</td>
                    <td>${docente.materia}</td>
                    <td>${docente.fecha}</td>
                `;
    
                tbody.appendChild(fila);
            });
        } catch (error) {
            console.error("Error en la solicitud:", error);
        }
    }
}

function logout() {
    localStorage.removeItem("tokenSesion");
    window.location.href = "/index.html";
}

obtenerDocentesTribunales()
ObtenerDocente();
verificarSession();
ObtenerInfoDocente();
obtenerMateriasDocente();

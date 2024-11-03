function verificarSession() {
    var docenteLocal = localStorage.getItem("tokenSesion");

    if (docenteLocal == null) {
        window.location.href = "/index.html";
    }

    var docenteObjeto = JSON.parse(docenteLocal);

    if (docenteObjeto.rol != "Docente") {
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
                document.getElementById('alumnoRiesgo').innerHTML = data.alumnosEnRiesgo;

                // Contar la cantidad de estados
                const estadoAlumnos = data.estadoAlumnos;
                let regulares = 0;
                let libres = 0;
                let promocionados = 0;

                // Procesar el estado de los alumnos
                estadoAlumnos.forEach(estado => {
                    switch (estado.estadoMateria) {
                        case "REGULAR":
                            regulares += estado.cantidad;
                            break;
                        case "LIBRE":
                            libres += estado.cantidad;
                            break;
                        case "PROMOCIONAL":
                            promocionados += estado.cantidad;
                            break;
                    }
                });

                const statusCtx = document.getElementById('statusChart').getContext('2d');
                new Chart(statusCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Regulares', 'Libres', 'Promocionados'],
                        datasets: [{
                            data: [regulares, libres, promocionados],
                            backgroundColor: [
                                '#1cc88a',
                                '#e74a3b',
                                '#f6c23e'
                            ]
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false
                    }
                });

                // Procesar datos de edad para el gráfico de barras
                const getDocenteDistriEdad = data.getDocenteDistriEdad;
                const edades = ['18-20', '21-23', '24-26', '27+'];
                const cantidadAlumnosEdad = [0, 0, 0, 0];

                getDocenteDistriEdad.forEach(edadInfo => {
                    if (edadInfo.edad >= 18 && edadInfo.edad <= 20) {
                        cantidadAlumnosEdad[0] += edadInfo.cantidadAlumnos;
                    } else if (edadInfo.edad >= 21 && edadInfo.edad <= 23) {
                        cantidadAlumnosEdad[1] += edadInfo.cantidadAlumnos;
                    } else if (edadInfo.edad >= 24 && edadInfo.edad <= 26) {
                        cantidadAlumnosEdad[2] += edadInfo.cantidadAlumnos;
                    } else if (edadInfo.edad >= 27) {
                        cantidadAlumnosEdad[3] += edadInfo.cantidadAlumnos;
                    }
                });

                const ageCtx = document.getElementById('ageChart').getContext('2d');
                new Chart(ageCtx, {
                    type: 'bar',
                    data: {
                        labels: edades,
                        datasets: [{
                            label: 'Cantidad de Alumnos',
                            data: cantidadAlumnosEdad,
                            backgroundColor: '#4e73df'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });

                // Agregar materias con alto y bajo desempeño en la interfaz
                const mejoresMaterias = data.docenteMateriasPromedio.mejoresMaterias;
                const peoresMaterias = data.docenteMateriasPromedio.peoresMaterias;

                // Limpiar etiquetas previas
                const highPerformanceContainer = document.querySelector(".performance-card .tag-container.success");
                const lowPerformanceContainer = document.querySelector(".performance-card .tag-container.danger");
                highPerformanceContainer.innerHTML = '';
                lowPerformanceContainer.innerHTML = '';

                // Agregar materias con alto desempeño
                mejoresMaterias.forEach(materia => {
                    const tag = document.createElement("span");
                    tag.classList.add("tag", "success");
                    tag.textContent = materia.materia;
                    highPerformanceContainer.appendChild(tag);
                });

                // Agregar materias con bajo desempeño
                peoresMaterias.forEach(materia => {
                    const tag = document.createElement("span");
                    tag.classList.add("tag", "danger");
                    tag.textContent = materia.materia;
                    lowPerformanceContainer.appendChild(tag);
                });
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

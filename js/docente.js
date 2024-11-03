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

async function ObtenerAdministracionDocente() {
    const docenteLocal = localStorage.getItem("tokenSesion");

    if (docenteLocal != null) {
        const docenteObjeto = JSON.parse(docenteLocal);

        try {
            const response = await fetch(`https://localhost:7146/v1/api/Docente/materia?legajo=${docenteObjeto.userName}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error("Error en la respuesta: " + response.status);
            }

            const data = await response.json();
            const materiasContainer = document.getElementById("materias-container");
            materiasContainer.innerHTML = ""; // Limpiar contenedor de materias

            data.forEach(materia => {
                const tableHTML = `
                    <div class="card shadow mb-4">
                        <div class="card-header py-3">
                            <h6 class="m-0 font-weight-bold text-primary">${materia.materia} (${materia.carrera}) - Año ${materia.anioPlan}</h6>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-bordered" width="100%" cellspacing="0">
                                    <thead>
                                        <tr>
                                            <th>Legajo</th>
                                            <th>Nombre</th>
                                            <th>Apellido</th>
                                            <th>Nota</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${materia.listAlumno.map(alumno => `
                                            <tr>
                                                <td>${alumno.legajo}</td>
                                                <td>${alumno.nombre}</td>
                                                <td>${alumno.apellido}</td>
                                                <td>${alumno.listNota.length > 0 ? alumno.listNota[0].nota : "N/A"}</td>
                                                <td>
                                                    <button class="btn btn-info btn-sm" onclick="mostrarInfo(${alumno.legajo}, '${materia.materia}')">
                                                        <i class="fas fa-info-circle"></i>
                                                    </button>
                                                    <button class="btn btn-primary btn-sm" onclick="editarNota(${alumno.legajo}, '${materia.materia}', '${alumno.listNota.length > 0 ? alumno.listNota[0].nota : "N/A"}')">
                                                        <i class="fas fa-edit"></i>
                                                    </button>
                                                    <button class="btn btn-danger btn-sm" onclick="eliminarAlumno(${alumno.legajo}, '${materia.materia}')">
                                                        <i class="fas fa-trash-alt"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        `).join("")}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                `;

                materiasContainer.innerHTML += tableHTML;
            });

        } catch (error) {
            console.error("Error en la solicitud:", error);
        }
    }
}

function editarNota(legajoAlumno, materia, notaActual) {
    const modalContent = `
        <div class="modal fade" id="editarNotaModal" tabindex="-1" role="dialog" aria-labelledby="editarNotaModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="editarNotaModalLabel">Editar Nota para ${materia}</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p>Legajo: ${legajoAlumno}</p>
                        <label for="nuevaNota">Nota Actual: ${notaActual}</label>
                        <input type="number" id="nuevaNotaInput" class="form-control" value="${notaActual}" min="1" max="10">
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" onclick="confirmarEdicionNota(${legajoAlumno}, '${materia}')">Confirmar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalContent);
    
    $('#editarNotaModal').modal('show');
}

function confirmarEdicionNota(legajoAlumno, materia) {
    const nuevaNota = document.getElementById("nuevaNotaInput").value;

    alert(`Nota actualizada para el alumno con legajo ${legajoAlumno} en ${materia} a: ${nuevaNota}`);
    
    $('#editarNotaModal').modal('hide');
    document.getElementById('editarNotaModal').remove();
}


function eliminarAlumno(legajoAlumno, materia) {
    // Crear el contenido del modal de confirmación
    const modalContent = `
        <div class="modal fade" id="eliminarAlumnoModal" tabindex="-1" role="dialog" aria-labelledby="eliminarAlumnoModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="eliminarAlumnoModalLabel">Confirmar Eliminación</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p>¿Estás seguro de que deseas eliminar al alumno con legajo <strong>${legajoAlumno}</strong> de la materia <strong>${materia}</strong>?</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-danger" onclick="confirmarEliminacion(${legajoAlumno}, '${materia}')">Eliminar</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Insertar el contenido del modal en el cuerpo del HTML
    document.body.insertAdjacentHTML('beforeend', modalContent);
    
    // Mostrar el modal
    $('#eliminarAlumnoModal').modal('show');
}

function confirmarEliminacion(legajoAlumno, materia) {
    // Aquí podrías agregar la lógica para eliminar al alumno cuando esté disponible la API
    alert(`Alumno con legajo ${legajoAlumno} eliminado de la materia ${materia}`);
    
    // Cerrar el modal y eliminarlo del DOM
    $('#eliminarAlumnoModal').modal('hide');
    document.getElementById('eliminarAlumnoModal').remove();
}


async function mostrarInfo(legajoAlumno) {
    try {
        const response = await fetch(`https://localhost:7146/v1/api/Alumno?legajo=${legajoAlumno}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Error al obtener la información del alumno: " + response.status);
        }

        const alumnoData = await response.json();

        // Llenar el modal con los datos del alumno
        document.getElementById('infoLegajo').textContent = alumnoData.legajo;
        document.getElementById('infoNombre').textContent = alumnoData.nombre;
        document.getElementById('infoApellido').textContent = alumnoData.apellido;
        document.getElementById('infoTipoDocumento').textContent = alumnoData.tipoDocumento;
        document.getElementById('infoNumeroDocumento').textContent = alumnoData.numeroDocumento;
        document.getElementById('infoDireccion').textContent = alumnoData.direccion;
        document.getElementById('infoLocalidad').textContent = alumnoData.localidad;
        document.getElementById('infoEstadoCivil').textContent = alumnoData.estadoCivil;
        document.getElementById('infoEstadoHabitacional').textContent = alumnoData.estadoHabitacional;
        document.getElementById('infoSituacionLaboral').textContent = alumnoData.situacionLaboral;
        document.getElementById('infoFechaNacimiento').textContent = alumnoData.fechaNacimiento;
        document.getElementById('infoGenero').textContent = alumnoData.genero;

        // Mostrar el modal
        $('#infoAlumnoModal').modal('show');
    } catch (error) {
        console.error("Error en la solicitud:", error);
        alert("Hubo un problema al obtener la información del alumno.");
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
ObtenerAdministracionDocente();

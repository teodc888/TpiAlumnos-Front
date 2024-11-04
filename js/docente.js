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
                                                    ${alumno.listNota.length > 0 && alumno.listNota[0].nota !== "N/A" ? `
                                                        <button class="btn btn-primary btn-sm" onclick="editarNota(${alumno.legajo}, '${materia.materia}', '${alumno.listNota[0].nota}')">
                                                            <i class="fas fa-edit"></i>
                                                        </button>
                                                    ` : ''}
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
    const existingModal = document.getElementById('editarNotaModal');
    if (existingModal) {
        existingModal.remove();
    }
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
                        <input type="number" id="nuevaNotaInput" class="form-control" value="${notaActual}" min="1" max="10" required>
                        <div id="notaError" class="text-danger" style="display: none;">Por favor, ingrese una nota entre 1 y 10.</div>
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


async function confirmarEdicionNota(legajoAlumno, materia) {
    const nuevaNota = document.getElementById("nuevaNotaInput").value;
    const notaError = document.getElementById("notaError");

    // Validar que la nota esté entre 1 y 10
    if (nuevaNota < 1 || nuevaNota > 10) {
        notaError.style.display = "block"; // Mostrar mensaje de error
        return; // Salir de la función si la nota es inválida
    } else {
        notaError.style.display = "none"; // Ocultar mensaje de error
    }

    try {
        const response = await fetch(`https://localhost:7146/v1/api/Docente/materia/editar?Legajo=${legajoAlumno}&Nota=${nuevaNota}&Materia=${encodeURIComponent(materia)}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Error al actualizar la nota: " + response.status);
        }

        window.location.reload();
    } catch (error) {
        console.error("Error en la solicitud:", error);
        alert("Ocurrió un error al actualizar la nota. Intente nuevamente.");
    }

    $('#editarNotaModal').modal('hide');
    document.getElementById('editarNotaModal').remove();
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

async function cargarPerfilAlumno() {
    var alumnoLocal = localStorage.getItem("tokenSesion");
    var alumnoObjeto = JSON.parse(alumnoLocal);
    try {
        const response = await fetch('https://localhost:7146/v1/api/Docente?legajo=' + alumnoObjeto.userName);
        console.log(response)
        if (!response.ok) {

            throw new Error("Error al obtener los datos del alumno");
        }
        const data = await response.json();
        console.log(data)
        mostrarPerfil(data);
    } catch (error) {
        console.error("Error:", error);
    }
}

function mostrarPerfil(alumno) {
    const cardPerfil = document.getElementById("cardPerfil");
    cardPerfil.innerHTML = `
        <div class="card shadow-lg p-3 mb-5 bg-white rounded" style="width: 24rem;">
            <div class="card-body">
                <h4 class="card-title text-center text-primary">${alumno.nombre} ${alumno.apellido}</h4>
                <h6 class="card-subtitle mb-2 text-muted text-center">Legajo: ${alumno.legajo}</h6>
                <hr>
                <p><strong>Documento:</strong> ${alumno.tipoDocumento} ${alumno.numeroDocumento}</p>
                <p><strong>Fecha de Nacimiento:</strong> ${new Date(alumno.fechaNacimiento).toLocaleDateString()}</p>
                <p><strong>Dirección:</strong> ${alumno.direccion}</p>
                <p><strong>Localidad:</strong> ${alumno.localidad}</p>
                <p><strong>Estado Civil:</strong> ${alumno.estadoCivil}</p>
                <p><strong>Estado Habitacional:</strong> ${alumno.estadoHabitacional}</p>
                <p><strong>Situación Laboral:</strong> ${alumno.situacionLaboral}</p>
                <p><strong>Género:</strong> ${alumno.genero}</p>
                <p><strong>Título Universitario:</strong> ${alumno.tituloUniversitario}</p>
            </div>
        </div>
    `;
}

async function cargarDatos() {
    try {
        const response = await fetch('https://localhost:7146/v1/api/Docente/info/materiasAndAlumnos');
        const data = await response.json();

        const alumnoSelect = document.getElementById('alumnoId');
        data.alumnos.forEach(alumno => {
            const option = document.createElement('option');
            option.value = alumno.nombre; 
            option.textContent = alumno.nombre; 
            alumnoSelect.appendChild(option);
        });

        const materiaSelect = document.getElementById('materiaId');
        data.materias.forEach(materia => {
            const option = document.createElement('option');
            option.value = materia.nombre; 
            option.textContent = materia.nombre; 
            materiaSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar datos:', error);
    }
}

async function inscribirAlumno() {
    const docenteLocal = localStorage.getItem("tokenSesion");
    const docenteObjeto = JSON.parse(docenteLocal);

    const legajoAlumno = document.getElementById('alumnoId').value; 
    const legajoDocente = docenteObjeto.userName; 
    const nombreMateria = document.getElementById('materiaId').value; 

    // Construir la URL con los parámetros
    const apiUrl = `https://localhost:7146/v1/api/Docente/alumno/materia?LegajoAlumno=${legajoAlumno}&LegajoDocente=${legajoDocente}&NombreMateria=${nombreMateria}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
            },
        });

        
    } catch (error) {
        console.error('Error al hacer la solicitud:', error);
    }
}

function logout() {
    localStorage.removeItem("tokenSesion");
    window.location.href = "/index.html";
}

cargarDatos()
cargarPerfilAlumno()
obtenerDocentesTribunales()
ObtenerDocente();
verificarSession();
ObtenerInfoDocente();
obtenerMateriasDocente();
ObtenerAdministracionDocente();

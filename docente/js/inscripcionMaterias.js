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

function logout() {
    localStorage.removeItem("tokenSesion");
    window.location.href = "/index.html";
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
    console.log('entro')
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

cargarDatos();
verificarSession();
ObtenerDocente();
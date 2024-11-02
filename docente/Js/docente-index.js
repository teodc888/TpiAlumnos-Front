const gradesCtx = document.getElementById('gradesChart').getContext('2d');
        new Chart(gradesCtx, {
            type: 'line',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                datasets: [{
                    label: 'Promedio de Calificaciones',
                    data: [7.2, 7.5, 7.8, 7.4, 7.9, 8.1],
                    borderColor: '#4e73df',
                    tension: 0.3,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10
                    }
                }
            }
        });

        // Status Chart
        const statusCtx = document.getElementById('statusChart').getContext('2d');
        new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: ['Regulares', 'Libres', 'No Rendidos'],
                datasets: [{
                    data: [120, 30, 15],
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

        // Age Chart
        const ageCtx = document.getElementById('ageChart').getContext('2d');
        new Chart(ageCtx, {
            type: 'bar',
            data: {
                labels: ['18-20', '21-23', '24-26', '27+'],
                datasets: [{
                    label: 'Cantidad de Alumnos',
                    data: [45, 60, 35, 25],
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
  
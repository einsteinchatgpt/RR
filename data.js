const DSEI_DATA = {
    polos: ['Sena Madureira', 'Manoel Urbano'],
    meses: ['Jan/25', 'Fev/25', 'Mar/25', 'Abr/25', 'Mai/25', 'Jun/25', 'Jul/25', 'Ago/25', 'Set/25', 'Out/25', 'Nov/25', 'Dez/25', 'Jan/26', 'Fev/26', 'Mar/26'],
    indicadores: {
        'Sena Madureira': {
            baixoPeso: {
                mensal: [0, 0, 0, 0, 0, 0, 0, 33.33, 0, 0, 0, 0, 25, 0, 0],
                acumulado: [0, 0, 0, 0, 0, 0, 0, 6.67, 5, 5, 4.55, 4.17, 7.14, 7.14, 6.67],
                numerador: [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
                denominador: [2, 0, 2, 4, 2, 0, 2, 3, 5, 0, 2, 2, 4, 0, 2]
            },
            consultas: {
                mensal: [100, 100, 100, 100, 0, 100, 50, 40, 100, 100, 100, 50, 100, 0, 0],
                acumulado: [100, 100, 100, 100, 90, 91.67, 85.71, 73.68, 78.26, 79.17, 80.77, 78.57, 78.57, 77.78, 73.08],
                numerador: [2, 1, 2, 4, 0, 2, 1, 2, 4, 1, 2, 1, 2, 0, 0],
                denominador: [2, 1, 2, 4, 1, 2, 2, 5, 4, 1, 2, 2, 2, 0, 1]
            },
            mortalidade: {
                mensal: [null, null, null, null, null, null, 500, null, 250, null, null, null, null, null, null],
                acumulado: [null, null, null, null, null, null, 58.82, 41.67, 71.43, 68.97, 64.52, 64.52, 64.52, 66.67, 68.97],
                obitos: [0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0],
                nascidos: [2, 1, 3, 5, 2, 2, 2, 7, 4, 1, 2, 0, 2, 0, 2]
            }
        },
        'Manoel Urbano': {
            baixoPeso: {
                mensal: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                acumulado: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                numerador: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                denominador: [2, 2, 5, 2, 2, 5, 7, 1, 2, 1, 2, 5, 3, 2, 3]
            },
            consultas: {
                mensal: [0, 0, 20, 0, 0, 14.29, 0, 0, 50, 0, 100, 0, 0, 50, 0],
                acumulado: [0, 0, 7.69, 6.67, 6.25, 8.70, 6.90, 6.45, 9.09, 8.57, 11.11, 11.11, 10.53, 16.67, 14.71],
                numerador: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 2, 0],
                denominador: [2, 6, 5, 2, 1, 7, 6, 2, 2, 2, 1, 0, 4, 4, 3]
            },
            mortalidade: {
                mensal: [500, null, null, null, 1000, null, null, null, null, 500, null, null, null, null, null],
                acumulado: [500, 125, 83.33, 66.67, 125, 86.96, 66.67, 62.50, 58.82, 83.33, 81.08, 71.43, 50.00, 57.14, 60.61],
                obitos: [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
                nascidos: [2, 6, 4, 3, 1, 7, 7, 2, 2, 2, 1, 5, 0, 1, 2]
            }
        }
    }
};

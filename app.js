const { useState, useEffect, useRef } = React;

if (typeof ChartDataLabels !== 'undefined') {
    Chart.register(ChartDataLabels);
    Chart.defaults.set('plugins.datalabels', { display: false });
}

// Utility functions
// Regressão Linear Simples para calcular tendência e projeções
// Metodologia: Usa o método dos mínimos quadrados para encontrar a reta que melhor se ajusta aos dados
// y = slope * x + intercept, onde x é o índice do mês (0, 1, 2, ...) e y é o valor do indicador
const calculateTrend = (data) => {
    // Filtra valores nulos/undefined, mas mantém zeros
    const validData = data.map(v => (v === null || v === undefined || isNaN(v)) ? 0 : v);
    if (validData.length < 3) return { slope: 0, predicted: validData[validData.length - 1] || 0, nextPredicted: validData[validData.length - 1] || 0 };
    
    const n = validData.length;
    // Soma dos índices: 0 + 1 + 2 + ... + (n-1) = n*(n-1)/2
    const xSum = (n * (n - 1)) / 2;
    // Soma dos valores y
    const ySum = validData.reduce((a, b) => a + b, 0);
    // Soma de x*y para cada ponto
    const xySum = validData.reduce((sum, y, i) => sum + i * y, 0);
    // Soma de x² para cada ponto
    const x2Sum = validData.reduce((sum, _, i) => sum + i * i, 0);
    
    // Fórmula da regressão linear: slope = (n*Σxy - Σx*Σy) / (n*Σx² - (Σx)²)
    const slope = (n * xySum - xSum * ySum) / (n * x2Sum - xSum * xSum);
    // Intercepto: intercept = (Σy - slope*Σx) / n
    const intercept = (ySum - slope * xSum) / n;
    
    // Valor esperado no último mês (índice n-1)
    const predicted = slope * (n - 1) + intercept;
    // Projeção para o próximo mês (índice n)
    const nextPredicted = slope * n + intercept;
    
    return { slope, predicted: Math.max(0, predicted), nextPredicted: Math.max(0, nextPredicted) };
};

// Formata valor como percentual (para baixo peso e consultas)
const formatPercent = (value) => {
    if (value === null || value === undefined || isNaN(value)) return '-';
    return `${value.toFixed(2)}%`;
};

// Formata valor como taxa (para mortalidade - já é taxa por 1000 NV)
const formatRate = (value) => {
    if (value === null || value === undefined || isNaN(value)) return '0,00';
    return value.toFixed(2).replace('.', ',');
};

// Formata valor baseado no tipo de indicador
const formatValue = (value, indicator) => {
    if (indicator === 'mortalidade') {
        return formatRate(value);
    }
    return formatPercent(value);
};

// Prepara dados para o gráfico, convertendo nulls em 0 para mortalidade
const prepareChartData = (data, indicator) => {
    if (indicator === 'mortalidade') {
        return data.map(v => (v === null || v === undefined || isNaN(v)) ? 0 : v);
    }
    return data;
};

// Determina se a tendência é boa ou ruim baseado no indicador
// Para consultas: maior = melhor (verde para alta)
// Para baixo peso e mortalidade: menor = melhor (verde para baixa)
const getTrendInterpretation = (slope, indicator) => {
    if (indicator === 'consultas') {
        // Para consultas, tendência de alta é BOM
        return {
            isGood: slope > 0,
            isBad: slope < 0,
            color: slope > 0 ? '#2E7D32' : slope < 0 ? '#C62828' : '#F9A825',
            bgColor: slope > 0 ? 'rgba(46, 125, 50, 0.1)' : slope < 0 ? 'rgba(198, 40, 40, 0.1)' : 'rgba(249, 168, 37, 0.1)',
            icon: slope > 0 ? 'up' : slope < 0 ? 'down' : 'right',
            label: slope > 0 ? 'Tendência Positiva ↑' : slope < 0 ? 'Tendência Negativa ↓' : 'Tendência Estável →'
        };
    } else {
        // Para baixo peso e mortalidade, tendência de baixa é BOM
        return {
            isGood: slope < 0,
            isBad: slope > 0,
            color: slope < 0 ? '#2E7D32' : slope > 0 ? '#C62828' : '#F9A825',
            bgColor: slope < 0 ? 'rgba(46, 125, 50, 0.1)' : slope > 0 ? 'rgba(198, 40, 40, 0.1)' : 'rgba(249, 168, 37, 0.1)',
            icon: slope < 0 ? 'down' : slope > 0 ? 'up' : 'right',
            label: slope < 0 ? 'Tendência Positiva ↓' : slope > 0 ? 'Tendência Negativa ↑' : 'Tendência Estável →'
        };
    }
};

// Indigenous decorative elements
const TribalPattern = () => (
    <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
        <pattern id="tribal" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M10 0L20 10L10 20L0 10Z" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            <circle cx="10" cy="10" r="3" fill="none" stroke="currentColor" strokeWidth="0.5"/>
        </pattern>
        <rect width="100%" height="100%" fill="url(#tribal)"/>
    </svg>
);

// Landing Page Component
const LandingPage = ({ onEnter }) => {
    return (
        <div className="landing-hero flex flex-col items-center justify-center text-white text-center px-4">
            <div className="tribal-decoration" style={{ top: '10%', left: '5%' }}></div>
            <div className="tribal-decoration" style={{ bottom: '10%', right: '5%', width: '150px', height: '150px' }}></div>
            <div className="tribal-decoration" style={{ top: '50%', right: '15%', width: '100px', height: '100px' }}></div>
            
            <div className="relative z-10 max-w-4xl animate-fadeInUp">
                <div className="mb-8">
                    <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-white/10 backdrop-blur flex items-center justify-center border-4 border-white/30">
                        <i className="fas fa-heartbeat text-5xl text-white"></i>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                        DSEI
                    </h1>
                    <p className="text-2xl md:text-3xl font-light opacity-90 mb-2">
                        Distrito Sanitário Especial Indígena
                    </p>
                    <div className="w-40 h-1 mx-auto bg-gradient-to-r from-transparent via-white to-transparent my-6"></div>
                    <p className="text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
                        Painel de Indicadores de Saúde dos Povos Indígenas
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
                        <i className="fas fa-baby text-4xl mb-4 text-yellow-300"></i>
                        <h3 className="text-xl font-bold mb-2">Baixo Peso ao Nascer</h3>
                        <p className="text-sm opacity-80">Monitoramento do peso dos recém-nascidos</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
                        <i className="fas fa-stethoscope text-4xl mb-4 text-green-300"></i>
                        <h3 className="text-xl font-bold mb-2">Consultas Pré-Natal</h3>
                        <p className="text-sm opacity-80">Acompanhamento de 6+ consultas</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
                        <i className="fas fa-child text-4xl mb-4 text-red-300"></i>
                        <h3 className="text-xl font-bold mb-2">Mortalidade Infantil</h3>
                        <p className="text-sm opacity-80">Taxa por 1.000 nascidos vivos</p>
                    </div>
                </div>

                <button onClick={onEnter} className="btn-primary-indigenous animate-pulse-slow">
                    <i className="fas fa-chart-line mr-3"></i>
                    Acessar Dashboard
                </button>

                <div className="mt-16 flex items-center justify-center gap-8 opacity-60">
                    <div className="text-center">
                        <div className="text-3xl font-bold">2</div>
                        <div className="text-sm">Polos de Saúde</div>
                    </div>
                    <div className="w-px h-12 bg-white/30"></div>
                    <div className="text-center">
                        <div className="text-3xl font-bold">3</div>
                        <div className="text-sm">Indicadores</div>
                    </div>
                    <div className="w-px h-12 bg-white/30"></div>
                    <div className="text-center">
                        <div className="text-3xl font-bold">12</div>
                        <div className="text-sm">Meses de Dados</div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0">
                <div className="geo-border"></div>
            </div>
        </div>
    );
};

// Sidebar Component
const Sidebar = ({ activeIndicator, setActiveIndicator }) => {
    const indicators = [
        { id: 'baixoPeso', name: 'Baixo Peso ao Nascer', icon: 'fa-baby', color: '#F9A825' },
        { id: 'consultas', name: '6+ Consultas Pré-Natal', icon: 'fa-stethoscope', color: '#4CAF50' },
        { id: 'mortalidade', name: 'Mortalidade Infantil', icon: 'fa-child', color: '#C62828' }
    ];

    return (
        <div className="sidebar">
            <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-3">
                    <i className="fas fa-heartbeat text-2xl text-white"></i>
                </div>
                <h2 className="text-white font-bold text-lg">DSEI</h2>
                <p className="text-white/60 text-xs">Saúde Indígena</p>
            </div>

            <nav className="space-y-2">
                {indicators.map(ind => (
                    <button
                        key={ind.id}
                        onClick={() => setActiveIndicator(ind.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                            activeIndicator === ind.id 
                                ? 'bg-white/20 text-white' 
                                : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                        <i className={`fas ${ind.icon}`} style={{ color: ind.color }}></i>
                        <span className="text-sm font-medium">{ind.name}</span>
                    </button>
                ))}
            </nav>

            <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white/10 rounded-xl p-4 text-center">
                    <i className="fas fa-leaf text-green-400 text-2xl mb-2"></i>
                    <p className="text-white/80 text-xs">Cuidando da saúde dos povos originários</p>
                </div>
            </div>
        </div>
    );
};

// KPI Card Component
const KPICard = ({ title, value, subtitle, icon, color, trend }) => {
    const colorClasses = {
        verde: 'verde',
        vermelho: 'vermelho',
        amarelo: 'amarelo',
        ocre: ''
    };

    return (
        <div className={`kpi-card ${colorClasses[color] || ''}`}>
            <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" 
                         style={{ background: `linear-gradient(135deg, ${color === 'verde' ? '#2E7D32' : color === 'vermelho' ? '#C62828' : color === 'amarelo' ? '#F9A825' : '#D4A574'}, ${color === 'verde' ? '#4CAF50' : color === 'vermelho' ? '#EF5350' : color === 'amarelo' ? '#FFC107' : '#E8C9A0'})` }}>
                        <i className={`fas ${icon} text-white text-xl`}></i>
                    </div>
                    {trend && (
                        <span className={`trend-badge ${trend > 0 ? 'trend-up' : trend < 0 ? 'trend-down' : 'trend-stable'}`}>
                            <i className={`fas fa-arrow-${trend > 0 ? 'up' : trend < 0 ? 'down' : 'right'}`}></i>
                            {Math.abs(trend).toFixed(1)}%
                        </span>
                    )}
                </div>
                <h3 className="text-sm text-gray-500 font-medium mb-1">{title}</h3>
                <p className="text-3xl font-bold" style={{ color: color === 'verde' ? '#2E7D32' : color === 'vermelho' ? '#C62828' : color === 'amarelo' ? '#F9A825' : '#5D4037' }}>
                    {value}
                </p>
                {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
            </div>
        </div>
    );
};

// Chart Component - Agora com visualização única (mensal OU acumulado)
const TimeSeriesChart = ({ data, title, labels, viewMode, polo1Data, polo2Data, compareMode, indicator }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const isMortalidade = indicator === 'mortalidade';

    useEffect(() => {
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        
        const datasets = [];
        const dataKey = viewMode === 'acumulado' ? 'acumulado' : 'mensal';
        const labelSuffix = viewMode === 'acumulado' ? 'Acumulado' : 'Mensal';
        
        if (compareMode && polo1Data && polo2Data) {
            datasets.push({
                label: `Sena Madureira - ${labelSuffix}`,
                data: prepareChartData(polo1Data[dataKey], indicator),
                borderColor: '#5D4037',
                backgroundColor: 'rgba(93, 64, 55, 0.15)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#5D4037',
                pointRadius: 5,
                pointHoverRadius: 7
            });
            datasets.push({
                label: `Manoel Urbano - ${labelSuffix}`,
                data: prepareChartData(polo2Data[dataKey], indicator),
                borderColor: '#D4A574',
                backgroundColor: 'rgba(212, 165, 116, 0.15)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                borderDash: [5, 5],
                pointBackgroundColor: '#D4A574',
                pointRadius: 5,
                pointHoverRadius: 7
            });
        } else {
            datasets.push({
                label: labelSuffix,
                data: prepareChartData(data[dataKey], indicator),
                borderColor: viewMode === 'acumulado' ? '#2E7D32' : '#5D4037',
                backgroundColor: viewMode === 'acumulado' ? 'rgba(46, 125, 50, 0.2)' : 'rgba(93, 64, 55, 0.15)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: viewMode === 'acumulado' ? '#2E7D32' : '#5D4037',
                pointRadius: 6,
                pointHoverRadius: 8
            });
        }

        chartInstance.current = new Chart(ctx, {
            type: 'line',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { 
                            usePointStyle: true, 
                            padding: 20,
                            font: { family: 'Nunito', weight: '600', size: 14 }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(93, 64, 55, 0.95)',
                        titleFont: { family: 'Nunito', weight: '700', size: 14 },
                        bodyFont: { family: 'Nunito', size: 13 },
                        padding: 16,
                        cornerRadius: 10,
                        callbacks: {
                            label: function(context) {
                                let value = context.parsed.y;
                                if (isMortalidade) {
                                    return `${context.dataset.label}: ${value.toFixed(2).replace('.', ',')} por 1.000 NV`;
                                }
                                return `${context.dataset.label}: ${value.toFixed(2)}%`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(93, 64, 55, 0.1)' },
                        ticks: { 
                            font: { family: 'Nunito', size: 12 },
                            callback: (value) => isMortalidade ? value.toFixed(0) : value + '%'
                        },
                        title: {
                            display: true,
                            text: isMortalidade ? 'Taxa por 1.000 NV' : 'Percentual (%)',
                            font: { family: 'Nunito', weight: '600', size: 12 }
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { family: 'Nunito', size: 12 } }
                    }
                }
            }
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [data, labels, viewMode, polo1Data, polo2Data, compareMode, indicator]);

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="font-bold text-lg">{title}</h3>
            </div>
            <div style={{ height: '450px', padding: '1.5rem' }}>
                <canvas ref={chartRef}></canvas>
            </div>
        </div>
    );
};

// Trend Analysis Component - Com interpretação correta por indicador e explicação da metodologia
const TrendAnalysis = ({ data, indicatorName, polo, indicator, startMonth, endMonth }) => {
    const trend = calculateTrend(data.acumulado);
    const lastValue = data.acumulado[data.acumulado.length - 1] || 0;
    const firstValue = data.acumulado[0] || 0;
    const interpretation = getTrendInterpretation(trend.slope, indicator);
    const isMortalidade = indicator === 'mortalidade';
    const unit = isMortalidade ? '' : '%';
    
    // Calcular próximo mês após o período selecionado
    const mesesOrdem = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const endMonthIdx = mesesOrdem.indexOf(endMonth);
    const nextMonth = mesesOrdem[(endMonthIdx + 1) % 12] || 'Próximo';
    
    const [showMethodology, setShowMethodology] = useState(false);
    
    return (
        <div className="card">
            <div className="card-header">
                <h3 className="font-bold flex items-center gap-2">
                    <i className="fas fa-chart-line"></i>
                    Análise de Tendência e Projeção - {polo}
                    <span className="text-sm font-normal opacity-70">({startMonth} a {endMonth})</span>
                </h3>
            </div>
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-xl p-4 text-center border-2 border-gray-200">
                        <p className="text-sm text-gray-500 mb-1 font-medium">Último Valor Real</p>
                        <p className="text-2xl font-bold" style={{ color: '#5D4037' }}>
                            {isMortalidade ? formatRate(lastValue) : formatPercent(lastValue)}
                        </p>
                        <p className="text-xs text-gray-400">{endMonth} (observado)</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center border-2 border-blue-200">
                        <p className="text-sm text-gray-500 mb-1 font-medium">Valor Esperado ({endMonth})</p>
                        <p className="text-2xl font-bold" style={{ color: '#1976D2' }}>
                            {isMortalidade ? formatRate(trend.predicted) : formatPercent(trend.predicted)}
                        </p>
                        <p className="text-xs text-gray-400">Baseado na tendência linear</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center border-2 border-orange-200">
                        <p className="text-sm text-gray-500 mb-1 font-medium">Projeção ({nextMonth})</p>
                        <p className="text-2xl font-bold" style={{ color: '#F57C00' }}>
                            {isMortalidade ? formatRate(trend.nextPredicted) : formatPercent(trend.nextPredicted)}
                        </p>
                        <p className="text-xs text-gray-400">Próximo mês (projetado)</p>
                    </div>
                </div>
                
                {/* Interpretação da Tendência */}
                <div className="p-4 rounded-xl mb-4" style={{ background: interpretation.bgColor }}>
                    <div className="flex items-center gap-3">
                        <i className={`fas fa-arrow-trend-${interpretation.icon} text-3xl`} style={{ color: interpretation.color }}></i>
                        <div>
                            <p className="font-bold text-lg" style={{ color: interpretation.color }}>
                                {interpretation.label}
                            </p>
                            <p className="text-sm text-gray-600">
                                Variação média de {Math.abs(trend.slope).toFixed(2)}{unit} por mês no período
                                {indicator === 'consultas' && trend.slope > 0 && ' - Aumento na cobertura de pré-natal'}
                                {indicator === 'consultas' && trend.slope < 0 && ' - Redução na cobertura de pré-natal'}
                                {indicator === 'baixoPeso' && trend.slope < 0 && ' - Redução de casos de baixo peso'}
                                {indicator === 'baixoPeso' && trend.slope > 0 && ' - Aumento de casos de baixo peso'}
                                {indicator === 'mortalidade' && trend.slope < 0 && ' - Redução na mortalidade infantil'}
                                {indicator === 'mortalidade' && trend.slope > 0 && ' - Aumento na mortalidade infantil'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Botão para mostrar metodologia */}
                <button 
                    onClick={() => setShowMethodology(!showMethodology)}
                    className="w-full text-left p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-between"
                >
                    <span className="flex items-center gap-2 text-blue-700 font-medium">
                        <i className="fas fa-info-circle"></i>
                        Como calculamos a projeção?
                    </span>
                    <i className={`fas fa-chevron-${showMethodology ? 'up' : 'down'} text-blue-500`}></i>
                </button>
                
                {showMethodology && (
                    <div className="mt-3 p-4 bg-blue-50 rounded-xl text-sm text-gray-700">
                        <h4 className="font-bold text-blue-800 mb-2">Metodologia: Regressão Linear Simples</h4>
                        <p className="mb-2">
                            Utilizamos o <strong>método dos mínimos quadrados</strong> para encontrar a reta que melhor se ajusta aos dados históricos do período selecionado ({startMonth} a {endMonth}).
                        </p>
                        <p className="mb-2">
                            <strong>Fórmula:</strong> y = slope × x + intercept
                        </p>
                        <ul className="list-disc list-inside space-y-1 mb-2">
                            <li><strong>slope (inclinação):</strong> indica a variação média por mês ({trend.slope.toFixed(4)}{unit}/mês)</li>
                            <li><strong>intercept:</strong> valor inicial estimado da série</li>
                            <li><strong>x:</strong> índice do mês dentro do período selecionado (0, 1, 2, ...)</li>
                        </ul>
                        <p className="mb-2">
                            <strong>Valor Esperado ({endMonth}):</strong> Aplicamos a fórmula para o último mês do período, obtendo o valor que seria esperado se a tendência fosse perfeitamente linear.
                        </p>
                        <p>
                            <strong>Projeção ({nextMonth}):</strong> Aplicamos a fórmula para o próximo mês após o período, projetando o valor assumindo que a tendência se mantenha.
                        </p>
                        <div className="mt-3 p-2 bg-yellow-100 rounded text-yellow-800 text-xs">
                            <i className="fas fa-exclamation-triangle mr-1"></i>
                            <strong>Nota:</strong> Projeções são estimativas baseadas em tendências passadas e podem não refletir eventos futuros imprevistos.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Comparison Table Component - Com formatação correta por indicador
const ComparisonTable = ({ indicator, data }) => {
    const polo1 = data['Sena Madureira'][indicator];
    const polo2 = data['Manoel Urbano'][indicator];
    const meses = DSEI_DATA.meses;
    const isMortalidade = indicator === 'mortalidade';

    const formatVal = (value) => {
        if (isMortalidade) {
            return formatRate(value);
        }
        return formatPercent(value);
    };

    return (
        <div className="card overflow-hidden">
            <div className="card-header">
                <h3 className="font-bold flex items-center gap-2">
                    <i className="fas fa-table"></i>
                    Comparativo entre Polos
                    {isMortalidade && <span className="text-xs font-normal opacity-80">(Taxa por 1.000 NV)</span>}
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="comparison-table">
                    <thead>
                        <tr>
                            <th>Mês</th>
                            <th colSpan="2" className="text-center">Sena Madureira</th>
                            <th colSpan="2" className="text-center">Manoel Urbano</th>
                        </tr>
                        <tr className="bg-gray-100">
                            <th></th>
                            <th className="text-sm font-medium">Mensal</th>
                            <th className="text-sm font-medium">Acumulado</th>
                            <th className="text-sm font-medium">Mensal</th>
                            <th className="text-sm font-medium">Acumulado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {meses.map((mes, i) => (
                            <tr key={mes}>
                                <td className="font-medium">{mes}</td>
                                <td>{formatVal(polo1.mensal[i])}</td>
                                <td className="font-semibold" style={{ color: '#2E7D32' }}>{formatVal(polo1.acumulado[i])}</td>
                                <td>{formatVal(polo2.mensal[i])}</td>
                                <td className="font-semibold" style={{ color: '#2E7D32' }}>{formatVal(polo2.acumulado[i])}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Main Dashboard Component
const Dashboard = ({ onBack }) => {
    const [activeIndicator, setActiveIndicator] = useState('baixoPeso');
    const [selectedPolo, setSelectedPolo] = useState('Sena Madureira');
    const [startMonth, setStartMonth] = useState('Janeiro');
    const [endMonth, setEndMonth] = useState('Novembro');
    const [viewMode, setViewMode] = useState('acumulado'); // 'mensal' ou 'acumulado'
    const [compareMode, setCompareMode] = useState(false);

    const indicatorConfig = {
        baixoPeso: { 
            name: 'Baixo Peso ao Nascer', 
            icon: 'fa-baby', 
            color: 'amarelo',
            description: 'Percentual de nascidos vivos com baixo peso (<2.500g)'
        },
        consultas: { 
            name: '6+ Consultas Pré-Natal', 
            icon: 'fa-stethoscope', 
            color: 'verde',
            description: 'Percentual de gestantes com 6 ou mais consultas'
        },
        mortalidade: { 
            name: 'Mortalidade Infantil', 
            icon: 'fa-child', 
            color: 'vermelho',
            description: 'Taxa de mortalidade por 1.000 nascidos vivos'
        }
    };

    const currentConfig = indicatorConfig[activeIndicator];
    const currentData = DSEI_DATA.indicadores[selectedPolo][activeIndicator];
    const polo1Data = DSEI_DATA.indicadores['Sena Madureira'][activeIndicator];
    const polo2Data = DSEI_DATA.indicadores['Manoel Urbano'][activeIndicator];

    const startIdx = DSEI_DATA.meses.indexOf(startMonth);
    const endIdx = DSEI_DATA.meses.indexOf(endMonth);
    
    // Garante que o período é válido
    const validStartIdx = Math.min(startIdx, endIdx);
    const validEndIdx = Math.max(startIdx, endIdx);

    const getFilteredLabels = () => {
        return DSEI_DATA.meses.slice(validStartIdx, validEndIdx + 1);
    };

    const getFilteredData = (data) => {
        return {
            mensal: data.mensal.slice(validStartIdx, validEndIdx + 1),
            acumulado: data.acumulado.slice(validStartIdx, validEndIdx + 1)
        };
    };

    const getLastValue = (data) => {
        const filtered = data.slice(validStartIdx, validEndIdx + 1);
        return filtered[filtered.length - 1];
    };
    
    const getFirstValue = (data) => {
        const filtered = data.slice(validStartIdx, validEndIdx + 1);
        return filtered[0];
    };
    
    // Dados filtrados para análise de tendência
    const filteredCurrentData = getFilteredData(currentData);

    return (
        <div className="dashboard-container">
            <Sidebar activeIndicator={activeIndicator} setActiveIndicator={setActiveIndicator} />
            
            <div className="main-content">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-2">
                            <i className="fas fa-arrow-left"></i> Voltar
                        </button>
                        <h1 className="text-2xl font-bold" style={{ color: '#5D4037' }}>
                            <i className={`fas ${currentConfig.icon} mr-3`} style={{ color: currentConfig.color === 'verde' ? '#2E7D32' : currentConfig.color === 'vermelho' ? '#C62828' : '#F9A825' }}></i>
                            {currentConfig.name}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">{currentConfig.description}</p>
                    </div>
                    
                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3">
                        <select 
                            value={selectedPolo} 
                            onChange={(e) => setSelectedPolo(e.target.value)}
                            className="filter-select"
                            disabled={compareMode}
                        >
                            {DSEI_DATA.polos.map(polo => (
                                <option key={polo} value={polo}>{polo}</option>
                            ))}
                        </select>
                        
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">De:</span>
                            <select 
                                value={startMonth} 
                                onChange={(e) => setStartMonth(e.target.value)}
                                className="filter-select"
                            >
                                {DSEI_DATA.meses.map(mes => (
                                    <option key={mes} value={mes}>{mes}</option>
                                ))}
                            </select>
                            <span className="text-sm text-gray-600">Até:</span>
                            <select 
                                value={endMonth} 
                                onChange={(e) => setEndMonth(e.target.value)}
                                className="filter-select"
                            >
                                {DSEI_DATA.meses.map(mes => (
                                    <option key={mes} value={mes}>{mes}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-1 bg-white rounded-lg p-1 border-2 border-gray-200">
                            <button
                                onClick={() => setViewMode('mensal')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                    viewMode === 'mensal' 
                                        ? 'bg-amber-600 text-white shadow-md' 
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                Mensal
                            </button>
                            <button
                                onClick={() => setViewMode('acumulado')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                    viewMode === 'acumulado' 
                                        ? 'bg-green-600 text-white shadow-md' 
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                Acumulado
                            </button>
                        </div>

                        <button 
                            onClick={() => setCompareMode(!compareMode)}
                            className={`btn-indigenous text-sm ${compareMode ? 'opacity-100' : 'opacity-70'}`}
                        >
                            <i className="fas fa-code-compare mr-2"></i>
                            {compareMode ? 'Comparando' : 'Comparar Polos'}
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <KPICard 
                        title="Valor Mensal Atual"
                        value={formatValue(getLastValue(currentData.mensal), activeIndicator)}
                        subtitle={endMonth}
                        icon={currentConfig.icon}
                        color={currentConfig.color}
                    />
                    <KPICard 
                        title="Valor Acumulado"
                        value={formatValue(getLastValue(currentData.acumulado), activeIndicator)}
                        subtitle={`${startMonth} a ${endMonth}`}
                        icon="fa-chart-area"
                        color="verde"
                    />
                    <KPICard 
                        title="Polo Selecionado"
                        value={selectedPolo}
                        subtitle="Polo de Saúde Indígena"
                        icon="fa-map-marker-alt"
                        color="ocre"
                    />
                    <KPICard 
                        title="Tendência"
                        value={getTrendInterpretation(calculateTrend(filteredCurrentData.acumulado).slope, activeIndicator).label.split(' ')[1]}
                        subtitle={`${Math.abs(calculateTrend(filteredCurrentData.acumulado).slope).toFixed(2)}${activeIndicator === 'mortalidade' ? '' : '%'} ao mês`}
                        icon="fa-arrow-trend-up"
                        trend={calculateTrend(filteredCurrentData.acumulado).slope}
                    />
                </div>

                {/* Gráfico Principal - Em destaque */}
                <div className="mb-6">
                    <TimeSeriesChart 
                        data={getFilteredData(currentData)}
                        title={`Série Histórica (${viewMode === 'acumulado' ? 'Acumulado' : 'Mensal'}) - ${compareMode ? 'Comparativo entre Polos' : selectedPolo}`}
                        labels={getFilteredLabels()}
                        viewMode={viewMode}
                        polo1Data={compareMode ? getFilteredData(polo1Data) : null}
                        polo2Data={compareMode ? getFilteredData(polo2Data) : null}
                        compareMode={compareMode}
                        indicator={activeIndicator}
                    />
                </div>

                {/* Análise de Tendência - Abaixo do gráfico */}
                <div className="mb-6">
                    <TrendAnalysis 
                        data={filteredCurrentData}
                        indicatorName={currentConfig.name}
                        polo={selectedPolo}
                        indicator={activeIndicator}
                        startMonth={DSEI_DATA.meses[validStartIdx]}
                        endMonth={DSEI_DATA.meses[validEndIdx]}
                    />
                </div>

                {/* Comparison Table */}
                {compareMode && (
                    <div className="mb-6">
                        <ComparisonTable 
                            indicator={activeIndicator}
                            data={DSEI_DATA.indicadores}
                        />
                    </div>
                )}

                {/* Footer */}
                <div className="text-center py-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        <i className="fas fa-leaf mr-2" style={{ color: '#2E7D32' }}></i>
                        DSEI - Distrito Sanitário Especial Indígena | Dados de Saúde dos Povos Originários
                    </p>
                </div>
            </div>
        </div>
    );
};

// Main App Component
const App = () => {
    const [currentPage, setCurrentPage] = useState('landing');

    return (
        <div>
            {currentPage === 'landing' ? (
                <LandingPage onEnter={() => setCurrentPage('dashboard')} />
            ) : (
                <Dashboard onBack={() => setCurrentPage('landing')} />
            )}
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

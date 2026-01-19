# PlanificaSUS Roraima - Dashboard de Indicadores

Sistema de monitoramento de indicadores de saúde para o Plano de Trabalho do PlanificaSUS em Roraima.

## 📊 Visão Geral

Este dashboard apresenta dados de indicadores de saúde para duas regiões:

- **Boa Vista (Capital)**: Monitoramento da capital do estado
- **Centro Norte (Regional)**: Análise comparativa de 8 municípios

## 🚀 Como Executar

### Opção 1: Servidor PowerShell (Recomendado)

```powershell
cd c:\Users\DRT76605\Documents\RR
powershell -ExecutionPolicy Bypass -File server.ps1
```

Acesse: http://localhost:8085

### Opção 2: Abrir diretamente

Abra o arquivo `index.html` diretamente no navegador (algumas funcionalidades podem não funcionar devido a restrições CORS).

## 📁 Estrutura do Projeto

```
RR/
├── index.html              # Landing page principal
├── dashboard_capital.html  # Dashboard Boa Vista
├── dashboard_regional.html # Dashboard Centro Norte
├── dados.json              # Dados convertidos do Excel
├── RR_Dados.xlsx           # Planilha original
├── server.ps1              # Servidor HTTP local
└── README.md               # Este arquivo
```

## 🎯 Funcionalidades

### Landing Page
- Design corporativo e elegante
- Acesso rápido aos dois painéis
- Estatísticas resumidas

### Dashboard Boa Vista
- **Série Histórica**: Evolução mensal dos indicadores
- **Predição**: Projeções para 1, 6 e 12 meses
- **Cards de Métricas**: Valor atual, média, máximo e mínimo
- **Filtros**: Por indicador e valor

### Dashboard Centro Norte
- **Ranking de Municípios**: Ordenação por desempenho
- **Série Histórica**: Comparativo entre municípios
- **Predição Regional**: Projeções agregadas e por município
- **Filtros**: Por indicador, mês e municípios

## 📈 Indicadores Disponíveis

### Taxas e Coberturas
- Cobertura vacinal de poliomielite inativa
- Taxa de incidência de sífilis congênita
- Taxa de incidência de sífilis em gestante
- Percentual de cobertura de APS

### Valores Absolutos
- Número de doses aplicadas
- Crianças menores de 1 ano
- Número de nascidos vivos
- Número de casos de sífilis congênita
- Número de casos de sífilis em gestantes
- Número de cadastros

## 🔮 Análise Preditiva

O sistema utiliza regressão linear simples para projetar valores futuros:
- **Próximo mês**: Previsão para o mês seguinte
- **6 meses**: Projeção de médio prazo
- **12 meses**: Projeção de longo prazo

## 🛠️ Tecnologias Utilizadas

- **HTML5/CSS3**: Interface responsiva
- **JavaScript**: Lógica de aplicação
- **Chart.js**: Gráficos interativos
- **Font Awesome**: Ícones
- **Google Fonts (Inter)**: Tipografia

## 📝 Notas

- Os dados são carregados do arquivo `dados.json`
- Para atualizar os dados, modifique a planilha `RR_Dados.xlsx` e execute o script de conversão
- O sistema é independente do projeto GDI-APS

---

**PlanificaSUS** - Sistema de Monitoramento de Indicadores de Saúde

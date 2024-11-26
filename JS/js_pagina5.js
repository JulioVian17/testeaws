
var quebraChart;
var dadosJSONArray;

///MENU\\\
$(document).ready(function () {
    $('.list').addClass('hidden'); // Adiciona a classe hidden inicialmente
    $('.menu').on('click', function () {
        $('.list').toggleClass('hidden');
    });
});
fetch('bancoDeDados/dadosQuebrasParadas.json')
    .then(response => response.json())
    .then(data => {
        dadosJSONArray = data;
        criarGrafico(obterDataAtual(), "")
    })
    .catch(error => {
        console.error('Erro ao carregar dados:', error);
    });
function obterDataAtual() {
    var newData = new Date();

    var ano = newData.getFullYear();

    var mes = newData.getMonth() + 1;
    mes = mes < 10 ? '0' + mes : mes; // Adiciona um zero à esquerda se for menor que 10

    var dia = newData.getDate();
    dia = dia < 10 ? '0' + dia : dia; // Adiciona um zero à esquerda se for menor que 10

    var dataFormatada = ano;
    return dataFormatada
}
function criarGrafico(anoSelecionado, mesSelecionado) {

    var returnSpan;
    var returnSpanProduzido;
    function funcHr(tempoTotalProducaoDoMes) {

        var horas = tempoTotalProducaoDoMes;
        var horasInt = parseInt(horas);

        var minutos = parseInt((horas - horasInt) * 60);
        returnSpanProduzido = `Tempo produzido: ${horasInt}h:${minutos}min`;
        return returnSpanProduzido;
    }

    function funcMinEmHr(tempoTotalParadoDoMes) {
        var horas = tempoTotalParadoDoMes / 60;
        var horasInt = parseInt(horas);
        var minutos = parseInt((horas - horasInt) * 60);
        returnSpan = `Tempo parado: ${horasInt}h:${minutos}min`;
        return returnSpan;
    }
    var fil = anoSelecionado + "-" + mesSelecionado;
    var dadosFiltrados = dadosJSONArray.filter(function (item) {
        return item.dataHora.startsWith(fil);
    });
    getDataTreeMap(dadosFiltrados);
    var motivoData = {};
    var categoriaMotivoData = {};
    var tempoTotalParadoDoMes = 0;
    var tempoTotalProducaoDoMes = 0;
    var rankingData = {};
    dadosFiltrados.forEach(function (item) {

        var Parado = item.tempoTotalParado;
        var Producao = parseFloat(item.tempoTotalProducao);
        var itemCode = item.itemCode;
        tempoTotalParadoDoMes += Parado;
        tempoTotalProducaoDoMes += Producao;

        funcMinEmHr(tempoTotalParadoDoMes);
        funcHr(tempoTotalProducaoDoMes);
        if (!rankingData[itemCode]) {
            rankingData[itemCode] = { tpar: 0, tprod: 0 };
        }
        rankingData[itemCode].tpar += Parado;
        rankingData[itemCode].tprod += Producao;

        var paradas = item.vetorParada.split(', ');
        if (paradas != '') {
            for (var i = 0; i < paradas.length; i += 3) {
                if (paradas[i + 2] != 'REMUAGEM') {
                    var valor = parseInt(paradas[i]);
                    var categoria = paradas[i + 1];
                    var motivo = paradas[i + 2];
                    if (!categoriaMotivoData[motivo]) {
                        categoriaMotivoData[motivo] = { quantidadeValor: 0, quantidadeValorMultiplicado: 0 };
                    }
                    if (!motivoData[motivo]) {
                        motivoData[motivo] = 0;
                    }

                    var valorMultiplicado = valor * obterValorCategoria(categoria);

                    motivoData[motivo] += valorMultiplicado;
                    categoriaMotivoData[motivo].quantidadeValor += valor;
                    categoriaMotivoData[motivo].quantidadeValorMultiplicado += valorMultiplicado;
                }

            }
        }

    });


    const span1 = document.getElementById("span1");
    span1.innerHTML = returnSpan;
    const span2 = document.getElementById("span2");
    span2.innerHTML = returnSpanProduzido;
    var insirirHtml2 = document.getElementById("insirir-html2");
    //DETALHADO
    var resultString2 =
        `<table style="text-align: left; background-color: rgb(101, 101, 101);">
<thead><th>Motivo</th><th>N.º de Paradas</th><th>Total Parado</th></thead>
<tbody>`;
    //transforma em array
    var motivoArray2 = [];
    for (var motivo in categoriaMotivoData) {
        var quantidadeValor = categoriaMotivoData[motivo].quantidadeValor;
        var quantidadeValorMultiplicado = categoriaMotivoData[motivo].quantidadeValorMultiplicado;
        motivoArray2.push({
            motivo: motivo,
            quantidadeValor: quantidadeValor,
            quantidadeValorMultiplicado: quantidadeValorMultiplicado
        });
    }
    //ordena 
    motivoArray2.sort(function (a, b) {
        return b.quantidadeValorMultiplicado - a.quantidadeValorMultiplicado;
    });
    motivoArray2.forEach(function (item) {
        resultString2 += `<tr><td>${item.motivo}</td><td>${item.quantidadeValor}</td><td style="white-space: nowrap;">${item.quantidadeValorMultiplicado} min</td></tr>`;
    });
    resultString2 += `</tbody></table>`;

    insirirHtml2.innerHTML = resultString2;

    //RESUMO
    var motivoArray = [];

    // Converter o objeto em um array
    for (var motivo in motivoData) {
        motivoArray.push({
            motivo: motivo,
            totalParado: motivoData[motivo]
        });
    }

    // Ordenar o array com base no total parado em ordem decrescente
    motivoArray.sort(function (a, b) {
        return b.totalParado - a.totalParado;
    });

    // Construir a string HTML
    var resultString = `<table style="text-align: left;background-color: rgb(201, 101, 101);">
    <thead><th>Motivo Resumo</th><th>Total Parado</th></thead>
    <tbody>`;

    // Construir a string com os dados ordenados
    motivoArray.forEach(function (item) {
        resultString += `<tr><td>${item.motivo}</td><td style="white-space: nowrap;">${item.totalParado} min</td></tr>`;
    });

    resultString += `</tbody></table>`;

    // Atualizar o elemento HTML com o novo conteúdo
    var insirirHtml = document.getElementById("inisirir-html");
    insirirHtml.innerHTML = resultString;




    //Ranking
    // Função para calcular o percentual de tempo parado em relação ao tempo produzido
    function calcularPercentual(tpar, tprod) {
        return (tpar / tprod) * 100;
    }

    // Função para formatar o tempo em "hh:mm"
    function formatarTempo(tempo) {
        var horas = Math.floor(tempo);
        var minutos = Math.round((tempo - horas) * 60);
        return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
    }

    // Converter os dados em um array para facilitar a ordenação
    var rankingArray = [];
    for (var itemCode in rankingData) {
        var tpar = rankingData[itemCode].tpar / 60;
        var tprod = rankingData[itemCode].tprod;

        var percentual = calcularPercentual(tpar, tprod);

        rankingArray.push({
            itemCode: itemCode,
            tpar: tpar,
            tprod: tprod,
            percentual: percentual
        });
    }

    // Ordenar o array com base no percentual em ordem decrescente
    rankingArray.sort(function (a, b) {
        return b.percentual - a.percentual;
    });

    // Atualizar o HTML com a tabela ordenada
    var fieldsetRanking = document.getElementById("fieldset-ranking");
    fieldsetRanking.style.display = 'none';
    var rankingHtml = document.getElementById("ranking");
    rankingHtml.style.display = 'none';
    var rankingString =
        `<table style="text-align: left;background-color: black;">
<thead><th>Posição</th><th>Item</th><th>Total Parado</th><th>Total Producao</th><th>Percentual</th></thead>
<tbody>`;

    for (var i = 0; i < rankingArray.length; i++) {
        var item = rankingArray[i];
        var returnRkPar = formatarTempo(item.tpar);
        var returnRkProd = formatarTempo(item.tprod);

        rankingString += `<tr><td>${i + 1}</td><td>${item.itemCode}</td><td>${returnRkPar}</td><td style="white-space: nowrap;">${returnRkProd}</td><td>${item.percentual.toFixed(2)}%</td></tr>`;
    }

    rankingString += `</tbody></table>`;
    rankingHtml.innerHTML = rankingString;
    //Ranking
    const btnRanking = document.getElementById("mostrar-ranking");
    btnRanking.addEventListener('click', funcMostrarRanking);
    const btnSemRanking = document.getElementById("sem-ranking");
    btnSemRanking.addEventListener('click', funcSemRanking);
    function funcMostrarRanking() {
        rankingHtml.style.display = 'block';
        fieldsetRanking.style.display = 'block';
    }
    function funcSemRanking() {
        rankingHtml.style.display = 'none';
        fieldsetRanking.style.display = 'none';
    }

    const sortedLabels = Object.keys(motivoData).map(label => ({
        label,
        total: motivoData[label]
    }));
    sortedLabels.sort((a, b) => b.total - a.total).slice(0, 10);
    // Limite aos 15 primeiros elementos
    const top15 = sortedLabels.slice(0, 25);
    const labels = top15.map(item => item.label);
    const dataValues = top15.map(item => item.total);
    //const labels = sortedLabels.map(item => item.label);
    //const dataValues = sortedLabels.map(item => item.total);

    var ctx = document.getElementById('quebraChart').getContext('2d');
    Chart.getChart(ctx)?.destroy();
    quebraChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: dataValues,
                backgroundColor: 'gray',
            }],
        },
        plugins: [ChartDataLabels],
        options: {
            indexAxis: 'y',
            aspectRatio: 0.7,
            plugins: {
                datalabels: {
                    anchor: 'center',
                    align: 'end',
                    color: "white",
                    font: {
                        size: 13,
                    },
                    formatter: function (value, context) {
                        return value + 'min';
                    },

                },
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: true,
                        color: 'white'
                    },
                    ticks: {
                        callback: function (value, index, values) {
                            {
                                return value + " min";
                            }
                        },
                        font: {
                            size: 12
                        },
                        color: 'white',
                    },
                },
                y: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 10
                        },
                        color: 'white'
                    },
                }
            }

        }
    });
}
document.getElementById('mesSelecionado').addEventListener('change', function () {
    atualizarGrafico();
});
document.getElementById('anoSelecionado').addEventListener('change', function () {
    atualizarGrafico();
});
function atualizarGrafico() {
    var mesSelecionado = document.getElementById('mesSelecionado').value;
    var anoSelecionado = document.getElementById('anoSelecionado').value;

    criarGrafico(anoSelecionado, mesSelecionado);
}
//Treemap
function getDataTreeMap(data) {
    console.log(data);
    var motivoData = {};

    data.forEach(function (item) {
        var paradas = item.vetorParada.split(', ');
        if (paradas != '') {
            for (var i = 0; i < paradas.length; i += 3) {
                if (paradas[i + 2] != 'REMUAGEM') {
                    var valor = parseInt(paradas[i]);
                    var categoria = paradas[i + 1];
                    var motivo = paradas[i + 2];
                    if (!motivoData[motivo]) {
                        motivoData[motivo] = 0;
                    }

                    var valorMultiplicado = valor * obterValorCategoria(categoria);

                    motivoData[motivo] += valorMultiplicado;
                }

            }
        }

    });

    const itemEntries = Object.entries(motivoData);
    const topEntries = itemEntries
        .sort((a, b) => b[1] - a[1])
        .slice(0, 25);

    const labels = ["Total", ...topEntries.map(entry => entry[0])];
    const parents = ["", ...topEntries.map(() => "Total")];
    const values = [topEntries.reduce((acc, entry) => acc + entry[1], 0), ...topEntries.map(entry => entry[1])];

    // Dados para o treemap
    const dataTreemap = [{
        type: "treemap",
        labels: labels,
        parents: parents,
        values: values,
        // textinfo: "label+value+percent parent",
        textinfo: "label+value",
        branchvalues: "total",
        marker: {
            //colorscale: 'Blues' // Adiciona uma escala de cores para uma melhor visualização
        }
    }];

    var layout = {
        autosize: true,
        margin: {
            l: 10,
            r: 10,
            b: 10,
            t: 10,
            pad: 0
        },
        paper_bgcolor: 'rgba(0, 0, 0, 0)',
        plot_bgcolor: 'white',
        font: {
            color: 'white'
        }
    };

    Plotly.newPlot('divTreemap', dataTreemap, layout);
}
function obterValorCategoria(categoria) {
    // Implemente a lógica para obter o valor associado à categoria
    // Aqui você pode usar um objeto de mapeamento ou qualquer lógica específica do seu caso.
    // Por exemplo, se tiver um objeto de mapeamento como categoriaValorMap, você pode fazer:
    // return categoriaValorMap[categoria] || 1; // Se não houver valor associado, assume 1.

    // Neste exemplo, assumirei que a categoria é convertida para um número diretamente.
    // Se for uma string, você precisará  conforme necessário.
    return parseInt(categoria) || 1;
}
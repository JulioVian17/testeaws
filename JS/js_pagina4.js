var quebraChartItem;
var quebraChart;
var dadosJSONArray;

///MENU\\\
$(document).ready(function () {
    $('.list').addClass('hidden'); // Adiciona a classe hidden inicialmente
    $('.menu').on('click', function () {
        $('.list').toggleClass('hidden');
    });
});

fetch('bancoDeDados/dadosRotulagem.json')
    .then(response => response.json())
    .then(data => {
        dadosJSONArray = data;
        criarGrafico(obterDataAtual(),"");
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

    var dataFormatada = ano ;
    return dataFormatada
}
function criarGrafico(anoSelecionado,mesSelecionado) {
    var fil = anoSelecionado+"-"+mesSelecionado;
    var dadosFiltrados = dadosJSONArray.filter(function (item) {
        return item.dataHora.startsWith(fil);
    });

    var quebraData = {};
    var motivoData = {};
    var categoriaMotivoData = {};
    var quantidadeTotalQuebrada = 0;
    dadosFiltrados.forEach(function (item) {

        var quebras = item.vetorQuebra.split(', ');
        if (quebras == '') {
            //não faz nada
        } else {
            for (var i = 0; i < quebras.length; i += 3) {

                var valor = parseInt(quebras[i]);
                quantidadeTotalQuebrada += valor;
                var categoria = quebras[i + 1];
                var motivo = quebras[i + 2];

                if (!categoriaMotivoData[categoria]) {
                    categoriaMotivoData[categoria] = {};
                    categoriaMotivoData[categoria].Total = 0
                }
                if (!categoriaMotivoData[categoria][motivo]) {
                    categoriaMotivoData[categoria][motivo] = 0;
                }
                if (!quebraData[categoria]) {
                    quebraData[categoria] = 0;
                }
                if (!motivoData[motivo]) {
                    motivoData[motivo] = 0;
                }

                quebraData[categoria] += valor;
                motivoData[motivo] += valor;
                categoriaMotivoData[categoria][motivo] += valor;
                categoriaMotivoData[categoria].Total += valor;
            }
        }
    });

    const span1 = document.getElementById("span1");
    span1.innerHTML = `Quantidade Total Quebrada: ${quantidadeTotalQuebrada} un`;

    //DETALHADO
    var insirirHtml2 = document.getElementById("insirir-html2");
    var resultString = `<table style="text-align: left; background-color: rgb(101, 101, 101); padding: 15px;">
                <thead><th>Categoria</th><th>Motivo</th><th>Quant</th></thead>
                <tbody>`;
    var lastCategoria = null;

    for (var categoria in categoriaMotivoData) {
        for (var motivo in categoriaMotivoData[categoria]) {
            var quantidadeMotivo = categoriaMotivoData[categoria][motivo];


            if (categoria !== lastCategoria) {
                resultString += `<tr><td style="border:1px solid" rowspan="${Object.keys(categoriaMotivoData[categoria]).length}">${categoria}</td><td style="border:2px solid">${motivo}</td><td style="border:2px solid">${quantidadeMotivo}</td></tr>`;
            } else {
                resultString += `<tr><td>${motivo}</td><td>${quantidadeMotivo}</td></tr>`;
            }

            lastCategoria = categoria;

        }
    }
    resultString += `</tbody></table>`;
    insirirHtml2.innerHTML = resultString;

    //RESUMO
    var motivoArray = [];
    // Converter o objeto motivoData em um array de objetos
    for (var motivo in motivoData) {
        motivoArray.push({
            motivo: motivo,
            quantidade: motivoData[motivo]
        });
    }
    // Ordenar o array com base na quantidade de motivos em ordem decrescente
    motivoArray.sort(function (a, b) {
        return b.quantidade - a.quantidade;
    });
    // Construir a string HTML
    var resultString = `<section style=""><table style="text-align: left;background-color: rgb(101, 101, 101); padding: 15px;">
        <thead><th>Item Resumo</th></thead>
        <tbody>`;
    // Adicionar as categorias do objeto quebraData
    Object.keys(quebraData).forEach(function (categoria) {
        resultString += `<tr><td>${categoria}</td></tr>`;
    });
    resultString += `</tbody></table>`;
    // Adicionar a tabela de motivos ordenada
    resultString += `<table style="text-align: left;background-color: rgb(201, 101, 101); padding: 15px;">
        <thead><th>Motivo</th><th>Quant</th></thead>
        <tbody>`;
    // Adicionar os motivos ordenados com base na quantidade
    motivoArray.forEach(function (item) {
        resultString += `<tr><td>${item.motivo}</td><td>${item.quantidade}</td></tr>`;
    });
    resultString += `</tbody></table></section>`;
    // Atualizar o elemento HTML com o novo conteúdo
    var insirirHtml = document.getElementById("inisirir-html");
    insirirHtml.innerHTML = resultString;
    /*
        const sortedLabels = Object.keys(quebraData).map(label => ({
            label,
            total: quebraData[label]
        }));
        sortedLabels.sort((a, b) => b.total - a.total);
        const labels = sortedLabels.map(item => item.label);
        const dataValues = sortedLabels.map(item => item.total);
    */

    const sortedLabels = Object.keys(categoriaMotivoData).map(label => ({
        label,
        total: Object.values(categoriaMotivoData[label]).reduce((acc, cur) => acc + cur, 0)
    }));

    // Ordenando o array com base no total
    sortedLabels.sort((a, b) => b.total - a.total);

    // Obtendo os labels ordenados
    const labels = sortedLabels.map(item => item.label);



    const dataProc = [];
    const dataRet = [];
    const dataIns = [];
    const dataMan = [];
    const dataReg = [];

    labels.forEach(label => {
        dataProc.push(categoriaMotivoData[label]['PROCESSO'] || "");
        dataRet.push(categoriaMotivoData[label]['RETIRADA'] || "");
        dataIns.push(categoriaMotivoData[label]['INSUMO'] || "");
        dataMan.push(categoriaMotivoData[label]['MANUTENCAO'] || "");
        dataReg.push(categoriaMotivoData[label]['REGULAGEM'] || "");

    });


    var ctx = document.getElementById('quebraChart').getContext('2d');
    Chart.getChart(ctx)?.destroy();
    quebraChart = new Chart(ctx, {
        type: 'bar',
        /* data: {
             labels: labels,
             datasets: [{
                 data: dataValues,
                 backgroundColor: 'gray',
             }],
         },*/
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Processo',
                    data: dataProc,
                    borderWidth: 1,
                    backgroundColor: 'rgb(77, 77, 77)',
                    borderColor: 'red',
                    borderWidth: 2
                },
                {
                    label: 'Retirada',
                    data: dataRet,
                    borderWidth: 1,
                    backgroundColor: 'rgb(97, 97, 97)',
                    borderColor: 'yellow',
                    borderWidth: 2
                },
                {
                    label: 'Insumo',
                    data: dataIns,
                    borderWidth: 1,
                    backgroundColor: 'rgb(150, 150, 150)',
                    borderColor: 'blue',
                    borderWidth: 2
                },
                {
                    label: 'Manutenção',
                    data: dataMan,
                    borderWidth: 1,
                    backgroundColor: 'rgb(97, 97, 97)',
                    borderColor: 'green',
                    borderWidth: 2
                },
                {
                    label: 'Regulagem',
                    data: dataReg,
                    borderWidth: 1,
                    backgroundColor: 'rgb(150, 150, 150)',
                    borderColor: 'orange',
                    borderWidth: 2
                }
            ]
        },
        plugins: [ChartDataLabels],
        options: {
            indexAxis: 'y',
            aspectRatio: 0.7,
            plugins: {
                datalabels: {
                    display: 'auto',
                    anchor: 'center',
                    align: 'end',
                    color: "white",
                    clamp: true,
                    clip :false,
                    font: {
                        size: 13,
                    },
                    formatter: function (value, context) {
                        if(value != '' || value != undefined){
                          return value + ' un';  
                        }
                        
                    },

                },
                legend: {
                    display: true,
                    labels: {
                        color: "white",
                        font: {
                            size: 14
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    grid: {
                        display: true,
                        color: 'white'
                    },
                    ticks: {
                        callback: function (value, index, values) {
                            {
                                return value + " un";
                            }
                        },
                        font: {
                            size: 12
                        },
                        color: 'white',
                    },
                },
                y: {
                    stacked: true,
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
 
    criarGrafico(anoSelecionado,mesSelecionado);
}


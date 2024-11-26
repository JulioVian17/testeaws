document.addEventListener('DOMContentLoaded', () => {
    setInitialDate();
    fetchQueebrasParadas();
});
///MENU\\\
$(document).ready(function () {
    $('.list').addClass('hidden');
    $('.menu').on('click', function () {
        $('.list').toggleClass('hidden');
    });
});

function filterDataByYear(data, year) {
    return data.filter(item => {
        const itemYear = item.dataHora.slice(0, 4);
        return itemYear === year;
    });
}
function filterDataByYearAndMonth(data, year, month) {
    return data.filter(item => {
        const itemYear = item.dataHora.slice(0, 4);
        const itemMonth = item.dataHora.slice(5, 7);
        return itemYear === year && itemMonth === month;
    });
}
function filterDataByYearAndMonthAndDay(data, year, month, day) {
    return data.filter(item => {
        const itemYear = item.dataHora.slice(0, 4);
        const itemMonth = item.dataHora.slice(5, 7);
        const itemDay = item.dataHora.slice(8, 10);
        return itemYear === year && itemMonth === month && itemDay === day;
    });
}
//seta a data para o filtro
function setInitialDate() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const yearSelect = document.getElementById('filterYear');
    const monthSelect = document.getElementById('filterMonth');
    const daySelect = document.getElementById('filterDay');

    yearSelect.value = yesterday.getFullYear().toString();
    monthSelect.value = (yesterday.getMonth() + 1).toString().padStart(2, '0');
    daySelect.value = yesterday.getDate().toString().padStart(2, '0');
}

function fetchQueebrasParadas(label) {
    fetch('bancoDeDados/dadosQuebrasParadas.json')
        .then(response => response.json())
        .then(data => {
            var selectedYear = document.getElementById('filterYear').value;
            var selectedMonth = document.getElementById('filterMonth').value;
            var selectedDay = document.getElementById('filterDay').value;
            if (label == true) {
                selectedDay = label;
            }
            const filteredYear = filterDataByYear(data, selectedYear);
            const filteredData = filterDataByYearAndMonth(data, selectedYear, selectedMonth);
            const filteredDataAndDay = filterDataByYearAndMonthAndDay(data, selectedYear, selectedMonth, selectedDay);

            document.getElementById("parteDiaSelecionado").style.display = filteredDataAndDay != "" ? 'block' : 'none';
            filteredData.sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));
            const paradasPorDiaData = getDataForParadasPorDia(filteredData);
            const paradasNoDiaSelectData = getDataForParadasNoDiaSelect(filteredDataAndDay);
            const quebrasNoDiaSelectData = getDataForQuebrasNoDiaSelect(filteredDataAndDay);
            const quebrasMotivoNoDiaSelectData = getDataForQuebrasMotivosNoDiaSelect(filteredDataAndDay);
            const paradasMotivoNoDiaSelectData = getDataForParadasMotivosNoDiaSelect(filteredDataAndDay);
            geraisQuebraParadas(filteredDataAndDay);
            const OEEporMesData = OEEmensal(filteredData);
            enviardata(selectedYear, selectedMonth, selectedDay);
            const { percentualPorDiaData, averageData } = getDataForPercentualPorDia(filteredData);
            createChartAcumulado('percentualPorDia', 'bar', 'Produtividade', percentualPorDiaData.labels, percentualPorDiaData.values, averageData.values, percentualPorDiaData.itemLabels, percentualPorDiaData.itemValue);
            const { pRendPorDiaData, averageDataRend } = getDataForPercentualRendPorDia(filteredData);
            createChartAcumulado('percentualRendPorDia', 'bar', 'Rendimento', pRendPorDiaData.labels, pRendPorDiaData.values, averageDataRend.values, pRendPorDiaData.itemLabels, pRendPorDiaData.itemValue);
            createChartAcumulado('oeePorDia', 'line', 'OEE', OEEporMesData.labels, OEEporMesData.values);
            createChart('paradasPorDia', 'line', 'Minutos', paradasPorDiaData.labels, paradasPorDiaData.values);
            createChartY('paradaNoDiaSelect', 'bar', 'Minutos', paradasNoDiaSelectData.labels, paradasNoDiaSelectData.values);
            createChartY('paradaMotivoNoDiaSelect', 'bar', 'Porcentagem', paradasMotivoNoDiaSelectData.labels, paradasMotivoNoDiaSelectData.values);
            //createChart('quebraNoDiaSelect', 'bar', 'Quantidade', quebrasNoDiaSelectData.labels, quebrasNoDiaSelectData.values);
            createChartY('quebraMotivoNoDiaSelect', 'bar', 'Porcentagem', quebrasMotivoNoDiaSelectData.labels, quebrasMotivoNoDiaSelectData.values);
            createChartYstacked('quebraNoDiaSelect', 'bar', 'Quantidade', quebrasNoDiaSelectData.labels, quebrasNoDiaSelectData.values);
            const garrafasPorDiaData = getDataForGarrafasPorDia(filteredData);
            createChartGarrafas('garrafasPorDia', 'bar', 'Garrafas', garrafasPorDiaData.labels, garrafasPorDiaData.valuesRot, garrafasPorDiaData.itemValue, garrafasPorDiaData.valuesEnv, garrafasPorDiaData.valuesDeg);
            const ociosidadePorDia = getDataForOciosidadePorDia(filteredData);
            createChart('ociosidadePorDia', 'line', 'Ociosidade', ociosidadePorDia.labels, ociosidadePorDia.values);

            funcInfo(filteredDataAndDay);

            getDataTreeMap(filteredYear);
            getRegistros(filteredYear);
        })
        .catch(error => console.error('Erro ao carregar os dados:', error));
}
document.getElementById('filterYear').addEventListener('change', function () {
    fetchQueebrasParadas();
});
document.getElementById('filterMonth').addEventListener('change', function () {
    fetchQueebrasParadas();
});
document.getElementById('filterDay').addEventListener('change', function () {
    fetchQueebrasParadas();
});
//Treemap
function getDataTreeMap(data) {
    const itemCodeSums = {};
    const contProd = {};
    const prodItem = {}
    data.forEach(item => {
        const code = item.itemCode;
        const garrafaValue = parseInt(item.garrafa, 10);
        const operacao = item.operacao;
        if (operacao === 'rotulagem') {
            if (!itemCodeSums[code]) {
                itemCodeSums[code] = 0;
            }
            itemCodeSums[code] += garrafaValue;
        };
        if (!prodItem[code]) {
            prodItem[code] = 0;
            contProd[code] = 0;
        }
        prodItem[code] += item.percentual;
        contProd[code] += 1;
    });

    const itemEntries = Object.entries(itemCodeSums);
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
//----------Registros-------------
async function getRegistros(data) {
    const tbody = document.getElementById('tabela-registros-corpo');

    // Objeto para armazenar dados agregados por código de item
    const contProd = {};
    const prodItem = {};
    const rendimentoItem = {};
    const garrafasPorOperacao = {};
    const tempoItem = {};
    var ano;
    // Itera sobre os dados para calcular as somas
    data.forEach(item => {
        const code = item.itemCode;
        const garrafaValue = parseInt(item.garrafa, 10);
        const percentual = item.percentual;
        const rendimento = item.percentualRendimento;
        const tempo = parseFloat(item.tempoTotalProducao);
        ano = item.dataHora.split("-")[0];

        // Inicializa os objetos se o código do item não existir ainda
        if (!prodItem[code]) {
            prodItem[code] = 0;
            rendimentoItem[code] = 0;
            //garrafasItem[code] = 0;
            tempoItem[code] = 0;
            contProd[code] = 0;
        }
        if (!garrafasPorOperacao[code]) {
            garrafasPorOperacao[code] = {
                rotulagem: 0,
                envase: 0,
                degorgement: 0
            };
        }
        // Acumula valores
        prodItem[code] += percentual;
        rendimentoItem[code] += rendimento;
        tempoItem[code] += tempo;
        contProd[code] += 1;
        if (item.operacao === "rotulagem") {
            garrafasPorOperacao[code].rotulagem += garrafaValue;
        } else if (item.operacao === "envase") {
            garrafasPorOperacao[code].envase += garrafaValue;
        } else if (item.operacao === "degorgment") {
            garrafasPorOperacao[code].degorgement += garrafaValue;
        }
    });
    document.getElementById("span-resumo-tit").innerHTML=` ${ano}`;
    // Calcula as médias por item
    const itemCodeAverages = {};
    Object.keys(prodItem).forEach(code => {
        itemCodeAverages[code] = {
            percentual: prodItem[code] / contProd[code],
            percentualRendimento: rendimentoItem[code] / contProd[code],
            garrafas: garrafasPorOperacao[code],
            tempoTotalProducao: tempoItem[code]
        };
    });

    // Ordena os itens pela média de produtividade (percentual)
    const array = Object.entries(itemCodeAverages);
    const topProd = array
        .sort((a, b) => b[1].percentual - a[1].percentual)
        .slice(0, 100);

    console.log("Média:", topProd);

    // Popula a tabela com os dados
    topProd.forEach(([code, stats]) => {
        const row = document.createElement('tr');

        // Código do item
        const itemCell = document.createElement('td');
        itemCell.textContent = code;
        row.appendChild(itemCell);

        // Média de produtividade
        const produtividadeCell = document.createElement('td');
        produtividadeCell.textContent = stats.percentual.toFixed(2) + "%";
        row.appendChild(produtividadeCell);

        // Média de rendimento
        const rendimentoCell = document.createElement('td');
        rendimentoCell.textContent = stats.percentualRendimento.toFixed(2) + "%";
        row.appendChild(rendimentoCell);

        // Tempo total de produção
        const tempoCell = document.createElement('td');
        tempoCell.textContent = stats.tempoTotalProducao.toFixed(2) + " h";
        row.appendChild(tempoCell);
        
        //Quantidades
        const rotulagemCell = document.createElement('td');
        rotulagemCell.textContent = stats.garrafas.rotulagem;
        row.appendChild(rotulagemCell);
        const envaseCell = document.createElement('td');
        envaseCell.textContent = stats.garrafas.envase;
        row.appendChild(envaseCell);
        const degorgementCell = document.createElement('td');
        degorgementCell.textContent = stats.garrafas.degorgement;
        row.appendChild(degorgementCell);


        tbody.appendChild(row);
    });

    // Função para ordenar colunas ao clicar nos cabeçalhos
    const addSorting = () => {
        const headers = document.querySelectorAll('th');
        let sortDirection = 1;
        headers.forEach((header, index) => {
            header.addEventListener('click', () => {
                const rows = Array.from(document.querySelectorAll('tbody tr'));
                const isNumericColumn = index >= 1;  // Todas as colunas exceto a primeira são numéricas

                rows.sort((rowA, rowB) => {
                    const cellA = rowA.children[index].textContent;
                    const cellB = rowB.children[index].textContent;

                    const valueA = isNumericColumn ? parseFloat(cellA) || 0 : cellA;
                    const valueB = isNumericColumn ? parseFloat(cellB) || 0 : cellB;

                    if (valueA < valueB) return -1 * sortDirection;
                    if (valueA > valueB) return 1 * sortDirection;
                    return 0;
                });

                sortDirection *= -1;
                const tbody = document.querySelector('tbody');
                rows.forEach(row => tbody.appendChild(row));
            });
        });
    };

    addSorting();
}

//OEE diario
function OEEmensal(data) {
    /*  const oeeMes = {};
      const performanceMes = {};
      const contagemPorMes = {};
      const disponibilidadeMes = {};
      const qualidadeMes = {};
  
      data.forEach(item => {
  
          const mes = item.dataHora.slice(5, 7);
          const dia = item.dataHora.slice(8, 10);
  
          // Contagem de Performance
          if (!performanceMes[mes]) {
              performanceMes[mes] = 0;
              contagemPorMes[mes] = 0;
          }
  
          performanceMes[mes] += parseInt(item.percentual, 10);
          contagemPorMes[mes]++;
  
          // Cálculo de Disponibilidade
          if (!disponibilidadeMes[mes]) {
              disponibilidadeMes[mes] = 0;
          }
          const horasDisponiveisPorDia = 8.8;
          disponibilidadeMes[mes] += parseFloat(item.tempoTotalProducao, 10) / horasDisponiveisPorDia;
          // Cálculo de Qualidade
          // Adicione aqui a lógica para calcular a qualidade com base nas suas métricas
  console.log(disponibilidadeMes);
      });
  
      // Média de Performance
      Object.keys(performanceMes).forEach(mes => {
          performanceMes[mes] /= contagemPorMes[mes];
      });
  
      // Média de Disponibilidade
      Object.keys(disponibilidadeMes).forEach(mes => {
          disponibilidadeMes[mes] /= contagemPorMes[mes];
      });
  
      // Cálculo do OEE
      Object.keys(performanceMes).forEach(mes => {
          if (!oeeMes[mes]) {
              oeeMes[mes] = 0;
          }
  
          // Adicione aqui a lógica para calcular a Qualidade (Qualidade = 100 para fins de exemplo)
          const qualidade = 100;
  console.log(disponibilidadeMes)
          // Fórmula do OEE: OEE = Disponibilidade * Performance * Qualidade
          oeeMes[mes] = disponibilidadeMes[mes] * performanceMes[mes] * (qualidade / 100);
      });
  
      const sortedKeys = Object.keys(oeeMes).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  
      return {
          labels: sortedKeys,
          values: sortedKeys.map(mes => parseInt(oeeMes[mes]))
      };*/


    const oeeDiario = {};
    const performanceDiaria = {};
    const contagemPorDia = {};
    const disponibilidadeDiaria = {};
    const qualidadeDiaria = {};

    data.forEach(item => {
        const dia = item.dataHora.slice(8, 10);

        // Contagem de Performance
        if (!performanceDiaria[dia]) {
            performanceDiaria[dia] = 0;
            contagemPorDia[dia] = 0;
        }

        performanceDiaria[dia] += parseInt(item.percentual, 10);
        contagemPorDia[dia]++;

        // Cálculo de Disponibilidade
        if (!disponibilidadeDiaria[dia]) {
            disponibilidadeDiaria[dia] = 0;
        }

        // Considerando 8.8 horas disponíveis por dia
        const horasDisponiveisPorDia = 8.8;
        disponibilidadeDiaria[dia] += parseFloat(item.tempoTotalProducao, 10) / horasDisponiveisPorDia;

        // Cálculo de Qualidade
        // Adicione aqui a lógica para calcular a qualidade com base nas suas métricas

    });

    // Média de Performance
    Object.keys(performanceDiaria).forEach(dia => {
        performanceDiaria[dia] /= contagemPorDia[dia];
    });

    // Média de Disponibilidade
    Object.keys(disponibilidadeDiaria).forEach(dia => {
        disponibilidadeDiaria[dia] /= contagemPorDia[dia];
    });

    // Cálculo do OEE
    Object.keys(performanceDiaria).forEach(dia => {
        if (!oeeDiario[dia]) {
            oeeDiario[dia] = 0;
        }

        // Adicione aqui a lógica para calcular a Qualidade (Qualidade = 100 para fins de exemplo)
        const qualidade = 100;

        // Fórmula do OEE: OEE = Disponibilidade * Performance * Qualidade
        oeeDiario[dia] = disponibilidadeDiaria[dia] * performanceDiaria[dia] * (qualidade / 100);
    });

    const sortedKeys = Object.keys(oeeDiario).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

    return {
        labels: sortedKeys,
        values: sortedKeys.map(dia => parseInt(oeeDiario[dia]))
    };
}
//Garrafas diario
function getDataForGarrafasPorDia(data) {
    const garrafasPorDia = {};
    const pointDia = [];
    data.forEach(item => {
        const dia = item.dataHora.slice(8, 10);
        const operacao = item.operacao;
        //tooltip
        const nomeItem = item.itemCode;
        if (!pointDia[dia]) {
            pointDia[dia] = {};
        }
        if (!pointDia[dia][nomeItem]) {
            pointDia[dia][nomeItem] = '';
        }

        //tooltip
        /*
                if (!garrafasPorDia[dia]) {
                    garrafasPorDia[dia] = 0;
                }
                garrafasPorDia[dia] += parseInt(item.garrafa, 10);
        */
        //--------------------Garrafas------------------
        if (!garrafasPorDia[dia]) {
            garrafasPorDia[dia] = {
                envase: 0,
                degorgment: 0,
                rotulagem: 0
            };
        }
        if (operacao == 'envase') {
            garrafasPorDia[dia].envase += parseInt(item.garrafa);
            pointDia[dia][nomeItem] += `Envasadas: ${parseInt(item.garrafa, 10)}\n`;

        } else if (operacao == 'degorgment') {
            garrafasPorDia[dia].degorgment += parseInt(item.garrafa);
            pointDia[dia][nomeItem] += `Degorgadas: ${parseInt(item.garrafa, 10)}\n`;

        } else {
            garrafasPorDia[dia].rotulagem += parseInt(item.garrafa);
            pointDia[dia][nomeItem] += `Rotuladas: ${parseInt(item.garrafa, 10)}\n`;

        };
    });
    const sortedKeys = Object.keys(garrafasPorDia).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    const labelsItem = Object.keys(pointDia).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    const valuesItem = labelsItem.map(dia => pointDia[dia]);
    const garrafasRot = sortedKeys.map(dia => (garrafasPorDia[dia].rotulagem != '' ? garrafasPorDia[dia].rotulagem : ''));
    const garrafasEnv = sortedKeys.map(dia => (garrafasPorDia[dia].envase != '' ? garrafasPorDia[dia].envase : ''));
    const garrafasDeg = sortedKeys.map(dia => (garrafasPorDia[dia].degorgment != '' ? garrafasPorDia[dia].degorgment : ''));
    return {
        labels: sortedKeys,
        valuesRot: garrafasRot,
        valuesEnv: garrafasEnv,
        valuesDeg: garrafasDeg,
        itemValue: valuesItem,
    };
}
//Produtividade diario
function getDataForPercentualPorDia(data) {
    // Função para calcular a média acumulada
    function getAverageData(data) {
        const averageData = {};
        let acumulado = 0;

        data.labels.forEach(dia => {
            acumulado += data.values[data.labels.indexOf(dia)];
            averageData[dia] = parseInt(acumulado / (data.labels.indexOf(dia) + 1));
        });

        return {
            labels: data.labels,
            values: data.labels.map(dia => averageData[dia]),
        };
    }

    const percentualPorDia = {};
    const contagemPordia = {};
    const pointDia = [];
    const contagemPoint = {};
    data.forEach(item => {
        const dia = item.dataHora.slice(8, 10);
        //tooltip
        const nomeItem = item.itemCode;
        if (!pointDia[dia]) {
            pointDia[dia] = {};
        }
        if (!pointDia[dia][nomeItem]) {
            pointDia[dia][nomeItem] = 0;
            contagemPoint[dia] = 0;
        }
        pointDia[dia][nomeItem] += parseInt(item.percentual, 10);
        contagemPoint[dia]++;
        //tooltip
        if (!percentualPorDia[dia]) {
            percentualPorDia[dia] = 0;
            contagemPordia[dia] = 0;
        }

        percentualPorDia[dia] += item.percentual;
        contagemPordia[dia]++;
    });

    Object.keys(percentualPorDia).forEach(dia => {
        percentualPorDia[dia] /= contagemPordia[dia];
    });

    //tooltip
    Object.keys(pointDia).forEach(dia => {
        Object.keys(pointDia[dia]).forEach(nomeItem => {
            if (contagemPoint[dia] !== 0) {
                pointDia[dia][nomeItem] /= contagemPoint[dia];
            }
        });
    });
    //tooltip

    const sortedKeys = Object.keys(percentualPorDia).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    const labelsItem = Object.keys(pointDia).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    const valuesItem = labelsItem.map(dia => pointDia[dia]);

    //  valuesItem.reverse();
    const percentualPorDiaData = {
        labels: sortedKeys,
        values: sortedKeys.map(dia => parseInt(percentualPorDia[dia])),
        itemValue: valuesItem,
    };

    // Calcular a média acumulada
    const averageData = getAverageData(percentualPorDiaData);
    console.log("Produtividade acumulada(Mês selecionado): " + averageData.values[averageData.values.length - 1]);
    return {
        percentualPorDiaData,
        averageData,
    };
}
//Rendimento diario
function getDataForPercentualRendPorDia(data) {
    // Função para calcular a média acumulada
    function getAverageData(data) {
        const averageData = {};
        let acumulado = 0;

        data.labels.forEach(dia => {
            acumulado += data.values[data.labels.indexOf(dia)];
            averageData[dia] = parseInt(acumulado / (data.labels.indexOf(dia) + 1));
        });

        return {
            labels: data.labels,
            values: data.labels.map(dia => averageData[dia]),
        };
    }

    const percentualPorDia = {};
    const contagemPordia = {};
    const pointDia = [];
    const contagemPoint = {};
    data.forEach(item => {
        const dia = item.dataHora.slice(8, 10);
        //tooltip
        const nomeItem = item.itemCode;
        if (!pointDia[dia]) {
            pointDia[dia] = {};
        }
        if (!pointDia[dia][nomeItem]) {
            pointDia[dia][nomeItem] = 0;
            contagemPoint[dia] = 0;
        }
        pointDia[dia][nomeItem] += parseInt(item.percentualRendimento, 10);
        contagemPoint[dia]++;
        //tooltip
        if (!percentualPorDia[dia]) {
            percentualPorDia[dia] = 0;
            contagemPordia[dia] = 0;
        }

        percentualPorDia[dia] += item.percentualRendimento;
        contagemPordia[dia]++;
    });

    Object.keys(percentualPorDia).forEach(dia => {
        percentualPorDia[dia] /= contagemPordia[dia];
    });
    //tooltip
    Object.keys(pointDia).forEach(dia => {
        Object.keys(pointDia[dia]).forEach(nomeItem => {
            if (contagemPoint[dia] !== 0) {
                pointDia[dia][nomeItem] /= contagemPoint[dia];
            }
        });
    });
    //tooltip

    const sortedKeys = Object.keys(percentualPorDia).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    const labelsItem = Object.keys(pointDia).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    const valuesItem = labelsItem.map(dia => pointDia[dia]);


    //  valuesItem.reverse();
    const pRendPorDiaData = {
        labels: sortedKeys,
        values: sortedKeys.map(dia => parseInt(percentualPorDia[dia])),
        itemValue: valuesItem,
    };

    // Calcular a média acumulada
    const averageDataRend = getAverageData(pRendPorDiaData);
    console.log("Rendimento acumulada(Mês selecionado): " + averageDataRend.values[averageDataRend.values.length - 1]);
    return {
        pRendPorDiaData,
        averageDataRend,
    };
}
//minutos parados diario
function getDataForParadasPorDia(data) {
    const paradasPorDia = {};

    data.forEach(item => {
        /* const dia = item.dataHora.slice(8, 10);
 
         if (!paradasPorDia[dia]) {
             paradasPorDia[dia] = 0;
         }
 
         paradasPorDia[dia] += parseInt(item.tempoTotalParado, 10);*/
        const paradasArray = item.vetorParada.split(', ');
        const dia = item.dataHora.slice(8, 10);
        if (paradasArray != '') {
            for (let i = 0; i < paradasArray.length; i += 3) {

                const quantidade = parseInt(paradasArray[i], 10) || 0;
                const tempo = parseInt(paradasArray[i + 1], 10) || 0;
                const motivo = paradasArray[i + 2];
                if (motivo != 'REMUAGEM' && 'REUNIÃO' && 'TREINAMENTO') {
                    if (!paradasPorDia[dia]) {
                        paradasPorDia[dia] = 0;
                    }
                    paradasPorDia[dia] += quantidade * tempo;

                }

            }
        }
    });
    const sortedKeys = Object.keys(paradasPorDia).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

    return {
        labels: sortedKeys,
        values: sortedKeys.map(dia => paradasPorDia[dia]),
    };
}
//ocisiosidade diario
function getDataForOciosidadePorDia(data) {
    const tempoProdPorDia = {};
    const tempoTrabPadrao = 8.8;
    const horasRealizadas = {};
    const ordensProcessadas = {};

    data.forEach(item => {
        const dia = item.dataHora.slice(8, 10);
        const ordemNumero = item.ordemNumero;

        if (!tempoProdPorDia[dia]) {
            tempoProdPorDia[dia] = 0;
            horasRealizadas[dia] = 0;
            ordensProcessadas[dia] = new Set();
        }

        if (!ordensProcessadas[dia].has(ordemNumero)) {
            tempoProdPorDia[dia] += parseFloat(item.tempoTotalProducao, 10);
            ordensProcessadas[dia].add(ordemNumero);
        }

        horasRealizadas[dia] = parseInt(((tempoTrabPadrao - tempoProdPorDia[dia]) * 100) / tempoTrabPadrao);
    });

    const sortedKeys = Object.keys(horasRealizadas).sort((a, b) => a.localeCompare(b));

    return {
        labels: sortedKeys,
        values: sortedKeys.map(dia => horasRealizadas[dia]),
    };
}
/*
function agetDataForOciosidadePorDia(data) {
    const tempoProdPorDia = {};
    const tempoTrabPadrao = 8.48;
    const horasRealizadas = {};
    const ordensProcessadas = {};
    data.forEach(item => {
        const dia = item.dataHora.slice(8, 10);
        const ordem = item.operacao;
        const ordemNumero = item.ordemNumero;

        if (!tempoProdPorDia[dia]) {
            tempoProdPorDia[dia] = {};
            horasRealizadas[dia] = 0;
            ordensProcessadas[dia] = {};

        }
        if (!ordensProcessadas[dia][ordemNumero]) {
            ordensProcessadas[dia][ordemNumero] = new Set();
        }

        if (!ordensProcessadas[dia][ordemNumero].has(ordem)) {
            if (!tempoProdPorDia[dia][ordem]) {
                tempoProdPorDia[dia][ordem] = 0;
            }
            tempoProdPorDia[dia][ordem] += parseFloat(item.tempoTotalProducao, 10);
            ordensProcessadas[dia][ordemNumero].add(ordem);        
            horasRealizadas[dia] = parseInt(((tempoTrabPadrao - tempoProdPorDia[dia]) * 100) / tempoTrabPadrao);

        }
    });
    console.log(horasRealizadas);
    console.log(tempoProdPorDia);

    const sortedKeys = Object.keys(horasRealizadas).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

    return {
        labels: sortedKeys,
        values: sortedKeys.map(dia => horasRealizadas[dia]),
    };
}
*/
//infos diario
function funcInfo(data) {

    const itensContainer = document.getElementById("itensContainer");
    itensContainer.innerHTML = "";
    //span data dia selecionado
    const spanDataParada = document.getElementById('spanDataParada');
    const itemYear = document.getElementById("filterYear").value;
    const itemMonth = document.getElementById("filterMonth").value;
    const itemDay = document.getElementById("filterDay").value;
    var dataFormatada = `  ${itemDay}/${itemMonth}/${itemYear}`;
    spanDataParada.innerHTML = dataFormatada;

    if (data.length === 0) {
        document.getElementById("itensContainer").innerHTML = `DATA: ${itemDay}/${itemMonth}/${itemYear} sem dados !!`
        document.getElementById("btn-relatorio").style.display = "none";

    } else {
        document.getElementById("btn-relatorio").style.display = "block";
        document.getElementById("btn-relatorio").textContent = `Relatório ${dataFormatada}`;
    }
    const porOrdem = {};

    data.forEach(item => {
        const ordem = item.ordemNumero;
        const operacao = item.operacao;
        const nomeItem = item.itemCode;
        const hi = item.hi;
        const hf = item.hf;
        var horas = Math.floor(item.tempoTotalProducao);
        var minutos = Math.round((item.tempoTotalProducao - horas) * 60);
        var showTempoProducao = horas + "h" + minutos + "min"
        if (!porOrdem[ordem]) {
            porOrdem[ordem] = {};
        }
        if (!porOrdem[ordem][operacao]) {
            porOrdem[ordem][operacao] = {};
        }
        if (!porOrdem[ordem][operacao][nomeItem]) {
            porOrdem[ordem][operacao][nomeItem] = [];
        }
        porOrdem[ordem][operacao][nomeItem].push({ hi, hf, showTempoProducao });
    });

    for (const ordem in porOrdem) {
        if (porOrdem.hasOwnProperty(ordem)) {
            const ordemDiv = document.createElement("div");
            ordemDiv.classList.add("ordem");

            const ordemHeader = document.createElement("p");
            ordemHeader.textContent = `Ordem: ${ordem}`;


            for (const operacao in porOrdem[ordem]) {
                if (porOrdem[ordem].hasOwnProperty(operacao)) {

                    const operacaoDiv = document.createElement("div");
                    operacaoDiv.classList.add("operacao");

                    const operacaoHeader = document.createElement("p");
                    operacaoHeader.textContent = `Operação: ${operacao}`;


                    for (const nomeItem in porOrdem[ordem][operacao]) {
                        if (porOrdem[ordem][operacao].hasOwnProperty(nomeItem)) {
                            //console.log(`    Nome do Item: ${nomeItem}`);

                            const operacoes = porOrdem[ordem][operacao][nomeItem];
                            //console.log(`    Operações: ${JSON.stringify(operacoes)}`);

                            const nomeItemDiv = document.createElement("div");
                            nomeItemDiv.classList.add("nome-item");

                            const operacoesList = document.createElement("ul");
                            operacoes.forEach(op => {
                                const operacaoItem = document.createElement("li");
                                operacaoItem.textContent = `${operacao} ${nomeItem} Hi: ${op.hi} Hf: ${op.hf} Total: ${op.showTempoProducao}`;
                                operacoesList.appendChild(operacaoItem);
                            });
                            nomeItemDiv.appendChild(operacoesList);

                            operacaoDiv.appendChild(nomeItemDiv);
                        }
                    }
                    ordemDiv.appendChild(operacaoDiv);
                }
            }
            itensContainer.appendChild(ordemDiv);
        }
    }

}
// mostra tempo e quantidade total 
function geraisQuebraParadas(data) {

    const spanTempoParado = document.getElementById("spanTempoParado");
    spanTempoParado.innerHTML = "";
    const spanQuebraTotal = document.getElementById("spanQuebraTotal");
    spanQuebraTotal.innerHTML = "";
    const tempParado = {};
    var quebraData = {};
    data.forEach(item => {
        const dia = item.dataHora.slice(8, 10);
        if (!tempParado[dia]) {
            tempParado[dia] = 0;
        }
        tempParado[dia] += parseInt(item.tempoTotalParado, 10);

        //total quebras
        var quebras = item.vetorQuebra.split(', ');

        if (quebras != '') {
            for (var i = 0; i < quebras.length; i += 3) {
                var valor = parseInt(quebras[i]);
                if (!quebraData[dia]) {
                    quebraData[dia] = 0;
                }
                quebraData[dia] += valor;
            }

        }
    });

    var quebrasTotal = Object.keys(quebraData).map(dia => quebraData[dia])
    var tempoTotal = Object.keys(tempParado).map(dia => tempParado[dia]);

    spanQuebraTotal.innerHTML = `Total: ${quebrasTotal} un`;
    spanTempoParado.innerHTML = `Total: ${tempoTotal} min`;

}

//paradas dia selecionado
function getDataForParadasNoDiaSelect(data) {
    const paradasPorMotivo = {};

    data.forEach(item => {
        const paradasArray = item.vetorParada.split(', ');

        if (paradasArray != '') {
            for (let i = 0; i < paradasArray.length; i += 3) {

                const quantidade = parseInt(paradasArray[i], 10) || 0;
                const tempo = parseInt(paradasArray[i + 1], 10) || 0;
                const motivo = paradasArray[i + 2];
                // if (motivo!='REMUAGEM'){
                if (!paradasPorMotivo[motivo]) {
                    paradasPorMotivo[motivo] = 0;
                }
                paradasPorMotivo[motivo] += quantidade * tempo;

                // }

            }
        }
    });
    // Criando um array de objetos com label e total
    const sortedLabels = Object.keys(paradasPorMotivo).map(label => ({
        label,
        total: paradasPorMotivo[label]
    }));

    // Ordenando o array com base no total
    sortedLabels.sort((a, b) => b.total - a.total);

    // Obtendo as labels ordenadas
    const labels = sortedLabels.map(item => item.label);
    const values = sortedLabels.map(item => item.total);

    return {
        labels: labels,
        values: values,
    };
}
function getDataForParadasMotivosNoDiaSelect(data) {
    const paradasPorMotivo = {};
    let tempoTotalProducaoTotal = 0;

    data.forEach(item => {
        const paradasArray = item.vetorParada.split(', ');
        const tempoTotalProducao = parseFloat(item.tempoTotalParado) / 60 || 0;
        tempoTotalProducaoTotal += tempoTotalProducao;
        if (paradasArray == '') {
            //não faz nada
        } else {
            for (let i = 0; i < paradasArray.length; i += 3) {
                const quantidade = parseInt(paradasArray[i], 10) || 0;
                const tempo = parseInt(paradasArray[i + 1], 10) || 0;
                const motivo = paradasArray[i + 2];

                if (!paradasPorMotivo[motivo]) {
                    paradasPorMotivo[motivo] = 0;
                }

                // Converte o tempo de parada para horas
                const tempoEmHoras = (quantidade * tempo) / 60;

                // Adiciona o tempo de parada ao total do motivo
                paradasPorMotivo[motivo] += tempoEmHoras;

            }
        }
    });
    // Calcula a porcentagem de cada motivo em relação ao tempoTotalProducao
    const porcentagensPorMotivo = {};
    Object.keys(paradasPorMotivo).forEach(motivo => {
        const porcentagem = ((paradasPorMotivo[motivo] / tempoTotalProducaoTotal) * 100).toFixed(1);
        porcentagensPorMotivo[motivo] = porcentagem;
    });

    /* const labels = Object.keys(porcentagensPorMotivo);
     const values = labels.map(motivo => porcentagensPorMotivo[motivo]);*/
    // Criando um array de objetos com label e total
    const sortedLabels = Object.keys(porcentagensPorMotivo).map(label => ({
        label,
        total: porcentagensPorMotivo[label]
    }));

    // Ordenando o array com base no total
    sortedLabels.sort((a, b) => b.total - a.total);

    // Obtendo as labels ordenadas
    const labels = sortedLabels.map(item => item.label);
    const values = sortedLabels.map(item => item.total);
    return {
        labels: labels,
        values: values,
    };
}
//quebras dia original
/*
function getDataForQuebrasNoDiaSelect(data) {
    const quebrasPorMotivo = {};

    data.forEach(item => {
        const quebrasArray = item.vetorQuebra.split(', ');

        if (quebrasArray == '') {
            //não faz nada
        } else {
            for (let i = 0; i < quebrasArray.length; i += 3) {

                const quantidade = parseInt(quebrasArray[i], 10) || 0;
                const motivo = quebrasArray[i + 1];
                if (!quebrasPorMotivo[motivo]) {
                    quebrasPorMotivo[motivo] = 0;
                }
                quebrasPorMotivo[motivo] += quantidade;

            }
        }
    });

    const labels = Object.keys(quebrasPorMotivo);
    const values = labels.map(motivo => quebrasPorMotivo[motivo]);

    return {
        labels: labels,
        values: values,
    };

}
*/

function getDataForQuebrasNoDiaSelect(data) {
    //const quebrasPorMotivo = {};
    const quebraEmp = {};

    data.forEach(item => {
        const quebrasArray = item.vetorQuebra.split(', ');
        if (quebrasArray != '') {
            for (let i = 0; i < quebrasArray.length; i += 3) {

                const quantidade = parseInt(quebrasArray[i], 10) || 0;
                const ITEM = quebrasArray[i + 1];
                const motivo = quebrasArray[i + 2];
                /*if (!quebrasPorMotivo[ITEM]) {
                    quebrasPorMotivo[ITEM] = 0;
                }
                quebrasPorMotivo[ITEM] += quantidade;*/
                if (!quebraEmp[ITEM]) {
                    quebraEmp[ITEM] = {};
                }
                if (!quebraEmp[ITEM][motivo]) {
                    quebraEmp[ITEM][motivo] = 0;
                }
                quebraEmp[ITEM][motivo] += quantidade;

            }
        }
    });

    /*
        const labels = Object.keys(quebrasPorMotivo);
        labels.map(ITEM => quebrasPorMotivo[ITEM]);
    */

    //const labelEmp = Object.keys(quebraEmp);

    const sortedLabels = Object.keys(quebraEmp).map(label => ({
        label,
        total: Object.values(quebraEmp[label]).reduce((acc, cur) => acc + cur, 0)
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
        dataProc.push(quebraEmp[label]['PROCESSO'] || "");
        dataRet.push(quebraEmp[label]['RETIRADA'] || "");
        dataIns.push(quebraEmp[label]['INSUMO'] || "");
        dataMan.push(quebraEmp[label]['MANUTENCAO'] || "");
        dataReg.push(quebraEmp[label]['REGULAGEM'] || "");

    });

    return {
        labels: labels,
        values: {
            dataProc: dataProc,
            dataRet: dataRet,
            dataMan: dataMan,
            dataReg: dataReg,
            dataIns: dataIns
        },
    };

}


function getDataForQuebrasMotivosNoDiaSelect(data) {
    const quebrasPorMotivo = {};

    // Somar as quantidades para cada motivo
    data.forEach(item => {
        const quebrasArray = item.vetorQuebra.split(', ');
        if (quebrasArray == '') {
            //não faz nada
        } else {
            for (let i = 0; i < quebrasArray.length; i += 3) {
                const quantidade = parseInt(quebrasArray[i], 10) || 0;
                const motivo = quebrasArray[i + 2];

                if (!quebrasPorMotivo[motivo]) {
                    quebrasPorMotivo[motivo] = 0;
                }

                quebrasPorMotivo[motivo] += quantidade;
            }
        }

    });

    // Calcular a porcentagem para cada motivo
    const totalQuantidade = Object.values(quebrasPorMotivo).reduce((acc, val) => acc + val, 0);

    const porcentagensPorMotivo = {};
    Object.keys(quebrasPorMotivo).forEach(motivo => {
        const quantidade = quebrasPorMotivo[motivo];
        const porcentagem = ((quantidade / totalQuantidade) * 100).toFixed(1) || 0;
        porcentagensPorMotivo[motivo] = porcentagem;
    });

    // Retornar os resultados
    const labels = Object.keys(porcentagensPorMotivo);
    const values = labels.map(motivo => porcentagensPorMotivo[motivo]);

    return {
        labels: labels,
        values: values,
    };
}

//grafico acumulado diario
function createChartAcumulado(canvasId, chartType, chartLabel, labels, data, dataAverage, itemLabels, itemValues) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    Chart.getChart(ctx)?.destroy();

    const cor = data.map(value => (value < 80 ? 'red' : 'rgba(30,144,255,0.6)'));
    let delayed;
    new Chart(ctx, {
        type: chartType,
        data: {
            labels: labels,
            datasets: [
                {
                    type: 'line',
                    label: 'Média Acumulada',
                    data: dataAverage,
                    borderWidth: 2,
                    backgroundColor: 'yellow',
                    borderColor: 'yellow',
                    tension: 0.4,
                    fill: false,
                    pointRadius: 0,
                },
                {
                    type: 'bar',
                    label: chartLabel,
                    data: data,
                    backgroundColor: cor,
                    borderColor: cor,
                    borderWidth: 2,
                    tension: 0.4,
                    opacity: 0.1,
                }
            ]
        },
        plugins: [ChartDataLabels],
        options: {
            animation: {
                onComplete: () => {
                    delayed = true;
                },
                delay: (context) => {
                    let delay = 0;
                    if (context.type === 'data' && context.mode === 'default' && !delayed) {
                        delay = context.dataIndex * 150 + context.datasetIndex * 100;
                    }
                    return delay;
                },
            },
            onClick: function (event, elements) {
                if (canvasId === 'percentualRendPorDia' || canvasId === 'percentualPorDia') {
                    if (elements.length > 0) {
                        const dataIndex = elements[0].index;
                        const clickedLabel = labels[dataIndex];
                        document.getElementById('filterDay').value = clickedLabel;
                        fetchQueebrasParadas(clickedLabel);
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        beforeTitle: function (context) {
                            if (canvasId === 'percentualRendPorDia' || canvasId === 'percentualPorDia') {
                                return `Dia: ${context[0].label}`;
                            }
                        },
                        title: function (context) {
                            if (canvasId === 'percentualRendPorDia' || canvasId === 'percentualPorDia') {
                                const dataIndex = context[0].dataIndex;
                                const objeto = itemValues[dataIndex];
                                let resultado = "";

                                for (const chave in objeto) {
                                    if (objeto.hasOwnProperty(chave)) {
                                        resultado += `${chave}: ${objeto[chave]}%,\n`;
                                    }
                                }
                                resultado = resultado.slice(0, -2);
                                return `${resultado}`;
                            }

                        }
                    }
                },
                datalabels: {
                    color: "white",
                    font: {
                        size: 16,
                        weight: 'bold'
                    },

                    anchor: 'mid',
                    align: 'top',
                    clip: false,
                    clamp: false,
                },
                legend: {
                    position: 'top',
                    align: 'mid',
                    labels: {
                        color: "white",
                        font: {
                            size: 12
                        }
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: function (value, index, values) {
                            {
                                return value + "%";
                            }
                        },
                        font: {
                            size: 15
                        },
                        color: 'white',
                    },
                    max: canvasId === 'percentualPorMes' || canvasId === 'percentualRendPorMes' ? 120 : undefined,
                    beginAtZero: true,

                    grid: {
                        color: canvasId === 'percentualRendPorDia' || canvasId === 'percentualPorDia' || canvasId === 'percentualPorMes' || canvasId === 'percentualRendPorMes' ?
                            (context) => (context.tick.value === 80 ?
                                'red' : 'rgba(169, 169, 169, 0.4)') : 'rgba(169, 169, 169, 0.4)',
                        lineWidth: 2,
                    },
                },
                x: {
                    title: {
                        font: {
                            size: 15
                        },
                        color: 'white',
                        display: true,
                        text: canvasId === 'percentualPorDia' || canvasId === 'percentualRendPorDia' || canvasId === 'oeePorDia' ? "Dia" : "Mês",

                    },
                    ticks: {
                        font: {
                            size: 15,
                        },
                        color: 'white',
                    },
                    grid: {
                        display: false
                    }
                }

            }
        }
    });
}
//grafico normal diario
function createChart(canvasId, chartType, chartLabel, labels, data, itemValues) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    Chart.getChart(ctx)?.destroy();
    let delayed;
    new Chart(ctx, {
        type: chartType,
        data: {
            labels: labels,
            datasets: [
                {
                    label: chartLabel,
                    data: data,
                    borderWidth: 1,
                    tension: 0.4
                }
            ]
        },
        plugins: [ChartDataLabels],
        options: {
            animation: {
                onComplete: () => {
                    delayed = true;
                },
                delay: (context) => {
                    let delay = 0;
                    if (context.type === 'data' && context.mode === 'default' && !delayed) {
                        delay = context.dataIndex * 150 + context.datasetIndex * 100;
                    }
                    return delay;
                },
            },
            onClick: function (event, elements) {
                if (canvasId === 'garrafasPorDia') {
                    if (elements.length > 0) {
                        const dataIndex = elements[0].index;
                        const clickedLabel = labels[dataIndex];
                        document.getElementById('filterDay').value = clickedLabel;
                        fetchQueebrasParadas(clickedLabel);
                    }
                }

            },
            plugins: {
                tooltip: {
                    callbacks: {
                        beforeTitle: function (context) {
                            if (canvasId === 'garrafasPorDia') {
                                return `Dia: ${context[0].label}`;
                            }
                        },
                        title: function (context) {
                            if (canvasId === 'garrafasPorDia') {
                                const dataIndex = context[0].dataIndex;
                                const objeto = itemValues[dataIndex];
                                let resultado = "";

                                for (const chave in objeto) {
                                    if (objeto.hasOwnProperty(chave)) {
                                        resultado += `${chave}: ${objeto[chave]},\n`;
                                    }
                                }
                                resultado = resultado.slice(0, -2);
                                return `${resultado}`;

                            }
                        }
                    }
                },
                datalabels: {
                    display: canvasId !== 'garrafasPorDia',
                    color: "white",
                    font: {
                        size: 16,
                        weight: 'bold'

                    },
                    formatter: function (value, context) {
                        return value + (canvasId == 'quebraMotivoNoDiaSelect'
                            ||
                            canvasId == 'paradaMotivoNoDiaSelect' || canvasId === 'ociosidadePorDia' ? '%' : '');
                    },
                    anchor: 'mid',
                    align: 'mid',
                    clip: false,
                    clamp: true,
                },
                legend: {
                    labels: {
                        color: "white",
                        font: {
                            size: 12
                        }
                    }
                }
            },
            scales: {
                y: {
                    title: {
                        font: {
                            size: 14
                        },
                        color: 'white',
                        display: true,
                        text: canvasId === 'percentualPorDia' || canvasId === 'paradaMotivoNoDiaSelect' ||
                            canvasId === 'quebraMotivoNoDiaSelect' || canvasId === 'ociosidadePorDia' ? 'Percentual' : 'Quantidades',
                    },
                    ticks: {
                        font: {
                            size: 15
                        },
                        color: 'white',
                        callback:
                            function (value, index, values) {
                                if (canvasId === 'paradaMotivoNoDiaSelect' || canvasId === 'quebraMotivoNoDiaSelect' ||
                                    canvasId === 'ociosidadePorDia') {
                                    return value + "%";
                                } else {
                                    return value
                                }


                            }
                    },
                    max: canvasId === 'percentualPorDia' ? 120 : undefined,
                    beginAtZero: true,
                    grid: {
                        color: canvasId === 'percentualPorDia' ?
                            (context) => (context.tick.value === 80 ?
                                'red' : 'rgba(169, 169, 169, 0.4)') : 'rgba(169, 169, 169, 0.4)',
                        lineWidth: 2,
                        //display: canvasId !== 'quebraMotivoNoDiaSelect',
                    },
                    //display: !(canvasId === 'quebraMotivoNoDiaSelect'),
                },
                x: {
                    title: {
                        font: {
                            size: 16
                        },
                        color: 'white',
                        display: true,
                        text: canvasId === 'paradaNoDiaSelect' || canvasId === 'quebraNoDiaSelect' ||
                            canvasId === 'quebraMotivoNoDiaSelect' || canvasId === 'paradaMotivoNoDiaSelect' ?
                            'Itens' : 'Dia',

                    },
                    ticks: {
                        font: {
                            size: 14
                        },
                        color: 'white',
                    },
                    grid: {
                        display: false,
                        color: 'rgba(169, 169, 169, 0.4)',
                    },
                    //display: !(canvasId === 'quebraMotivoNoDiaSelect'),
                }

            }
        }
    });
}
function createChartGarrafas(canvasId, chartType, chartLabel, labels, data, itemValues, dataEnv, dataDeg) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    Chart.getChart(ctx)?.destroy();
    let delayed;
    new Chart(ctx, {
        type: chartType,
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Envasadas',
                    data: dataEnv,
                    borderWidth: 1,
                    tension: 0.4,
                    backgroundColor: 'orange',
                    borderColor: 'orange',
                    borderWidth: 2,
                    tension: 0.4,
                    opacity: 0.1,
                },
                {
                    label: 'Rotuladas',
                    data: data,
                    borderWidth: 1,
                    tension: 0.4,
                    backgroundColor: 'lightBlue',
                    borderColor: 'lightBlue',
                    borderWidth: 2,
                    tension: 0.4,
                    opacity: 0.1,
                },
                {
                    label: 'Degorgadas',
                    data: dataDeg,
                    borderWidth: 1,
                    tension: 0.4,
                    backgroundColor: 'lightGreen',
                    borderColor: 'lightGreen',
                    borderWidth: 2,
                    tension: 0.4,
                    opacity: 0.1,
                }
            ]
        },
        plugins: [ChartDataLabels],
        options: {
            animation: {
                onComplete: () => {
                    delayed = true;
                },
                delay: (context) => {
                    let delay = 0;
                    if (context.type === 'data' && context.mode === 'default' && !delayed) {
                        delay = context.dataIndex * 150 + context.datasetIndex * 100;
                    }
                    return delay;
                },
            },
            onClick: function (event, elements) {
                if (canvasId === 'garrafasPorDia') {
                    if (elements.length > 0) {
                        const dataIndex = elements[0].index;
                        const clickedLabel = labels[dataIndex];
                        document.getElementById('filterDay').value = clickedLabel;
                        fetchQueebrasParadas(clickedLabel);
                    }
                }

            },
            plugins: {
                tooltip: {
                    callbacks: {
                        beforeTitle: function (context) {
                            if (canvasId === 'garrafasPorDia') {
                                return `Dia: ${context[0].label}`;
                            }
                        },
                        title: function (context) {
                            if (canvasId === 'garrafasPorDia') {
                                const dataIndex = context[0].dataIndex;
                                const objeto = itemValues[dataIndex];
                                let resultado = "";

                                for (const chave in objeto) {
                                    if (objeto.hasOwnProperty(chave)) {
                                        resultado += `${chave}:\n ${objeto[chave]}`;
                                    }
                                }
                                resultado = resultado.slice(0, -2);
                                return `${resultado}`;

                            }
                        }
                    }
                },
                datalabels: {
                    display: canvasId !== 'garrafasPorDia',
                    color: "white",
                    font: {
                        size: 16,
                        weight: 'bold'

                    },
                    formatter: function (value, context) {
                        return value + (canvasId == 'quebraMotivoNoDiaSelect'
                            ||
                            canvasId == 'paradaMotivoNoDiaSelect' || canvasId === 'ociosidadePorDia' ? '%' : '');
                    },
                    anchor: 'mid',
                    align: 'mid',
                    clip: false,
                    clamp: true,
                },
                legend: {
                    labels: {
                        color: "white",
                        font: {
                            size: 12
                        }
                    }
                }
            },
            scales: {
                y: {
                    title: {
                        font: {
                            size: 14
                        },
                        color: 'white',
                        display: false,
                        text: canvasId === 'percentualPorDia' || canvasId === 'paradaMotivoNoDiaSelect' ||
                            canvasId === 'quebraMotivoNoDiaSelect' || canvasId === 'ociosidadePorDia' ? 'Percentual' : 'Quantidades',
                    },
                    ticks: {
                        maxTicksLimit: 7,
                        font: {
                            size: 15
                        },
                        color: 'white',
                        callback:
                            function (value, index, values) {
                                if (canvasId === 'paradaMotivoNoDiaSelect' || canvasId === 'quebraMotivoNoDiaSelect' ||
                                    canvasId === 'ociosidadePorDia') {
                                    return value + "%";
                                } else {
                                    return value
                                }


                            }
                    },
                    beginAtZero: true,
                    grid: {
                        color: 'gray',
                        lineWidth: 2,
                    },
                },
                x: {
                    title: {
                        font: {
                            size: 16
                        },
                        color: 'white',
                        display: true,
                        text: canvasId === 'paradaNoDiaSelect' || canvasId === 'quebraNoDiaSelect' ||
                            canvasId === 'quebraMotivoNoDiaSelect' || canvasId === 'paradaMotivoNoDiaSelect' ?
                            'Itens' : 'Dia',

                    },
                    ticks: {
                        font: {
                            size: 14
                        },
                        color: 'white',
                    },
                    grid: {
                        display: false,
                        color: 'rgba(169, 169, 169, 0.4)',
                    },
                    //display: !(canvasId === 'quebraMotivoNoDiaSelect'),
                }

            }
        }
    });
}
//grafico garrafas mensal
function createChartMes(canvasId, chartType, chartLabel, labels, data, itemValues, dataEnv, dataDeg) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    Chart.getChart(ctx)?.destroy();
    const monthLabels = labels.map(label => {
        const [year, month] = label.split('-');
        const monthIndex = parseInt(month, 10) - 1;
        const monthName = new Date(year, monthIndex, 1).toLocaleString('pt-BR', { month: 'short' });
        return `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)} `;

    });
    let delayed;
    new Chart(ctx, {
        type: chartType,
        data: {
            labels: monthLabels,
            datasets: [
                {
                    label: 'Envasadas',
                    data: dataEnv,
                    borderWidth: 1,
                    tension: 0.4,
                    backgroundColor: 'orange',
                    borderColor: 'orange',
                    borderWidth: 2,
                    tension: 0.4,
                    opacity: 0.1,
                },
                {
                    label: 'Rotuladas',
                    data: data,
                    borderWidth: 1,
                    tension: 0.4,
                    backgroundColor: 'lightBlue',
                    borderColor: 'lightBlue',
                    borderWidth: 2,
                    tension: 0.4,
                    opacity: 0.1,
                },
                {
                    label: 'Degorgadas',
                    data: dataDeg,
                    borderWidth: 1,
                    tension: 0.4,
                    backgroundColor: 'lightGreen',
                    borderColor: 'lightGreen',
                    borderWidth: 2,
                    tension: 0.4,
                    opacity: 0.1,
                }
            ]
        },
        plugins: [ChartDataLabels],
        options: {
            animation: {
                onComplete: () => {
                    delayed = true;
                },
                delay: (context) => {
                    let delay = 0;
                    if (context.type === 'data' && context.mode === 'default' && !delayed) {
                        delay = context.dataIndex * 150 + context.datasetIndex * 100;
                    }
                    return delay;
                },
            },
            onClick: function (event, elements) {
                if (canvasId === 'garrafasPorDia') {
                    if (elements.length > 0) {
                        const dataIndex = elements[0].index;
                        const clickedLabel = labels[dataIndex];
                        document.getElementById('filterDay').value = clickedLabel;
                        fetchQueebrasParadas(clickedLabel);
                    }
                }

            },
            plugins: {
                tooltip: {
                    callbacks: {
                        beforeTitle: function (context) {
                            if (canvasId === 'garrafasPorDia') {
                                return `Dia: ${context[0].label}`;
                            }
                        },
                        title: function (context) {
                            if (canvasId === 'garrafasPorDia') {
                                const dataIndex = context[0].dataIndex;
                                const objeto = itemValues[dataIndex];
                                let resultado = "";

                                for (const chave in objeto) {
                                    if (objeto.hasOwnProperty(chave)) {
                                        resultado += `${chave}: ${objeto[chave]},\n`;
                                    }
                                }
                                resultado = resultado.slice(0, -2);
                                return `${resultado}`;

                            }
                        }
                    }
                },
                datalabels: {
                    //display: canvasId !== 'garrafasPorDia',
                    display: false,
                    color: "white",
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    formatter: function (value, context) {
                        const formattedValue = value > 999 ? value.toLocaleString('pt-BR') : value;
                        return formattedValue
                    },
                    anchor: 'mid',
                    align: 'top',
                    clip: false,
                    clamp: false,
                },
                legend: {
                    labels: {
                        color: "white",
                        font: {
                            size: 12
                        }
                    }
                }
            },
            scales: {
                y: {
                    title: {
                        font: {
                            size: 14
                        },
                        color: 'white',
                        display: true,
                        // text: canvasId === 'percentualPorDia' ? 'Percentual' : 'Quantidades',
                    }, ticks: {
                        font: {
                            size: 15
                        },
                        color: 'white',
                    },
                    beginAtZero: true,
                    grid: {

                        color: canvasId === 'percentualPorDia' ?
                            (context) => (context.tick.value === 80 ?
                                'red' : 'rgba(169, 169, 169, 0.4)') : 'rgba(169, 169, 169, 0.4)',
                        lineWidth: 2,
                    },
                },
                x: {
                    title: {
                        font: {
                            size: 16
                        },
                        color: 'white',
                        display: true,
                        //text: 'Mês',
                    },
                    ticks: {
                        font: {
                            size: 14
                        },
                        color: 'white',
                    },
                    grid: {
                        display: false,
                        color: 'rgba(169, 169, 169, 0.4)',
                    }
                }

            }
        }
    });
}


//grafico quebras staked 
function createChartYstacked(canvasId, chartType, chartLabel, labels, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    Chart.getChart(ctx)?.destroy();

    new Chart(ctx, {
        type: chartType,
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Processo',
                    data: data.dataProc,
                    borderWidth: 1,
                    backgroundColor: 'rgb(77, 77, 77)',
                    borderColor: 'red'
                },
                {
                    label: 'Retirada',
                    data: data.dataRet,
                    borderWidth: 1,
                    backgroundColor: 'rgb(97, 97, 97)',
                    borderColor: 'yellow'
                },
                {
                    label: 'Insumo',
                    data: data.dataIns,
                    borderWidth: 1,
                    backgroundColor: 'rgb(150, 150, 150)',
                    borderColor: 'blue'
                },
                {
                    label: 'Manutenção',
                    data: data.dataMan,
                    borderWidth: 1,
                    backgroundColor: 'rgb(97, 97, 97)',
                    borderColor: 'green'
                },
                {
                    label: 'Regulagem',
                    data: data.dataReg,
                    borderWidth: 1,
                    backgroundColor: 'rgb(150, 150, 150)',
                    borderColor: 'orange'
                }
            ]
        },
        plugins: [ChartDataLabels],
        options: {
            //aspectRatio: 5,
            indexAxis: 'y',

            onClick: function (event, elements) {
                if (canvasId === 'aaaaaa') {
                    if (elements.length > 0) {
                        const dataIndex = elements[0].index;
                        const clickedLabel = labels[dataIndex];
                        document.getElementById('filterDay').value = clickedLabel;
                        fetchDataQualidade(clickedLabel);
                    }
                }

            },
            plugins: {

                datalabels: {
                    color: "white",
                    font: {
                        size: 16,
                    },
                    formatter: function (value, context) {
                        return value + (canvasId == 'quebraMotivoNoDiaSelect'
                            ||
                            canvasId == 'paradaMotivoNoDiaSelect' || canvasId == 'defXanaPorDia' ? '%' : '');
                    },
                    anchor: 'mid',
                    align: 'mid',
                    clip: false,
                    clamp: false,
                },
                legend: {
                    display: true,
                    labels: {
                        color: "white",
                        font: {
                            size: 12
                        }
                    }
                }
            },
            scales: {
                y: {
                    stacked: true,
                    title: {
                        font: {
                            size: 14
                        },
                        color: 'white',
                        display: false,
                        //text: canvasId === 'defXanaPorDia' ? 'Percentual' : 'Quantidades',
                    },
                    ticks: {
                        /*callback: function (value, index, values) {
                            {
                                return value + "%";
                            }
                        },*/
                        font: {
                            size: 15
                        },
                        color: 'white',
                    },
                    beginAtZero: true,
                    grid: {
                        display: false,
                        color: 'white',
                    },
                },
                x: {
                    stacked: true,
                    title: {
                        font: {
                            size: 16
                        },
                        color: 'white',
                        display: true,
                        text: 'Quantidade',

                    },
                    ticks: {
                        font: {
                            size: 15,
                        },
                        color: 'white',
                    },
                    grid: {
                        display: true,
                        color: 'white',
                    },
                }

            }
        }
    });
}
function createChartY(canvasId, chartType, chartLabel, labels, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    Chart.getChart(ctx)?.destroy();

    new Chart(ctx, {
        type: chartType,
        data: {
            labels: labels,
            datasets: [
                {
                    label: chartLabel,
                    data: data,
                    borderWidth: 1,
                    backgroundColor: 'rgb(77, 77, 77)',
                    borderColor: 'red'
                }
            ]
        },
        plugins: [ChartDataLabels],
        options: {
            //aspectRatio: 5,
            indexAxis: 'y',
            plugins: {
                datalabels: {
                    display: canvasId !== 'garrafasPorDia',
                    color: "white",
                    font: {
                        size: 16,
                        weight: 'bold'

                    },
                    formatter: function (value, context) {
                        return value + (canvasId == 'paradaNoDiaSelect' ? ' min' : '%');
                    },
                    anchor: 'mid',
                    align: 'end',
                    clip: false,
                    clamp: false,
                },
                legend: {
                    labels: {
                        color: "white",
                        font: {
                            size: 12
                        }
                    }
                }
            },
            scales: {
                y: {
                    title: {
                        font: {
                            size: 14
                        },
                        color: 'white',
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 14
                        },
                        color: 'white',

                    },
                    beginAtZero: true,
                    grid: {
                        display: false,
                        color: 'white',
                    },
                },
                x: {
                    title: {
                        font: {
                            size: 16
                        },
                        color: 'white',
                        display: true,
                        text: canvasId === 'paradaNoDiaSelect' || canvasId === 'quebraNoDiaSelect' ? 'Minutos' : 'Percentual',

                    },
                    ticks: {
                        callback: function (value, index, values) {
                            if (canvasId === 'paradaMotivoNoDiaSelect' || canvasId === 'quebraMotivoNoDiaSelect') {
                                return value + "%";
                            } else { return value }

                        },
                        font: {
                            size: 14
                        },
                        color: 'white',
                    },
                    grid: {
                        display: true,
                        color: 'white',
                    },
                    //display: !(canvasId === 'quebraMotivoNoDiaSelect'),
                }

            }
        }
    });
}

//grafico acumulado mensal
function createChartMesAcumulado(canvasId, chartType, chartLabel, labels, data, dataAverage, itemValues) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    Chart.getChart(ctx)?.destroy();
    var cor = data.map(value => (value < 80 ? 'red' : 'rgba(30,144,255,0.6)'));
    if(canvasId =='ociosidadePorMes'){
        var cor = data.map(value => (value > 30 ? 'red' : 'gray'));

    };
    const monthLabels = labels.map(label => {
        const [year, month] = label.split('-');
        const monthIndex = parseInt(month, 10) - 1; // Mês no JavaScript é baseado em zero (janeiro é 0)
        const monthName = new Date(year, monthIndex, 1).toLocaleString('pt-BR', { month: 'short' });
        return `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)} `;

    });
    let delayed;
    new Chart(ctx, {
        type: chartType,
        data: {
            labels: monthLabels,
            datasets: [
                {
                    type: 'line',
                    label: 'Média Acumulada',
                    data: dataAverage,
                    borderWidth: 2,
                    backgroundColor: 'yellow',
                    borderColor: 'yellow',
                    tension: 0.4,
                    fill: false,
                    pointRadius: 0,
                },
                {
                    type: 'bar',
                    label: chartLabel,
                    data: data,
                    backgroundColor: cor,
                    borderColor: cor,
                    borderWidth: 2,
                    tension: 0.4,
                    opacity: 0.1,
                }
            ]
        },
        plugins: [ChartDataLabels],
        options: {
            animation: {
                onComplete: () => {
                    delayed = true;
                },
                delay: (context) => {
                    let delay = 0;
                    if (context.type === 'data' && context.mode === 'default' && !delayed) {
                        delay = context.dataIndex * 150 + context.datasetIndex * 100;
                    }
                    return delay;
                },
            },
            onClick: function (event, elements) {
                if (canvasId === 'ociosidadePorMes' || canvasId === 'percentualRendPorMes' || canvasId === 'percentualPorMes') {
                    if (elements.length > 0) {
                        const dataIndex = elements[0].index;
                        const clickedLabel = labels[dataIndex];
                        const partes = clickedLabel.split('-');
                        const ano = partes[0];
                        const mes = partes[1];

                        document.getElementById('filterMonth').value = mes;
                        document.getElementById('filterYear').value = ano;
                        mensal();
                        fetchQueebrasParadas(clickedLabel);

                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        /* beforeTitle: function (context) {
                             if (canvasId === 'percentualRendPorMes' || canvasId === 'percentualPorMes') {
                              
                                 return `Mês: ${context[0].label}`;
                                
                             }
                         },*/
                        title: function (context) {
                            if (canvasId === 'percentualRendPorDia' || canvasId === 'percentualPorDia') {
                                const dataIndex = context[0].dataIndex;
                                const objeto = itemValues[dataIndex];
                                let resultado = "";

                                for (const chave in objeto) {
                                    if (objeto.hasOwnProperty(chave)) {
                                        resultado += `${chave}: ${objeto[chave]}%,\n`;
                                    }
                                }
                                resultado = resultado.slice(0, -2);
                                return `${resultado}`;
                            }

                        }
                    }
                },
                datalabels: {
                    color: "white",
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    formatter: function (value, context) {
                        return value + (canvasId == 'percentualPorMes'
                            ||
                            canvasId == 'percentualRendPorMes' || canvasId == 'ociosidadePorMes' ? '%' : '');
                    },
                    anchor: 'mid',
                    align: 'top',
                    clip: false,
                    clamp: false,
                },
                legend: {
                    position: 'top',
                    align: 'mid',
                    labels: {
                        color: "white",
                        font: {
                            size: 12
                        }
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: function (value, index, values) {
                            {
                                return value + "%";
                            }
                        },
                        font: {
                            size: 15
                        },
                        color: 'white',
                    },
                    beginAtZero: true,
                    grid: {
                        color: canvasId === 'percentualRendPorDia' || canvasId === 'percentualPorDia' || canvasId === 'percentualPorMes' || canvasId === 'percentualRendPorMes' ?
                            (context) => (context.tick.value === 80 ?
                                'red' : 'rgba(169, 169, 169, 0.4)') : 'rgba(169, 169, 169, 0.4)',
                        lineWidth: 2,
                    },
                },
                x: {
                    title: {
                        font: {
                            size: 15
                        },
                        color: 'white',
                        display: true,
                        text: "Mês",

                    },
                    ticks: {
                        font: {
                            size: 15,
                        },
                        color: 'white',
                    },
                    grid: {
                        display: false
                    }
                }

            }
        }
    });
}
//gastos gerais
function createChartMesGastos(canvasId, chartType, chartLabel, labels, data, dataAverage, valuespoint) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    Chart.getChart(ctx)?.destroy();
    const cor = data.map(value => (value < -5 ? 'gray' : 'red'));
    let delayed;
    new Chart(ctx, {
        type: chartType,
        data: {
            labels: labels,
            datasets: [
                {
                    type: 'line',
                    label: 'Média Acumulada',
                    data: dataAverage,
                    borderWidth: 2,
                    backgroundColor: 'yellow',
                    borderColor: 'yellow',
                    tension: 0.4,
                    fill: false,
                    pointRadius: 0,
                },
                {
                    type: 'bar',
                    label: chartLabel,
                    data: data,
                    backgroundColor: cor,
                    borderColor: cor,
                    borderWidth: 2,
                    tension: 0.4,
                    opacity: 0.1,
                }
            ]
        },
        plugins: [ChartDataLabels],
        options: {
            animation: {
                onComplete: () => {
                    delayed = true;
                },
                delay: (context) => {
                    let delay = 0;
                    if (context.type === 'data' && context.mode === 'default' && !delayed) {
                        delay = context.dataIndex * 150 + context.datasetIndex * 100;
                    }
                    return delay;
                },
            },
            plugins: {
                datalabels: {
                    color: "white",
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    formatter: function (value, context) {
                        return value + (canvasId == 'percentualPorMes'
                            ||
                            canvasId == 'gastosGeraisPorMes' ? '%' : '');
                    },
                    anchor: 'mid',
                    align: 'bottom',
                    clip: false,
                    clamp: false,
                },
                tooltip: {
                    //backgroundColor:'red',
                    padding: 12,
                    titleAlign: 'center',
                    titleSpacing: 5,
                    callbacks: {
                        beforeTitle: function (context) {
                            if (canvasId === 'gastosGeraisPorMes') {
                                return `Mês: ${context[0].label}`;
                            }
                        },
                        title: function (context) {
                            if (canvasId === 'gastosGeraisPorMes') {
                                const dataIndex = context[0].dataIndex;
                                const objeto = valuespoint[dataIndex];
                                let resultado = "";

                                for (const chave in objeto) {
                                    if (objeto.hasOwnProperty(chave)) {
                                        resultado += `${chave}: ${objeto[chave].toLocaleString('pt-BR')},\n`;
                                    }
                                }
                                resultado = resultado.slice(0, -2);
                                return `${resultado}`;
                            }

                        }
                    }
                },
                legend: {
                    position: 'top',
                    align: 'mid',
                    labels: {
                        color: "white",
                        font: {
                            size: 12

                        }
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: function (value, index, values) {
                            {
                                return value + "%";
                            }
                        },
                        font: {
                            size: 15
                        },
                        color: 'white',
                    },
                    beginAtZero: true,
                    grid: {
                        color: canvasId === 'gastosGeraisPorMes' ?
                            (context) => (context.tick.value === -5 ?
                                'red' : 'rgba(169, 169, 169, 0.4)') : 'rgba(169, 169, 169, 0.4)',
                        lineWidth: 2,
                    },
                },
                x: {
                    title: {
                        font: {
                            size: 15
                        },
                        color: 'white',
                        display: true,
                        text: "Mês",

                    },
                    ticks: {
                        font: {
                            size: 15,
                        },
                        color: 'white',
                    },
                    grid: {
                        display: false
                    }
                }

            }
        }
    });
}

//requisita as  informações do backend para preencher o gráficos mensais
var totGlobal;
function mensal() {
    var ano = document.getElementById("filterYear").value;

    const divsMensais = document.getElementsByClassName("grafico-container-mensal");
    const divsDiarios = document.getElementsByClassName("grafico-container");
    const parteDiaSelecionado = document.getElementById("parteDiaSelecionado");
    const mensalOcultar = document.getElementsByClassName("mensal-ocultar")[0];
    const mensalOcultar1 = document.getElementsByClassName("mensal-ocultar")[1];
    const titMensalDiario = document.getElementById("titulo-mensal-diario");
    for (const divMensal of divsMensais) {
        if (divMensal.style.display !== "none") {
            divMensal.style.display = "none";
            mensalOcultar.style.display = "none";
            mensalOcultar1.style.display = "none";

        } else {
            divMensal.style.display = "block";
            parteDiaSelecionado.style.display = 'none';
            mensalOcultar.style.display = "block";
            mensalOcultar1.style.display = "block";
            Plotly.Plots.resize(divTreemap);
            titMensalDiario.innerHTML="MENSAL";
        }
    }

    // Supondo que você quer iterar sobre todos os elementos diários
    for (const divDiario of divsDiarios) {
        if (divDiario.style.display !== "none") {
            divDiario.style.display = "none";
        } else {
            divDiario.style.display = "block";
            titMensalDiario.innerHTML="DIÁRIO";
        }
    }


    fetch('/garrafasMensal')
        .then(response => response.json())
        .then(data => {
            var garrafaDataMes = data;
            createChartMes('garrafasPorMes', 'bar', 'Garrafas', garrafaDataMes.labels, garrafaDataMes.valueRot, garrafaDataMes.itemValue, garrafaDataMes.valueEnv, garrafaDataMes.valueDeg);
        })
        .catch((error) => {
            console.log('Erro ao carregar dados:', error);
        });

    fetch('/prodMensal')
        .then(response => response.json())
        .then(data => {
            var prodDataMes = data.percentualPorMesData;
            var avProdDataMes = data.averageDataPmes;
            createChartMesAcumulado('percentualPorMes', 'bar', 'Produtividade', prodDataMes.labels, prodDataMes.values, avProdDataMes.values);

        })
        .catch((error) => {
            console.log('Erro ao carregar dados:', error);
        });


    fetch('/rendMensal')
        .then(response => response.json())
        .then(data => {
            var rendDataMes = data.percRendPorMesData;
            var avRendDataMes = data.aveRendDataPmes;
            createChartMesAcumulado('percentualRendPorMes', 'bar', 'Rendimento', rendDataMes.labels, rendDataMes.values, avRendDataMes.values);

        })
        .catch((error) => {
            console.log('Erro ao carregar dados:', error);
        });

    fetch('/ociosidadeMensal')
        .then(response => response.json())
        .then(data => {
            var ociDataMes = data.ociosidadePorMesData;
            var aveOciDataMes = data.averageDataOci;
            createChartMesAcumulado('ociosidadePorMes', 'bar', 'Ociosidade', ociDataMes.labels, ociDataMes.values, aveOciDataMes.values);

        })
        .catch((error) => {
            console.log('Erro ao carregar dados:', error);
        });

    fetch('/gastosGeraisMensal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({
            'ano': ano
        })
    })
        .then(response => response.json())
        .then(data => {
            var gastosGeraisData = data.geraisData;
            var averageGastosData = data.averageData;
            var valuesPoint = data.valuesPoint
            totGlobal = data.totais;
            console.log(gastosGeraisData.labels);
            createChartMesGastos('gastosGeraisPorMes', 'bar', 'Gastos', gastosGeraisData.labels, gastosGeraisData.values, averageGastosData.values, valuesPoint);

        })
        .catch((error) => {
            console.log('Erro ao carregar dados:', error);
        });

}


/*
let listaVisivel = false; // Variável para controlar o estado de visibilidade da lista
document.getElementById("btn-relatorio").addEventListener("click", function () {
    if (listaVisivel) {
        // Se a lista estiver visível, oculta-a
        document.getElementById("ul-result").style.display = "none";
        listaVisivel = false;
    } else {
        // Se a lista estiver oculta, exibe-a
        buscarDadosEmail();
        listaVisivel = true;
        document.getElementById("ul-result").style.display = "block";
    }
    console.log(listaVisivel);
});
function buscarDadosEmail() {
    fetch('bancoDeDados/dadosEmail.json')
        .then(response => response.json())
        .then(data => {
            EM = Object.keys(data[0]);
            exibirEmails(EM); // Chama a função para exibir os emails após carregar os dados
        })
        .catch(error => console.error('Erro ao carregar os dados:', error));
}
function exibirEmails(dadosEmail) {
    const ulResult = document.getElementById("ul-result");

    ulResult.innerHTML = ""; // Limpar a lista

    dadosEmail.forEach(email => {
        const li = document.createElement("li");
        li.textContent = JSON.stringify(email);

        const btnExcluir = document.createElement("button");
        btnExcluir.innerHTML = '<i class="material-icons">delete</i>';
        btnExcluir.onclick = function () {
            excluirEmail(email);
        };

        li.appendChild(btnExcluir);
        ulResult.appendChild(li);

    });
}
function adicionarEmail() {
    const novoEmail = document.getElementById("novo-email").value;
    const emailParaEditar = [];
    if (novoEmail) {
        fetch('bancoDeDados/dadosEmail.json')
            .then(response => response.json())
            .then(data => {
                EM = Object.keys(data[0]);
                EM.push(novoEmail); // Adiciona o novo email aos dados existentes
                exibirEmails(EM); // Exibe os emails atualizados
            })
            .catch(error => console.error('Erro ao carregar os dados:', error));

    }
}
function excluirEmail(email) {
    fetch('bancoDeDados/dadosEmail.json')
        .then(response => response.json())
        .then(data => {
            EM = Object.keys(data[0]);
            const indice = EM.indexOf(email);
            if (indice !== -1) {
                EM.splice(indice, 1); // Remove o email dos dados existentes
                exibirEmails(EM); // Exibe os emails atualizados
            }
        })
        .catch(error => console.error('Erro ao carregar os dados:', error));
}
*/


//relatório
function relatorio() {
    var anoRel = document.getElementById('filterYear').value;
    var mesRel = document.getElementById('filterMonth').value;
    var diaRel = document.getElementById('filterDay').value;
    var dataRel = `${anoRel}-${mesRel}-${diaRel}`;
    console.log("dataRel", dataRel);
    fetch('/relatorio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            'dataRel': dataRel
        })
    })
        .catch((error) => {
            console.log('Erro ao carregar dados:', error);
        });

    //Mudanças visuais
    var spanRel = document.getElementById("span-rel");
    spanRel.style.display = "block";
    let iconElement = document.createElement("i");
    iconElement.className = "fas fa-check fa-1x";
    iconElement.style.color = "green";
    let mensagemTexto = "Enviado ";
    spanRel.innerHTML = mensagemTexto;
    spanRel.appendChild(iconElement);
    const btnRel = document.getElementById("btn-relatorio");
    btnRel.style.backgroundColor = "green";
    setTimeout(function () {
        btnRel.style.backgroundColor = "white";
        spanRel.style.display = "none";
    }, 2000);
    //Mudanças visuais

}

//linha do tempo
function creatLinha(canvasId, chartType, chartLabel, labels, values, hf, hi) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    Chart.getChart(ctx)?.destroy();
    //------ Obtem o maior valor de HF-------
    const minutos = hf.map(horario => {
        const [hora, minuto] = horario.split(':').map(Number);
        return hora * 60 + minuto; // Convertendo para minutos
    });
    const indiceMaiorValor = minutos.indexOf(Math.max(...minutos));
    const maiorHorario = hf[indiceMaiorValor];
    //------ Obtem o maior valor de HF-------
    //------ Obtem o menor valor de HI-------
    const minutosHI = hi.map(horario => {
        const [hora, minuto] = horario.split(':').map(Number);
        return hora * 60 + minuto; // Convertendo para minutos
    });

    const indiceMenorValor = minutosHI.indexOf(Math.min(...minutosHI));
    const menorHorario = hi[indiceMenorValor];
    //------ Obtem o menor valor de HI-------
    new Chart(ctx, {
        type: chartType,
        data: {
            labels: labels,
            datasets: [{
                backgroundColor: 'white',
                label: chartLabel,
                data: values,
                barPercentage: 0.3,
            }]
        },
        options: {
            plugins: {

                legend: {
                    position: 'top',
                    align: 'mid',
                    labels: {
                        color: "white",
                        font: {
                            size: 15
                        }
                    }
                },
                tooltip: {
                    bodyFontSize: 16,
                    callbacks: {
                        beforeTitle: function (context) {
                            console.log(context);
                            context[0].formattedValue = null;
                            return `${context[0].label}`;
                        },
                        title: function (context) {
                            return `Período: ${context[0].raw.join(' as ')}`;
                        },
                        label: function (context) {
                            return null;
                        }
                    },

                }
            },
            indexAxis: 'y',
            aspectRatio: 3,

            scales: {
                x: {
                    stacked: true,
                    grid: {
                        display: true,
                        color: 'white'
                    },
                    type: 'time',
                    time: {
                        unit: 'minute',
                    },
                    min: menorHorario,
                    max: maiorHorario,
                    ticks: {
                        //maxTicksLimit: 30,
                        font: {
                            size: 14
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
                        color: 'white',
                    },
                }
            }
        }
    });
}
function enviardata(selectedYear, selectedMonth, selectedDay,) {
    var dataEnviar = { data: `${selectedYear}-${selectedMonth}-${selectedDay}` };
    fetch('/linhaTempo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataEnviar)
    })
        .then(response => response.json())
        .then(data => {
            var linha = data;
            creatLinha('linhaTempo', 'bar', 'Paradas', linha.labels, linha.values, linha.horaFinal, linha.horaInicial);
        })
        .catch((error) => {
            console.log('Erro ao carregar dados da linha do tempo:', error);
        });
}
//linha do tempo


//----------------gastos gerais-----------
const addDiv = document.getElementById("add-div");
addDiv.style.display = "none";
const ol = document.getElementById("ol-res");
function addGastos() {
    if (addDiv.style.display === 'none') {
        addDiv.style.display = 'block';
        document.getElementById("div-gastos").style.display = 'none';
    } else {
        addDiv.style.display = 'none';
        document.getElementById("div-gastos").style.display = 'block';

    }

    fetch('bancoDeDados/gastosGerais.json')
        .then(response => response.json())
        .then(data => {
            const liLegenda = document.createElement("li");
            liLegenda.style.display = 'flex';
            liLegenda.style.justifyContent = 'space-between';
            const p = document.createElement("p");
            p.textContent = "Mês";
            const pP = document.createElement("p");
            pP.textContent = "Planejado";
            const pR = document.createElement("p");
            pR.textContent = "Realizado";
            liLegenda.appendChild(p);
            liLegenda.appendChild(pP);
            liLegenda.appendChild(pR);
            ol.appendChild(liLegenda);

            for (let item in data) {
                for (let meses in data[item]) {
                    for (var i = 0; i < item.length; i++) {
                        const li = document.createElement("li");
                        li.style.backgroundColor = 'gray';
                        li.style.padding = '5px';
                        li.style.textAlign = 'center';
                        li.style.display = 'flex'; // Para alinhar os elementos na mesma linha
                        li.style.justifyContent = 'space-between'; // Para adicionar espaçamento igual entre os elementos


                        //------------mes--------
                        var mesText = document.createElement("span");
                        mesText.textContent = `${meses} - `;
                        if (data[item][meses].Planejado == undefined || data[item][meses].Realizado == undefined) {
                            continue
                        }
                        //---------planejado--------
                        var planejadoText = document.createElement("span");
                        planejadoText.textContent = `${(data[item][meses].Planejado).toLocaleString('pt-BR')}`;
                        //---------realizado------------
                        var realizadoText = document.createElement("span");
                        if (data[item][meses].Realizado > data[item][meses].Planejado) {
                            realizadoText.style.color = 'red';
                        }
                        //realizadoText.style.marginLeft = '5px';
                        realizadoText.textContent = `${(data[item][meses].Realizado).toLocaleString('pt-BR')}`;

                        mesText.style.marginRight = '5px';
                        planejadoText.style.marginRight = '5px';
                        realizadoText.style.marginRight = '5px';
                        //-------------Novo Planejado--------------
                        const nvV = document.createElement("input");
                        nvV.setAttribute("hidden", "true");
                        nvV.style.width = "120px"
                        nvV.style.textAlign = "center"
                        nvV.placeholder = "Novo Plan..";
                        nvV.type = "number";
                        nvV.name = "Checkbox" + meses;
                        const cbV = document.createElement("input");
                        cbV.setAttribute("hidden", "true");
                        cbV.type = "checkbox";
                        cbV.className = "planCheck";
                        cbV.onclick = function () {
                            if (nvV.value !== "") {
                                cbV.value = nvV.value
                            } else {
                                cbV.checked = false;
                                alert("Valor não suportado!!!")
                            }
                        };

                        const nvR = document.createElement("input");
                        nvR.setAttribute("hidden", "true");
                        nvR.style.width = "120px"
                        nvR.style.textAlign = "center"
                        nvR.placeholder = "Novo Real...";
                        nvR.type = "number";
                        nvR.name = "Checkbox" + meses;
                        const cbR = document.createElement("input");
                        cbR.setAttribute("hidden", "true");
                        cbR.type = "checkbox";
                        cbR.className = "realCheck";
                        cbR.onclick = function () {
                            if (nvR.value !== "") {
                                cbR.value = nvR.value
                            } else {
                                cbR.checked = false;
                                alert("Valor não suportado!!!")
                            }
                        };

                        li.appendChild(mesText);
                        li.appendChild(planejadoText);
                        li.appendChild(nvV);
                        li.appendChild(cbV);
                        li.appendChild(realizadoText);
                        li.appendChild(nvR);
                        li.appendChild(cbR);
                        // Botão de exclusão
                        //adicionarBotaoExclusao(li, codigo);
                        ol.appendChild(li);
                    }



                }
            }
            const liTotais = document.createElement("li");
            liTotais.style.display = 'flex';
            var ano = Object.keys(totGlobal.planejadoAnual);
            var planFormatado = (totGlobal.planejadoAnual[ano]).toLocaleString('pt-BR');
            var realFormatado = (totGlobal.realizadoAnual[ano]).toLocaleString('pt-BR');
            liTotais.textContent = (`Planejado Total: ${planFormatado} Realizado Total: ${realFormatado}`);
            ol.appendChild(liTotais);


        })
        .catch(error => console.error('Erro ao carregar os dados:', error));


}

function mostrar() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const checked = document.querySelectorAll('input[type="checkbox"]:checked');
    const novoItem = document.querySelectorAll('input[type="number"]');
    const btnSalvar = document.getElementById("btnSalvar");

    checkboxes.forEach(checkbox => {
        if (checkbox.hasAttribute("hidden")) {
            checkbox.removeAttribute("hidden");
            btnSalvar.style.display = "block";
        } else {
            checkbox.setAttribute("hidden", "true");
            btnSalvar.style.display = "none";
        }
    });
  
    novoItem.forEach(novo => {
        if (novo.hasAttribute("hidden")) {
            novo.removeAttribute("hidden");
        } else {
            novo.setAttribute("hidden", "true");
        }
    });
}
//função do botão salvar
function salvarGastosGerais() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    /* const itensParaEditar = [];
     const itensParaPessR = [];
     const itensParaPessE = [];
     const itensParaPessD = [];*/
    const planEditar = [];
    const realEditar = [];
    if (checkboxes == "checked") {
        alert("Nunhum check selecionado!!!")
    }
    checkboxes.forEach(checkbox => {
        if (checkbox.className === "planCheck") {
            const codigo = checkbox.parentNode.textContent.split(' - ')[0];
            const valor = checkbox.value;
            if (valor !== "") {
                planEditar.push({ "Mes": codigo, "Planejado": valor });
            }
        } else if (checkbox.className === "realCheck") {
            const codigo = checkbox.parentNode.textContent.split(' - ')[0];
            const valor = checkbox.value;
            if (valor !== "") {
                realEditar.push({ "Mes": codigo, "Realizado": valor });
            }
        }
    });

    fetch('/editarGastosGerais', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            plan: planEditar,
            real: realEditar
        })
    })
        .then(response => {
            if (response.ok) {
                console.log('Valores enviados com sucesso para edição.');
                location.reload();
            } else {
                console.error('Erro ao enviar valores para edição.');
            }
        })
        .catch(error => {
            console.error('Erro ao enviar valores para edição:', error);
        });

}
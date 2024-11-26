///socket\\\
var socket = io();
socket.on('data', function (data) {
  const contagemSplit = data.split('|');
  for (var i = 0; i < contagemSplit.length; i += 4) {

    var contagemRot = contagemSplit[i] + ' UN';
    var velocidadeRot = contagemSplit[i + 1];
    var contagemEnv = contagemSplit[i + 2] + ' UN';
    var velocidadeEnv = contagemSplit[i + 3];
    document.getElementById("sample").innerHTML = contagemRot;
    document.getElementById("sample2").innerHTML = velocidadeRot;
    document.getElementById("sample3").innerHTML = contagemEnv;
    document.getElementById("sample4").innerHTML = velocidadeEnv;
  }
  const cont = contagemSplit[0];
  const velo = contagemSplit[1];
  const contEnv = contagemSplit[2];
  const veloEnv = contagemSplit[3];
  fetchDadosRapidos(cont, velo, contEnv, veloEnv);
});

///MENU\\\
$(document).ready(function () {
  $('.list').addClass('hidden'); // Adiciona a classe hidden inicialmente
  $('.menu').on('click', function () {
    $('.list').toggleClass('hidden');
  });
});

document.addEventListener('DOMContentLoaded', () => {
  var cont = "Garrafas Rotuladas: 0 ";
  var velo = "Velocidade Rotuladora: 0 ";
  var contEnv = "Garrafas Envasadas: 0 ";
  var veloEnv = "Velocidade Envasadora: 0 ";

  fetchDadosRapidos(cont, velo, contEnv, veloEnv);
  fetchDataAndCreateCharts();
  setInitialDate();
  const reiniciarContagemBtn = document.getElementById('reiniciarContagemBtn');

  reiniciarContagemBtn.addEventListener('click', function () {
    socket.emit('reiniciarContagem');
  });

});

document.getElementById("btnApagarRapidos").addEventListener('click', () => {
  fetch('/apagarDadosRapidos', { method: 'post' })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro na requisição: ' + response.statusText);
      }
      return response.json(); // ou response.text(), dependendo do que seu servidor retorna
    })
    .then(data => {
      console.log('Dados apagados com sucesso:', data);
    })
    .catch(error => {
      console.error('Erro ao apagar dados:', error);
    });
  location.reload();
});
//filtra a data bruta em mes e ano
function filterDataByYearAndMonth(data, year, month) {
  return data.filter(item => {
    const itemYear = item.dataHora.slice(0, 4);
    const itemMonth = item.dataHora.slice(5, 7);
    return itemYear === year && itemMonth === month;
  });
}

///seta a data para o filtro\\\
function setInitialDate() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const yearSelect = document.getElementById('filterYear');
  const monthSelect = document.getElementById('filterMonth');
  yearSelect.value = yesterday.getFullYear().toString();
  monthSelect.value = (yesterday.getMonth() + 1).toString().padStart(2, '0');
}
//dados  rapidos
//----------------------------------ANDAMENTO----------------------------------------
function fetchDadosRapidos(cont, velo, contEnv, veloEnv) {
  var codeCerto;
  var ordemCerto;
  fetch('bancoDeDados/dadosRapidos.json')
    .then(response => response.json())
    .then(data => {
      const divGrafAnd = document.getElementById("divGrafAnd");
      const spanItemCode = document.getElementById("span-itemcode");
      const spanOrdem = document.getElementById("span-ordem");
      const spanDatahora = document.getElementById("span-datahora");
      if (data.length == 0) {
        divGrafAnd.style = "display: none;"
        spanItemCode.innerHTML = "N/A";
        spanOrdem.innerHTML = "N/A";
        spanDatahora.innerHTML = "N/A";
      } else {
        var newdate = new Date();
        var anoAt = newdate.getFullYear();
        var mesAt = ("0" + (newdate.getMonth() + 1)).slice(-2);
        var diaAt = ("0" + newdate.getDate()).slice(-2);
        var dataAtual = anoAt + "-" + mesAt + "-" + diaAt;
        var dataAtualFormatada = diaAt + "/" + mesAt + "/" + anoAt;
        let hasRotulagem = false;
        let hasEnvase = false;
        data.forEach(item => {
          const dataReq = item.dataHora;
          const code = item.codItem;
          const ordem = item.numOrdem;
          if (dataReq == dataAtual && item != '') {
            divGrafAnd.style = "display: block;"

            codeCerto = code;
            ordemCerto = ordem;
            spanItemCode.innerHTML = codeCerto;
            spanOrdem.innerHTML = ordemCerto;
            spanDatahora.innerHTML = dataAtualFormatada;

            if (item.operacao == "envase") {
              //document.getElementById("sample3").style.display = 'block';
              //document.getElementById("sample4").style.display = 'block';
            } else {
              // document.getElementById("sample3").style.display = 'none';
              // document.getElementById("sample4").style.display = 'none';
            }
            if (item.operacao == "rotulagem") {
              hasRotulagem = true;
            }
            if (item.operacao == "envase") {
              hasEnvase = true;
            }


          } else {
            divGrafAnd.style = "display: none;"
            spanItemCode.innerHTML = "N/A";
            spanOrdem.innerHTML = "N/A";
            spanDatahora.innerHTML = "N/A";
          }


        });

        if (hasEnvase == true && hasRotulagem == false) {
          const andamentoData = getAndamento(data, dataAtual, contEnv);
          if (andamentoData.percentAnd > 100) {
            chartAnd('grafAnd', 'pie', ['Andamento'], 'Andamento', '+100', 0);
          } else {
            chartAnd('grafAnd', 'pie', ['Andamento'], 'Andamento', andamentoData.percentAnd, andamentoData.qtdePendente);
          };
          document.getElementById("sample").style.display = 'none';
          document.getElementById("sample2").style.display = 'none';
          document.getElementById("sample3").style.display = 'block';
          document.getElementById("sample4").style.display = 'block';
        } else if (hasRotulagem == true) {
          const andamentoData = getAndamento(data, dataAtual, cont);
          if (andamentoData.percentAnd > 100) {
            chartAnd('grafAnd', 'pie', ['Andamento'], 'Andamento', '+100', 0);
          } else {
            chartAnd('grafAnd', 'pie', ['Andamento'], 'Andamento', andamentoData.percentAnd, andamentoData.qtdePendente);
          };
          document.getElementById("sample").style.display = 'block';
          document.getElementById("sample2").style.display = 'block';
          document.getElementById("sample3").style.display = 'none';
          document.getElementById("sample4").style.display = 'none';
        };
      }

    })
    .catch(error => console.error('Erro ao carregar os dados:', error));

}
function getAndamento(data, dataAtual, cont) {
  var contParts = cont.split(":");

  const numOrdem = document.getElementById("numOrdem");
  var percentAnd;
  var qtdePendente;
  data.forEach(item => {
    if (item.dataHora == dataAtual) {
      qtdePendente = (item.qtde - contParts[1]);
      percentAnd = (contParts[1] * 100) / item.qtde;
      numOrdem.innerHTML = item.numOrdem;
    }
  });
  return {
    percentAnd: parseInt(percentAnd),
    qtdePendente: qtdePendente
  }
}
function chartAnd(canvasId, chartType, chartLabel, labels, data, qtdePendente) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  Chart.getChart(ctx)?.destroy();
  
  const cor = 'green';
  const gray = 'rgba(169, 169, 169, 0.6)';
  const difProd = (100 - data);
  var qtde = parseInt(qtdePendente).toLocaleString('pt-BR');
  const centerTextLine = {
    id: 'centerTextLine',
    beforeDatasetsDraw(chart, args, plugins) {
      const { ctx, data } = chart;
      const xCenter = chart.getDatasetMeta(0).data[0].x;
      const yCenter = chart.getDatasetMeta(0).data[0].y;
      const radius = chart.getDatasetMeta(0).data[0].innerRadius;
      //console.log(radius);
      ctx.save();
      const fontSize = (radius / 7.2);
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      //ctx.fillText(`${data.datasets[0].data[0]}%`, xCenter, yCenter -(fontSize/2));
      ctx.fillText(`PENDENTE: ${qtde}GFS`, xCenter, (yCenter) - (fontSize / 2));
    }
  }
  new Chart(ctx, {
    type: chartType,
    data: {
      labels: chartLabel,
      datasets: [
        {
          label: labels,
          data: [data, difProd],
          backgroundColor: [cor, gray],
          borderWidth: 3,
          circumference: 180,
          rotation: 270,
          cutout: '65%'
        }
      ]
    },
    plugins: [ChartDataLabels, centerTextLine],
    options: {
      cutout: 20,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        datalabels: {
          color: "black",
          font: {
            size: 28,
            weight: 'bold'
          },
          formatter: function (value, context) {
            if (context.dataIndex == 0) {
              return value + (canvasId == 'grafAnd' ? '%' : '');
            } else {
              return '';
            }
          },
          anchor: 'center',
          align: 'center',
        },
        legend: {
          display: false,
          position: 'left',
          align: 'start',
          labels: {
            color: "white",
            font: {
              size: 18
            }
          }
        }
      },
    },

  });

}
function fetchDataAndCreateCharts() {
  fetch('bancoDeDados/dadosQuebrasParadas.json')
    .then(response => response.json())
    .then(data => {
      var mesesAbreviados = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Nov', 'Dez'];
      function abreviarMeses(numeroMes) {
        return mesesAbreviados[numeroMes - 1];
      }

      //Filtro de data    
      const selectedYear = document.getElementById('filterYear').value;
      const selectedMonth = document.getElementById('filterMonth').value;
      const filteredData = filterDataByYearAndMonth(data, selectedYear, selectedMonth);
      filteredData.sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));

      //Graficos diarios
      const { percentualPorDiaData, averageData } = getDataForPercentualPorDia(filteredData);
      const { pRendPorDiaData, averageDataRend } = getDataForPercentualRendPorDia(filteredData);
      createChartAcumulado('percentualPorDia', 'bar', 'Produtividade', percentualPorDiaData.labels, percentualPorDiaData.values, averageData.values);
      createChartAcumulado('percentualRendPorDia', 'bar', 'Rendimento', pRendPorDiaData.labels, pRendPorDiaData.values, averageDataRend.values);

      //Graficos mensais   
      const percentualPorMesData = FuncPercentualDoughnut(filteredData);
      const rendimentoPorMesData = FuncRendimentoDoughnut(filteredData);

      var nomesMesesPercentual = percentualPorMesData.percentualPorMesData.labels.map(function (numeroMes) { return abreviarMeses(numeroMes); });
      createChart('percentualPorMes', 'doughnut', 'Produtividade', nomesMesesPercentual, percentualPorMesData.percentualPorMesData.values, rendimentoPorMesData.percRendPorMesData.values);
      //var nomesMesesRendimento = rendimentoPorMesData.percRendPorMesData.labels.map(function (numeroMes) { return abreviarMeses(numeroMes); });
      //createChart('percentualRendPorMes', 'doughnut', 'Rendimento', nomesMesesRendimento, rendimentoPorMesData.percRendPorMesData.values);
      var p = percentualPorMesData.percentualPorMesData.values;
      var r = rendimentoPorMesData.percRendPorMesData.values;
      if (r > 100 && p > 100) {
        createChart('percentualPorMes', 'doughnut', 'Produtividade', nomesMesesPercentual, "+100", "+100");
      } else if (p > 100 && r < 100) {
        createChart('percentualPorMes', 'doughnut', 'Produtividade', nomesMesesPercentual, "+100", rendimentoPorMesData.percRendPorMesData.values);
      } else if (p < 100 && r > 100) {
        createChart('percentualPorMes', 'doughnut', 'Produtividade', nomesMesesPercentual, percentualPorMesData.percentualPorMesData.values, "+100");
      }
      document.getElementById("spanMes").innerHTML = nomesMesesPercentual
    })
    .catch(error => console.error('Erro ao carregar os dados:', error));
}
document.getElementById('filterYear').addEventListener('change', fetchDataAndCreateCharts);
document.getElementById('filterMonth').addEventListener('change', fetchDataAndCreateCharts);

//Produtividade
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
  data.forEach(item => {
    const dia = item.dataHora.slice(8, 10);
    //tooltip
    const nomeItem = item.itemCode;
    if (!pointDia[dia]) {
      pointDia[dia] = {};
    }
    if (!pointDia[dia][nomeItem]) {
      pointDia[dia][nomeItem] = 0;
    }
    pointDia[dia][nomeItem] += (item.percentual, 10);
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
function FuncPercentualDoughnut(data) {
  // Função para calcular a média acumulada
  function getAverageData(data) {
    const averageDataPmes = {};
    let acumulado = 0;

    data.labels.forEach(mes => {
      acumulado += data.values[data.labels.indexOf(mes)];
      averageDataPmes[mes] = Math.round(acumulado / (data.labels.indexOf(mes) + 1));
    });

    return {
      labels: data.labels,
      values: data.labels.map(mes => parseInt(averageDataPmes[mes])),
    };
  }

  const percentualPorMes = {};
  const contagemPorMes = {};

  data.forEach(item => {
    const mes = item.dataHora.slice(5, 7);
    const dia = item.dataHora.slice(0, 10);

    if (!percentualPorMes[mes]) {
      percentualPorMes[mes] = {};
      contagemPorMes[mes] = {};
    }

    if (!percentualPorMes[mes][dia]) {
      percentualPorMes[mes][dia] = 0;
      contagemPorMes[mes][dia] = 0;
    }

    percentualPorMes[mes][dia] += parseInt(item.percentual, 10);
    contagemPorMes[mes][dia]++;
  });

  // Calcula a média de cada dia dentro do mês
  Object.keys(percentualPorMes).forEach(mes => {
    Object.keys(percentualPorMes[mes]).forEach(dia => {
      percentualPorMes[mes][dia] /= contagemPorMes[mes][dia];
    });
  });

  // Calcula a média dos dias diferentes dentro do mês
  Object.keys(percentualPorMes).forEach(mes => {
    let totalPercentual = 0;
    let totalDias = 0;

    Object.keys(percentualPorMes[mes]).forEach(dia => {
      totalPercentual += percentualPorMes[mes][dia];
      totalDias++;
    });

    percentualPorMes[mes] = totalPercentual / totalDias;
  });

  const sortedKeys = Object.keys(percentualPorMes).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  const percentualPorMesData = {
    labels: sortedKeys,
    values: sortedKeys.map(mes => parseInt(percentualPorMes[mes])),
  };
  const corMeta = document.getElementById("meta");
  if (percentualPorMesData.values < 80) {
    corMeta.style.color = 'red';
  } else {
    corMeta.style.color = 'inherit';
  }

  // Calcular a média acumulada
  const averageDataPmes = getAverageData(percentualPorMesData);

  return {
    percentualPorMesData,
    averageDataPmes,
  };
}
//Rendimento
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
  data.forEach(item => {
    const dia = item.dataHora.slice(8, 10);
    //tooltip
    const nomeItem = item.itemCode;
    if (!pointDia[dia]) {
      pointDia[dia] = {};
    }
    if (!pointDia[dia][nomeItem]) {
      pointDia[dia][nomeItem] = 0;
    }
    pointDia[dia][nomeItem] += (item.percentualRendimento, 10);
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
function FuncRendimentoDoughnut(data) {
  // Função para calcular a média acumulada
  function getAverageData(data) {
    const averageDataPmes = {};
    let acumulado = 0;

    data.labels.forEach(mes => {
      acumulado += data.values[data.labels.indexOf(mes)];
      averageDataPmes[mes] = Math.round(acumulado / (data.labels.indexOf(mes) + 1));
    });

    return {
      labels: data.labels,
      values: data.labels.map(mes => parseInt(averageDataPmes[mes])),
    };
  }

  const percentualPorMes = {};
  const contagemPorMes = {};

  data.forEach(item => {
    const mes = item.dataHora.slice(5, 7);
    const dia = item.dataHora.slice(0, 10);

    if (!percentualPorMes[mes]) {
      percentualPorMes[mes] = {};
      contagemPorMes[mes] = {};
    }

    if (!percentualPorMes[mes][dia]) {
      percentualPorMes[mes][dia] = 0;
      contagemPorMes[mes][dia] = 0;
    }

    percentualPorMes[mes][dia] += parseInt(item.percentualRendimento, 10);
    contagemPorMes[mes][dia]++;
  });

  // Calcula a média de cada dia dentro do mês
  Object.keys(percentualPorMes).forEach(mes => {
    Object.keys(percentualPorMes[mes]).forEach(dia => {
      percentualPorMes[mes][dia] /= contagemPorMes[mes][dia];
    });
  });

  // Calcula a média dos dias diferentes dentro do mês
  Object.keys(percentualPorMes).forEach(mes => {
    let totalPercentual = 0;
    let totalDias = 0;

    Object.keys(percentualPorMes[mes]).forEach(dia => {
      totalPercentual += percentualPorMes[mes][dia];
      totalDias++;
    });

    percentualPorMes[mes] = totalPercentual / totalDias;
  });

  const sortedKeys = Object.keys(percentualPorMes).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  const percRendPorMesData = {
    labels: sortedKeys,
    values: sortedKeys.map(mes => parseInt(percentualPorMes[mes])),
  };
  const corMeta2 = document.getElementById("meta2");
  if (percRendPorMesData.values < 80) {
    corMeta2.style.color = 'red';
  } else {
    corMeta2.style.color = 'inherit';
  }
  // Calcular a média acumulada
  const aveRendDataPmes = getAverageData(percRendPorMesData);


  return {
    percRendPorMesData,
    aveRendDataPmes,
  };
}

//grafico acumulado diario
function createChartAcumulado(canvasId, chartType, chartLabel, labels, data, dataAverage) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  Chart.getChart(ctx)?.destroy();

  const cor = data.map(value => (value < 80 ? 'red' : '#007BFF'));
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
      responsive: true,
      plugins: {
        datalabels: {
          display: false,
          color: "white",
          font: {
            size: 20,
          },
          formatter: function (value, context) {
            return value + (canvasId == 'percentualPorDia'
              ||
              canvasId == 'percentualRendPorDia' ? '%' : '');
          },
          anchor: 'mid',
          align: 'mid',
          clip: false,
          clamp: false,
        },
        legend: {
          position: 'top',
          align: 'mid',
          labels: {
            color: "white",
            font: {
              size: 15

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
            text: canvasId === 'percentualPorDia' || canvasId === 'percentualRendPorDia' ? "Dia" : "Mês",

          },
          ticks: {
            font: {
              size: 15,
            },
            color: 'white',
          },
          grid: {
            display: true,
            color: 'rgba(169, 169, 169, 0.4)'
          }
        }

      }
    }
  });
}
//grafico donut
/*
function createChart(canvasId, chartType, chartLabel, labels, data) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  Chart.getChart(ctx)?.destroy();
  const cor = data < 80 ? 'red' : '#007BFF';
  const gray = 'rgba(169, 169, 169, 0.6)';
  const diferenca = (100 - data);
  new Chart(ctx, {
    type: chartType,
    data: {
      labels: labels,
      datasets: [{
        label: chartLabel,ChartDataLabels
        data: [data, diferenca],
        backgroundColor: [cor, gray],
        borderWidth: 3,
        circumference:180,
        rotation:270,
        cutout:'50%'
      }]
    },
    plugins: [ChartDataLabels],
    options: {
      cutout: 20,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        datalabels: {
          color: "black",
          font: {
            size: 28,
            weight:'bold'
          },
          formatter: function (value, context) {
            if (context.dataIndex === 0 && context.datasetIndex === 0) {
              return value + (canvasId == 'percentualPorMes'
              ||
              canvasId == 'percentualRendPorMes' ? '%' : '');
            } else {
              return ''; 
            }
          },
          anchor: 'mid',
          align: 'mid',
          clip: false,
          clamp: false,
        },
        legend: {
          position: 'left',
          align: 'start',
          labels: {
            color: "white",
            font: {
              size: 18
            }
          }
        }
      },
    },

  });
}
*/
function createChart(canvasId, chartType, chartLabel, labels, data, dataRend) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  Chart.getChart(ctx)?.destroy();
  const corP = data < 80 ? 'red' : '#007BFF';
  const corR = dataRend < 80 ? 'red' : '#007BFF';

  const gray = 'rgba(169, 169, 169, 0.6)';
  const difProd = (100 - data);
  const difRend = (100 - dataRend);
  const centerTextLine = {
    id: 'centerTextLine',
    beforeDatasetsDraw(chart, args, plugins) {
      const { ctx, data } = chart;
      const xCenter = chart.getDatasetMeta(0).data[0].x;
      const yCenter = chart.getDatasetMeta(0).data[0].y;
      const radius = chart.getDatasetMeta(0).data[0].innerRadius;
      var meta = 80;
      //console.log(radius);
      ctx.save();
      const fontSize = (radius / 7.5);
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      //ctx.fillText(`${data.datasets[0].data[0]}%`, xCenter, yCenter -(fontSize/2));

      ctx.fillText(`META ${meta}%`, xCenter, yCenter - (fontSize / 2));
      ctx.fillText(`RENDIMENTO`, xCenter, (yCenter - 40) - (fontSize / 2));
    }
  }
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Produtividade',
          data: [data, difProd],
          backgroundColor: [corP, gray],
          borderWidth: 3,
          circumference: 180,
          rotation: 270,
          cutout: '50%'
        },
        {
          label: 'Rendimento',
          data: [dataRend, difRend],
          backgroundColor: [corR, gray],
          borderWidth: 3,
          circumference: 180,
          rotation: 270,
          cutout: '50%'
        }
      ]
    },
    plugins: [ChartDataLabels, centerTextLine],
    options: {
      cutout: 20,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        datalabels: {
          color: "black",
          font: {
            size: 28,
            weight: 'bold'
          },
          formatter: function (value, context) {
            if (context.dataIndex == 0) {
              return value + (canvasId == 'percentualPorMes'
                ||
                canvasId == 'percentualRendPorMes' ? '%' : '');
            } else {
              return '';
            }
          },
          anchor: 'center',
          align: 'center',
        },
        legend: {
          display: false,
          position: 'left',
          align: 'start',
          labels: {
            color: "white",
            font: {
              size: 18
            }
          }
        }
      },
    },

  });
}


//-----------------Monitor--------------------
function btnCantoDireito() {
  const divGraf = document.getElementsByClassName("div-graf")[0];
  const divMonit = document.getElementsByClassName("div-monit")[0];
  if (divMonit.style.display == 'none') {
    divGraf.style.display = 'none';
    divMonit.style.display = 'block';
    fetchDataMonitor();
  } else {
    divMonit.style.display = 'none';
    divGraf.style.display = 'block';
  }


}
function fetchDataMonitor() {
  fetch('bancoDeDados/monitoramento.json')
    .then(response => response.json())
    .then(data => {

      const monitorData = getDataForMonitor(data);
      ChartMonitor('graf-monitor', 'line', 'Monitoramento', monitorData.labels, monitorData.values);
      console.log("monitor:", monitorData.labels, monitorData.values);
    })
    .catch(error => console.error('Erro ao carregar os dados:', error));
}
function getDataForMonitor(data) {
  //const objMonitor = {};
  const labels = [];
  const valuesVelo = [];
  const valuesVeloEnv = [];
  data.forEach(item => {

    const time = item.time;
    const velodata = (item.dados).split('|');
    const velo = velodata[1].slice(23, 28);
    const veloEnv = velodata[3].slice(23, 28);
    /*
     for (var i = 0; i < velodata.length; i += 4) {

      var contagemRot = velodata[i] + ' UN';
      var velocidadeRot = velodata[i + 1];
      var contagemEnv = velodata[i + 2] + ' UN';
      var velocidadeEnv = velodata[i + 3];

     }
    if (!objMonitor[time]) {
      objMonitor[time] = velo;
    }*/
    labels.push(time);
    valuesVelo.push(velo);
    valuesVeloEnv.push(veloEnv);
  });
  //const sortedKeys = Object.keys(objMonitor).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  //  valuesItem.reverse();
  /*return {
    labels: sortedKeys,
    values: sortedKeys.map(time => parseFloat(objMonitor[time])),
  };*/
  return {
    labels: labels,
    values: [valuesVelo, valuesVeloEnv]
  };

}
function ChartMonitor(canvasId, chartType, chartLabel, labels, values) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  Chart.getChart(ctx)?.destroy();

  const formatLabel = labels.map(label => {
    const [hora, minuto, segundo] = label.split(":");
    return hora + ":" + minuto;
  });

  new Chart(ctx, {
    type: chartType,
    data: {
      labels: formatLabel,
      /*datasets: [{
        backgroundColor: 'white',
        label: chartLabel,
        data: values,
        tension: 0.2,
        borderWidth: 1,
        borderColor: 'white',
        pointRadius: 1,
      }]*/
      datasets: [{
        label: 'Rotuladora',
        data: values[0],
        tension: 0.2,
        borderWidth: 1,
        borderColor: 'white',
        backgroundColor: 'white',
        pointRadius: 1,
      }, {
        label: 'Envasadora',
        data: values[1],
        tension: 0.2,
        borderWidth: 1,
        borderColor: 'lightcoral',
        backgroundColor: 'lightcoral',
        pointRadius: 1,
      }]
    },
    options: {
      plugins: {
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
      aspectRatio: 16 / 9,
      scales: {
        x: {
          grid: {
            display: true,
            color: 'gray'
          },
          ticks: {
            maxTicksLimit: 25,
            font: {
              size: 12
            },
            color: 'white',
          },
        },
        y: {
          grid: {
            display: true,
            color: 'gray'
          },
          ticks: {
            font: {
              size: 12
            },
            color: 'white',
          },
        }
      }
    }
  });

}
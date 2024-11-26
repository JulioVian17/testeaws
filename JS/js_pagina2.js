/*///data e horario\\\

function atualizarHora() {
  var spanDataHora = document.getElementById("span-hora");
  var dataAtual = new Date();
  var dia = String(dataAtual.getDate()).padStart(2, '0');
  var mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
  var ano = dataAtual.getFullYear();
  var hora = String(dataAtual.getHours()).padStart(2, '0');
  var minutos = String(dataAtual.getMinutes()).padStart(2, '0');
  var dataHoraFormatada = `${dia}/${mes}/${ano}--${hora}:${minutos}`;
  spanDataHora.innerHTML = dataHoraFormatada;
}
atualizarHora();
setInterval(atualizarHora, 30000);
///data e horario\\\*/

///socket\\\
var socket = io();
socket.on('data', function (data) {
  document.getElementById("sample").innerHTML = data;
});
///socket\\\

document.addEventListener('DOMContentLoaded', () => {
  fetchDataAndCreateCharts();
  setInitialDate();
  const reiniciarContagemBtn = document.getElementById('reiniciarContagemBtn');

  reiniciarContagemBtn.addEventListener('click', function () {
    socket.emit('reiniciarContagem');
    console.log("Conategem Reiniciada!");
  });

});

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

function fetchDataAndCreateCharts() {
  fetch('bancoDeDados/dadosQuebrasParadas.json')
    .then(response => response.json())
    .then(data => {
      var mesesAbreviados = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      function abreviarMeses(numeroMes) {
        return mesesAbreviados[numeroMes - 1];
      }
      const garrafasPorMesData = getDataForGarrafasPorMes(data);
      const { percentualPorMesData, averageDataPmes} = getDataForPercentualPorMes(data);
      const { percentualRendPorMesData, averageDataRmes} = getDataForPercentualRendPorMes(data);
      const { ociosidadePorMesData, averageDataOci } = getDataForOciosidadePorMes(data);
      var nomesMesesPercentual = percentualPorMesData.labels.map(function (numeroMes) {
        return abreviarMeses(numeroMes);
      });
      var nomesMesesGarrafas = garrafasPorMesData.labels.map(function (numeroMes) {
        return abreviarMeses(numeroMes);
      });
      var nomesMesesOciosidade = ociosidadePorMesData.labels.map(function (numeroMes) {
        return abreviarMeses(numeroMes);
      });
      var nomesMesesRendimento = percentualRendPorMesData.labels.map(function (numeroMes) {
        return abreviarMeses(numeroMes);
      });
      createChart('garrafasPorMes', 'bar', 'Garrafas', nomesMesesGarrafas, garrafasPorMesData.values);
      createChartAcumulado('percentualPorMes', 'bar', 'Produtividade', nomesMesesPercentual, percentualPorMesData.values, averageDataPmes.values);
      createChartAcumulado('percentualRendPorMes', 'bar', 'Rendimento', nomesMesesRendimento, percentualRendPorMesData.values, averageDataRmes.values);
      createChartAcumulado('ociosidadePorMes', 'bar', 'Ociosidade', nomesMesesOciosidade, ociosidadePorMesData.values, averageDataOci.values);
      const selectedYear = document.getElementById('filterYear').value;
      const selectedMonth = document.getElementById('filterMonth').value;

      const filteredData = filterDataByYearAndMonth(data, selectedYear, selectedMonth);
      filteredData.sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));
      const garrafasPorDiaData = getDataForGarrafasPorDia(filteredData);
      const { percentualPorDiaData, averageData } = getDataForPercentualPorDia(filteredData);
      const { pRendPorDiaData, averageDataRend } = getDataForPercentualRendPorDia(filteredData);
      const ociosidadePorDia = getDataForOciosidadePorDia(filteredData);

      createChart('garrafasPorDia', 'bar', 'Garrafas', garrafasPorDiaData.labels, garrafasPorDiaData.values);
      createChartAcumulado('percentualPorDia', 'bar', 'Produtividade', percentualPorDiaData.labels, percentualPorDiaData.values, averageData.values);
      createChartAcumulado('percentualRendPorDia', 'bar', 'Rendimento', pRendPorDiaData.labels, pRendPorDiaData.values, averageDataRend.values);
      createChart('ociosidadePorDia', 'line', 'Ociosidade', ociosidadePorDia.labels, ociosidadePorDia.values);
    })
    .catch(error => console.error('Erro ao carregar os dados:', error));
}
document.getElementById('filterYear').addEventListener('change', fetchDataAndCreateCharts);
document.getElementById('filterMonth').addEventListener('change', fetchDataAndCreateCharts);

//garrafas
function getDataForGarrafasPorMes(data) {
  const garrafasPorMes = {};

  data.forEach(item => {
    const mes = item.dataHora.slice(5, 7);
    if (!garrafasPorMes[mes]) {
      garrafasPorMes[mes] = 0;
    }

    garrafasPorMes[mes] += parseInt(item.garrafa, 10);
  });
  const sortedKeys = Object.keys(garrafasPorMes).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  return {
    labels: sortedKeys,
    values: sortedKeys.map(mes => garrafasPorMes[mes])
  };
}
function getDataForGarrafasPorDia(data) {
  const garrafasPorDia = {};

  data.forEach(item => {
    const dia = item.dataHora.slice(8, 10);

    if (!garrafasPorDia[dia]) {
      garrafasPorDia[dia] = 0;
    }

    garrafasPorDia[dia] += parseInt(item.garrafa, 10);
  });


  const sortedKeys = Object.keys(garrafasPorDia).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  return {
    labels: sortedKeys,
    values: sortedKeys.map(dia => garrafasPorDia[dia]),
  };
}
//produtividade
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

  data.forEach(item => {
    const dia = item.dataHora.slice(8, 10);

    if (!percentualPorDia[dia]) {
      percentualPorDia[dia] = 0;
      contagemPordia[dia] = 0;
    }

    percentualPorDia[dia] += parseInt(item.percentual, 10);
    contagemPordia[dia]++;
  });

  Object.keys(percentualPorDia).forEach(dia => {
    percentualPorDia[dia] /= contagemPordia[dia];
  });

  const sortedKeys = Object.keys(percentualPorDia).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  const percentualPorDiaData = {
    labels: sortedKeys,
    values: sortedKeys.map(dia => percentualPorDia[dia]),
  };

  // Calcular a média acumulada
  const averageData = getAverageData(percentualPorDiaData);
  console.log("Produtividade acumulada(Mês selecionado): " + averageData.values[averageData.values.length - 1]);
  return {
    percentualPorDiaData,
    averageData,
  };
}
function getDataForPercentualPorMes(data) {
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

    if (!percentualPorMes[mes]) {
      percentualPorMes[mes] = 0;
      contagemPorMes[mes] = 0;
    }

    percentualPorMes[mes] += parseInt(item.percentual, 10);
    contagemPorMes[mes]++;
  });

  Object.keys(percentualPorMes).forEach(mes => {
    percentualPorMes[mes] /= contagemPorMes[mes];
  });

  const sortedKeys = Object.keys(percentualPorMes).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  const percentualPorMesData = {
    labels: sortedKeys,
    values: sortedKeys.map(mes => parseInt(percentualPorMes[mes])),
  };
  
  // Calcular a média acumulada
  const averageDataPmes = getAverageData(percentualPorMesData);
  console.log("Produtividade acumulada(Mêses): " + averageDataPmes.values[averageDataPmes.values.length - 1]);
  
  return {
    percentualPorMesData,
    averageDataPmes,
  };
}
//rendimento
function getDataForPercentualRendPorDia(data) {
  // Função para calcular a média acumulada
  function getAverageData(data) {
    const averageDataRend = {};
    let acumulado = 0;

    data.labels.forEach(dia => {
      acumulado += data.values[data.labels.indexOf(dia)];
      averageDataRend[dia] = parseInt(acumulado / (data.labels.indexOf(dia) + 1));
    });

    return {
      labels: data.labels,
      values: data.labels.map(dia => averageDataRend[dia]),
    };
  }

  const pRendPorDia = {};
  const contagemPordia = {};

  data.forEach(item => {
    const dia = item.dataHora.slice(8, 10);

    if (!pRendPorDia[dia]) {
      pRendPorDia[dia] = 0;
      contagemPordia[dia] = 0;
    }

    pRendPorDia[dia] += parseInt(item.percentualRendimento, 10);
    contagemPordia[dia]++;
  });

  Object.keys(pRendPorDia).forEach(dia => {
    pRendPorDia[dia] = parseInt(pRendPorDia[dia] / contagemPordia[dia]);
  });

  const sortedKeys = Object.keys(pRendPorDia).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  const pRendPorDiaData = {
    labels: sortedKeys,
    values: sortedKeys.map(dia => pRendPorDia[dia]),
  };

  // Calcular a média acumulada
  const averageDataRend = getAverageData(pRendPorDiaData);
  console.log("Rendimento acumulada(Mês selecionado): " + averageDataRend.values[averageDataRend.values.length - 1]);

  return {
    pRendPorDiaData,
    averageDataRend,
  };
}
function getDataForPercentualRendPorMes(data) {
  // Função para calcular a média acumulada
  function getAverageData(data) {
    const averageDataRmes = {};
    let acumulado = 0;

    data.labels.forEach(mes => {
      acumulado += data.values[data.labels.indexOf(mes)];
      averageDataRmes[mes] = Math.round(acumulado / (data.labels.indexOf(mes) + 1));
    });

    return {
      labels: data.labels,
      values: data.labels.map(mes => parseInt(averageDataRmes[mes])),
    };
  }

  const percentualPorMes = {};
  const contagemPorMes = {};

  data.forEach(item => {
    const mes = item.dataHora.slice(5, 7);

    if (!percentualPorMes[mes]) {
      percentualPorMes[mes] = 0;
      contagemPorMes[mes] = 0;
    }

    percentualPorMes[mes] += parseInt(item.percentualRendimento, 10);
    contagemPorMes[mes]++;
  });

  Object.keys(percentualPorMes).forEach(mes => {
    percentualPorMes[mes] /= contagemPorMes[mes];
  });

  const sortedKeys = Object.keys(percentualPorMes).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  const percentualRendPorMesData = {
    labels: sortedKeys,
    values: sortedKeys.map(mes => parseInt(percentualPorMes[mes])),
  };
  
  // Calcular a média acumulada
  const averageDataRmes = getAverageData(percentualRendPorMesData);
  console.log("Rendimento acumulada(Mêses): " + averageDataRmes.values[averageDataRmes.values.length - 1]);
  
  return {
    percentualRendPorMesData,
    averageDataRmes,
  };
}
//osciosidade
function getDataForOciosidadePorDia(data) {
  const tempoProdPorDia = {};
  const tempoTrabPadrao = 8.48;
  const horasRealizadas = {};
  data.forEach(item => {
    const dia = item.dataHora.slice(8, 10);

    if (!tempoProdPorDia[dia]) {
      tempoProdPorDia[dia] = 0;
      horasRealizadas[dia] = 0;
    }
    tempoProdPorDia[dia] += parseFloat(item.tempoTotalProducao, 10);
    horasRealizadas[dia] = parseInt(((tempoTrabPadrao - tempoProdPorDia[dia]) * 100) / tempoTrabPadrao);
  });
  const sortedKeys = Object.keys(horasRealizadas).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  return {
    labels: sortedKeys,
    values: sortedKeys.map(dia => horasRealizadas[dia]),
  };
}
function getDataForOciosidadePorMes(data) {
  // Função para calcular a média acumulada
  function getAverageData(data) {
    const averageDataOci = {};
    let acumulado = 0;

    data.labels.forEach(dia => {
      acumulado += data.values[data.labels.indexOf(dia)];
      averageDataOci[dia] = parseInt(acumulado / (data.labels.indexOf(dia) + 1));
    });

    return {
      labels: data.labels,
      values: data.labels.map(dia => averageDataOci[dia]),
    };
  }

  const ociosidadePorMes = {};
  const diasPorMes = {};

  data.forEach(item => {
    const mes = item.dataHora.slice(5, 7);
    const dia = item.dataHora.slice(0, 10);

    if (!ociosidadePorMes[mes]) {
      ociosidadePorMes[mes] = 0;
      diasPorMes[mes] = {};
    }

    if (!diasPorMes[mes][dia]) {
      diasPorMes[mes][dia] = true; // Marca o dia como contado
    }

    ociosidadePorMes[mes] += parseFloat(item.tempoTotalProducao, 10);
  });

  const sortedKeys = Object.keys(ociosidadePorMes).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  const values = sortedKeys.map(mes => {
    const diasUteis = Object.keys(diasPorMes[mes]).length;
    const horasDisponiveis = diasUteis * 8.8;
    const horasOciosas = horasDisponiveis - ociosidadePorMes[mes];
    const ociosidade = parseInt((horasOciosas * 100) / horasDisponiveis);

    return ociosidade;
  });

  const ociosidadePorMesData = {
    labels: sortedKeys,
    values: values,
  };

  // Calcular a média acumulada
  const averageDataOci = getAverageData(ociosidadePorMesData);
  console.log("Ociosidade acumulada: " + averageDataOci.values[averageDataOci.values.length - 1]);

  return {
    ociosidadePorMesData,
    averageDataOci,
  };
}
//grafico acumulado diario
function createChartAcumulado(canvasId, chartType, chartLabel, labels, data, dataAverage) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  Chart.getChart(ctx)?.destroy();
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
          backgroundColor: 'rgba(30,144,255,0.6)',
          borderColor: '#3498db',
          borderWidth: 2,
          tension: 0.4,
          opacity: 0.1,
        }
      ]
    },
    plugins: [ChartDataLabels],
    options: {

      plugins: {
        datalabels: {
          display: true,
          color: "white",
          font: {
            size: 19,
          }
        },
        legend: {
          labels: {
            color: "white",
            font: {
              size: 17

            }
          }
        }
      },
      scales: {
        y: {
          title: {
            font: {
              size: 16
            },
            color: 'white',
            display: true,
            text: 'Percentual %',
          },
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
          max: canvasId === 'percentualPorDia' || canvasId === 'percentualRendPorDia' ? 120 : undefined,
          beginAtZero: true,

          grid: {
            color: canvasId === 'percentualRendPorDia' || canvasId === 'percentualPorDia'|| canvasId === 'percentualPorMes'|| canvasId === 'percentualRendPorMes' ?
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
            text: canvasId === 'percentualPorDia' || canvasId === 'percentualRendPorDia' ? "Dia" : "Mês",

          },
          ticks: {
            font: {
              size: 13,
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
//grafico normal diario
function createChart(canvasId, chartType, chartLabel, labels, data) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  Chart.getChart(ctx)?.destroy();
  new Chart(ctx, {
    type: chartType,
    data: {
      labels: labels,
      datasets: [{
        label: chartLabel,
        data: data,
        borderWidth: 2,
        tension: 0.4,

      }]
    },
    plugins: [ChartDataLabels],
    options: {

      plugins: {
        datalabels: {
          display: canvasId == 'percentualPorMes' || canvasId == 'percentualRendPorMes' || canvasId == 'ociosidadePorMes'
          || canvasId == 'ociosidadePorDia',
          color: "white",
          font: {
            size: 19,
          }
        },
        legend: {
          labels: {
            color: "white",
            font: {
              size: 17

            }
          }
        }
      },
      scales: {
        y: {
          title: {
            font: {
              size: 16
            },
            color: 'white',
            display: true,
            text: canvasId === 'percentualRendPorMes' || canvasId === 'percentualPorMes' || canvasId === 'ociosidadePorDia' || canvasId === 'ociosidadePorMes' ? 'Percentual %' : 'Quantidades',
          },
          ticks: {
            callback: function (value, index, values) {
              if (this.chart.canvas.id !== 'garrafasPorMes' && this.chart.canvas.id !== 'garrafasPorDia') {
                return value + "%";
              } else {
                return value;
              }
            },
            font: {
              size: 15
            },
            color: 'white',
          },
          max: canvasId === 'percentualRendPorMes' || canvasId === 'percentualPorMes' ? 120 : undefined,
          beginAtZero: true,
          grid: {
            color: canvasId === 'percentualRendPorMes' || canvasId === 'percentualPorMes' ?
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
            text: canvasId === 'percentualPorMes' || canvasId === 'garrafasPorMes' || canvasId === 'percentualRendPorMes' || canvasId === 'ociosidadePorMes' ? 'Mês' : 'Dia',

          },
          ticks: {
            font: {
              size: canvasId === 'percentualPorMes' || canvasId === 'garrafasPorMes' || canvasId === 'percentualRendPorMes' ? 15 : 10,
            },
            color: 'white',
          },
          grid: {
            display: canvasId === 'ociosidadePorDia' ? true : false,
            color: 'rgba(169, 169, 169, 0.4)',
          },


        }

      }
    },

  });
}

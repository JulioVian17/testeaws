document.addEventListener('DOMContentLoaded', () => {
    setInitialDate();
    fetchDataQualidade();
    mensal();
});
///MENU\\\
$(document).ready(function () {
    $('.list').addClass('hidden');
    $('.menu').on('click', function () {
        $('.list').toggleClass('hidden');
    });
});

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
//FILTRO QUALIDADE

function filterQualidade(data, year, month, tipo) {
    return data.filter(obj => {
        const dateKey = Object.keys(obj)[0];
        const [objYear, objMonth] = dateKey.split("-");
        var tipoData;
        for (const dia in obj) {
            for (const ordem in obj[dia]) {
                tipoData = obj[dia][ordem].tipo;
            }
        }
        if (tipo == 'geral') {
            return objYear === year && objMonth === month;
        } else {
            return objYear === year && objMonth === month && tipoData === tipo;
        }
    });
}

function filterQualidadeDay(data, year, month, day, tipo) {
    return data.filter(obj => {
        const dateKey = Object.keys(obj)[0];
        const [objYear, objMonth, objDay] = dateKey.split("-");
        var tipoData;
        for (const dia in obj) {
            for (const ordem in obj[dia]) {
                tipoData = obj[dia][ordem].tipo;
            }
        }
        if (tipo == 'geral') {
            return objYear === year && objMonth === month && objDay === day;
        } else {
            return objYear === year && objMonth === month && objDay === day && tipoData === tipo;
        }
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
function fetchDataQualidade(label) {
    fetch('bancoDeDados/dadosQualidade.json')
        .then(response => response.json())
        .then(data => {

            var selectedYear = document.getElementById('filterYear').value;
            var selectedMonth = document.getElementById('filterMonth').value;
            var selectedDay = document.getElementById('filterDay').value;
            var selectedTipo = document.getElementById("filterTipo").value;

            if (label == true) {
                selectedDay = label;
            }

            const filteredData = filterQualidade(data, selectedYear, selectedMonth, selectedTipo);
            const filteredDataAndDay = filterQualidadeDay(data, selectedYear, selectedMonth, selectedDay, selectedTipo);

            filteredData.sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));

            funcInfo(filteredDataAndDay);

            const defXana = getDefXana(filteredData);
            createChart('defXanaPorDia', 'bar', 'Defeito', defXana.labels, defXana.percentuais, defXana.valuesVetorD, defXana.valuesVetorE);

            const retXleve = getRetXleve(filteredData);
            createChartAcumulado('retXlevePorDia', 'bar', 'Condição', retXleve.labels, retXleve.percentuaisRetrabalho, retXleve.percentuaisLeve, retXleve.defRetrab, retXleve.defLeve);

            const defeitos = getDefeitos(filteredData);
            createChartY('defeitosPorDia', 'bar', 'Defeitos', defeitos.labels, defeitos.values);
            const defItens = getDefItens(filteredData);

            const registrosData = getRegistros(data);
            //createChartYYASA('defItensPorMes', 'bar', 'Defeitos', defItens);
        })
        .catch(error => console.error('Erro ao carregar os dados:', error));
}

document.getElementById('filterYear').addEventListener('change', function () {
    fetchDataQualidade();
});
document.getElementById('filterMonth').addEventListener('change', function () {
    fetchDataQualidade();
});
document.getElementById('filterDay').addEventListener('change', function () {
    fetchDataQualidade();
});
document.getElementById('filterTipo').addEventListener('change', function () {
    fetchDataQualidade();
});
//----------Registros-------------
async function getRegistros(data) {
    const tbody = document.getElementById('tabela-registros-corpo');

    data.forEach(entry => {
        for (const [date, records] of Object.entries(entry)) {
            for (const [id, record] of Object.entries(records)) {
                const row = document.createElement('tr');

                // Soma dos números dos arrays vetorD e vetorE, ignorando valores vazios
                const somaVetorD = record.registros.vetorD.reduce((acc, val) => acc + (val ? parseInt(val, 10) : 0), 0);
                const somaVetorE = record.registros.vetorE.reduce((acc, val) => acc + (val ? parseInt(val, 10) : 0), 0);

                // Calcula a porcentagem de vetorE/vetorD
                const porcentagem = (somaVetorD !== 0) ? ((somaVetorE / somaVetorD) * 100).toFixed(2) + '%' : 'N/A';

                const loteCell = document.createElement('td');
                loteCell.textContent = record.lote;
                row.appendChild(loteCell);

                const idCell = document.createElement('td');
                idCell.textContent = id;
                row.appendChild(idCell);

                const itemCell = document.createElement('td');
                itemCell.textContent = record.itemCode;
                row.appendChild(itemCell);

                const dataCell = document.createElement('td');
                dataCell.textContent = date;
                row.appendChild(dataCell);

                const quantidadeCell = document.createElement('td');
                quantidadeCell.textContent = somaVetorD;
                row.appendChild(quantidadeCell);

                const quantidadeDefCell = document.createElement('td');
                quantidadeDefCell.textContent = somaVetorE;
                row.appendChild(quantidadeDefCell);

                const porcentagemCell = document.createElement('td');
                porcentagemCell.textContent = porcentagem;
                row.appendChild(porcentagemCell);

                const obvsCell = document.createElement('td');
                obvsCell.textContent = record.registros.obs;
                row.appendChild(obvsCell);


                tbody.appendChild(row);
            }
        }
    });

    const addSorting = () => {
        const headers = document.querySelectorAll('th');
        let sortDirection = 1;
        headers.forEach((header, index) => {
            header.addEventListener('click', () => {
                const rows = Array.from(document.querySelectorAll('tbody tr'));
                const isNumericColumn = index === 4 || index === 5;

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
//---------- % defeito ----------
function getDefXana(data) {
    const garrafasPorDia = {};

    data.forEach(item => {
        const dia = Object.keys(item)[0];
        Object.keys(item[dia]).forEach(ordem => {
            // item[dia][ordem].registros.forEach(registro => {
            const somaVetorD = item[dia][ordem].registros.vetorD.reduce((acc, curr) => acc + parseInt(curr), 0);
            const somaVetorE = item[dia][ordem].registros.vetorE.reduce((acc, curr) => acc + (curr === "" ? 0 : parseInt(curr)), 0);

            // Verificando se já existe uma entrada para o dia no objeto garrafasPorDia
            if (!garrafasPorDia[dia]) {
                // Se não existir, criamos uma entrada com as somas de vetorD e vetorE
                garrafasPorDia[dia] = {
                    somaVetorD: 0,
                    somaVetorE: 0,
                    percentual: 0
                };
            }

            // Incrementando as somas de vetorD e vetorE para o dia atual
            garrafasPorDia[dia].somaVetorD += somaVetorD;
            garrafasPorDia[dia].somaVetorE += somaVetorE;
            //});
        });
        garrafasPorDia[dia].percentual = ((garrafasPorDia[dia].somaVetorE / garrafasPorDia[dia].somaVetorD) * 100).toFixed(1);
    });

    // Convertendo o objeto em arrays para o formato desejado
    const labels = Object.keys(garrafasPorDia).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    const labelsForm = labels.map(label => label.split("-")[2]);
    const valuesVetorD = labels.map(dia => garrafasPorDia[dia].somaVetorD);
    const valuesVetorE = labels.map(dia => garrafasPorDia[dia].somaVetorE);
    const percentuais = labels.map(dia => garrafasPorDia[dia].percentual);
    return {
        labels: labelsForm,
        valuesVetorD: valuesVetorD,
        valuesVetorE: valuesVetorE,
        percentuais: percentuais
    };
}

//---------- ret X leve ----------
function getRetXleve(data) {
    const garrafasPorDia = {};

    data.forEach(item => {
        const dia = Object.keys(item)[0];
        Object.keys(item[dia]).forEach(ordem => {
            const registros = item[dia][ordem].registros;
            const vetorC = registros.vetorC;
            const vetorE = registros.vetorE;

            let totalDefeitos = 0;
            let defeitosRetrabalhados = 0;
            let defeitosLeves = 0;

            vetorC.forEach((gravidade, index) => {
                const valorE = parseInt(vetorE[index]) || 0;
                totalDefeitos += valorE;

                if (gravidade === "retrabalho") {
                    defeitosRetrabalhados += valorE;
                } else if (gravidade === "leve") {
                    defeitosLeves += valorE;
                }
            });

            // Verificando se já existe uma entrada para o dia no objeto garrafasPorDia
            if (!garrafasPorDia[dia]) {
                // Se não existir, criamos uma entrada com os valores iniciais
                garrafasPorDia[dia] = {
                    totalDefeitos: 0,
                    percentualRetrabalho: 0,
                    percentualLeve: 0,
                    defeitosLeves: 0,
                    defeitosRetrabalhados: 0
                };
            }

            // Atualizando os valores para o dia atual
            garrafasPorDia[dia].totalDefeitos += totalDefeitos;
            garrafasPorDia[dia].defeitosRetrabalhados += defeitosRetrabalhados;
            garrafasPorDia[dia].defeitosLeves += defeitosLeves;
        });
    });

    // Calculando os percentuais apenas se houver mais de um conjunto de dados no mesmo dia
    Object.keys(garrafasPorDia).forEach(dia => {
        const numRegistros = data.filter(item => Object.keys(item)[0] === dia).length;
        if (numRegistros > 0) {
            garrafasPorDia[dia].percentualRetrabalho = (garrafasPorDia[dia].defeitosRetrabalhados / garrafasPorDia[dia].totalDefeitos) * 100;
            garrafasPorDia[dia].percentualLeve = (garrafasPorDia[dia].defeitosLeves / garrafasPorDia[dia].totalDefeitos) * 100;
        }
    });

    // Convertendo o objeto em arrays para o formato desejado
    const labels = Object.keys(garrafasPorDia).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    const labelsForm = labels.map(label => label.split("-")[2]);
    const percentuaisRetrabalho = labels.map(dia => (garrafasPorDia[dia].percentualRetrabalho != '' ? garrafasPorDia[dia].percentualRetrabalho.toFixed(1) : ''));
    const percentuaisLeve = labels.map(dia => (garrafasPorDia[dia].percentualLeve != '' ? garrafasPorDia[dia].percentualLeve.toFixed(1) : ''));

    const defRetrab = labels.map(dia => garrafasPorDia[dia].defeitosRetrabalhados);
    const defLeve = labels.map(dia => garrafasPorDia[dia].defeitosLeves);
    return {
        labels: labelsForm,
        percentuaisRetrabalho: percentuaisRetrabalho,
        percentuaisLeve: percentuaisLeve,
        defRetrab: defRetrab,
        defLeve: defLeve
    };
}

//--------- defeitos -------
function getDefeitos(data) {
    const garrafasPorDia = {};

    data.forEach(item => {
        const dia = Object.keys(item)[0];

        Object.keys(item[dia]).forEach(ordem => {
            const registros = item[dia][ordem].registros;
            const vetorB = registros.vetorB;
            const vetorE = registros.vetorE;
            const vetorC = registros.vetorC;

            vetorB.forEach((labelB, index) => {
                if (labelB !== "") {
                    if (!garrafasPorDia[labelB]) {
                        garrafasPorDia[labelB] = {
                            'leve': 0,
                            'retrabalho': 0
                        };
                    }
                    garrafasPorDia[labelB][vetorC[index]] += (parseInt(vetorE[index]) || 0);
                }
            });
        });
    });

    const sortedLabels = Object.keys(garrafasPorDia).map(label => ({
        label,
        total: Object.values(garrafasPorDia[label]).reduce((acc, cur) => acc + cur, 0)
    }));
    sortedLabels.sort((a, b) => b.total - a.total);

    const labels = sortedLabels.map(item => item.label);
    const dataLeve = [];
    const dataRetrabalho = [];

    labels.forEach(label => {
        dataLeve.push(garrafasPorDia[label]['leve'] || '');
        dataRetrabalho.push(garrafasPorDia[label]['retrabalho'] || '');
    });

    return {
        labels: labels,
        values: {
            leve: dataLeve,
            retrabalho: dataRetrabalho
        }
    };
}
//--------- defeitos por item -------
function getDefItens(data) {
    const garrafasPorDia = {};
    let totalDefeitosPorItemCode = {};
    data.forEach(item => {
        const dia = Object.keys(item)[0];

        Object.keys(item[dia]).forEach(ordem => {
            const registros = item[dia][ordem].registros;
            const vetorB = registros.vetorB;
            const vetorE = registros.vetorE;
            const vetorC = registros.vetorC;
            const itemCode = item[dia][ordem].itemCode;

            if (!totalDefeitosPorItemCode[itemCode]) {
                totalDefeitosPorItemCode[itemCode] = {
                    'leve': 0,
                    'retrabalho': 0
                };
            }

            vetorB.forEach((labelB, index) => {
                if (labelB !== "") {
                    if (!garrafasPorDia[labelB]) {
                        garrafasPorDia[labelB] = {
                            'leve': 0,
                            'retrabalho': 0
                        };
                    }
                    const qtd = parseInt(vetorE[index]) || 0;
                    garrafasPorDia[labelB][vetorC[index]] += qtd;
                    totalDefeitosPorItemCode[itemCode][vetorC[index]] += qtd;
                }
            });
        });
    });

    // Calculate total defects per itemCode
    const totalDefeitos = Object.keys(totalDefeitosPorItemCode).reduce((acc, itemCode) => {
        acc[itemCode] = Object.values(totalDefeitosPorItemCode[itemCode]).reduce((sum, count) => sum + count, 0);
        return acc;
    }, {});


    // Calculate percentages
    const porcentagensPorItemCode = Object.keys(totalDefeitosPorItemCode).reduce((acc, itemCode) => {
        acc[itemCode] = {
            'leve': (totalDefeitosPorItemCode[itemCode]['leve'] / totalDefeitos[itemCode]) * 100,
            'retrabalho': (totalDefeitosPorItemCode[itemCode]['retrabalho'] / totalDefeitos[itemCode]) * 100
        };
        return acc;
    }, {});
    return porcentagensPorItemCode;
}

//infos diario
function funcInfo(data) {
    const div = document.getElementById("itensContainer");
    div.innerHTML = "";
    const spanObs = document.getElementById("span-obs");

    //---span data dia selecionado---
    const spanDataParada = document.getElementById('spanDataParada');
    const itemYear = document.getElementById("filterYear").value;
    const itemMonth = document.getElementById("filterMonth").value;
    const itemDay = document.getElementById("filterDay").value;
    var dataFormatada = `  ${itemDay}/${itemMonth}/${itemYear}`;
    spanDataParada.innerHTML = dataFormatada;


    if (data.length === 0) {
        document.getElementById("itensContainer").innerHTML = `DIA: ${itemDay}/${itemMonth}/${itemYear} SEM DADOS !`
    }

    const observacao = [];

    data.forEach(dia => {
        const diaKey = Object.keys(dia)[0];
        const ordens = dia[diaKey];
        Object.keys(ordens).forEach(ordemKey => {

            const obsData = ordens[ordemKey].registros.obs;
            if (obsData !== "" || undefined) {
                observacao.push(obsData)
            }

        });
    });
    spanObs.innerHTML = observacao;

    for (const index in data) {
        let ul = document.createElement("ul");
        ul.style.width = 'maxContent'
        for (const dia in data[index]) {
            for (const ordem in data[index][dia]) {
                let li1 = document.createElement("li");
                let itemCode = data[index][dia][ordem].itemCode;
                li1.textContent = `Item: ${itemCode}`;

                let li2 = document.createElement("li");
                li2.textContent = `Ordem:${ordem}`;

                let li3 = document.createElement("li");
                let operacao = data[index][dia][ordem].operacao;
                li3.textContent = `Operação:${operacao}`;

                let li4 = document.createElement("li");
                let lote = data[index][dia][ordem].lote;
                li4.textContent = `Lote: ${lote}`;

                let li5 = document.createElement("li");
                let tipo = data[index][dia][ordem].tipo;
                li5.textContent = `Tipo: ${tipo}`;

                ul.appendChild(li1);
                ul.appendChild(li2);
                ul.appendChild(li3);
                ul.appendChild(li4);
                ul.appendChild(li5);
            }
        }

        div.appendChild(ul);
    }

}
/*
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

        for (var i = 0; i < quebras.length; i += 3) {
            var valor = parseInt(quebras[i]);
            if (!quebraData[dia]) {
                quebraData[dia] = 0;
            }
            quebraData[dia] += valor;
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
                paradasPorMotivo[motivo] += quantidade * tempo;

            }
        }
    });

    const labels = Object.keys(paradasPorMotivo);
    const values = labels.map(motivo => paradasPorMotivo[motivo]);

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

    const labels = Object.keys(porcentagensPorMotivo);
    const values = labels.map(motivo => porcentagensPorMotivo[motivo]);

    return {
        labels: labels,
        values: values,
    };
}
//quebras dia selecionado
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
*/

//grafico acumulado diario
function createChartAcumulado(canvasId, chartType, chartLabel, labels, data, data2, data3, data4) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    Chart.getChart(ctx)?.destroy();
    new Chart(ctx, {
        type: chartType,
        data: {
            labels: labels,
            datasets: [
                {
                    type: 'bar',
                    label: 'Leve',
                    data: data2,
                    borderWidth: 2,
                    backgroundColor: 'blue',
                    borderColor: 'white',
                    tension: 0.4,
                    fill: false,
                    pointRadius: 0,
                },
                {
                    type: 'bar',
                    label: 'Retrabalho',
                    data: data,
                    backgroundColor: 'red',
                    borderColor: 'white',
                    borderWidth: 2,
                    tension: 0.4,
                    opacity: 0.1,
                }
            ]
        },
        plugins: [ChartDataLabels],
        options: {
            onClick: function (event, elements) {
                if (canvasId === 'retXlevePorDia') {
                    if (elements.length > 0) {
                        const dataIndex = elements[0].index;
                        const clickedLabel = labels[dataIndex];
                        document.getElementById('filterDay').value = clickedLabel;
                        fetchDataQualidade(clickedLabel);
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        beforeTitle: function (context) {
                            if (canvasId === 'retXlevePorDia' || canvasId === 'percentualPorDia') {
                                return `Dia: ${context[0].label}`;
                            }
                        },
                        title: function (context) {
                            if (canvasId === 'retXlevePorDia') {
                                const dataIndex = context[0].dataIndex;
                                const objeto = data3[dataIndex];
                                let resultado = "";

                                for (const chave in objeto) {
                                    if (objeto.hasOwnProperty(chave)) {
                                        resultado += `${chave}: ${objeto[chave]},\n`;
                                    }
                                }
                                // resultado = resultado.slice(0, -2);
                                return `Leve: ${data4[dataIndex]}un\nRetrabalho: ${data3[dataIndex]}un`;

                            }

                        }
                    }
                },
                datalabels: {
                    color: "white",
                    font: {
                        size: 16,
                    },
                    formatter: function (value, context) {
                        return value + (canvasId == 'retXlevePorDia' && value != '' ? '%' : '');
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
                    stacked: true,

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
                        lineWidth: 2,
                        display: true,
                        color:'gray'
                    },
                },
                x: {
                    stacked: true,
                    title: {
                        font: {
                            size: 15
                        },
                        color: 'white',
                        display: true,
                        text: canvasId === 'retXlevePorDia' ? "Dia" : "Mês",

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
function createChart(canvasId, chartType, chartLabel, labels, data, valuesAna, valuesDef) {
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
                    tension: 0.4,
                    backgroundColor: 'gray',
                    borderColor: 'gray'
                }
            ]
        },
        plugins: [ChartDataLabels],
        options: {
            onClick: function (event, elements) {
                if (canvasId === 'defXanaPorDia') {
                    if (elements.length > 0) {
                        const dataIndex = elements[0].index;
                        const clickedLabel = labels[dataIndex];
                        document.getElementById('filterDay').value = clickedLabel;
                        fetchDataQualidade(clickedLabel);
                    }
                }

            },
            plugins: {

                tooltip: {
                    callbacks: {
                        beforeTitle: function (context) {
                            if (canvasId === 'defXanaPorDia') {
                                return `Mês: ${context[0].label} `;
                            }
                        },
                        title: function (context) {
                            if (canvasId === 'defXanaPorDia') {
                                const dataIndex = context[0].dataIndex;
                                const objeto = valuesAna[dataIndex];
                                let resultado = "";

                                for (const chave in objeto) {
                                    if (objeto.hasOwnProperty(chave)) {
                                        resultado += `${chave}: ${objeto[chave]},\n`;
                                    }
                                }
                                // resultado = resultado.slice(0, -2);
                                return `Garrafas análisadas: ${valuesAna[dataIndex]}\nGarrafas defeituosas: ${valuesDef[dataIndex]}`;

                            }
                        }
                    }
                },

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
                    title: {
                        font: {
                            size: 14
                        },
                        color: 'white',
                        display: true,
                        // text: canvasId === 'defXanaPorDia' ? 'Percentual' : 'Quantidades',
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
                    beginAtZero: true,
                    grid: {
                        lineWidth: 2,
                        display: true,
                        color:'gray'
                    },
                },
                x: {
                    title: {
                        font: {
                            size: 16
                        },
                        color: 'white',
                        display: true,
                        text: canvasId === 'paradaNoDiaSelect' || canvasId === 'quebraNoDiaSelect' ?
                            'Itens' : 'Dia',

                    },
                    ticks: {
                        font: {
                            size: 15,
                        },
                        color: 'white',
                    },
                    grid: {
                        display: false,
                        color: 'rgba(169, 169, 169, 0.4)',
                    },
                    display: !(canvasId === 'quebraMotivoNoDiaSelect' ||
                        canvasId === 'paradaMotivoNoDiaSelect'),
                }

            }
        }
    });
}
//grafico barra Y
function createChartY(canvasId, chartType, chartLabel, labels, data, valuesAna, valuesDef) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    Chart.getChart(ctx)?.destroy();

    new Chart(ctx, {
        type: chartType,
        data: {
            labels: labels,
            datasets: [
                /* {
                     label: chartLabel,
                     data: data,
                     borderWidth: 1,
                     tension: 0.4,
                     backgroundColor: 'gray',
                     borderColor: 'white'
                 }*/
                {
                    label: 'Leve',
                    data: data.leve,
                    borderWidth: 1,
                    backgroundColor: 'blue',
                    borderColor: 'white'
                },
                {
                    label: 'Retrabalho',
                    data: data.retrabalho,
                    borderWidth: 1,
                    backgroundColor: 'red',
                    borderColor: 'white'
                }
            ]
        },
        plugins: [ChartDataLabels],
        options: {
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

                tooltip: {
                    callbacks: {
                        beforeTitle: function (context) {
                            if (canvasId === 'defXanaPorDia') {
                                return `Mês: ${context[0].label} `;
                            }
                        },
                        title: function (context) {
                            if (canvasId === 'defXanaPorDia') {
                                const dataIndex = context[0].dataIndex;
                                const objeto = valuesAna[dataIndex];
                                let resultado = "";

                                for (const chave in objeto) {
                                    if (objeto.hasOwnProperty(chave)) {
                                        resultado += `${chave}: ${objeto[chave]},\n`;
                                    }
                                }
                                // resultado = resultado.slice(0, -2);
                                return `Garrafas análisadas: ${valuesAna[dataIndex]}\nGarrafas defeituosas: ${valuesDef[dataIndex]}`;

                            }
                        }
                    }
                },

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
                            size: 15
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
                        lineWidth: 2,
                        display: false,
                        color: 'gray'
                    }
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
                        lineWidth: 2,
                        display: true,
                        color: 'gray'
                    }
                }

            }
        }
    });
}


//
function createChartMes(canvasId, chartType, chartLabel, labels, data, valuesAna, valuesDef, average) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    Chart.getChart(ctx)?.destroy();
    const monthLabels = labels.map(label => {
        const [year, month] = label.split('-');
        const monthIndex = parseInt(month, 10) - 1; // Mês no JavaScript é baseado em zero (janeiro é 0)
        const monthName = new Date(year, monthIndex, 1).toLocaleString('pt-BR', { month: 'long' });
        return `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)} `;

    });
    new Chart(ctx, {
        type: chartType,
        data: {
            labels: monthLabels,
            datasets: [
                {
                    label: chartLabel,
                    type: 'line',
                    data: average,
                    borderWidth: 1,
                    tension: 0.4,
                    backgroundColor: 'yellow',
                    borderColor: 'yellow',
                    fill: false,
                    pointRadius: 0,
                },
                {
                    label: chartLabel,
                    data: data,
                    borderWidth: 1,
                    tension: 0.4,
                    backgroundColor: 'gray',
                    borderColor: 'white'

                },

            ]
        },
        plugins: [ChartDataLabels],
        options: {
            onClick: function (event, elements) {
                if (canvasId === 'defXanaPorMes') {
                    if (elements.length > 0) {
                        const dataIndex = elements[0].index;
                        const clickedLabel = labels[dataIndex];
                        const partes = clickedLabel.split('-');
                        const ano = partes[0];
                        const mes = partes[1];

                        document.getElementById('filterMonth').value = mes;
                        document.getElementById('filterYear').value = ano;
                        mensal();
                        fetchDataQualidade(clickedLabel);
                    }
                }

            },
            plugins: {

                tooltip: {
                    callbacks: {
                        beforeTitle: function (context) {
                            if (canvasId === 'defXanaPorMes') {
                                return `Mês: ${context[0].label} `;
                            }
                        },
                        title: function (context) {
                            if (canvasId === 'defXanaPorMes') {
                                const dataIndex = context[0].dataIndex;
                                const objeto = valuesAna[dataIndex];
                                let resultado = "";

                                for (const chave in objeto) {
                                    if (objeto.hasOwnProperty(chave)) {
                                        resultado += `${chave}: ${objeto[chave]},\n`;
                                    }
                                }
                                // resultado = resultado.slice(0, -2);
                                return `Garrafas análisadas: ${valuesAna[dataIndex]}\nGarrafas defeituosas: ${valuesDef[dataIndex]}`;

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
                        return value + (canvasId == 'defXanaPorMes' ? '%' : '');
                    },
                    anchor: 'mid',
                    align: 'mid',
                    clip: false,
                    clamp: false,
                },
                legend: {
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
                    title: {
                        font: {
                            size: 14
                        },
                        color: 'white',
                        display: true,
                        //text: canvasId === 'percentualPorDia' ? 'Percentual' : 'Quantidades',
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
                        text: 'Mês',
                    },
                    ticks: {
                        font: {
                            size: 15,
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
function createChartMesY(canvasId, chartType, chartLabel, labels, data, valuesAna, valuesDef) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    Chart.getChart(ctx)?.destroy();

    new Chart(ctx, {
        type: chartType,
        data: {
            labels: labels,
            datasets: [
                /* {
                     label: chartLabel,
                     data: data,
                     borderWidth: 1,
                     tension: 0.4,
                     backgroundColor: 'gray',
                     borderColor: 'white'
                 }*/
                {
                    label: 'Leve',
                    data: data.leve,
                    borderWidth: 1,
                    backgroundColor: 'blue',
                    borderColor: 'white'
                },
                {
                    label: 'Retrabalho',
                    data: data.retrabalho,
                    borderWidth: 1,
                    backgroundColor: 'red',
                    borderColor: 'white'
                }
            ]
        },
        plugins: [ChartDataLabels],
        options: {
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

                tooltip: {
                    callbacks: {
                        beforeTitle: function (context) {
                            if (canvasId === 'defXanaPorDia') {
                                return `Mês: ${context[0].label} `;
                            }
                        },
                        title: function (context) {
                            if (canvasId === 'defXanaPorDia') {
                                const dataIndex = context[0].dataIndex;
                                const objeto = valuesAna[dataIndex];
                                let resultado = "";

                                for (const chave in objeto) {
                                    if (objeto.hasOwnProperty(chave)) {
                                        resultado += `${chave}: ${objeto[chave]},\n`;
                                    }
                                }
                                // resultado = resultado.slice(0, -2);
                                return `Garrafas análisadas: ${valuesAna[dataIndex]}\nGarrafas defeituosas: ${valuesDef[dataIndex]}`;

                            }
                        }
                    }
                },

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
                            size: 15
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
                        //lineWidth: 2,
                        //color:'gray'
                        display: false
                    }
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
                        color: 'gray'
                    }
                }

            }
        }
    });
}
function createChartMesYsimples(canvasId, chartType, chartLabel, labels, data, valuesAna, valuesDef) {
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
                    backgroundColor: 'gray',
                    borderColor: 'white'
                }
            ]
        },
        plugins: [ChartDataLabels],
        options: {
            aspectRatio: 16 / 10,
            indexAxis: 'y',
            plugins: {
                tooltip: {
                    callbacks: {
                        beforeTitle: function (context) {
                            if (canvasId === 'defItensPorMes') {
                                return `Mês: ${context[0].label} `;
                            }
                        },
                        title: function (context) {
                            if (canvasId === 'defItensPorMes') {
                                const dataIndex = context[0].dataIndex;
                                const objeto = valuesAna[dataIndex];
                                let resultado = "";

                                for (const chave in objeto) {
                                    if (objeto.hasOwnProperty(chave)) {
                                        resultado += `${chave}: ${objeto[chave]},\n`;
                                    }
                                }
                                // resultado = resultado.slice(0, -2);
                                return `Garrafas análisadas: ${valuesAna[dataIndex]}\nGarrafas defeituosas: ${valuesDef[dataIndex]}`;

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
                            size: 12
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
                            if (canvasId === 'defItensPorMes') {
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
                        color: 'gray',
                    },
                }

            }
        }
    });
}
//grafico acumulado mensal
function createChartMesAcumulado(canvasId, chartType, chartLabel, labels, data, data2, data3, data4) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    Chart.getChart(ctx)?.destroy();
    const monthLabels = labels.map(label => {
        const [year, month] = label.split('-');
        const monthIndex = parseInt(month, 10) - 1; // Mês no JavaScript é baseado em zero (janeiro é 0)
        const monthName = new Date(year, monthIndex, 1).toLocaleString('pt-BR', { month: 'long' });
        return `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)} `;

    });
    new Chart(ctx, {
        type: chartType,
        data: {
            labels: monthLabels,
            datasets: [
                {
                    type: 'bar',
                    label: 'Leve',
                    data: data2,
                    borderWidth: 2,
                    backgroundColor: 'blue',
                    borderColor: 'white',
                    tension: 0.4,
                    fill: false,
                    pointRadius: 0,
                },
                {
                    type: 'bar',
                    label: 'Retrabalho',
                    data: data,
                    backgroundColor: 'red',
                    borderColor: 'white',
                    borderWidth: 2,
                    tension: 0.4,
                    opacity: 0.1,
                }
            ]
        },
        plugins: [ChartDataLabels],
        options: {
            onClick: function (event, elements) {
                if (canvasId === 'retXlevePorMes') {
                    if (elements.length > 0) {
                        const dataIndex = elements[0].index;
                        const clickedLabel = labels[dataIndex];
                        const partes = clickedLabel.split('-');
                        const ano = partes[0];
                        const mes = partes[1];

                        document.getElementById('filterMonth').value = mes;
                        document.getElementById('filterYear').value = ano;
                        mensal();
                        fetchDataQualidade(clickedLabel);
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        beforeTitle: function (context) {
                            if (canvasId === 'retXlevePorMes' || canvasId === 'percentualPorDia') {
                                return `Dia: ${context[0].label}`;
                            }
                        },
                        title: function (context) {
                            if (canvasId === 'retXlevePorMes') {
                                const dataIndex = context[0].dataIndex;
                                const objeto = data3[dataIndex];
                                let resultado = "";

                                for (const chave in objeto) {
                                    if (objeto.hasOwnProperty(chave)) {
                                        resultado += `${chave}: ${objeto[chave]},\n`;
                                    }
                                }
                                // resultado = resultado.slice(0, -2);
                                return `Leve: ${data4[dataIndex]}un\nRetrabalho: ${data3[dataIndex]}un`;

                            }

                        }
                    }
                },
                datalabels: {
                    color: "white",
                    font: {
                        size: 14,
                    },
                    formatter: function (value, context) {
                        if (value != 0 || value != '') {
                            return value + (canvasId == 'retXlevePorMes' ? '%' : '');
                        }
                        return value;
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
                    stacked: true,
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
                    stacked: true,
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

//requisita as  informações do backend para preencher o gráficos mensais
function mensal() {
    const divsMensais = document.getElementsByClassName("grafico-container-mensal");
    const divsDiarios = document.getElementsByClassName("grafico-container");
    //const btnRel = document.getElementsByClassName("btnRel")[0];
    const titMensalDiario = document.getElementById("titulo-mensal-diario");

    for (const divMensal of divsMensais) {
        if (divMensal.style.display !== "none") {
            divMensal.style.display = "none";
            //btnRel.textContent = 'ALTERAR P/ MENSAL'
            document.getElementById("titulo-selecionado").style.display = 'block';
            document.getElementById("section-selecionado").style.display = 'flex';
            titMensalDiario.innerHTML="DIÁRIO";
        } else {
            divMensal.style.display = "block";
            //btnRel.textContent = 'ALTERAR P/ DIÁRIO'
            document.getElementById("titulo-selecionado").style.display = 'none';
            document.getElementById("section-selecionado").style.display = 'none';
            titMensalDiario.innerHTML="MENSAL";
        };
    }
    for (const divDiario of divsDiarios) {
        if (divDiario.style.display !== "none") {
            divDiario.style.display = "none";
        } else {
            divDiario.style.display = "block";
            divDiario.style.transition = 'none';
        };
    }

    var ano = document.getElementById("filterYear").value;
    var mes = document.getElementById("filterMonth").value;
    var tipo = document.getElementById("filterTipo").value;

    //----------------------- % defeitos -----------------------------------
    fetch('/defXanaMensal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({
            'ano': ano,
            'mes': mes,
            'tipo': tipo
        })
    })
        .then(response => response.json())
        .then(data => {
            var DataMes = data;
            createChartMes('defXanaPorMes', 'bar', 'Defeito', DataMes.labels, DataMes.percentuais, DataMes.valuesVetorD, DataMes.valuesVetorE, DataMes.averagePercentuais);
        })
        .catch((error) => {
            console.log('Erro ao carregar dados:', error);
        });
    //------------------------- ret X leve ---------------------------
    fetch('/retXleveMensal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({
            'ano': ano,
            'mes': mes,
            'tipo': tipo
        })
    })
        .then(response => response.json())
        .then(data => {
            var DataMes = data;
            createChartMesAcumulado('retXlevePorMes', 'bar', 'Condição', DataMes.labels, DataMes.percentuaisRetrabalho,
                DataMes.percentuaisLeve, DataMes.defRetrab, DataMes.defLeve);
        })
        .catch((error) => {
            console.log('Erro ao carregar dados:', error);
        });

    //---------------- defeitos --------------------
    fetch('/defeitosMensal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({
            'ano': ano,
            'mes': mes,
            'tipo': tipo
        })
    })
        .then(response => response.json())
        .then(data => {
            var DataMes = data;
            createChartMesY('defeitosPorMes', 'bar', 'Defeitos', DataMes.labels, DataMes.values);

        })
        .catch((error) => {
            console.log('Erro ao carregar dados:', error);
        });
    //---------------- defeitos --------------------
    fetch('/defeitosPorItemMensal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({
            'ano': ano,
            'mes': mes,
            'tipo': tipo
        })
    })
        .then(response => response.json())
        .then(data => {
            var DataMes = data;
            createChartMesYsimples('defItensPorMes', 'bar', 'Defeitos Por Item', DataMes.labels, DataMes.percentuais, DataMes.valuesVetorD, DataMes.valuesVetorE);

        })
        .catch((error) => {
            console.log('Erro ao carregar dados:', error);
        });

}

/*
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
*/


/*
    const sortedLabels = Object.keys(quebraEmp).map(label => ({
        label,
        total: Object.values(quebraEmp[label]).reduce((acc, cur) => acc + cur, 0)
    }));

    // Ordenando o array com base no total
    sortedLabels.sort((a, b) => b.total - a.total);

    // Obtendo os labels ordenados
    const labels = sortedLabels.map(item => item.label);



*/
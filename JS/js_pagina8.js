//MENU
$(document).ready(function () {
    $('.list').addClass('hidden'); // Adiciona a classe hidden inicialmente
    $('.menu').on('click', function () {
        $('.list').toggleClass('hidden');
    });
});

document.getElementById("data-hora").addEventListener('blur', function () {
    const dataInput = document.getElementById("data-hora");
    // Verifica se há uma data selecionada
    if (dataInput.value) {
        // Executa a função com a data selecionada
        var dataSelecionada = dataInput.value;
        funcApiOps(dataSelecionada);

        // Define todos os links para abrir em uma nova guia
        const links = document.querySelectorAll('a');
        links.forEach(link => {
            link.setAttribute('target', '_blank');
        });
        avisoData();
    }

});

//SUBMIT
document.getElementById('form1').addEventListener('submit', function (event) {
    event.preventDefault();//impede que o formulário seja enviado automaticamente
});
document.getElementById('form2').addEventListener('submit', function (event) {
    event.preventDefault(); //impede que o formulário seja enviado automaticamente
});

//CONDIÇÃO PARA MOSTRAR SELECTS
document.getElementById("select1").addEventListener('change', function () {
    if (document.getElementById("select1").value == "C/ Defeito") {
        document.getElementById("divComDef").style.display = "grid";
    } else {
        document.getElementById("divComDef").style.display = "none";
    }
});

var quantAnaTotal = 0
var numAmosPad;
var flagAmostragem = false;
//INFORMAÇÕES ORDEM SELECIONADA
async function avisoOps() {
    const selectElement = document.getElementById('ops');
    const selectedOption = selectElement.options[selectElement.selectedIndex];

    const { codItem, qtdePendente, qtde, descItem, obsOrdem, numOrdem } = selectedOption.dataset;
    
    document.getElementById('ordem').value = numOrdem;
    document.getElementById('item_code').value = codItem;
    document.getElementById('qtde_op').value = qtde;
   
    let linha = document.getElementById('linhaResumo');
    linha.textContent = '';
    linha.innerHTML = `OP: ${numOrdem} ITEM: ${codItem} - ${descItem}<br>OBS: ${obsOrdem} `;

    await calcularRestanteAmostras();
   
}
async function getAmostragem(qtdePendente, ordemNumero) {
    try {
        // Recupera o histórico de amostras retiradas com base no número da ordem
        const found = await vaiProc(ordemNumero);

        // Determina a quantidade total de amostras necessárias com base em qtdePendente
        let numAmostrasNecessarias;
        switch (true) {
            case (qtdePendente >= 2 && qtdePendente <= 8):
                numAmostrasNecessarias = 2;
                break;
            case (qtdePendente >= 9 && qtdePendente <= 15):
                numAmostrasNecessarias = 2;
                break;
            case (qtdePendente >= 16 && qtdePendente <= 25):
                numAmostrasNecessarias = 3;
                break;
            case (qtdePendente >= 26 && qtdePendente <= 50):
                numAmostrasNecessarias = 5;
                break;
            case (qtdePendente >= 51 && qtdePendente <= 90):
                numAmostrasNecessarias = 8;
                break;
            case (qtdePendente >= 91 && qtdePendente <= 150):
                numAmostrasNecessarias = 8;
                break;
            case (qtdePendente >= 151 && qtdePendente <= 280):
                numAmostrasNecessarias = 13;
                break;
            case (qtdePendente >= 281 && qtdePendente <= 500):
                numAmostrasNecessarias = 13;
                break;
            case (qtdePendente >= 501 && qtdePendente <= 1200):
                numAmostrasNecessarias = 20;
                break;
            case (qtdePendente >= 1201 && qtdePendente <= 3200):
                numAmostrasNecessarias = 32;
                break;
            case (qtdePendente >= 3201 && qtdePendente <= 10000):
                numAmostrasNecessarias = 32;
                break;
            case (qtdePendente >= 10001 && qtdePendente <= 35000):
                numAmostrasNecessarias = 50;
                break;
            case (qtdePendente >= 35001 && qtdePendente <= 150000):
                numAmostrasNecessarias = 50;
                break;
            case (qtdePendente >= 150001 && qtdePendente <= 500000):
                numAmostrasNecessarias = 80;
                break;
            case (qtdePendente >= 500001):
                numAmostrasNecessarias = 125;
                break;
            default:
                return "Valor fora do intervalo de amostragem.";
        }

        // Calcula a quantidade de amostras restantes
        const amostrasRestantes = numAmostrasNecessarias - (found || 0);
        return amostrasRestantes >= 0 ? amostrasRestantes : 0;

    } catch (error) {
        console.error('Erro ao calcular amostragem:', error);
        return "Erro ao calcular amostragem.";
    }
}
async function vaiProc(ordemNumero) {
    let retorno = 0;
    try {
        const response = await fetch('/dadosInicias-qualidade', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ordemNumero })
        });

        const data = await response.json();
        retorno = data || 0;

    } catch (error) {
        console.log('Erro ao carregar ops:', error);
    }
    return retorno;
}
var totalAmostrasNecessarias;
async function calcularRestanteAmostras() {
    try {
        var numOrdem = document.getElementById('ordem').value;
        var qtde = document.getElementById('qtde_op').value;
        if (totalAmostrasNecessarias == undefined || ultimoOrdem != numOrdem) {
            totalAmostrasNecessarias = await getAmostragem(qtde, numOrdem);
        }
        ultimoOrdem = numOrdem;

        var restante = Math.max(totalAmostrasNecessarias - quantAnaTotal, 0);

        let linha = document.getElementById('linhaAmos');
        linha.textContent = "";
        linha.innerHTML = `Nº AMOSTRAGEM: (${quantAnaTotal}/${restante + quantAnaTotal}) RESTANTE: ${restante}`;

        flagAmostragem = true;
        return restante;

    } catch (error) {
        console.error('Erro ao calcular restante de amostras:', error);
        return null; // Retorna `null` para indicar erro
    }
}
//BUSCA AS INFORMAÇÕES ORDENS
function funcApiOps(dataSelecionada) {
    const select = document.getElementById("ops");
    const divOps = document.getElementById("div-ops")
    divOps.style.display = "block";
    // Limpar todas as opções existentes
    while (select.firstChild) {
        select.removeChild(select.firstChild);
    }

    // Criar uma opção vazia e adicioná-la ao início do seletor
    const blankOption = document.createElement("option");
    blankOption.text = "";
    blankOption.value = "";
    select.appendChild(blankOption);

    // Fetch dos dados e adição das opções
    fetch('/apiOps', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dataEnviar: dataSelecionada })
    })
        .then(response => response.json())
        .then(data => {
            for (let ordem in data) {
                if (data.hasOwnProperty(ordem)) {
                    const item = data[ordem];
                    //ordemArray.forEach(item => {
                    const option = document.createElement("option");
                    option.style.fontSize = 'medium';
                    option.style.fontWeight = 'bold';
                    option.text = `OP: ${ordem} |  ${item.codItem} - ${item.descItem};`;
                    option.value = ordem;
                    // Adicione dados personalizados usando dataset
                    option.dataset.codItem = item.codItem;
                    option.dataset.qtde = item.qtde;
                    option.dataset.qtdePendente = item.qtdePendente;
                    option.dataset.qtde = item.qtde;
                    option.dataset.diaHI = item.diaHI;
                    option.dataset.diaHF = item.diaHF;
                    option.dataset.descItem = item.descItem;
                    option.dataset.obsOrdem = item.obsOrdem;
                    option.dataset.numOrdem = item.numOrdem;
                    select.appendChild(option);
                    //});
                }
            }
        })
        .catch((error) => {
            console.log('Erro ao carregar ops:', error);
        });
}
//REGRA DE ALERTA
function avisoData() {
    var data = document.getElementById("data-hora").value;
    if (data !== obterDataAtual()) {
        alert(`A data selecionada: ${data} não corresponde  à data atual !!.`);
    }
}
function obterDataAtual() {
    var newData = new Date();

    var ano = newData.getFullYear();

    var mes = newData.getMonth() + 1;
    mes = mes < 10 ? '0' + mes : mes; // Adiciona um zero à esquerda se for menor que 10

    var dia = newData.getDate();
    dia = dia < 10 ? '0' + dia : dia; // Adiciona um zero à esquerda se for menor que 10

    var dataFormatada = ano + '-' + mes + '-' + dia;
    return dataFormatada
}

//PRIMEIRO FORMULARIO
function armazenarDados() {

    var dataHora = document.getElementById("data-hora").value;
    var codItem = document.getElementById("item_code").value;
    var operacao = document.getElementById("operacao").value;
    var numOrdem = document.getElementById("ordem").value;
    var lote = document.getElementById("idLote").value;
    var tipo = document.getElementById("idTipo").value;
    var qtde = document.getElementById("qtde_op").value;
    if (!dataHora || !codItem || !operacao || !numOrdem || !lote || !tipo || !qtde) {
        alert("Por favor, preencha todos os campos da primeira parte!.")
        return;
    }
    if (numOrdem.length < 5) {
        alert("Por favor, preencha o numero da ORDEM corretamente!. Minímo de 5 números")
        return;
    }
    if (codItem.length < 6) {
        alert("Por favor, preencha o CÓDIGO do Item corretamente!.")
        return;
    }
    if (dataHora.length > 10) {
        alert("Por favor, preencha a DATA corretamente!.")
        return;
    }

    let checkClass = "fas fa-check fa-2x";
    let checkStyles = "color: green;";
    let dadosArmazenados2Element = document.getElementById("dados-armazenados");
    let iconElement = document.createElement("i");
    iconElement.className = checkClass;
    let mensagemTexto = document.createTextNode("Dados armazenados com sucesso");
    iconElement.style = checkStyles;


    dadosArmazenados2Element.appendChild(mensagemTexto);
    dadosArmazenados2Element.appendChild(iconElement);
    primeiraParteSalva = true;
    exibirSegundaParte();
    desabilitarCamposPrimeiraParte();

    let linha = document.getElementById('linhaLote');
    linha.textContent = '';
    linha.innerHTML = `LOTE: ${lote}`;

    if (flagAmostragem == false) {
        calcularRestanteAmostras();
        document.getElementById('linhaResumo').textContent = '';
        document.getElementById('linhaResumo').innerHTML = `OP: ${numOrdem} ITEM: ${codItem}`;

    }
}
//DESABILITA PRIMEIRO FORMULARIO
function desabilitarCamposPrimeiraParte() {
    document.getElementById("data-hora").disabled = true;
    document.getElementById("item_code").disabled = true;
    document.getElementById("operacao").disabled = true;
    document.getElementById("ordem").disabled = true;

}
//HABILITA SEGUNDO FORMULARIO
function exibirSegundaParte() {
    if (primeiraParteSalva) {
        var segundaParte = document.getElementById("form2");
        segundaParte.style.display = "block";
        var fotter = document.getElementById("fotter-parte");
        fotter.style.display = "block"
        document.getElementById("form1").style.display = "none";
    }
}
var vetorA = [];
var vetorB = [];
var vetorC = [];
var vetorD = [];
var vetorE = [];
var registro = [];

function salvarInspeção() {
    var select1 = document.getElementById("select1").value;
    var select2 = document.getElementById("select2").value;
    var select3 = document.getElementById("select3").value;
    var quantAna = document.getElementById("quantAna").value;
    var quantDef = document.getElementById("quantidade").value;

    if (document.getElementById("divComDef").style.display == "grid") {
        if (quantAna.trim() !== "" && select1.trim() !== "" && select2.trim() !== "" && select3.trim() !== "" && quantDef.trim() !== "") {
            vetorA.push(select1);
            vetorB.push(select2);
            vetorC.push(select3);
            vetorD.push(parseFloat(quantAna)); // Converte para número para somar corretamente
            vetorE.push(quantDef);

            quantAnaTotal += parseFloat(quantAna);

            // Registro do horário
            var newDate = new Date();
            var hours = newDate.getHours();
            var minutes = newDate.getMinutes();
            var formattedTime = (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
            registro.push(formattedTime);

            // Apagar campos
            document.getElementById("select1").value = "";
            document.getElementById("select2").value = "";
            document.getElementById("select3").value = "";
            document.getElementById("quantAna").value = "";
            document.getElementById("quantidade").value = "";
            console.log("Salvo!");

        } else {
            alert("Por favor, preencha corretamente com código do item, quantidade e motivo.");
            return;
        }
    } else {
        if (quantAna.trim() !== "" && select1.trim() !== "") {
            vetorA.push(select1);
            vetorB.push(select2);
            vetorC.push(select3);
            vetorD.push(parseFloat(quantAna)); // Converte para número para somar corretamente
            vetorE.push(quantDef);
            quantAnaTotal += parseFloat(quantAna);

            // Registro do horário
            var newDate = new Date();
            var hours = newDate.getHours();
            var minutes = newDate.getMinutes();
            var formattedTime = (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
            registro.push(formattedTime);

            // Apagar campos
            document.getElementById("select1").value = "";
            document.getElementById("quantAna").value = "";
            console.log("Salvo!");
        } else {
            alert("Por favor, preencha corretamente com código do item, quantidade e motivo.");
            return;
        }
    }

    // Armazenar dados no Local Storage
    localStorage.setItem("vetoresStorage", JSON.stringify({ vetorA, vetorB, vetorC, vetorD, vetorE }));
    calcularRestanteAmostras(); // Atualiza a exibição de amostras restantes
}
//EXPORTAR
function exportar() {
    var operacao = document.getElementById("operacao").value;
    var dataHora = document.getElementById("data-hora").value;
    var ordemNumero = document.getElementById("ordem").value;
    var itemCode = document.getElementById("item_code").value;
    var lote = document.getElementById("idLote").value;
    var obs = document.getElementById("obs").value;
    var tipo = document.getElementById("idTipo").value;

    //ICONE CHECK
    let checkClass = "fas fa-check fa-2x";
    let checkStyles = "color: green;";
    let dadosArmazenados2Element = document.getElementById("dados-armazenados2");
    let iconElement = document.createElement("i");
    iconElement.className = checkClass;

    //MENSAGEM DE SUCESSO
    let mensagemTexto = document.createTextNode("Dados armazenados com sucesso");
    iconElement.style = checkStyles;
    dadosArmazenados2Element.appendChild(mensagemTexto);
    dadosArmazenados2Element.appendChild(iconElement);
    //DADOS
    var dadosArray2 =
    {
        itemCode: itemCode,
        dataHora: dataHora,
        ordemNumero: ordemNumero,
        operacao: operacao,
        lote: lote,
        tipo: tipo,
        quantAnaTotal: quantAnaTotal,
        vetorA: vetorA,
        vetorB: vetorB,
        vetorC: vetorC,
        vetorD: vetorD,
        vetorE: vetorE,
        obs: obs,
        registro: registro,
        numAmosPad, numAmosPad
    };
    //ENVIA PARA O SERVIDOR
    fetch('/exportar-qualidade', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosArray2),
    })
        .then(response => response.text())
        .then(message => {
            console.log(message);

        })
        .catch(error => console.error('Erro ao enviar dados:', error));
    //RECARREGA A PAGINA
    setTimeout(function () { location.reload(); }, 2000);

    //--------------------------IMPRESSÃO-------------------------------------------
    /* 
    function exportarParaJSON(dados, fileName) {
       var jsonString = JSON.stringify(dados);
       var jsonDataUri = "data:application/json;charset=utf-8," + encodeURIComponent(jsonString);

       var link = document.createElement("a");
       link.setAttribute("href", jsonDataUri);
       link.setAttribute("download", fileName + ".json");
       document.body.appendChild(link);
       link.click();

       //Impressão
       var buttone = document.getElementById("btn-imprimir");
       buttone.onclick = function impressao() {
           var printWindow = window.open('Relatório', 'Relatório CDP');
           printWindow.document.write(
               "Código:        " + itemCode + "<br>" +
               "Data:          " + dataHora + "<br>" +
               "Ordem:         " + ordemNumero + "<br>" +
               "Operação:      " + operacao + "<br>" +
               "Paradas:       " + vetorParada.join(", ") + "<br>" +
               "Quebra:        " + vetorQuebra.join(", ") + "<br>" +
               "Garrafas:      " + garrafa + "<br>" +
               "Pessoas:       " + pessoas + "<br>" +
               "HI:            " + hi + "<br>" +
               "HF:            " + hf + "<br>" +
               "Produtividade: " + percentual + "%" + "<br>" +
               "Produtividade: " + produtividade + "GF/H" + "<br>" +
               "Prod Padrão:   " + produtividadePadrao + "GF/H" + "<br>" +
               "Rendimento:    " + percentualRendimento + "%" + "<br>" +
               "Rendimento:    " + rendimento + "GF.H/P" + "<br>" +
               "Rend Padrão:   " + rendimentoPadrao + "GF.H/P" + "<br>" +
               "Tempo total produção:" + showTempoProducao + "<br>" +
               "Tempo total parado:  " + tempoTotalParado + "min" + "<br>" +
               "Analise:       " + vetorAnalise.join(", ")
           );
           printWindow.print();
           printWindow.close();
       }

   }

   // Itera sobre o array de dados e exporta cada conjunto para um arquivo JSON separado
   for (var i = 0; i < dadosArray.length; i++) {
       var fileName = operacao + dataHora + itemCode;
       exportarParaJSON(dadosArray[i], fileName);
   };
   //IMPRESSÂO
 setTimeout(function () {
       const finalSection = document.getElementById('section-final');
       const mainSection = document.getElementById('section-principal');

       mainSection.style.opacity = '0';
       finalSection.style.opacity = '1';
       mainSection.style.display = 'none';
       finalSection.style.display = 'block';
   }, 3000);
   */
}

//---------REGRAS DE FORMATACAO DE INPUT-----------
function toUpperCase(elem) {
    elem.value = elem.value.toUpperCase();
}
function somenteNumeros(elem) {
    elem.value = elem.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
}

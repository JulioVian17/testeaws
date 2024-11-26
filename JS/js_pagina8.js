$(document).ready(function () {
    $('.list').addClass('hidden'); // Adiciona a classe hidden inicialmente
    $('.menu').on('click', function () {
        $('.list').toggleClass('hidden');
    });
});
document.addEventListener('DOMContentLoaded', () => {
    exibirElemento();
});


document.getElementById("data-hora").addEventListener('change', function () {
    avisoData();
    var dataSelecionada = document.getElementById("data-hora").value;
    funcApiOps(dataSelecionada);
    //cria uma nova guia
    const links = document.querySelectorAll('a');
    links.forEach(link => {
        link.setAttribute('target', '_blank');
    });
});
document.getElementById('item_code').addEventListener('change', avisoItem);
document.getElementById("operacao").addEventListener('change', function () {
    avisoItem();
});
document.getElementById('ops').addEventListener('change', avisoItem);
//--------------------------submit-------------------------------------------  
document.getElementById('form1').addEventListener('submit', function (event) {
    event.preventDefault();//impede que o formulário seja enviado automaticamente
});
document.getElementById('form2').addEventListener('submit', function (event) {
    event.preventDefault(); //impede que o formulário seja enviado automaticamente
});
document.getElementById("select1").addEventListener('change', function () {
    console.log("listener select1");
    console.log(document.getElementById("select1").value);

    if (document.getElementById("select1").value == "C/ Defeito") {
        document.getElementById("divComDef").style.display = "grid";
    } else {
        document.getElementById("divComDef").style.display = "none";
    }
});
//--------------------------submit-------------------------------------------  

function avisoOps() {
    const selectElement = document.getElementById('ops');
    const selectedOption = selectElement.options[selectElement.selectedIndex];

    const codItem = selectedOption.dataset.codItem;
    const qtdePendente = selectedOption.dataset.qtdePendente;
    const diaHI = selectedOption.dataset.diaHI;
    const diaHF = selectedOption.dataset.diaHF;
    const descItem = selectedOption.dataset.descItem;
    const obsOrdem = selectedOption.dataset.obsOrdem;
    const numOrdem = selectedOption.dataset.numOrdem;

    document.getElementById('ordem').value = numOrdem;
    document.getElementById('item_code').value = codItem;
    document.getElementById("span-item-parametros").textContent = "";
    let linha = document.createElement('p');
    linha.textContent = `Item: ${codItem} - ${descItem} Obs: ${obsOrdem}`
    linha.style.color = "light-gray";
    document.getElementById("span-item-parametros").appendChild(linha);
}
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
                        option.style.fontSize='medium';
                        option.style.fontWeight='bold';
                        option.text = `OP: ${ordem} |  ${item.codItem} - ${item.descItem};`;
                        option.value = ordem;
                        // Adicione dados personalizados usando dataset
                        option.dataset.codItem = item.codItem;
                        option.dataset.qtdePendente = item.qtdePendente;
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
function avisoData() {
    var data = document.getElementById("data-hora").value;
    if (data !== obterDataAtual()) {
        alert(`A data selecionada: ${data} não corresponde  à data atual, se deseja CONTINUAR pressione OK!!.`);
    }
}
function avisoItem() {
    console.log("apagar avisoItem!");
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
function exibirElemento() {
    /*
        operacao = document.getElementById("operacao").value;
        var elementoRot = document.getElementById("quebra-rotulagem");
        var elementoEnv = document.getElementById("quebra-envase");
        var elementoDeg = document.getElementById("quebra-degorgment");
        var elementoAna = document.getElementById("amostra-analise");
        var elementoRotParada = document.getElementById("observacao-exibir-rotulagem");
        var elementoEnvParada = document.getElementById("observacao-exibir-enavase");
        var elementoDegParada = document.getElementById("observacao-exibir-degorgment");
    
        if (operacao === "rotulagem") {
    
            elementoRot.style.display = "block";
            elementoEnv.style.display = "none";
            elementoDeg.style.display = "none";
            elementoAna.style.display = "none";
            elementoRotParada.style.display = "inline-block";
            elementoEnvParada.style.display = "none";
            elementoDegParada.style.display = "none";
        } else if (operacao === "envase") {
            elementoRot.style.display = "none";
            elementoEnv.style.display = "block";
            elementoDeg.style.display = "none";
            elementoAna.style.display = "none";
            elementoRotParada.style.display = "none";
            elementoEnvParada.style.display = "inline-block";
            elementoDegParada.style.display = "none";
            console.log("3", elementoRot);
        } else if (operacao === "degorgment") {
    
            elementoRot.style.display = "none";
            elementoEnv.style.display = "none";
            elementoDeg.style.display = "block";
            elementoAna.style.display = "block";
            elementoRotParada.style.display = "none";
            elementoEnvParada.style.display = "none";
            elementoDegParada.style.display = "inline-block";
        } else {
            elementoRot.style.display = "none";
            elementoEnv.style.display = "none";
            elementoDeg.style.display = "none";
            elementoAna.style.display = "none";
            elementoRotParada.style.display = "none";
            elementoEnvParada.style.display = "none";
            elementoDegParada.style.display = "none";
        }*/
}

function armazenarDados() {

    var dataHora = document.getElementById("data-hora").value;
    var itemCode = document.getElementById("item_code").value;
    var operacao = document.getElementById("operacao").value;
    var ordemNumero = document.getElementById("ordem").value;
    var lote = document.getElementById("idLote").value;
    var tipo = document.getElementById("idTipo").value;
    if (!dataHora || !itemCode || !operacao || !ordemNumero || !lote || !tipo) {
        alert("Por favor, preencha todos os campos da primeira parte!.")
        return;
    }
    if (ordemNumero.length < 5) {
        alert("Por favor, preencha o numero da ORDEM corretamente!. Minímo de 5 números")
        return;
    }
    if (itemCode.length < 6) {
        alert("Por favor, preencha o CÓDIGO do Item corretamente!.")
        return;
    }
    if (dataHora.length > 10) {
        alert("Por favor, preencha a DATA corretamente!.")
        return;
    }

    var dados = {
        dataHora: dataHora,
        itemCode: itemCode,
        operacao: operacao,
        ordemNumero: ordemNumero,
        lote: lote,
        tipo: tipo
    };
/*
    fetch('/exportar-iniciais-qualidade', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
    })
        .then(response => response.text())
        .then(message => {
            console.log(message);
        })
        .catch(error => console.error('Erro ao enviar dados rápidos:', error));
*/

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
    let linha = document.createElement('p');
    linha.textContent = `${operacao} - ${ordemNumero} - ${lote} `;
    document.getElementById("span-item-parametros").appendChild(linha);

}
function desabilitarCamposPrimeiraParte() {
    document.getElementById("data-hora").disabled = true;
    document.getElementById("item_code").disabled = true;
    document.getElementById("operacao").disabled = true;
    document.getElementById("ordem").disabled = true;

}
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
var quantAnaTotal = 0;
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
            vetorD.push(quantAna);
            vetorE.push(quantDef);

            quantAnaTotal += parseFloat(quantAna);


            //---------Registro-----------
            var newDate = new Date();
            var hours = newDate.getHours();
            var minutes = newDate.getMinutes();
            var formattedTime = (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
            console.log(formattedTime);
            registro.push(formattedTime);

            
            //---------Apagar campos-----------
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
            //tentei botar todos para verse da o mesmo lenght 
            vetorA.push(select1);
            vetorB.push(select2);
            vetorC.push(select3);
            vetorD.push(quantAna);
            vetorE.push(quantDef);
            quantAnaTotal += parseFloat(quantAna);

            //---------Registro-----------
            var newDate = new Date();
            var hours = newDate.getHours();
            var minutes = newDate.getMinutes();
            var formattedTime = (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
            console.log(formattedTime);
            registro.push(formattedTime);

            //---------Apagar campos-----------
            document.getElementById("select1").value = "";
            document.getElementById("quantAna").value = "";
            console.log("Salvo!");
        } else {
            alert("Por favor, preencha corretamente com código do item, quantidade e motivo.");
            return;
        }

    }
       //---------------Local Storage---------------
       localStorage.setItem("vetoresStorage", vetorA, vetorB, vetorC, vetorD, vetorE);
}


//--------------------------EXPORTAR-------------------------------------------  
function exportar() {
    var operacao = document.getElementById("operacao").value;
    var dataHora = document.getElementById("data-hora").value;
    var ordemNumero = document.getElementById("ordem").value;
    var itemCode = document.getElementById("item_code").value;
    var lote = document.getElementById("idLote").value;
    var obs = document.getElementById("obs").value;
    var tipo = document.getElementById("idTipo").value;

    //check
    let checkClass = "fas fa-check fa-2x";
    let checkStyles = "color: green;";
    let dadosArmazenados2Element = document.getElementById("dados-armazenados2");
    let iconElement = document.createElement("i");
    iconElement.className = checkClass;
    let mensagemTexto = document.createTextNode("Dados armazenados com sucesso");
    iconElement.style = checkStyles;
    dadosArmazenados2Element.appendChild(mensagemTexto);
    dadosArmazenados2Element.appendChild(iconElement);

    //---------------------------------------------------------------------
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
        registro: registro
    };
    console.log(dadosArray2);
    //--------------------------Exportar-------------------------------------------

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

    setTimeout(function () { location.reload(); }, 2000);


    //--------------------------EMAIL-------------------------------------------
    /*
    fetch('/enviar-email', {
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
        .catch(error => console.error('Erro ao enviar dados rápidos:', error));
*/

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
//--------------------------EXPORTAR-------------------------------------------  


function toUpperCase(elem) {
    elem.value = elem.value.toUpperCase();
}

function somenteNumeros(elem) {
    elem.value = elem.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
}
var parametrosData;
fetch('bancoDeDados/parametros.json')
    .then(response => response.json())
    .then(data => {
        parametrosData = data;
    })
    .catch(error => console.error('Erro ao carregar os dados:', error));
function encontrarNumeroPorCodigo(codigo) {
    for (var i = 0; i < parametrosData.length; i++) {
        operacao = document.getElementById("operacao").value;
        if (parametrosData[i]["Código"] === codigo) {
            if (operacao == 'rotulagem') {
                var capData = {
                    prod: parametrosData[i]["Prod"],
                    nomeItem: parametrosData[i]["Código"],
                    rend: parametrosData[i]["Valor"],
                    pess: parametrosData[i]["Pessoas"].rotulagem
                };
            } else if (operacao == 'envase') {
                var capData = {
                    prod: parametrosData[i]["Prod"],
                    nomeItem: parametrosData[i]["Código"],
                    rend: parametrosData[i]["Valor"],
                    pess: parametrosData[i]["Pessoas"].envase
                };
            } else if (operacao == 'degorgment') {
                var capData = {
                    prod: parametrosData[i]["Prod"],
                    nomeItem: parametrosData[i]["Código"],
                    rend: parametrosData[i]["Valor"],
                    pess: parametrosData[i]["Pessoas"].degorgment
                };
            }
            return capData;
        }
    }
    return null;
}
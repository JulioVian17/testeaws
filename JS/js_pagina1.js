setTimeout(function () {
    const initialSection = document.getElementById('section-entrada');
    const mainSection = document.getElementById('section-principal');

    initialSection.style.opacity = '0';
    mainSection.style.opacity = '1';
    initialSection.style.display = 'none';
    mainSection.style.display = 'block';
}, 2000);
//Funções quando a pagina é gerada        
var contagemRot;
///socket\\\
var socket = io();
socket.once('data', function (data) {
    const contagemSplit = data.split('|');
    for (var i = 0; i < contagemSplit.length; i += 4) {

        contagemRot = contagemSplit[i] + ' UN';
        var velocidadeRot = contagemSplit[i + 1];
        var contagemEnv = contagemSplit[i + 2] + ' UN';
        var velocidadeEnv = contagemSplit[i + 3];
        //console.log("teste socket contagem: ", contagemRot)
    }
    /*const cont = contagemSplit[0];
    const velo = contagemSplit[1];
    const contEnv = contagemSplit[2];
    const veloEnv = contagemSplit[3];*/
});
document.addEventListener('DOMContentLoaded', () => {
    exibirElemento();
});
///MENU\\\
$(document).ready(function () {
    $('.list').addClass('hidden'); // Adiciona a classe hidden inicialmente
    $('.menu').on('click', function () {
        $('.list').toggleClass('hidden');
    });
});


var parametrosData;
fetch('bancoDeDados/parametros.json')
    .then(response => response.json())
    .then(data => {
        parametrosData = data;
    })
    .catch(error => console.error('Erro ao carregar os dados:', error));

var vetorAnalise = [];
var analiseSelect;
var dataHora;
var itemCode;
var operacao;
var ordemNumero;
var quebra;
var parada;
var garrafa;
var pessoas;
var hi;
var hf;
var quebraRotulagem;
var quebraEnvase;
var quebraDegorgment;
var vetorQuebra = [];
var quebraSelect;
var vetorParada = [];
var registro = [];
var tempoTotalParado = 0;

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


document.getElementById('item_code').addEventListener('change', avisoItem);
document.getElementById("operacao").addEventListener('change', function () {
    avisoItem();
});
document.getElementById('ops').addEventListener('change', avisoItem);
document.getElementById('form1').addEventListener('submit', function (event) {
    event.preventDefault(); // Isso irá impedir que o formulário seja enviado automaticamente
});
document.getElementById('form2').addEventListener('submit', function (event) {
    event.preventDefault(); // Isso irá impedir que o formulário seja enviado automaticamente
});
function avisoOps() {
    const selectElement = document.getElementById('ops');
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    //console.log(selectedOption.dataset);
    const codItem = selectedOption.dataset.codItem;
    const qtde = selectedOption.dataset.qtde;
    const qtdePendente = selectedOption.dataset.qtdePendente;
    const diaHI = selectedOption.dataset.diaHI;
    const diaHF = selectedOption.dataset.diaHF;
    const descItem = selectedOption.dataset.descItem;
    const obsOrdem = selectedOption.dataset.obsOrdem;
    const numOrdem = selectedOption.dataset.numOrdem;

    document.getElementById('span-obs').innerHTML = `OBS: ${selectedOption.dataset.obs}`;
    document.getElementById('ordem').value = numOrdem;
    document.getElementById('item_code').value = codItem;
    document.getElementById('qtde_op').value = qtde;

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
                    //console.log(item)
                    //ordemArray.forEach(item => {
                    const option = document.createElement("option");
                    option.style.fontSize = 'medium';
                    option.style.fontWeight = 'bold';
                    option.text = `Ordem: ${ordem} | Qtde Pend: ${(item.qtdePendente).toLocaleString('pt-BR')} ${item.unMed} | ${item.codItem} - ${item.descItem};`;
                    option.value = ordem;
                    // Adicione dados personalizados usando dataset
                    option.dataset.codItem = item.codItem;
                    option.dataset.qtde = item.qtde;
                    option.dataset.qtdePendente = item.qtdePendente;
                    option.dataset.diaHI = item.diaHI;
                    option.dataset.diaHF = item.diaHF;
                    option.dataset.descItem = item.descItem;
                    option.dataset.obsOrdem = item.obsOrdem;
                    option.dataset.numOrdem = item.numOrdem;
                    option.dataset.obs = item.obs;
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
        alert(`A data selecionada: ${data} não corresponde  à data atual !!.`);
    }
}
function avisoItem() {
    document.getElementById("span-item-parametros").textContent = "";
    if (document.getElementById('item_code').value != '') {
        var itemID = document.getElementById("item_code").value;
        var parametros = encontrarNumeroPorCodigo(itemID);
        operacao = document.getElementById("operacao").value;
        if (parametros == null || parametros.nomeItem == null) {
            alert(`Código ${itemID} não encontrado, se deseja CONTINUAR pressione OK!!.`);
        }
        let linha = document.createElement('p');
        linha.textContent = `PARÂMETROS ${parametros.nomeItem}\n- VELOCIDADE PADRÃO: ${parametros.prod} GF/H | PESSOAS PADRÃO NO(A) ${operacao.toUpperCase()}: ${parametros.pess}`
        linha.style.color = "light-gray";
        document.getElementById("span-item-parametros").appendChild(linha);
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
function mostrarCampoAnalise() {
    var selectElement = document.getElementById("amostra-analise-select");
    var acucarInput = document.getElementById("amostra-analise-select-acucar");
    var totalInput = document.getElementById("amostra-analise-select-total");
    var livreInput = document.getElementById("amostra-analise-select-livre");
    var btnAcucar = document.getElementById("btn-acucar");
    var btnTotal = document.getElementById("btn-total");
    var btnLivre = document.getElementById("btn-livre");
    acucarInput.style.display = "none";
    totalInput.style.display = "none";
    livreInput.style.display = "none";
    btnAcucar.style.display = "none";
    btnTotal.style.display = "none";
    btnLivre.style.display = "none";

    if (selectElement.value === "acucar") {
        acucarInput.style.display = "inline-block";
        btnAcucar.style.display = "inline-block";
    } else if (selectElement.value === "total") {
        totalInput.style.display = "inline-block";
        btnTotal.style.display = "inline-block";
    } else if (selectElement.value === "livre") {
        livreInput.style.display = "inline-block";
        btnLivre.style.display = "inline-block";
    }
}
function salvarAnalise(inputId) {
    analiseSelect = document.getElementById("amostra-analise-select").value;

    var analise = document.getElementById(inputId).value;

    if (analise.trim() !== "") {
        vetorAnalise.push(analiseSelect);
        vetorAnalise.push(analise);
        document.getElementById("amostra-analise-select").value = "";
        document.getElementById(inputId).value = "";

        console.log("Select/Analise: ", vetorAnalise);
    }

}

function exibirElemento() {
    fetch('bancoDeDados/paradas.json')
        .then(response => response.json())
        .then(data => {
            var motivosParadas = data;
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
                var selectRot = document.getElementById("observacao-rotulagem");
                for (let a in motivosParadas.ROTULAGEM) {
                    var optgroup = document.createElement("optgroup");
                    optgroup.label = a;
                    motivosParadas.ROTULAGEM[a].forEach(option => {
                        var optionEle = document.createElement("option");
                        optionEle.textContent = option;
                        optgroup.appendChild(optionEle);
                    });
                    selectRot.appendChild(optgroup);

                }
            } else if (operacao === "envase") {
                elementoRot.style.display = "none";
                elementoEnv.style.display = "block";
                elementoDeg.style.display = "none";
                elementoAna.style.display = "none";
                elementoRotParada.style.display = "none";
                elementoEnvParada.style.display = "inline-block";
                elementoDegParada.style.display = "none";
                var selectEnv = document.getElementById("observacao-envase");
                for (let a in motivosParadas.ENVASE) {
                    var optgroup = document.createElement("optgroup");
                    optgroup.label = a;
                    motivosParadas.ENVASE[a].forEach(option => {
                        var optionEle = document.createElement("option");
                        optionEle.textContent = option;
                        optgroup.appendChild(optionEle);
                    });
                    selectEnv.appendChild(optgroup);

                }
            } else if (operacao === "degorgment") {

                elementoRot.style.display = "none";
                elementoEnv.style.display = "none";
                elementoDeg.style.display = "block";
                elementoAna.style.display = "block";
                elementoRotParada.style.display = "none";
                elementoEnvParada.style.display = "none";
                elementoDegParada.style.display = "inline-block";
                var selectDeg = document.getElementById("observacao-degorgment");

                for (let a in motivosParadas.DEGORGMENT) {
                    var optgroup = document.createElement("optgroup");
                    optgroup.label = a;
                    motivosParadas.DEGORGMENT[a].forEach(option => {
                        var optionEle = document.createElement("option");
                        optionEle.textContent = option;
                        optgroup.appendChild(optionEle);
                    });
                    selectDeg.appendChild(optgroup);

                }
            } else {
                elementoRot.style.display = "none";
                elementoEnv.style.display = "none";
                elementoDeg.style.display = "none";
                elementoAna.style.display = "none";
                elementoRotParada.style.display = "none";
                elementoEnvParada.style.display = "none";
                elementoDegParada.style.display = "none";
            }
        })
        .catch(error => console.error('Erro ao carregar os dados:', error));
}
function refresh() {
    location.reload();
}
function salvarQuebra(inputId) {
    if (operacao === "rotulagem") {
        quebraSelect = document.getElementById("quebra-rotulagem-select").value;
        quebra = document.getElementById(inputId).value;
        quebraSelectMotivo = document.getElementById("quebra-rotulagem-select-motivo").value;
        if (quebraSelect.trim() !== "" && quebra.trim() !== "" && quebraSelectMotivo.trim() !== "") {
            vetorQuebra.push(quebra);
            vetorQuebra.push(quebraSelect);
            vetorQuebra.push(quebraSelectMotivo);
            document.getElementById("quebra-rotulagem-select").value = "";
            document.getElementById(inputId).value = "";
            document.getElementById("quebra-rotulagem-select-motivo").value = "";
            console.log("QuantQuebras, Item: ", vetorQuebra);
        } else {
            alert("Por favor, preencha corretamente com código do item, quantidade e motivo.")
            return;
        }
    } else if (operacao === "envase") {
        quebraSelect = document.getElementById("quebra-envase-select").value;
        quebra = document.getElementById(inputId).value;
        quebraSelectMotivo = document.getElementById("quebra-envase-select-motivo").value;
        if (quebraSelect.trim() !== "" && quebra.trim() !== "" && quebraSelectMotivo.trim() !== "") {
            vetorQuebra.push(quebra);
            vetorQuebra.push(quebraSelect);
            vetorQuebra.push(quebraSelectMotivo);
            document.getElementById("quebra-envase-select").value = "";
            document.getElementById(inputId).value = "";
            document.getElementById("quebra-envase-select-motivo").value = "";
            console.log("QuantQuebras, Item: ", vetorQuebra);
        } else {
            alert("Por favor, preencha corretamente com código do item, quantidade e motivo.")
            return;
        }

    } else if (operacao === "degorgment") {
        quebraSelect = document.getElementById("quebra-degorgment-select").value;
        quebra = document.getElementById(inputId).value;
        quebraSelectMotivo = document.getElementById("quebra-degorgment-select-motivo").value;
        if (quebraSelect.trim() !== "" && quebra.trim() !== "" && quebraSelectMotivo.trim() !== "") {
            vetorQuebra.push(quebra);
            vetorQuebra.push(quebraSelect);
            vetorQuebra.push(quebraSelectMotivo);
            document.getElementById("quebra-degorgment-select").value = "";
            document.getElementById(inputId).value = "";
            document.getElementById("quebra-degorgment-select-motivo").value = "";
            console.log("QuantQuebras, Item: ", vetorQuebra);
        } else {
            alert("Por favor, preencha corretamente com código do item, quantidade e motivo.")
            return;
        }
    }
}
function armazenarDados() {

    dataHora = document.getElementById("data-hora").value;
    itemCode = document.getElementById("item_code").value;
    operacao = document.getElementById("operacao").value;
    ordemNumero = document.getElementById("ordem").value;
    qtde = document.getElementById("qtde_op").value;
    if (!dataHora || !itemCode || !operacao || !ordemNumero || !qtde) {
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
        qtde: qtde
    };

    fetch('/salvar-dados-rapidos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
    })
        .then(response => response.json())
        .then(data => {
            if (data === true) {
                const overlay = document.createElement("div");
                overlay.classList.add("overlay");

                const confirmacaoBox = document.createElement("div");
                confirmacaoBox.classList.add("confirmacao-box");
                confirmacaoBox.style.fontSize = 'larger';

                const mensagem = document.createElement("p");
                mensagem.style.color = 'black';
                mensagem.style.fontWeight = 'bold';
                mensagem.textContent = "Deseja reiniciar a contagem ?";

                confirmacaoBox.appendChild(mensagem);

                const div1 = document.createElement("div");
                div1.style.color = 'black';
                div1.style.fontWeight = 'bold';
                const mens1 = document.createElement("p");
                mens1.textContent = `Rotuladora: ${contagemRot}`;
                const mens2 = document.createElement("p");
                mens2.textContent = `Envasadora: N/A`;
                div1.appendChild(mens1);
                div1.appendChild(mens2);
                confirmacaoBox.appendChild(div1);

                const botoes = document.createElement("div");
                botoes.classList.add("botoes");

                const simButton = document.createElement("button");
                simButton.textContent = "Sim";
                simButton.addEventListener("click", () => {
                    removerConfirmacao();
                    socket.emit('reiniciarContagem');
                    console.log("Comando de reinicizlização enviado!")
                });
                botoes.appendChild(simButton);

                const naoButton = document.createElement("button");
                naoButton.textContent = "Não";
                naoButton.addEventListener("click", () => {
                    removerConfirmacao();
                    console.log("Comando de reinicizlização NÂO enviado!")

                });
                botoes.appendChild(naoButton);

                confirmacaoBox.appendChild(botoes);
                overlay.appendChild(confirmacaoBox);
                const divConfirm = document.getElementById("divContagem");
                // Adicionar tela de confirmação ao corpo do documento
                divConfirm.appendChild(overlay);
            }
        })
        .catch(error => console.error('Erro ao enviar dados rápidos:', error));

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
}
function desabilitarCamposPrimeiraParte() {
    document.getElementById("data-hora").disabled = true;
    document.getElementById("item_code").disabled = true;
    document.getElementById("operacao").disabled = true;
    document.getElementById("ordem").disabled = true;

}
function exibirSegundaParte() {
    if (primeiraParteSalva) {
        var segundaParte = document.getElementById("segunda-parte");
        segundaParte.style.display = "block";
        var fotter = document.getElementById("fotter-parte");
        fotter.style.display = "block"
    }
}
var tempoDescontar = 0;
function salvarParada(inputId) {
    parada = document.getElementById("parada").value;
    var observacao = document.getElementById(inputId).value;
    paradaTempo = document.getElementById("parada-tempo").value;
    if (observacao == 'REMUAGEM' || observacao == 'REUNIÃO' || observacao == 'TREINAMENTO') {
        tempoDescontar += parseInt(paradaTempo);
    }
    if (observacao.trim() !== "" && parada.trim() !== "" && paradaTempo.trim() !== "") {
        vetorParada.push(parada);
        vetorParada.push(paradaTempo);
        vetorParada.push(observacao);

        tempoTotalParado += parseFloat(paradaTempo);
        document.getElementById(inputId).value = "";
        document.getElementById("parada").value = "";
        document.getElementById("parada-tempo").value = "";
        console.log("QuantParadas, Tempo Parado e Motivo: ", vetorParada);
        console.log("Tempo total parado:", tempoTotalParado);
        var newDate = new Date();
        var hours = newDate.getHours();
        var minutes = newDate.getMinutes();
        var formattedTime = (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
        registro.push(formattedTime);
    }
    else {
        alert("Por favor, preencha corretamente todos campos.")
        return;
    }
}

///EXPORTAR\\\       
async function exportar() {

    //produtividade GF/H
    garrafa = document.getElementById("garrafa").value;
    hi = document.getElementById("hi").value;
    hf = document.getElementById("hf").value;
    var partsHi = hi.split(":");
    var hoursHi = parseInt(partsHi[0], 10);
 console.log(mostrouConfirmacao,hoursHi);
    if (mostrouConfirmacao == false && hoursHi < 12) {
        await mostrarConfirmacao();
    }
    var minutesHi = parseFloat(partsHi[1], 10);
    var totalTempoHi = (hoursHi + (minutesHi / 60)).toFixed(1);

    var partsHf = hf.split(":");
    var hoursHf = parseInt(partsHf[0], 10);
    var minutesHf = parseFloat(partsHf[1], 10);
    var totalTempoHf = (hoursHf + (minutesHf / 60)).toFixed(1);

    /* if (hoursHi < 12 && hoursHf > 12) {
         var tempoTotalProducao = ((totalTempoHf - totalTempoHi) - 1).toFixed(1);
     } else {
         var tempoTotalProducao = (totalTempoHf - totalTempoHi).toFixed(1);
     }*/

    if (descontarAlmoco == true) {
        var tempoTotalProducao = ((totalTempoHf - totalTempoHi) - 1).toFixed(1);
    } else {
        var tempoTotalProducao = (totalTempoHf - totalTempoHi).toFixed(1);
    }
    var tempoDescHr = tempoDescontar / 60;
    tempoTotalProducao = tempoTotalProducao - tempoDescHr;
    var produtividade = parseInt(garrafa / tempoTotalProducao);
    var horas = Math.floor(tempoTotalProducao);
    var minutos = Math.round((tempoTotalProducao - horas) * 60);
    var showTempoProducao = horas + "h" + minutos + "min"
    console.log("Tempo de Produção: " + showTempoProducao);
    console.log("Produtividade:" + produtividade + "GF/H");

    //rendimento por pessoa 
    pessoas = document.getElementById("pessoas").value;
    var rendimento = parseInt(produtividade / pessoas);
    console.log("Rendimento:" + rendimento + "GF.H/PESSOA");

    garrafa = document.getElementById("garrafa").value;
    pessoas = document.getElementById("pessoas").value;
    hi = document.getElementById("hi").value;
    hf = document.getElementById("hf").value;
    operacao = document.getElementById("operacao").value;
    dataHora = document.getElementById("data-hora").value;
    ordem = document.getElementById("ordem").value;
    itemCode = document.getElementById("item_code").value;
    if (!garrafa || !hi || !hf || !pessoas) {
        alert("Por favor, preencha todos os campos da segunda parte!")
        return;
    }
    if (garrafa > 100000) {
        alert("Por favor, a quantidade de GARRAFAS é > 100.000, preencha corretamente!.")
        return;
    }
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



    var produtividadePadrao = encontrarNumeroPorCodigo(itemCode).prod;
    var percentual = parseInt((produtividade * 100) / produtividadePadrao);
    var pessoasPadrao = encontrarNumeroPorCodigo(itemCode).pess;
    var rendimentoPadrao = parseInt(produtividadePadrao / pessoasPadrao);

    var percentualRendimento = parseInt((rendimento * 100) / rendimentoPadrao);

    if (produtividadePadrao !== null) {
        console.log(`A produtividade padrão correspondente ao código ${itemCode} é ${produtividadePadrao}.`);
    } else {
        console.log(`Código ${itemCode} não encontrado.`);
    }
    if (rendimentoPadrao !== null) {
        console.log(`O rendimento padrão correspondente ao código ${itemCode} é ${rendimentoPadrao}.`);
    } else {
        console.log(`Código ${itemCode} não encontrado.`);
    }
    var dadosArray = [
        {
            "Código": itemCode,
            "Data": dataHora,
            "Ordem": ordemNumero,
            "Operação": operacao,
            "Paradas": vetorParada.join(", "),
            "Quebra": vetorQuebra.join(", "),
            "Garrafas": garrafa,
            "Pessoas": pessoas,
            "HI": hi,
            "HF": hf,
            "Produtividade": produtividade,
            "Prod Padrão": produtividadePadrao,
            "Rendimento": percentualRendimento,
            "Rendimento": rendimento,
            "Rend Padrão": rendimentoPadrao,
            "Tempo total produção": tempoTotalProducao,
            "Tempo total parado": tempoTotalParado,
            "Analise": vetorAnalise.join(", "),
            "Show TProdução": showTempoProducao
        },
    ];
    //---------------------------------------------------------------------
    var dadosArray2 =
    {
        itemCode: itemCode,
        dataHora: dataHora,
        ordemNumero: ordemNumero,
        operacao: operacao,
        vetorParada: vetorParada.join(", "),
        vetorQuebra: vetorQuebra.join(", "),
        garrafa: garrafa,
        pessoas: pessoas,
        pessoasPadrao: pessoasPadrao,
        hi: hi,
        hf: hf,
        percentual: percentual,
        produtividade: produtividade,
        produtividadePadrao: produtividadePadrao,
        percentualRendimento: percentualRendimento,
        rendimento: rendimento,
        rendimentoPadrao: rendimentoPadrao,
        tempoTotalProducao: tempoTotalProducao,
        tempoTotalParado: tempoTotalParado,
        vetorAnalise: vetorAnalise.join(", "),
        showTempoProducao: showTempoProducao,
        registro: registro.join(", "),
    };
    fetch('/salvar-dados', {
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

    fetch('/salvar-quebras-paradas', {
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

    //---------------------------------------------------------------------
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
    setTimeout(function () {
        const finalSection = document.getElementById('section-final');
        const mainSection = document.getElementById('section-principal');

        mainSection.style.opacity = '0';
        finalSection.style.opacity = '1';
        mainSection.style.display = 'none';
        finalSection.style.display = 'block';
    }, 3000);
}
///EXPORTAR///
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

function toUpperCase(elem) {
    elem.value = elem.value.toUpperCase();
}

function somenteNumeros(elem) {
    elem.value = elem.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
}
function incrementarQuebra(inputId) {
    quebra = document.getElementById(inputId);
    var quebraValue = parseInt(quebra.value) || 0;
    quebraValue++;
    quebra.value = quebraValue;
}
function incrementarParada() {
    parada = document.getElementById("parada");
    var paradaValue = parseInt(parada.value) || 0;
    paradaValue++;
    parada.value = paradaValue;
}
function incrementarParadaTempo() {
    var paradaTempo = document.getElementById("parada-tempo");
    var paradaTempoValue = parseInt(paradaTempo.value) || 0;
    paradaTempoValue++;
    paradaTempo.value = paradaTempoValue;
}
function hfMaior() {
    if (document.getElementById('hf').value < document.getElementById('hi').value) {
        alert("Horário final deve ser maior do que o horário inicial !!");
        document.getElementById('hf').value = "";
    }
}
setInterval(verificarHora, 60000);// a cada 1 minuto 
function verificarHora() {
    var novaData = new Date();
    var diaOntem = (novaData.getDate() - 1);
    var mesAtual = novaData.getMonth() + 1;
    diaOntem = diaOntem < 10 ? '0' + diaOntem : diaOntem;
    mesAtual = mesAtual < 10 ? '0' + mesAtual : mesAtual;
    //var anoAtual = novaData.getFullYear();
    var horaAtual = novaData.getHours();
    var minutosAtuais = novaData.getMinutes();
    //var dataOntem = anoAtual + "-" + mesAtual + '-' + diaOntem;
    var hi = document.getElementById('hi').value
    if (hi != '') {
        var partsHi = hi.split(":");
        var hoursHi = parseInt(partsHi[0], 10);
    }
    if (horaAtual === 13 && minutosAtuais == 0 && hoursHi < 12) {
        mostrarConfirmacao();
    }
}
let mostrouConfirmacao = false;
let descontarAlmoco = false;

//cria a confirmação
function mostrarConfirmacao() {
    return new Promise((resolve) => {
        mostrouConfirmacao = true;
        const overlay = document.createElement("div");
        overlay.classList.add("overlay");

        const confirmacaoBox = document.createElement("div");
        confirmacaoBox.classList.add("confirmacao-box");

        const mensagem = document.createElement("p");
        mensagem.textContent = "Descontar hora de almoço (1h) ?";
        confirmacaoBox.appendChild(mensagem);

        const botoes = document.createElement("div");
        botoes.classList.add("botoes");

        const simButton = document.createElement("button");
        simButton.textContent = "Sim";
        simButton.addEventListener("click", () => {
            removerConfirmacao();
            descontarAlmoco = true;
            resolve(true);
        });
        botoes.appendChild(simButton);

        const naoButton = document.createElement("button");
        naoButton.textContent = "Não";
        naoButton.addEventListener("click", () => {
            removerConfirmacao();
            resolve(false);
        });
        botoes.appendChild(naoButton);

        confirmacaoBox.appendChild(botoes);
        overlay.appendChild(confirmacaoBox);
        const divConfirm = document.getElementById("divConfirm");
        // Adicionar tela de confirmação ao corpo do documento
        divConfirm.appendChild(overlay);
    });
}
//remove a tela de confirmação
function removerConfirmacao() {
    const overlay = document.querySelector(".overlay");
    if (overlay) {
        overlay.remove();
    }
}

// ------------------- DEMANDA ORDEM -------------------
function demandasBtn() {
    const ordemText = document.getElementById("ordem").value;
    const buttonIcon = document.getElementById("buttonIcon");
    const loadingIcon = document.getElementById("loadingIcon");

    // Mostrar ícone de carregamento
    buttonIcon.style.display = 'none';  // Oculta o ícone original
    loadingIcon.style.display = 'inline-block';  // Mostra o ícone de carregamento

    fetch('/vizualizarOrdens', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ordens: ordemText })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao buscar demandas');
            }
            return response.json();
        })
        .then(data => {
            // Exibe o conteúdo
            const divDemanda = document.getElementById("divDemanda");
            divDemanda.style.display = "block";
            divDemanda.innerHTML = '';    
            const overlay = document.createElement("div");
            overlay.classList.add("overlay");

            const confirmacaoBox = document.createElement("div");
            confirmacaoBox.classList.add("confirmacao-box");
            confirmacaoBox.style.color='black';

            const table = document.createElement("table");
            table.classList.add("confirmacao-tabela");

            const thead = document.createElement("thead");
            const headerRow = document.createElement("tr");
            headerRow.style.fontWeight = "bold";
            headerRow.style.color='black';
            const headerContent = ["Código", "Descrição", "Quantidade", "Un.Med"];
            headerContent.forEach(title => {
                const th = document.createElement("th");
                th.textContent = title;
                th.className = "column";
                headerRow.appendChild(th);
            });

            thead.appendChild(headerRow);
            table.appendChild(thead);

            const tbody = document.createElement("tbody");
            data.forEach(item => {
                const row = document.createElement("tr");
                //row.style.borderBottom = "2px solid black";
                const codigoCell = document.createElement("td");
                codigoCell.textContent = item["cod_item_d"];
                codigoCell.className = "column";
                row.appendChild(codigoCell);

                const descricaoCell = document.createElement("td");
                descricaoCell.textContent = item["desc_tecnica_d"];
                descricaoCell.className = "column";
                row.appendChild(descricaoCell);

                const quantidadeCell = document.createElement("td");
                quantidadeCell.textContent = `${item["qtde_d"].toLocaleString('pt-BR')}`;
                quantidadeCell.className = "column";
                row.appendChild(quantidadeCell);

                const uniMed = document.createElement("td");
                uniMed.textContent = `${item["cod_unid_med_d"]}`;
                uniMed.className = "column";
                row.appendChild(uniMed);

                tbody.appendChild(row);
            });

            table.appendChild(tbody);
            confirmacaoBox.appendChild(table);

            const botoes = document.createElement("div");
            botoes.classList.add("botoes");

            const naoButton = document.createElement("button");
            naoButton.textContent = "Sair";
            naoButton.addEventListener("click", () => {
                removerConfirmacao();
            });
            botoes.appendChild(naoButton);

            confirmacaoBox.appendChild(botoes);
            overlay.appendChild(confirmacaoBox);
            divDemanda.appendChild(overlay);
        })
        .catch(error => {
            console.error('Erro:', error);
        })
        .finally(() => {
            // Restaurar o ícone original após a conclusão
            buttonIcon.style.display = 'inline-block'; // Mostra o ícone original
            loadingIcon.style.display = 'none'; // Oculta o ícone de carregamento
        });
}



document.getElementById("hf").addEventListener('blur', hfMaior);

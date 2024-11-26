///MENU\\\
$(document).ready(function () {
    $('.list').addClass('hidden'); // Adiciona a classe hidden inicialmente
    $('.menu').on('click', function () {
        $('.list').toggleClass('hidden');
    });
});
document.addEventListener('DOMContentLoaded', () => {

});

const olPess = document.getElementById("ol-res-pess");

const btnSalvar = document.getElementById("btnSalvar");
btnSalvar.style.display = "none";
const btnEdit = document.getElementById("btnEdit");
btnEdit.style.display = "none";
const btnAdd = document.getElementById("btnAdd");

const divOl = document.getElementById("div-ol");
divOl.style.display = "none";
const addDiv = document.getElementById("add-div");
addDiv.style.display = "none";

const p1 = document.getElementById("p1");
const p2 = document.getElementById("p2");
p2.style.display = "none";
var itemTotais;
function buscar() {

    p1.style.display = "none";

    btnEdit.style.display = "block";

    divOl.style.display = "flex";


    olPess.innerHTML = "";

    const buscar = document.getElementById("buscar");

    const buscarValue = buscar.value;
    const idInicial = document.getElementById("idInicial").value;
    const idFinal = document.getElementById("idFinal").value;
    var item = encontrarNumeroPorCodigo(buscarValue);

    fetch('/buscarRegistros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({
            'item': buscarValue,
            'idInicial': idInicial,
            'idFinal': idFinal
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log("dataXML:", data);
            var item = data;
            itemTotais = data
            const header = document.createElement("li");
            header.style.fontWeight = "bold"; // Deixar o cabeçalho em negrito

            // Define os títulos das colunas
            const headerContent = [
                "Ordem",
                "Data Inicial",
                "Código",
                "Descrição",
                "Quantidade"
            ];

            headerContent.forEach(title => {
                const span = document.createElement("span");
                span.textContent = title;
                header.appendChild(span);
                span.className = "column";

            });

            // Adiciona o cabeçalho à lista
            olPess.appendChild(header);
            for (var i = 0; i < item.length; i++) {
                const li = document.createElement("li");
                li.className = "borda";
                //codigo
                var codigo = item[i]["codItem"] + " - ";
                var codigoText = document.createElement("span");
                codigoText.textContent = `${codigo}`;
                codigoText.className = "column";
                //data inicial 
                const dateStr = item[i]["diaHI"]; // Supondo que esta é a string de data no formato 'aaaa-mm-dd'
                const dateObj = new Date(dateStr); // Cria um objeto de data a partir da string
                const day = String(dateObj.getDate()).padStart(2, '0'); // Obtém o dia e adiciona zero à esquerda se necessário
                const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Obtém o mês (ajustando, pois começa em 0) e adiciona zero à esquerda se necessário
                const year = String(dateObj.getFullYear()).slice(-2); // Obtém os últimos dois dígitos do ano
                const formattedDate = `${day}/${month}/${year}`;
                var valorText = document.createElement("span");
                valorText.textContent = `${formattedDate}`;
                valorText.className = "column";
                //ordem
                var ordemText = item[i]["numOrdem"] + " - ";
                var ordemElement = document.createElement("span");
                ordemElement.textContent = `${ordemText}`;
                ordemElement.className = "column";
                //desc
                var descText = item[i]["descItem"] + " - ";
                var descElement = document.createElement("span");
                descElement.textContent = `${descText}`;
                descElement.className = "column";
                //qtde
                var qtdeText = item[i]["qtdePendente"];
                var formattedQtde = Number(qtdeText).toLocaleString('pt-BR');
                var unMed = item[i]["unMed"];
                var qtdeElement = document.createElement("span");
                qtdeElement.textContent = `${formattedQtde} ${unMed}`;
                qtdeElement.className = "column";

                //pessoas 
                /*
                var pessoasE = ` Envase: ${item[i]["pessoasE"]} ; `;
                var pessoasR = ` Rotulagem: ${item[i]["pessoasR"]} ; `;
                var pessoasD = ` Degorge: ${item[i]["pessoasD"]} ; `;
                const pE = document.createElement("span");
                const pR = document.createElement("span");
                const pD = document.createElement("span");
                pE.textContent = `${pessoasE}`;
                pR.textContent = `${pessoasR}`;
                pD.textContent = `${pessoasD}`;
                pE.className = "classSpanPess";
                pR.className = "classSpanPess";
                pD.className = "classSpanPess";
                */
                // cria o cbV
                const nvV = document.createElement("input");
                nvV.setAttribute("hidden", "true");
                nvV.style.width = "100px"
                nvV.placeholder = "Novo Valor";
                nvV.type = "number";
                nvV.name = "Checkbox" + item[i]["nomeItem"];
                const cbV = document.createElement("input");
                cbV.setAttribute("hidden", "true");
                cbV.type = "checkbox";
                cbV.className = "prodCheck";
                cbV.onclick = function () {
                    if (nvV.value !== "") {
                        cbV.value = nvV.value
                    } else {
                        cbV.checked = false;
                        alert("Valor não suportado!!!")
                    }
                };

                // Criar o cbE
                const nvE = document.createElement("input");
                nvE.setAttribute("hidden", "true");
                nvE.style.width = "40px"
                nvE.type = "number";
                nvE.name = "PessoasValor" + item[i]["nomeItem"];
                const cbE = document.createElement("input");
                cbE.setAttribute("hidden", "true");
                cbE.type = "checkbox";
                cbE.className = "pessCheckE";
                cbE.onclick = function () {
                    if (nvE.value !== "") {
                        cbE.value = nvE.value
                    } else {
                        cbE.checked = false;
                        alert("Valor não suportado!!!")
                    }
                };
                // Criar o cbD
                const nvD = document.createElement("input");
                nvD.setAttribute("hidden", "true");
                nvD.style.width = "40px"
                nvD.type = "number";
                nvD.name = "PessoasValor" + item[i]["nomeItem"];
                const cbD = document.createElement("input");
                cbD.setAttribute("hidden", "true");
                cbD.type = "checkbox";
                cbD.className = "pessCheckD";
                cbD.onclick = function () {
                    if (nvD.value !== "") {
                        cbD.value = nvD.value
                    } else {
                        cbD.checked = false;
                        alert("Valor não suportado!!!")
                    }
                };
                // Criar o cbR
                const nvR = document.createElement("input");
                nvR.setAttribute("hidden", "true");
                nvR.style.width = "40px"
                nvR.type = "number";
                nvR.name = "PessoasValor" + item[i]["nomeItem"];
                const cbR = document.createElement("input");
                cbR.setAttribute("hidden", "true");
                cbR.type = "checkbox";
                cbR.className = "pessCheckR";
                cbR.onclick = function () {
                    if (nvR.value !== "") {
                        cbR.value = nvR.value
                    } else {
                        cbR.checked = false;
                        alert("Valor não suportado!!!")
                    }
                };

                li.appendChild(ordemElement);
                li.appendChild(valorText);
                li.appendChild(codigoText);
                li.appendChild(descElement);
                li.appendChild(qtdeElement);
                li.appendChild(nvV);
                li.appendChild(cbV);

                //condição para não aparecer zerado
                /*
                if (item[i]["pessoasR"] != null) {

                    li.appendChild(pR);
                    li.appendChild(nvR);
                    li.appendChild(cbR);
                }
                if (item[i]["pessoasE"] != null) {
                    li.appendChild(pE);
                    li.appendChild(nvE);
                    li.appendChild(cbE);
                }
                if (item[i]["pessoasD"] != null) {
                    li.appendChild(pD);
                    li.appendChild(nvD);
                    li.appendChild(cbD);
                }
*/
                // Botão de exclusão
                //adicionarBotaoExclusao(li, codigo);
                adicionarBtn(li, ordemText)
                olPess.appendChild(li);

            }
        })
        .catch((error) => {
            console.log('Erro ao carregar dados:', error);
            alert(`Código ${buscarValue} não encontrado!!.`);
            location.reload();//reload

        });

    buscar.value = "";
}
// ------------------- DEMANDA ORDEM -------------------
function adicionarBtn(li, codigoFormatado) {
    const ordemText = codigoFormatado.split(' - ')[0].trim();
    // Botão de demanda
    const deleteButton = document.createElement("button");
    deleteButton.className = "deleteButton";
    deleteButton.action = "/vizualizarOrdens";

    const icon = document.createElement("i");
    icon.id = "buttonIcon";
    icon.classList.add("material-symbols-outlined");
    icon.textContent = "list_alt";

    deleteButton.appendChild(icon);

    const loadingIcon = document.createElement("div");
    loadingIcon.id = "loadingIcon";
    loadingIcon.classList.add("loader");
    loadingIcon.style.display = "none";
    deleteButton.appendChild(loadingIcon);

    deleteButton.addEventListener("click", function () {
        const buttonIcon = document.getElementById("buttonIcon");
        const loadingIcon = document.getElementById("loadingIcon");

        buttonIcon.style.display = 'none';
        loadingIcon.style.display = 'inline-block';
        fetch('/vizualizarOrdens', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ordens: ordemText })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao excluir o parâmetro');
                }
                if (response.ok) {
                    return response.json();
                }
            })
            .then(data => {
                const divDemanda = document.getElementById("divDemanda");
                divDemanda.innerHTML = '';
                const overlay = document.createElement("div");
                overlay.classList.add("overlay");

                const confirmacaoBox = document.createElement("div");
                confirmacaoBox.classList.add("confirmacao-box");

                // Cria a tabela
                const table = document.createElement("table");
                table.classList.add("confirmacao-tabela");

                // Cria o cabeçalho da tabela
                const thead = document.createElement("thead");
                const headerRow = document.createElement("tr");
                headerRow.style.fontWeight = "bold"; // Deixar o cabeçalho em negrito

                // Define os títulos das colunas
                const headerContent = ["Código", "Descrição", "Quantidade", "Un.Med"];

                headerContent.forEach(title => {
                    const th = document.createElement("th");
                    th.textContent = title;
                    th.className = "column";
                    headerRow.appendChild(th);
                });

                thead.appendChild(headerRow);
                table.appendChild(thead);

                // Cria o corpo da tabela
                const tbody = document.createElement("tbody");

                data.forEach(item => {
                    const row = document.createElement("tr");
                    
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
                /*
                                const simButton = document.createElement("button");
                                simButton.textContent = "Sim";
                                simButton.addEventListener("click", () => {
                                    removerConfirmacao();
                                    callback(true);
                                });
                                botoes.appendChild(simButton);
                */
                const naoButton = document.createElement("button");
                naoButton.textContent = "Sair";
                naoButton.addEventListener("click", () => {
                    removerConfirmacao();
                    //callback(false);
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

                buttonIcon.style.display = 'inline-block';
                loadingIcon.style.display = 'none';
            });
    });
    li.appendChild(deleteButton);
}

// Botão de exclusão
function adicionarBotaoExclusao(li, codigo) {
    const codigoFormatado = codigo.split(' - ')[0].trim();
    // Botão de exclusão
    const deleteButton = document.createElement("button");
    deleteButton.innerHTML = '<i class="material-icons">delete</i>';
    deleteButton.className = "deleteButton";
    deleteButton.action = "/deleteParametros/:codigo";
    deleteButton.addEventListener("click", function () {

        mostrarConfirmacao(function (confirmado) {
            if (confirmado) {
                fetch(`/deleteParametros/${codigoFormatado}`, {
                    method: "DELETE"
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Erro ao excluir o parâmetro');
                        }
                        if (response.ok) {
                            console.log(`Item ${codigo} excluído!`);
                        }
                        li.remove();
                    })
                    .catch(error => {
                        console.error('Erro:', error);
                    });
            }
        });
    });
    li.appendChild(deleteButton);
}
//cria a confirmação
function mostrarConfirmacao(callback) {
    // Criar elementos da tela de confirmação
    const overlay = document.createElement("div");
    overlay.classList.add("overlay");

    const confirmacaoBox = document.createElement("div");
    confirmacaoBox.classList.add("confirmacao-box");

    const mensagem = document.createElement("p");
    mensagem.textContent = "Tem certeza de que deseja excluir este item?";
    confirmacaoBox.appendChild(mensagem);

    const botoes = document.createElement("div");
    botoes.classList.add("botoes");

    const simButton = document.createElement("button");
    simButton.textContent = "Sim";
    simButton.addEventListener("click", () => {
        removerConfirmacao();
        callback(true);
    });
    botoes.appendChild(simButton);

    const naoButton = document.createElement("button");
    naoButton.textContent = "Não";
    naoButton.addEventListener("click", () => {
        removerConfirmacao();
        callback(false);
    });
    botoes.appendChild(naoButton);

    confirmacaoBox.appendChild(botoes);
    overlay.appendChild(confirmacaoBox);
    const divConfirm = document.getElementById("divConfirm");
    // Adicionar tela de confirmação ao corpo do documento
    divConfirm.appendChild(overlay);
}
//remove a tela de confirmação
function removerConfirmacao() {
    const overlay = document.querySelector(".overlay");
    if (overlay) {
        overlay.remove();
    }
}

//função do botão salvar
function editarProdutividade() {
    p2.style.display = 'none';
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');

    const itensParaEditar = [];
    const itensParaPessR = [];
    const itensParaPessE = [];
    const itensParaPessD = [];
    if (checkboxes == "checked") {
        alert("Nunhum check selecionado!!!")
    }

    checkboxes.forEach(checkbox => {
        if (checkbox.className === "prodCheck") {
            const codigo = checkbox.parentNode.textContent.split(' - ')[0].trim();
            const valor = checkbox.value;
            if (valor !== "") {
                itensParaEditar.push({ "Código": codigo, "Prod": valor });
            }
        } else if (checkbox.className === "pessCheckR") {
            const codigo = checkbox.parentNode.textContent.split(' - ')[0]
            const valor = checkbox.value;
            if (valor !== "") {
                itensParaPessR.push({ "Código": codigo, "Pessoas": valor });
            }
        } else if (checkbox.className === "pessCheckE") {
            const codigo = checkbox.parentNode.textContent.split(' - ')[0]
            const valor = checkbox.value;
            if (valor !== "") {
                itensParaPessE.push({ "Código": codigo, "Pessoas": valor });
            }
        }
        else if (checkbox.className === "pessCheckD") {
            const codigo = checkbox.parentNode.textContent.split(' - ')[0]
            const valor = checkbox.value;
            if (valor !== "") {
                itensParaPessD.push({ "Código": codigo, "Pessoas": valor });
            }
        }
    });



    //call para editar parametros existentes
    fetch('/editar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            item: itensParaEditar,
            itemPR: itensParaPessR,
            itemPE: itensParaPessE,
            itemPD: itensParaPessD
        })
    })
        .then(response => {
            if (response.ok) {
                console.log('Valores enviados com sucesso para edição.');
            } else {
                console.error('Erro ao enviar valores para edição.');
            }
        })
        .catch(error => {
            console.error('Erro ao enviar valores para edição:', error);
        });

    divOl.style.display = "none";

    let a = `Itens alterados com sucesso !! `
    document.getElementById("span").innerHTML = a;
    setTimeout(function () { location.reload(); }, 1000);

}
//função do botão editar
function mostrar() {
    p2.style.display = "block"

    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const checked = document.querySelectorAll('input[type="checkbox"]:checked');
    const novoItem = document.querySelectorAll('input[type="number"]');

    checkboxes.forEach(checkbox => {
        if (checkbox.hasAttribute("hidden")) {
            checkbox.removeAttribute("hidden");
            btnSalvar.style.display = "block";
            btnAdd.style.display = "none";
            addDiv.style.display = 'none';
        } else {
            checkbox.setAttribute("hidden", "true");
            btnSalvar.style.display = "none";
            btnAdd.style.display = "block";
        }
    });
    checked.forEach(checkbox => {
        if (checkbox.hasAttribute("hidden", "false")) {
            checkbox.removeAttribute("hidden");
            btnSalvar.style.display = "n";
        } else {
            checkbox.setAttribute("hidden", "true");
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

//-------- EXPLODIR ----------------
function mostrarAdd() {

    const loadingIconExp = document.getElementById("loadingIconExp");
    loadingIconExp.style.display = 'inline-block';

    if (addDiv.style.display === 'none') {
        var dataIn = document.getElementById("idInicial").value;
        var dataFi = document.getElementById("idFinal").value;

        document.getElementById("legend-dem-tot").innerHTML = `Demandas de Ordens ${dataIn} a ${dataFi}`
        addDiv.style.display = 'block';
        document.getElementById("div-1").style.display = 'none';
        var ordensEnviadas = [];
        itemTotais.forEach(item => {
            ordensEnviadas.push(item.numOrdem);
        })
        fetch('/vizualizarOrdens', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ordens: ordensEnviadas })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao excluir o parâmetro');
                }
                if (response.ok) {
                    return response.json();
                }

            })
            .then(data => {
                const divDemandaTot = document.getElementById("div-demanda-totais");
                divDemandaTot.innerHTML = '';
                // Cria a tabela
                const table = document.createElement("table");
                table.classList.add("confirmacao-tabela");

                // Cria o cabeçalho da tabela
                const thead = document.createElement("thead");
                const headerRow = document.createElement("tr");
                headerRow.style.fontWeight = "bold"; // Deixar o cabeçalho em negrito

                // Define os títulos das colunas
                const headerContent = ["Código", "Descrição", "Estoque", "Demanda", "(Est-Qtde)", "Un.Med"];

                headerContent.forEach(title => {
                    const th = document.createElement("th");
                    th.textContent = title;
                    th.className = "column";
                    headerRow.appendChild(th);
                });

                thead.appendChild(headerRow);
                table.appendChild(thead);

                // Cria o corpo da tabela
                const tbody = document.createElement("tbody");

                data.forEach(item => {
                    const row = document.createElement("tr");
                    //Código
                    const codigoCell = document.createElement("td");
                    codigoCell.textContent = item["cod_item_d"];
                    codigoCell.className = "column";
                    row.appendChild(codigoCell);
                    //Descrição
                    const descricaoCell = document.createElement("td");
                    descricaoCell.textContent = item["desc_tecnica_d"];
                    descricaoCell.className = "column";
                    row.appendChild(descricaoCell);
                    //Estoque
                    const estoqueCell = document.createElement("td");
                    estoqueCell.textContent = `${item["estoque_atual"].toLocaleString('pt-BR')}`;
                    estoqueCell.className = "column";
                    row.appendChild(estoqueCell);
                    //Demanda
                    const quantidadeCell = document.createElement("td");
                    quantidadeCell.textContent = `${item["qtde_pendente_d"].toLocaleString('pt-BR')}`;
                    quantidadeCell.className = "column";
                    row.appendChild(quantidadeCell);
                    //Diferença Est-Demanda
                    const diferencaCell = document.createElement("td");
                    diferencaCell.textContent = `${item["diferenca"].toLocaleString('pt-BR')}`;
                    if (item["diferenca"] < 0) {
                        diferencaCell.style.color = 'red';
                    }
                    diferencaCell.className = "column";
                    row.appendChild(diferencaCell);
                    //Unidade de medida
                    const uniMed = document.createElement("td");
                    uniMed.textContent = `${item["cod_unid_med_d"]}`;
                    uniMed.className = "column";
                    row.appendChild(uniMed);

                    tbody.appendChild(row);
                });

                table.appendChild(tbody);
                divDemandaTot.appendChild(table);
                /*
                 const botoes = document.createElement("div");
                 botoes.classList.add("botoes");
 
                 const simButton = document.createElement("button");
                 simButton.textContent = "Sim";
                 simButton.addEventListener("click", () => {
                     removerConfirmacao();
                     callback(true);
                 });
                 botoes.appendChild(simButton);
 
                 const naoButton = document.createElement("button");
                 naoButton.textContent = "Não";
                 naoButton.addEventListener("click", () => {
                     removerConfirmacao();
                     callback(false);
                 });
                 botoes.appendChild(naoButton);
 
                 divDemandaTot.appendChild(botoes);
                 */
            })

            .catch(error => {
                console.error('Erro:', error);
            })
            .finally(() => {
                loadingIconExp.style.display = 'none';
            });

    } else {
        addDiv.style.display = 'none';
    }
}
function sair() {
    addDiv.style.display = 'none';
    document.getElementById("div-1").style.display = 'block';

}
/*
function enviarAdd() {
    var verificarItem = document.getElementById('item_add').value;
    var verificarVelo = document.getElementById('velo_add').value;
    if (verificarItem && verificarVelo) {
        const form = document.getElementById('frmAdd');
        const formData = new FormData(form);

        fetch('/addParametros', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Object.fromEntries(formData))
        })
            .then(response => {
                if (response.ok) {
                    console.log('Item enviado');
                    // Você pode adicionar aqui uma ação de redirecionamento ou atualização da página se desejar
                } else {
                    console.error('Erro ao enviar!');
                }
            })
            .catch(error => {
                console.error('Erro ao enviar:', error);
            });
        //location.reload();//reload 
    } else {
        alert("Verifique os campos e preencha corretamente !!");
    }

}
*/
function encontrarOrdemPorCodigo(codigo) {
    var resultados = [];

    for (var i = 0; i < parametros.length; i++) {
        if (parametros[i]["Código"].includes(codigo)) {
            var capData = {
                prod: parametros[i]["Prod"],
                nomeItem: parametros[i]["Código"],
                pessoas: parametros[i]["Pessoas"],
                pessoasE: parametros[i]["Pessoas"].envase,
                pessoasD: parametros[i]["Pessoas"].degorgment,
                pessoasR: parametros[i]["Pessoas"].rotulagem
            }
            resultados.push(capData);
        }
    }
    resultados.sort(function (a, b) {
        return a.nomeItem.localeCompare(b.nomeItem);
    });
    return resultados.length > 0 ? resultados : null;
}


function encontrarNumeroPorCodigo(codigo) {
    var resultados = [];

    for (var i = 0; i < parametros.length; i++) {
        if (parametros[i]["Código"].includes(codigo)) {
            var capData = {
                prod: parametros[i]["Prod"],
                nomeItem: parametros[i]["Código"],
                pessoas: parametros[i]["Pessoas"],
                pessoasE: parametros[i]["Pessoas"].envase,
                pessoasD: parametros[i]["Pessoas"].degorgment,
                pessoasR: parametros[i]["Pessoas"].rotulagem
            }
            resultados.push(capData);
        }
    }
    resultados.sort(function (a, b) {
        return a.nomeItem.localeCompare(b.nomeItem);
    });
    return resultados.length > 0 ? resultados : null;
}
function toUpperCase(elem) {
    elem.value = elem.value.toUpperCase();
}
function somenteNumeros(elem) {
    elem.value = elem.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
}
var parametros;
fetch('bancoDeDados/parametros.json')
    .then(response => response.json())
    .then(data => {
        parametros = data;

    })
    .catch(error => console.error('Erro ao carregar os dados:', error));

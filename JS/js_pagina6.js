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

function buscar() {

    p1.style.display = "none";

    btnEdit.style.display = "block";

    divOl.style.display = "flex";


    olPess.innerHTML = "";

    const buscar = document.getElementById("buscar");

    const buscarValue = buscar.value;
    var item = encontrarNumeroPorCodigo(buscarValue);
    //alerta
    if (item == null) {
        alert(`Código ${buscarValue} não encontrado!!.`);
        location.reload();//reload
    }
    const header = document.createElement("li");
    header.style.fontWeight = "bold";

    const headerContent = [
        "Código",
        "Descrição",
        "Velocidade",
        "| Nº de Pessoas Padrão"
    ];

    headerContent.forEach(title => {
        const span = document.createElement("span");
        span.textContent = title;
        header.appendChild(span);
        span.className = "column";

    });

    // Adiciona o cabeçalho à lista
    olPess.appendChild(header);
    //Cria todas linhas e ol
    for (var i = 0; i < item.length; i++) {
        const li = document.createElement("li");
        li.className = "borda";
        //codigo
        //console.log( "desc",item[i]["desc"]);
        var codigo = item[i]["nomeItem"] + " - ";
        var codigoText = document.createElement("span");
        codigoText.textContent = `${codigo}`;
        //descrição
        var desc = item[i]["desc"] + " - ";
        var descText = document.createElement("span");
        descText.textContent = `${desc}`;
        //velocidade 
        var valor = item[i]["prod"] + " GF/H | ";
        var valorText = document.createElement("span");
        valorText.textContent = `${valor}`;
        //pessoas 
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
        li.appendChild(codigoText);
        if (item[i]["desc"] != undefined) {
            li.appendChild(descText);
        };
        li.appendChild(valorText);
        li.appendChild(nvV);
        li.appendChild(cbV);

        //condição para não aparecer zerado
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

        // Botão de exclusão
        adicionarBotaoExclusao(li, codigo);
        olPess.appendChild(li);
    }

    buscar.value = "";
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
//função do botão adicionar
function mostrarAdd() {
var divOl = document.getElementsByClassName("div-ol-result")[0];
    if (addDiv.style.display === 'none') {
        divOl.style.display = 'none';
        addDiv.style.display = 'block';
    } else {
        addDiv.style.display = 'none';
    }
}
function sairAdd(){
    var divOl = document.getElementsByClassName("div-ol-result")[0];
    if (addDiv.style.display === 'none') {
        addDiv.style.display = 'block';
    } else {
        addDiv.style.display = 'none';
        divOl.style.display = 'block';

    }
}
function enviarAdd() {
    var verificarItem = document.getElementById('item_add').value;
    var verificarDesc = document.getElementById('desc_add').value;

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
                pessoasR: parametros[i]["Pessoas"].rotulagem,
                desc: parametros[i]["DESC"],
            }
            resultados.push(capData);
        }
    }
    resultados.sort(function (a, b) {
        return a.nomeItem.localeCompare(b.nomeItem);
    });
    return resultados.length > 0 ? resultados : null;
}
function autoResize(input) {
    input.style.width = ((input.value.length + 10) * 100) + 'px';
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

//EMAIL ----------------------------------------------------

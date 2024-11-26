///MENU\\\
$(document).ready(function () {
    $('.list').addClass('hidden'); // Adiciona a classe hidden inicialmente
    $('.menu').on('click', function () {
        $('.list').toggleClass('hidden');
    });
});

const ol = document.getElementById("ol-resultado");
const olR = document.getElementById("ol-res-rend");
const olPess = document.getElementById("ol-res-pess");
const btnSalvar = document.getElementById("btnSalvar");
btnSalvar.style.display = "none";
const btnEdit = document.getElementById("btnEdit");
btnEdit.style.display = "none";
const divOl = document.getElementById("div-ol");
divOl.style.display = "none";
const p1 = document.getElementById("p1");
const p2 = document.getElementById("p2");
p2.style.display = "none";
const addDiv = document.getElementById("add-div");
addDiv.style.display = "none";
const btnAdd = document.getElementById("btnAdd");

function buscar() {
    p1.style.display = "none";
    btnEdit.style.display = "block";
    divOl.style.display = "flex";
    ol.innerHTML = "";
    olR.innerHTML = "";
    olPess.innerHTML = "";

    const buscar = document.getElementById("buscar");
    const buscarValue = buscar.value;
    var item = encontrarNumeroPorCodigo(buscarValue);
    //alerta
    if (item == null) {
        alert(`Código ${buscarValue} não encontrado!!.`);
        location.reload();//reload
    }

    //prod
    for (var i = 0; i < item.length; i++) {
        var valor = item[i]["prod"] + " GF/H ; ";
        var codigo = item[i]["nomeItem"] + " - ";
        const li = document.createElement("li");
        li.textContent = `${codigo}${valor}`;

        // Botão de exclusão
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Excluir";
        deleteButton.className = "deleteButton";
        deleteButton.action="/deleteParametros/:codigo"
        deleteButton.addEventListener("click", function () {
            var codigo=li.textContent.split(' - ')[0].trim();
            console.log("excluido "+codigo)
            fetch(`/deleteParametros/${codigo}`, {
                method: "DELETE"
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao excluir o parâmetro');
                }
            })
            .catch(error => {
                console.error('Erro:', error);
            });
            li.remove();
            
        });

        // Criar o checkbox
        const novoValor = document.createElement("input");
        novoValor.setAttribute("hidden", "true");
        novoValor.style.width = "100px"
        novoValor.placeholder = "Novo Valor";
        novoValor.type = "number";
        novoValor.name = "Checkbox" + item[i]["nomeItem"];

        const checkbox = document.createElement("input");
        checkbox.setAttribute("hidden", "true");
        checkbox.type = "checkbox";
        checkbox.className = "prodCheck";

        checkbox.onclick = function () {
            if (novoValor.value !== "") {
                checkbox.value = novoValor.value
            } else {
                checkbox.checked = false;
                alert("Valor não suportado!!!")
            }
        };
        li.appendChild(novoValor);
        li.appendChild(checkbox);
        li.appendChild(deleteButton);
        ol.appendChild(li);
    }
    //rend
    for (var i = 0; i < item.length; i++) {
        var valor = item[i]["valor"] + " GF.H/P";
        var codigo = item[i]["nomeItem"] + " - ";
        const li = document.createElement("li");
        li.textContent = `${codigo}${valor}`;
        // Criar o checkbox
        const novoValor = document.createElement("input");
        novoValor.setAttribute("hidden", "true");
        novoValor.style.width = "100px"
        novoValor.placeholder = "Novo Valor";
        novoValor.type = "number";
        novoValor.name = "RendimentoValor" + item[i]["nomeItem"];

        const checkbox = document.createElement("input");
        checkbox.setAttribute("hidden", "true");
        checkbox.type = "checkbox";
        checkbox.className = "rendCheck";

        checkbox.onclick = function () {
            if (novoValor.value !== "") {
                checkbox.item = codigo;
                checkbox.value = novoValor.value
            } else {
                checkbox.checked = false;
                alert("Valor não suportado!!!")
            }
        };
        li.appendChild(novoValor);
        li.appendChild(checkbox);
        olR.appendChild(li);
    }
    //pessoas
    for (var i = 0; i < item.length; i++) {
        var pessoasE = ` Envase: ${item[i]["pessoasE"]} ; `;
        var pessoasR = ` Rotulagem: ${item[i]["pessoasR"]} ; `;
        var pessoasD = ` Degorge: ${item[i]["pessoasD"]} ; `;
        var codigo = item[i]["nomeItem"] + " - ";
        var codigoText = document.createElement("span");
        codigoText.textContent = `${codigo}`;
        const li = document.createElement("li");
        const pE = document.createElement("span");
        const pR = document.createElement("span");
        const pD = document.createElement("span");
        pE.textContent = `${pessoasE}`;
        pR.textContent = `${pessoasR}`;
        pD.textContent = `${pessoasD}`;
        //li.textContent = `${codigo}${pessoasE}`;
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
        olPess.appendChild(li);
    }

    buscar.value = "";
}


function editarProdutividade() {
    p2.style.display = 'none';
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');

    const itensParaEditar = [];
    const itensParaRend = [];
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
        } else if (checkbox.className === "rendCheck") {
            const codigo = checkbox.parentNode.textContent.split(' - ')[0]
            const valor = checkbox.value;
            if (valor !== "") {
                itensParaRend.push({ "Código": codigo, "Valor": valor });
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




    fetch('/editar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            item: itensParaEditar,
            itemR: itensParaRend,
            itemPR: itensParaPessR,
            itemPE: itensParaPessE,
            itemPD: itensParaPessD
        })
    })
        .then(response => {
            if (response.ok) {
                console.log('Valores enviados com sucesso para edição.');
                // Realizar qualquer ação adicional após o sucesso da edição
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
function mostrarAdd() {

    if (addDiv.style.display === 'none') {
        addDiv.style.display = 'block';
    } else {
        addDiv.style.display = 'none';
    }
}
function enviarAdd() {
    location.reload();//reload
}
function encontrarNumeroPorCodigo(codigo) {
    var resultados = [];

    for (var i = 0; i < parametros.length; i++) {
        if (parametros[i]["Código"].includes(codigo)) {
            var capData = {
                valor: parametros[i]["Valor"],
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

//EMAIL ----------------------------------------------------

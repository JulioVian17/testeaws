///MENU\\\
$(document).ready(function () {
    $('.list').addClass('hidden'); // Adiciona a classe hidden inicialmente
    $('.menu').on('click', function () {
        $('.list').toggleClass('hidden');
    });
});
function fillPageWithData(data) {
    const container = document.querySelector('.container');
    container.innerHTML = '';
    data.forEach(item => {
        let newDiv = document.createElement('div');
        newDiv.style.display = 'none'; // Inicialmente esconder todos os elementos

        if (item.formato === 'text') {
            newDiv.className = 'padrao1';
            const h1 = document.createElement("h1")
            h1.textContent = item.dados;
            newDiv.appendChild(h1);
        } else if (item.formato === 'photo') {
            newDiv.className = 'padrao1';
            let img = document.createElement('img');
            img.src = item.dados.replace('url:', '');
            img.alt = 'Imagem';
            newDiv.appendChild(img);
        } else if (item.formato === 'dashboard') {

            let iframe = document.createElement('iframe');
            iframe.src = item.dados;
            newDiv.className = 'padrao1';
            iframe.style.width = `${document.body.clientWidth}px`;
            iframe.style.height = `${document.body.clientHeight}px`;
            iframe.style.border = 'none';
            newDiv.appendChild(iframe);
        } else if (item.formato === 'table') {
            newDiv.className = 'padrao2';
            let iframe = document.createElement('iframe');
            iframe.src = item.dados;
            iframe.className = 'table';
            newDiv.appendChild(iframe);
        }
        container.appendChild(newDiv);
    });


    let currentIndex = 0;
    let sections = document.querySelectorAll('.container > div');

    function showNextSection() {
        sections[currentIndex].style.display = 'none';
        currentIndex = (currentIndex + 1) % sections.length;
        sections[currentIndex].style.display = 'flex';

        // Obtenha o tempo do próximo item ou use um valor padrão se não estiver definido
        const displayTime = (data[currentIndex].tempo || 10) * 1000;
          console.log("document",document.body.clientHeight)
        setTimeout(showNextSection, displayTime);
    }

    // Mostrar o primeiro elemento e iniciar o loop
    if (sections.length > 0) {
        sections[currentIndex].style.display = 'flex';
        setTimeout(showNextSection, (data[currentIndex].tempo || 10) * 1000);
    }
}
var retornoApi;
fetch('/getDisplay')
    .then(response => response.json())
    .then(data => {
        fillPageWithData(data);
        retornoApi = data;
    })
    .catch(error => {
        console.error('Erro ao buscar dados:', error);
    });
// ------ Central de Controle ----------
function openControlPanel() {
    document.getElementById('controlModal').style.display = 'block';
    var ul = document.getElementById("ul-diplay");
    ul.innerHTML = "";

    for (var i = 0; i < retornoApi.length; i++) {
        var li = document.createElement("li");
        li.id = `item-${i}`;
        li.textContent = `ID: ${i}, Conteúdo: ${retornoApi[i].formato}, Tempo:${retornoApi[i].tempo}`;
        li.style.display = 'flex';
        li.style.fontSize = 'medium';
        li.style.alignContent = 'space-between';
        li.style.alignItems = 'center'
        li.style.lineHeight = '2.5'

        var inputTempo = document.createElement("input");
        inputTempo.placeholder = 'Novo';
        inputTempo.style.display = 'none';
        inputTempo.style.textAlign = 'center'
        inputTempo.style.marginLeft = '5px'
        inputTempo.style.border = '1px solid gray'
        inputTempo.style.width = '60px'
        inputTempo.type = 'number';
        inputTempo.id = `tempo-${i}`;
        inputTempo.className = "inputTempoClass";

        var btnExcluir = document.createElement("button");
        btnExcluir.innerHTML = '<i class="material-icons">delete</i>';
        btnExcluir.className = "deleteButton";

        btnExcluir.onclick = (() => {
            const id = i;
            return () => excluirElemento(id);
        })();
        li.appendChild(inputTempo);
        li.appendChild(btnExcluir);
        ul.appendChild(li);
    }
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'div-botoes-add';
    buttonContainer.style.display = 'none';
    buttonContainer.style.marginTop = '10px';
    buttonContainer.style.justifyContent = 'space-between';
    const add = document.createElement('button');
    add.className = 'btnAdd';
    add.innerHTML = '<i class="fa-solid fa-plus fa-2xl add"></i>';
    add.onclick = () => {
        if (buttonContainer.style.display == 'none') {
            buttonContainer.style.display = 'block';
        } else { buttonContainer.style.display = 'none'; }

    };
    const btnEdit = document.createElement('button');
    btnEdit.textContent = 'Editar Tempo';
    btnEdit.style.marginTop = '10px'
    btnEdit.style.float = 'right'

    btnEdit.onclick = () => {
        inputTempoBlock();
    };
    const btnSalvar = document.createElement('button');
    btnSalvar.textContent = 'Salvar';
    btnSalvar.style.marginTop = '10px'

    btnSalvar.style.float = 'right'
    btnSalvar.onclick = () => {
        salvarTempo();
    };
    ul.appendChild(add);
    ul.appendChild(btnSalvar);
    ul.appendChild(btnEdit);

    // Botões adicionais
    const addButton = document.createElement('button');
    addButton.textContent = 'Nova Imagem';
    addButton.onclick = () => document.getElementById('fileInput').click();
    buttonContainer.appendChild(addButton);

    const addTextButton = document.createElement('button');
    addTextButton.textContent = 'Novo Texto';
    addTextButton.onclick = () => openTextInputModal();
    buttonContainer.appendChild(addTextButton);

    const addDashboardButton = document.createElement('button');
    addDashboardButton.textContent = 'Novo Dashboard';
    addDashboardButton.onclick = () => openDashInputModal();
    buttonContainer.appendChild(addDashboardButton);

    const addTableButton = document.createElement('button');
    addTableButton.textContent = 'Nova Tabela';
    addTableButton.onclick = () => openTableInputModal();
    buttonContainer.appendChild(addTableButton);

    ul.appendChild(buttonContainer);
}
function closeControlPanel() {
    document.getElementById('controlModal').style.display = 'none';
}
function excluirElemento(id) {
    const itemToRemove = document.getElementById(`item-${id}`);
    if (itemToRemove) {
        itemToRemove.remove();
    }
    fetch(`/deleteElement/${id}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            fetch('/getDisplay')
                .then(response => response.json())
                .then(data => {
                    fillPageWithData(data);
                })
                .catch(error => {
                    console.error('Erro ao buscar dados:', error);
                });
        })
        .catch(error => {
            console.error('Erro ao excluir elemento:', error);
        });
}
//------TEMPO------
function inputTempoBlock() {
    const inputs = document.getElementsByClassName("inputTempoClass");
    for (let input of inputs) {
        if (input.style.display == 'none') {
            input.style.display = 'block';
        } else if (input.style.display == 'block') {
            input.style.display = 'none';

        }

    }
}
function salvarTempo() {
    const inputs = document.querySelectorAll('input[type="number"]');
    const paraEnviar = [];
    inputs.forEach(input => {
        if (input.value != '') {
            var valor = input.value;
            var indexTempo = input.id.split('-')[1];
            paraEnviar.push({ "Index": indexTempo, "Valor": valor });
        }
    });
    fetch('/tempo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            item: paraEnviar
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            } else {
                location.reload();
            }
            return response.json();
        })
        .catch(error => {
            console.error('Erro ao alterar tempo:', error);
        });
}

//------FOTO---------------------
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('file', file);

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                fetch('/getDisplay')
                    .then(response => response.json())
                    .then(data => {
                        fillPageWithData(data);
                        setInterval(() => {
                            location.reload()
                        }, 1000);
                    })
                    .catch(error => {
                        console.error('Erro ao buscar dados:', error);
                    });
            })
            .catch(error => {
                console.error('Erro ao fazer upload da imagem:', error);
            });
    }
}

//------TEXTO---------------------
function openTextInputModal() {
    document.getElementById("controlModal").style.display = 'none';

    document.getElementById("textModal").style.display = 'block';

    const modal = document.getElementById('div-text');
    //modal.id = 'textInputModal';
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.backgroundColor = '#fff';
    modal.style.padding = '20px';
    modal.style.border = '1px solid #ccc';
    modal.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';

    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'textInput';
    input.placeholder = 'Digite o texto aqui';
    modal.appendChild(input);

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Salvar';
    saveButton.onclick = () => {
        document.getElementById("textModal").style.display = 'none'
        saveText()
        setInterval(() => {
            location.reload()
        }, 1000);
    };
    modal.appendChild(saveButton);

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Cancelar';
    closeButton.onclick = () => {
        modal.innerHTML = '';
        document.getElementById("textModal").style.display = 'none'
    };
    modal.appendChild(closeButton);
}
function saveText() {
    const text = document.getElementById('textInput').value;
    if (!text) {
        alert('Por favor, digite um texto.');
        return;
    }
    fetch('/text', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: text // Plain text sent directly
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .catch(error => {
            console.error('Erro ao fazer texto:', error);
        });
}

// ----------Dashboard-----------
function openDashInputModal() {
    document.getElementById("controlModal").style.display = 'none';

    document.getElementById("dashModal").style.display = 'block';

    const modal = document.getElementById('div-dash');
    //modal.id = 'textInputModal';
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.backgroundColor = '#fff';
    modal.style.padding = '20px';
    modal.style.border = '1px solid #ccc';
    modal.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';

    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'urlInput';
    input.placeholder = 'Insira o URL';
    modal.appendChild(input);

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Salvar';
    saveButton.onclick = () => {
        document.getElementById("dashModal").style.display = 'none'
        saveDash()
        setInterval(() => {
            location.reload()
        }, 1000);
    };
    modal.appendChild(saveButton);

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Cancelar';
    closeButton.onclick = () => {
        modal.innerHTML = '';
        document.getElementById("dashModal").style.display = 'none'
    };
    modal.appendChild(closeButton);
}
function saveDash() {
    const dash = document.getElementById('urlInput').value;
    if (!dash) {
        alert('Por favor, digite um texto.');
        return;
    }
    fetch('/dash', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: dash
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .catch(error => {
            console.error('Erro ao fazer dash:', error);
        });
}
//------- Table ------------
function openTableInputModal() {
    document.getElementById("controlModal").style.display = 'none';

    document.getElementById("tableModal").style.display = 'block';

    const modal = document.getElementById('div-table');
    //modal.id = 'textInputModal';
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.backgroundColor = '#fff';
    modal.style.padding = '20px';
    modal.style.border = '1px solid #ccc';
    modal.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';

    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'urlTableInput';
    input.placeholder = 'Insira o URL';
    modal.appendChild(input);

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Salvar';
    saveButton.onclick = () => {
        document.getElementById("tableModal").style.display = 'none'
        saveTable()
        setInterval(() => {
            location.reload()
        }, 1000);
    };
    modal.appendChild(saveButton);

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Cancelar';
    closeButton.onclick = () => {
        modal.innerHTML = '';
        document.getElementById("tableModal").style.display = 'none'
    };
    modal.appendChild(closeButton);
}
function saveTable() {
    const table = document.getElementById('urlTableInput').value;
    if (!table) {
        alert('Por favor, digite um texto.');
        return;
    }
    fetch('/table', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: table
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .catch(error => {
            console.error('Erro ao fazer dash:', error);
        });
}


//----PHOTO-----
document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);
//----RESET--------
setInterval(() => {
    fetch('/getDisplay')
        .then(response => response.json())
        .then(data => {
            fillPageWithData(data);
        })
        .catch(error => {
            console.error('Erro ao buscar dados:', error);
        });
}, 90000);
///MENU\\\
$(document).ready(function () {
    $('.list').addClass('hidden'); // Adiciona a classe hidden inicialmente
    $('.menu').on('click', function () {
        $('.list').toggleClass('hidden');
    });
});
document.addEventListener('DOMContentLoaded', () => {

});
//LOGIN
document.getElementById('form-login').addEventListener('submit', function (event) {
    event.preventDefault(); // Isso irá impedir que o formulário seja enviado automaticamente
    var email = document.getElementById("idEmailLog").value;
    var senha = document.getElementById("idSenhaLog").value;
    console.log(email + " - " + senha);
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email,
            senha: senha
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data == true) {                
                let checkClass = "fas fa-check fa-2x";
                let checkStyles = "color: green;";
                let span = document.getElementById("spanMessageRecebida");
                let iconElement = document.createElement("i");
                iconElement.className = checkClass;
                let mensagemTexto = document.createTextNode("Entrando");
                iconElement.style = checkStyles;
            
            
                span.appendChild(mensagemTexto);
                span.appendChild(iconElement);

                //document.getElementById("spanMessageRecebida").innerHTML = "Email encontrado !.";
                setTimeout(() => {
                    window.location.href = "./08-CDQ.html";
                }, 2000);
                // document.getElementById('form-login').style.display = 'none';
                //document.getElementById('spanMessageRecebida').style.display = 'none';
                // document.getElementById('form1').style.display = 'block';
            }
            if (data == false) {
                document.getElementById("spanMessageRecebida").innerHTML = "Email não encontrado !."
            }

        })
        .catch((error) => {
            console.log('Erro ao carregar ops:', error);
        });

});
//CADASTRO
document.getElementById('form-cadastro').addEventListener('submit', function (event) {
    console.log("Cadastrando...");
    event.preventDefault(); // Isso irá impedir que o formulário seja enviado automaticamente
    var email = document.getElementById("idEmailCad").value;
    var senha = document.getElementById("idSenhaCad").value;
    console.log(email + " - " + senha);
    fetch('/cadastro', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email,
            senha: senha
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data == true) {
                document.getElementById("spanMessageRecebida").innerHTML = "Já existe um usuário com esse e-mail cadastrado.";
            }
            if (data == false) {
                document.getElementById("spanMessageRecebida").innerHTML = "Novo usuário cadastrado com sucesso.";

                setTimeout(() => {
                    location.reload();
                }, 1500);
            }

        })
        .catch((error) => {
            console.log("erro:", error);
        });

});
//ESQUECI
document.getElementById('esqueci').addEventListener('click', function () {
    document.getElementById('form-login').style.display = 'none';
    document.getElementById('form-esqueci').style.display = 'block';
});
document.getElementById('form-esqueci').addEventListener('submit', function (event) {
    event.preventDefault(); // Isso irá impedir que o formulário seja enviado automaticamente
    var email = document.getElementById("idEmailEsq").value;
    var senha = document.getElementById("idSenhaEsq").value;
    var senhaConf = document.getElementById("idSenhaEsqConf").value;
    var codVerif = document.getElementById("idCodigo").value;
    fetch('/redefinir', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email,
            senha: senha,
            senhaConf: senhaConf,
            codVerif: codVerif
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                //alert(data.message);
                let checkClass = "fas fa-check fa-2x";
                let checkStyles = "color: green;";
                let spanRedif = document.getElementById("spanRedif");
                let iconElement = document.createElement("i");
                iconElement.className = checkClass;
                let mensagemTexto = document.createTextNode("Senha redefinida com sucesso");
                iconElement.style = checkStyles;
            
            
                spanRedif.appendChild(mensagemTexto);
                spanRedif.appendChild(iconElement);
                setTimeout(() => {
                    location.reload();
                }, 1500);
            } else {
                alert(data.message);
            }
        })
        .catch((error) => {
            console.log("Erro:", error);
            alert('Erro ao processar a solicitação.');
        });

});
//MOSTRAR FORMS
function login() {
    document.getElementById('botoes1').style.display = 'none';
    document.getElementById('form-login').style.display = 'block';
}
function cadastro() {
    document.getElementById('botoes1').style.display = 'none';
    document.getElementById('form-cadastro').style.display = 'block';
}
function autoResize(input) {
    input.style.width = ((input.value.length + 10) * 8) + 'px';
}

function enviarCodigo() {
    const email = document.getElementById('idEmailEsq').value;

    if (email != '') {
        fetch('/esqueci', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 'email': email })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(data.message);
                } else {
                    alert(data.message);
                }
            })
            .catch((error) => {
                console.log('Erro ao carregar dados:', error);
                alert('Erro ao processar a solicitação.');
            });
    } else {
        alert('Digite um email cadastrado!');
    }
}

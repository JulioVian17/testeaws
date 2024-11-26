let count = 0;

// Itere de 1 até 903 (o maior número menor que 904)
for (let i = 1; i < 904; i++) {
    // Verifique se o número atual é divisível por 3
    if (i % 3 === 0) {
        count++; // Se for divisível, aumente o contador em 1
    }
}

// Exiba o resultado
console.log("O número de números menores que 904 que são divisíveis por 3 é: " + count);


var obj = {
    carro: 'golf'
};
var modelo = 'tsi';

obj.mod = modelo;

console.log(obj);

var array = [{ carro: 'golf', tamanho: 1.4 }, { carro: 'palio', tamanho: 1.0 }];

var tamanhoData = array.map(a => a.tamanho);
console.log(tamanhoData);

array.forEach(a => {
    console.log("duas vezes!")
    console.log(a.tamanho);
    if (a.tamanho > 1) {
        a.potencia = '140cv';
    }

});
console.log(array);
var dia = '2024-04-12';
var item = 'cv111gf';
var inputA = 'C/Defeito';
var inputB = 'cap-alisamento'
var inputC = 'retrabalho';
var ordem = '54321';
var hora = '15:30';
var compilado={
    [hora]:{
        cond: inputA,
        def: inputB,
        gravidade: inputC
    }
}
var salvar = {
    [dia]: {
        item: item,
        ordem: ordem,
        registro:compilado
    }
}

var inputD = 'S/Defeito';
var inputE = '';
var inputF = 'leve';
var hora2= '16:40';
var compilado2={
    [hora2]:{
        inputD:inputD,
        inputE: inputE,
        inputF: inputF
    }
}


for (let dia in salvar) {
    salvar[dia].registro = { ...salvar[dia].registro, ...compilado2 };
}

for(let dia in salvar){
console.log(salvar[dia]);
} 


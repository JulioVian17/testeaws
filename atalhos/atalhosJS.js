//if
var data = 79;
//variavel = valor condição(<,>,=...) ? "atribuição se TRUE" : "atribuição se FALSE"
const corP = data < 80 ? 'red' : '#007BFF';
console.log(corP);
//if
const cores = {
    true: 'red',
    false: '#007BFF'
};
const corR = cores[data < 80];
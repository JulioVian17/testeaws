/*
<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>

<div id="myDiv" style="width: 100%; height: 600px;"></div>
*/

var dataTreemap = [{
    type: "treemap",
    labels: ["Alimentos", "Frutas", "Legumes", "Carnes", "Maçã", "Banana", "Cenoura", "Tomate", "Frango", "Carne Bovina"],
    parents: ["", "Alimentos", "Alimentos", "Alimentos", "Frutas", "Frutas", "Legumes", "Legumes", "Carnes", "Carnes"],
    values: [0, 20, 15, 30, 10, 10, 8, 7, 130, 50],
    textinfo: "label+value+percent parent"
}];

Plotly.newPlot('divTreemap', dataTreemap);

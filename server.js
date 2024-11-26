const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const app = express();
const porta = 3002;
var SerialPort = require('serialport');
const parsers = SerialPort.parsers;
const http = require('http');
const fs = require('fs');
const nodemailer = require('nodemailer');
const pdfkit = require('pdfkit');
//const xml2js = require('xml2js');
const bodyParser = require('body-parser');
const os = require('os');
const multer = require('multer');
const axios = require('axios');
const publicDirectoryPath = path.join(__dirname);
app.use(express.static(publicDirectoryPath));
app.use(express.text());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

//----------------- DISPLAY -----------------------------------------
const uploadDir = path.join(__dirname, 'uploads');
const jsonFilePath = path.join(__dirname, 'bancoDeDados', 'dadosDisplay.json');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
if (!fs.existsSync(path.dirname(jsonFilePath))) {
  fs.mkdirSync(path.dirname(jsonFilePath));
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

const readData = (callback) => {
  fs.readFile(jsonFilePath, 'utf8', (err, data) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, JSON.parse(data));
    }
  });
};
const writeData = (data, callback) => {
  fs.writeFile(jsonFilePath, JSON.stringify(data, null, 2), 'utf8', callback);
};
app.get('/getDisplay', (req, res) => {
  readData((err, data) => {
    if (err) {
      res.status(500).json({ message: 'Erro ao ler os dados' });
    } else {
      res.json(data);
    }
  });
});
//-------------Excluir midia-------
app.delete('/deleteElement/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  readData((err, data) => {
    if (err) {
      res.status(500).json({ message: 'Erro ao ler os dados' });
    } else {
      if (id >= 0 && id < data.length) {
        data.splice(id, 1);

        writeData(data, (err) => {
          if (err) {
            res.status(500).json({ message: 'Erro ao salvar os dados' });
          } else {
            res.json({ message: 'Elemento excluído com sucesso' });
          }
        });
      } else {
        res.status(404).json({ message: 'Elemento não encontrado' });
      }
    }
  });
});
//--------- FOTO -----------------
app.post('/upload', upload.single('file'), (req, res) => {
  const filePath = path.join('uploads', req.file.filename);

  readData((err, jsonData) => {
    if (err) {
      res.status(500).json({ message: 'Erro ao ler os dados' });
      return;
    }
    jsonData.push({
      "formato": "photo",
      "dados": filePath,
      "tempo": 10
    });

    writeData(jsonData, (err) => {
      if (err) {
        res.status(500).json({ message: 'Erro ao salvar os dados' });
        return;
      }
      res.json({ message: 'Upload realizado com sucesso', filePath });
    });
  });
});
//--------- TEXTO -------------
app.post('/text', (req, res) => {
  const newText = req.body;
  console.log("Received text:", newText);

  readData((err, jsonData) => {
    if (err) {
      res.status(500).json({ message: 'Erro ao ler os dados' });
      return;
    }
    jsonData.push({
      "formato": "text",
      "dados": newText,
      "tempo": 10
    });

    writeData(jsonData, (err) => {
      if (err) {
        res.status(500).json({ message: 'Erro ao salvar os dados' });
        return;
      }
      res.json({ message: 'Texto adicionado com sucesso', newText });
    });
  });
});
//--------- TEMPO -------------
app.post('/tempo', (req, res) => {
  const newTempo = req.body.item;
  readData((err, jsonData) => {
    if (err) {
      res.status(500).json({ message: 'Erro ao ler os dados' });
      return;
    }
    newTempo.forEach(temp => {
      const index = parseInt(temp.Index, 10);
      if (index < jsonData.length && index >= 0) {
        jsonData[index].tempo = parseInt(temp.Valor, 10); // Atualiza o valor de "tempo"
      }
    });
    writeData(jsonData, (err) => {
      if (err) {
        res.status(500).json({ message: 'Erro ao salvar os dados' });
        return;
      }
      res.json({ message: 'Tempo alterado com sucesso' });
    });
  });

});
//--------- DASH -------------
app.post('/dash', (req, res) => {
  const newDash = req.body;
  console.log("Received dash:", newDash);

  readData((err, jsonData) => {
    if (err) {
      res.status(500).json({ message: 'Erro ao ler os dados' });
      return;
    }
    jsonData.push({
      "formato": "dashboard",
      "dados": newDash,
      "tempo": 10
    });

    writeData(jsonData, (err) => {
      if (err) {
        res.status(500).json({ message: 'Erro ao salvar os dados' });
        return;
      }
      res.json({ message: 'Dashboard adicionado com sucesso', newDash });
    });
  });
});
//--------- TABLE -------------
app.post('/table', (req, res) => {
  const newTable = req.body;
  console.log("Received dash:", newTable);

  readData((err, jsonData) => {
    if (err) {
      res.status(500).json({ message: 'Erro ao ler os dados' });
      return;
    }
    jsonData.push({
      "formato": "table",
      "dados": newTable,
      "tempo": 10
    });

    writeData(jsonData, (err) => {
      if (err) {
        res.status(500).json({ message: 'Erro ao salvar os dados' });
        return;
      }
      res.json({ message: 'Dashboard adicionado com sucesso', newTable });
    });
  });
});
//-----------------------------------------------API AXIOS Focco Integrador-------------------------------------------

const baseUrl = "https://appcom.famigliavalduga.com.br/proweb/FoccoIntegrador/api/v1/Exportacao";
const ordemFabricacaoEndpoint = `${baseUrl}/ordemfabricacao_pcp`;
const saldoItensEndpoint = `${baseUrl}/saldoitens_pcp`;
const pedVendaEndpoint = `${baseUrl}/ped_venda_pcp`;
const saidaEndpoint = `${baseUrl}/resumo_mvestoque_pcp`;
//https://appcom.famigliavalduga.com.br/proweb/FoccoIntegrador/api/v1/Exportacao/ordemfabricacao_pcp?Chave=8999158608&Skip=0&Take=20
const paramSaldo = {
  Chave: '8999158608',
  Skip: 0,
  COD_EMP: 11,
  //COD_ALMOX: '200',
};
const paramOp = {
  Chave: '8999158608',
  Skip: 0,
  // Take: 100,
  empr_id: 11
};
const paramPed = {
  Chave: '8999158608',
  dt_entrega: '%072024',
};
const paramSai = {
  Chave: '8999158608',
  dt: '%082024'
};
const headers = {
  'Authorization': 'Bearer CfDJ8OFC-ERSzHNLkWOv8JaMhikrYkFjff2uS0ewB-mBNl1DAfFWVRzx5lQDk6Tvc8rgWFbN2F4Tn3VPdXpqE1zKO_1-Y_OWKeVrVjgHSUah8jx2tfgWu0NvAEvMfwIIB-ZV2SqTvqNQD28iEJjq16hawsr4QzK25e6t9SGPU7SWHD3PRHsNJVdmq6ojya3DSWE4pKDTVwPjAHcHYGqPLezqRn35j5PWkidp9fF52DdTNx1I5gGBeRk-3xfbzx6Qzx_sRr5q-yknGveZBrErQbymhiRILhhbbv-upu4pyjKNtKeyruWwMw8jg6ewTuUmuMlYiVUWXqsjV4pVsUGeX0ZsqFVhewKOxgHavrBKfvTs_UJpOIB4ncPYqSII4hH81SIAcn-WErKcaikcvIc3GDa4sNyyYjZuFGBnvljnlBqbvUz37Vk1eMV7-QGEXcbb08vkgba5Z6ZcuUP3ll2VKr8CgCqQaRk-w68HdNcv7kwqxg6dhWVF9SA-aMs81tbjHSDdGyPHExXM3AaFtz7-AV5LJLj1eo_3Z9pXN3ozuxLqCk1CIKIlzWYWDekxRU-A9qeTlw'
};
async function getOrdemFabricacao() {
  try {
    const response = await axios.get(ordemFabricacaoEndpoint, { headers, params: paramOp });
    var dataArray = response.data.value;
    //console.log(dataArray);
    return dataArray
  } catch (error) {
    console.error('Erro ao obter dados de ordem de fabricação:', error.response ? error.response.data : error.message);
  }
}
async function getSaldoItens(codAlmox) {
  // DA PRA FAZER UM SCRIPT PARA BUSCAR O SALDO DE CADA ALMOX INDIVIDUAL E SOBREESCREVER TODA VEZ COM O FS.NODEJS ------------------------
  try {
    const params = { ...paramSaldo, COD_ALMOX: codAlmox };

    const response = await axios.get(saldoItensEndpoint, { headers, params });
    const dataArray = response.data.value;
    //console.log(dataArray);
    //console.log(dataArray.length);
    /*
    let saldoPorItem = {};
    dataArray.forEach(item => {
      const codItem = item.cod_item;
      if (!saldoPorItem[codItem]) {
        saldoPorItem[codItem] = 0;
      }
      saldoPorItem[codItem] += parseInt(item.sld_atual);
    });
    */
    //console.log("saldos 030:", dataArray);
    return dataArray
  } catch (error) {
    console.error('Erro ao obter dados de saldo de itens:', error.response ? error.response.data : error.message);
  }
}
async function getPedidos() {
  try {
    const response = await axios.get(pedVendaEndpoint, { headers, params: paramPed });
    const dataArray = response.data.value;
    //console.log(dataArray);
    console.log("length pedidos:", dataArray.length);

    let saldoPorItem = {};
    console.log("Pedidos:", dataArray);
  } catch (error) {
    console.error('Erro:', error.response ? error.response.data : error.message);
  }
}
async function getSaidas() {
  try {
    const response = await axios.get(saidaEndpoint, { headers, params: paramSai });
    const dataArray = response.data.value;
    //console.log(dataArray);
    //console.log("length saidas:",dataArray.length);

    //console.log("Saidas:", response);
  } catch (error) {
    console.error('Erro ao obter dados de saldo de itens:', error.response ? error.response.data : error.message);
  }
}
//getSaidas();
//getPedidos();
//getOrdemFabricacao();

//---------------------------------------------Serial Port--------------------------------
const parser = new parsers.Readline({
  delimiter: '\r\n'
});
let ultimaData;
function handleData(data) {
  if (data != 'Contagem reiniciada!' || undefined) {
    ultimaData = data;
  }
}
function connectToPort(portName) {
  let port;

  function connect() {
    port = new SerialPort(portName, {
      baudRate: 115200,
      dataBits: 8,
      parity: 'none',
      stopBits: 1,
      flowControl: false
    });

    port.on('error', function (err) {
      console.error(`Erro ao abrir a porta ${portName}: ${err.message}`);
      setTimeout(connect, 1000); // Tentar reconectar após 1 segundo
    });

    port.on('open', function () {
      console.log(`Porta ${portName} aberta com sucesso.`);
    });

    port.pipe(parser);
    io.on('connection', function (socket) {
      console.log('Node is listening to port');
      socket.on('reiniciarContagem', function () {
        socket.broadcast.emit('reiniciarContagem');
        port.write('R', (err) => {
          if (err) {
            console.error('Erro ao enviar mensagem para o Arduino:', err.message);
          } else {
            console.log('Reiniciando Contagem!!');
            apagarMonitoramento();
          }
        });
      });

      let ultimaData;
      parser.on('data', function (data) {
        if (data !== ultimaData) {
          console.log('Dados do ESP32: ' + data);
          socket.emit('data', data);
          handleData(data);
        }
        ultimaData = data;
      });
    });
  }
  // Tenta conectar à porta COM
  connect();
}
SerialPort.list().then(ports => {
  console.log(ports);
  ports.forEach(portInfo => {
    console.log(`Tentando conectar à porta ${portInfo.path}...`);
    connectToPort(portInfo.path);
  });
});
setInterval(() => {
  const dados = ultimaData;
  const horaAtual = new Date().getHours();
  if (horaAtual >= 7 && horaAtual < 18 && dados != undefined) {
    const time = obterHorarioAtual();
    //console.log("dados:", dados);
    escreverMonitoramento(dados, time);
  }

}, 60000);
//--------------Monitoramento---------
function escreverMonitoramento(dados, time) {
  //------------------Monitoramento------------------
  const formData = {
    dados,
    time
  };

  let jsonData = [];
  let fileName = '';
  fileName = 'bancoDeDados/monitoramento.json';

  try {
    const dataLida = fs.readFileSync(fileName, 'utf8');
    jsonData = JSON.parse(dataLida);
  } catch (err) {
    console.error(err);
  }

  jsonData.push(formData);

  fs.writeFileSync(fileName, JSON.stringify(jsonData, null, 2));

}
function apagarMonitoramento() {
  const timeAtual = obterHorarioAtual();
  let fileName = '';
  fileName = 'bancoDeDados/monitoramento.json';

  try {
    const dataLida = fs.readFileSync(fileName, 'utf8');
    let jsonData = JSON.parse(dataLida);
  } catch (err) {
    console.error(err);
  }

  jsonData = [{ time: timeAtual, dados: "Garrafas Rotuladas: 0 | Velocidade Rotuladora: 0.00 GF/H | Garrafas Envasadas: 0 | Velocidade Envasadora: 0.00 GF/H" }];

  fs.writeFileSync(fileName, JSON.stringify(jsonData, null, 2), (err) => {
    if (err) {
      console.error('Erro ao escrever MONITORAMENTO:', err);
      return;
    }
    console.log('Conteúdo do arquivo MONITORAMENTO apagado com sucesso.');
  });
}
function obterHorarioAtual() {
  function adicionarZero(numero) {
    return numero < 10 ? "0" + numero : numero;
  }
  var newDate = new Date();
  var hora = adicionarZero(newDate.getHours());
  var minuto = adicionarZero(newDate.getMinutes());
  var segundo = adicionarZero(newDate.getSeconds());
  var time = (`${hora}:${minuto}:${segundo}`)
  return time
}

//------------------------Obter IPV4-----------------------
const interfaces = os.networkInterfaces();
let ipv4Address = '';
for (const interfaceName in interfaces) {
  const interface = interfaces[interfaceName];
  for (const address of interface) {
    if (address.family === 'IPv4' && !address.internal) {
      ipv4Address = address.address;
      break;
    }
  }
  if (ipv4Address) {
    break;
  }
}

//---------------------------------------------Rotas--------------------------------
app.get('/home', (req, res) => {
  res.sendFile(path.join(publicDirectoryPath, '00-Home.html'));
});
app.get('/', (req, res) => {
  res.sendFile(path.join(publicDirectoryPath, '01-Famiglia Valduga CDP.html'));
});
app.get('/qualidade', (req, res) => {
  res.sendFile(path.join(publicDirectoryPath, '07-Controle de Qualidade CDQ.html'));
});
app.get('/indicadores-qualidade', (req, res) => {
  res.sendFile(path.join(publicDirectoryPath, '09-Indicadores Qualidade.html'));
});
app.get('/graficos', (req, res) => {
  res.sendFile(__dirname + '/02-Dashboard.html');
});
app.get('/dashboard', (req, res) => {
  res.sendFile(__dirname + '/022-Dashboard.html');
});
app.get('/analise', (req, res) => {
  res.sendFile(__dirname + '/03-Analise.html');
});
app.get('/quebras', (req, res) => {
  res.sendFile(path.join(publicDirectoryPath, '04-Controle de Quebras.html'));
});
app.get('/paradas', (req, res) => {
  res.sendFile(path.join(publicDirectoryPath, '05-Controle de Paradas.html'));
});
app.get('/consultas', (req, res) => {
  res.sendFile(path.join(publicDirectoryPath, '06-Consultas.html'));
});
app.get('/ordens', (req, res) => {
  res.sendFile(path.join(publicDirectoryPath, '10-Ordens.html'));
});
app.get('/display', (req, res) => {
  res.sendFile(path.join(publicDirectoryPath, '11-Display.html'));
});
app.get('/plotly', (req, res) => {
  res.sendFile(path.join(publicDirectoryPath, '99-TestePlotly.html'));
});
//--------------------------Relatório-----------------------------------
app.post('/relatorio', (req, res) => {
  var dataRel = req.body.dataRel;
  dataEmail(dataRel);
});
setInterval(verificarHora, 60000);
function verificarHora() {
  var novaData = new Date();
  var diaOntem = (novaData.getDate() - 1);
  var mesAtual = novaData.getMonth() + 1;
  diaOntem = diaOntem < 10 ? '0' + diaOntem : diaOntem;
  mesAtual = mesAtual < 10 ? '0' + mesAtual : mesAtual;
  var anoAtual = novaData.getFullYear();
  var horaAtual = novaData.getHours();
  var minutosAtuais = novaData.getMinutes();
  var dataOntem = anoAtual + "-" + mesAtual + '-' + diaOntem;

  if (horaAtual === 7 && minutosAtuais === 30) {
    dataEmail(dataOntem);
  }
}
function dataEmail(dataOntem) {
  fs.readFile('bancoDeDados/dadosQuebrasParadas.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo:', err);
      return;
    }
    const data2 = JSON.parse(data)

    const percentualPorDiaData = getDataForPercentualPorDia(data2, dataOntem);
    const infoPordiaData = getDataForGarrafasPorDia(data2, dataOntem);
    const pRendPorDiaData = getDataForPercentualRendPorDia(data2, dataOntem);
    const paradasNoDiaSelectData = getDataForParadasNoDiaSelect(data2, dataOntem);
    const quebrasNoDiaSelectData = getDataForQuebrasNoDiaSelect(data2, dataOntem);

    enviarEmail(percentualPorDiaData.values, pRendPorDiaData.values, infoPordiaData,
      paradasNoDiaSelectData.labels, paradasNoDiaSelectData.values, quebrasNoDiaSelectData.labels, dataOntem);

  });
}
async function enviarEmail(percentualPorDia, pRendPorDia, infoPordiaData, paradasLabels, paradasValues, quebrasLabels, dataOntem) {
  if (percentualPorDia == "") {
    console.log("Email não enviado por falta de dados!!!")
  }
  else {
    try {
      const doc = new pdfkit();
      doc.page.size = 'letter';
      doc.text.size = '24'
      //imagem casinha
      const pdfWidth = doc.page.width;
      const imageX = (pdfWidth - 120) / 2;
      const imageY = 40;
      doc.image('imagens/logo - Casa Valduga.png', imageX, imageY, {
        width: 120, height: 36, align: 'center', valign: 'center'
      });

      doc.moveDown();
      //titulo
      doc.text("Relatório de Controle de Produção - Casa Valduga Engarrafamento", {
        align: 'center',
        fontSize: 16,
        font: 'Helvetica-Bold'
      });
      doc.moveDown();
      doc.moveDown();

      for (let chave in infoPordiaData) {
        //------------------itens e tempos--------------------
        if (chave === 'info') {
          let infos = infoPordiaData[chave];
          for (let dia in infos) {
            var data = new Date(dia + 'T00:00:00');
            var dataForm = data.toLocaleDateString('pt-BR');
            doc.text(`Data: ${dataForm}`);
            doc.moveDown();
            doc.text("Itens:");
            for (let item of infos[dia].nomeItens) {
              doc.text(`${item}`, { continued: false });
            }
          }
        }

        //------------------Garrafas--------------------
        if (chave === 'garrafasPorDia') {
          let garrafasPorDia = infoPordiaData[chave];
          for (let dia in garrafasPorDia) {

            if (garrafasPorDia[dia].envase != '') {
              doc.text(`Garrafas Envasadas: ${(garrafasPorDia[dia].envase).toLocaleString('pt-BR')} GFS`);
            }
            if (garrafasPorDia[dia].degorgment != '') {
              doc.text(`Garrafas Degorge: ${(garrafasPorDia[dia].degorgment).toLocaleString('pt-BR')} GFS`);
            }
            if (garrafasPorDia[dia].rotulagem != '') {
              doc.text(`Garrafas Rotuladas:${(garrafasPorDia[dia].rotulagem).toLocaleString('pt-BR')} GFS`);
            }
          }
        }
      }
      //------------------Prod e Rend--------------------
      doc.moveDown();
      doc.moveDown();
      doc.text("PRODUTIVIDADE E RENDIMENTO", {
        align: 'center',
        fontSize: 14,
        font: 'Helvetica-Bold'
      });
      doc.moveDown();
      if (percentualPorDia < 80) {
        doc.fillColor('red');
      } else {
        doc.fillColor('black');
      }
      doc.text(`Produtividade: ${percentualPorDia} %`);
      if (pRendPorDia < 80) {
        doc.fillColor('red');
      } else {
        doc.fillColor('black');
      }
      doc.text(`Rendimento:    ${pRendPorDia} %`);
      doc.fillColor('black');
      doc.moveDown();

      //------------------Parametros--------------------
      for (let chave in infoPordiaData) {
        if (chave == 'pessoas') {
          let parametroPess = infoPordiaData[chave];
          for (let dia in parametroPess) {
            for (let iCode in parametroPess[dia]) {
              for (let operacao in parametroPess[dia][iCode]) {
                //nome do item
                doc.text(`* ${iCode}\n`, { continued: false });
                doc.text(`${parametroPess[dia][iCode].pessoasPad}`, { continued: false });
                doc.moveDown();
              }
            }
          }
        }
      }
      doc.moveDown();
      doc.moveDown();
      doc.text("PARADAS", {
        align: 'center',
        fontSize: 14,
        font: 'Helvetica-Bold'
      });
      doc.moveDown();
      doc.text(" TEMPO | MOTIVO ", {

        fontSize: 12,
        font: 'Helvetica-Bold'
      });
      paradasLabels.forEach((motivo, index) => {
        var tempo = paradasValues[index];
        tempo = tempo < 10 ? '0' + tempo : tempo;
        doc.text(`${tempo} min | ${motivo} `, { continued: false }); // Adiciona o motivo e o tempo da parada em uma nova linha
      });
      doc.moveDown();
      doc.moveDown();
      doc.text("QUEBRAS", {
        align: 'center',
        fontSize: 14,
        font: 'Helvetica-Bold'
      });
      for (var motivo in quebrasLabels) {
        doc.moveDown();
        doc.text(`MOTIVO: ${motivo}`);
        for (var categoria in quebrasLabels[motivo]) {
          var quantidadeMotivo = quebrasLabels[motivo][categoria];
          quantidadeMotivo = quantidadeMotivo < 10 ? '0' + quantidadeMotivo : quantidadeMotivo;
          if (categoria == "VIN") {
            doc.text(`${quantidadeMotivo} lt | ${categoria}`);
          } else {
            doc.text(`${quantidadeMotivo} un | ${categoria}`);
          }

        }
      }
      doc.moveDown();
      doc.moveDown();
      doc.text(`Para mais informações acesse: http://${ipv4Address}:${porta}/analise`);
      /*  doc.addPage(); // adicionar página
        doc.moveDown();
        doc.moveDown();// info[dia][ordemNumero][iCode][operacao].gerais
        for (let chave in infoPordiaData) {
          //------------------2ª pagina--------------------
          if (chave === 'info') {
            let infos = infoPordiaData[chave];
  
            for (let dia in infos) {
              for (let ordem in infos[dia]) {
                for (let icode in infos[dia][ordem]) {
                  console.log("infos", infos[dia][ordem][icode]);
                  doc.moveDown();
                  doc.moveDown();
    
                  doc.text(`Item: ${icode}`);
                  doc.text(`Operação: ${infos[dia][ordem][icode].operacao}`);
                  doc.text(`Gerais:\n ${infos[dia][ordem][icode].gerais}`);
                  doc.text(`${infos[dia][ordem][icode].percentuais}`);
                  
                }
              }
            }
          }
        }
        doc.text(`Para mais informações acesse`);*/
      doc.end();
      const pdfBuffer = await new Promise((resolve, reject) => {
        const buffers = [];
        doc.on('data', buffer => buffers.push(buffer));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);
      });
      const transporter = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: {
          user: 'controle.producao@famigliavalduga.com.br',
          pass: 'Cart2057'
        }
      });

      const mailOptions = {
        from: 'controle.producao@famigliavalduga.com.br',
        to: 'pcp@casavalduga.com.br,julio.vian@famigliavalduga.com.br,michel.trevisol@famigliavalduga.com.br,manutencao@casavalduga.com.br,luiz.styburski@famigliavalduga.com.br,anildo.almeida@famigliavalduga.com.br',
        //to: 'julio.vian@famigliavalduga.com.br',
        subject: `${dataOntem} - Relatório de Controle de Produção - Casa Valduga Engarrafamento`,
        text: `Segue anexado referente a ${dataOntem},  relatório de Controle de Produção referente ao processo de Engarrafamento da Casa Valduga.`,
        attachments: [
          {
            filename: 'Relatório CDP.pdf',
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      };
      const info = await transporter.sendMail(mailOptions);
      console.log('E-mail enviado com sucesso:', info.response);
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
    }
  }
}
//-------------------Indicadore Diarios------------------
function getDataForPercentualPorDia(data, dataOntem) {
  const percentualPorDia = {};
  const contagemPordia = {};

  data.forEach(item => {
    const dia = item.dataHora;
    if (dia == dataOntem) {
      if (!percentualPorDia[dia]) {
        percentualPorDia[dia] = 0;
        contagemPordia[dia] = 0;
      }

      percentualPorDia[dia] += item.percentual;
      contagemPordia[dia]++;
    }
  });

  Object.keys(percentualPorDia).forEach(dia => {
    percentualPorDia[dia] /= contagemPordia[dia];
  });

  const sortedKeys = Object.keys(percentualPorDia).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  return {
    labels: sortedKeys,
    values: sortedKeys.map(dia => percentualPorDia[dia]),
  };
}
function getDataForPercentualRendPorDia(data, dataOntem) {
  const pRendPorDia = {};
  const contagemPordia = {};

  data.forEach(item => {
    const dia = item.dataHora;
    if (dia == dataOntem) {
      if (!pRendPorDia[dia]) {
        pRendPorDia[dia] = 0;
        contagemPordia[dia] = 0;
      }
      pRendPorDia[dia] += parseInt(item.percentualRendimento, 10);
      contagemPordia[dia]++;
    }
  });

  Object.keys(pRendPorDia).forEach(dia => {
    pRendPorDia[dia] = (pRendPorDia[dia] / contagemPordia[dia]);
  });

  const sortedKeys = Object.keys(pRendPorDia).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  return {
    labels: sortedKeys,
    values: sortedKeys.map(dia => parseInt(pRendPorDia[dia])),
  };
}
function getDataForGarrafasPorDia(data, dataOntem) {
  const info = {};
  const garrafasPorDia = {};
  const pessoas = {};
  const parametros = {};
  let temRotulagem = true;

  data.forEach(item => {
    function tempo(tempoTotalProducao) {
      var horas = tempoTotalProducao;
      var horasInt = parseInt(horas);
      var minutos = parseInt((horas - horasInt) * 60);
      if (horasInt < 10) {
        horasInt = "0" + horasInt;
      }
      if (minutos < 10) {
        minutos = "0" + minutos;
      }
      returnSpanProduzido = `${horasInt}h:${minutos}min`;
      return returnSpanProduzido;
    }

    const dia = item.dataHora;
    const operacao = item.operacao;
    const prod = item.produtividade;
    const prodPad = item.produtividadePadrao;
    const rend = item.rendimento;
    const rendPad = item.rendimentoPadrao;
    const pess = item.pessoas;
    const pessPad = item.pessoasPadrao;
    const tempoTotalProducao = item.tempoTotalProducao;
    const tempoP = tempo(tempoTotalProducao);
    const iCode = item.itemCode;
    const ordemNumero = item.ordemNumero;
    const hi = item.hi;
    const hf = item.hf;
    const garrafas = item.garrafa;



    if (dia === dataOntem) {
      //--------------------Parametros------------------
      if (!info[dia]) {
        info[dia] = {
          nomeItens: [],
          //produtividade: []
        };
      }
      if (!info[dia].nomeItens.includes(iCode)) {
        info[dia].nomeItens.push(`${iCode} Tempo ${operacao} ${tempoP}\n`);
      }

      if (!info[dia][ordemNumero]) {
        info[dia][ordemNumero] = {};
      }

      if (!info[dia][ordemNumero][iCode]) {
        info[dia][ordemNumero][iCode] = {
          gerais: [],
          //parametros: [],
          percentuais: [],
          operacao: []
        };
      }
      /*if (!info[dia][ordemNumero][iCode][operacao]) {
        info[dia][ordemNumero][iCode][operacao] = {
         // gerais: [],
         // parametros: [],
         // percentuais:[]
        };
      }*/
      //info[dia][ordemNumero][iCode][operacao].parametros.push(`${iCode} Velocidade: ${prod} GF/H | Padrão: ${prodPad} GF/H\n\nPessoas: ${pess} | Padrão: ${pessPad}`);
      //info[dia][ordemNumero][iCode][operacao].gerais.push(`${iCode}: ${garrafas} | ${hi}-${hf}--${tempoP}`);
      //info[dia][ordemNumero][iCode][operacao].percentuais.push(`${iCode} Produtividade ${item.percentual}% | Rendimento ${item.percentualRendimento}% `);
      //info[dia][ordemNumero][iCode].parametros.push(`${iCode} Velocidade: ${prod} GF/H | Padrão: ${prodPad} GF/H\n\nPessoas: ${pess} | Padrão: ${pessPad}`);

      /*
       info[dia][ordemNumero][iCode].gerais.push(`Quantidade: ${garrafas}\n Hora Inicial: ${hi} Final: ${hf}\n Tempo de Produção: ${tempoP}`);
       info[dia][ordemNumero][iCode].percentuais.push(`Produtividade: ${item.percentual}% | Rendimento: ${item.percentualRendimento}% `);
       info[dia][ordemNumero][iCode].operacao.push(operacao);
 */
      //--------------------Garrafas------------------
      if (!garrafasPorDia[dia]) {
        garrafasPorDia[dia] = {
          envase: 0,
          degorgment: 0,
          rotulagem: 0
        };
      }
      if (operacao == 'envase') {
        garrafasPorDia[dia].envase += parseInt(item.garrafa);
      } else if (operacao == 'degorgment') {
        garrafasPorDia[dia].degorgment += parseInt(item.garrafa);
      } else {
        garrafasPorDia[dia].rotulagem += parseInt(item.garrafa);
      };
      //--------------------Pessoas------------------
      if (!pessoas[dia]) {
        pessoas[dia] = {};
      }
      if (!pessoas[dia][iCode]) {
        pessoas[dia][iCode] = {
          pessoasPad: []
        };
      }
      pessoas[dia][iCode].pessoasPad.push(`${operacao.toUpperCase()}:\n - Velocidade ${prod} GF/H Padrão ${prodPad} GF/H\n - Pessoas ${pess} Padrão ${pessPad}\n`);

    }
  });

  return {
    info: info,
    garrafasPorDia: garrafasPorDia,
    pessoas: pessoas
  };

}
function getDataForParadasNoDiaSelect(data, dataOntem) {
  const paradasPorMotivo = {};

  data.forEach(item => {
    const dia = item.dataHora;
    if (dia == dataOntem) {
      const paradasArray = item.vetorParada.split(', ');

      if (paradasArray == '') {
        //não faz nada
      } else {
        for (let i = 0; i < paradasArray.length; i += 3) {

          const quantidade = parseInt(paradasArray[i], 10) || 0;
          const tempo = parseInt(paradasArray[i + 1], 10) || 0;
          const motivo = paradasArray[i + 2];
          if (!paradasPorMotivo[motivo]) {
            paradasPorMotivo[motivo] = 0;
          }
          paradasPorMotivo[motivo] += quantidade * tempo;

        }
      }
    }

  });

  const labels = Object.keys(paradasPorMotivo);
  const values = labels.map(motivo => paradasPorMotivo[motivo]);

  return {
    labels: labels,
    values: values,
  };
}
function getDataForQuebrasNoDiaSelect(data, dataOntem) {
  const categoriaMotivoData = {};
  data.forEach(item => {
    const dia = item.dataHora;
    if (dia == dataOntem) {
      const quebrasArray = item.vetorQuebra.split(', ');

      if (quebrasArray == '') {
        //não faz nada
      } else {
        for (let i = 0; i < quebrasArray.length; i += 3) {

          const quantidade = parseInt(quebrasArray[i], 10) || 0;
          const categoria = quebrasArray[i + 1];
          const motivo = quebrasArray[i + 2];
          if (!categoriaMotivoData[motivo]) {
            categoriaMotivoData[motivo] = {}; // Inicializa categoriaMotivoData[item] como um objeto vazio, se não estiver definido
          }
          if (!categoriaMotivoData[motivo][categoria]) {
            categoriaMotivoData[motivo][categoria] = 0;
          }
          categoriaMotivoData[motivo][categoria] += quantidade;
        }
      }
    }
  });

  const labels = Object.keys(categoriaMotivoData);
  const values = labels.map(motivo => categoriaMotivoData[motivo]);
  return {
    labels: categoriaMotivoData,
    values: values,
  };

}

//-------------------Indicadore Mensais------------------
//garrafas 
function getDataForGarrafasPorMes(data) {
  const garrafasPorMes = {};
  const pointDia = [];
  data.forEach(item => {
    const mes = item.dataHora.slice(0, 7);
    const operacao = item.operacao;

    //tooltip
    const nomeItem = item.itemCode;
    if (!pointDia[mes]) {
      pointDia[mes] = {};
    }
    if (!pointDia[mes][nomeItem]) {
      pointDia[mes][nomeItem] = 0;
    }
    pointDia[mes][nomeItem] += parseInt(item.garrafa, 10);
    //tooltip
    /*if (!garrafasPorMes[mes]) {
      garrafasPorMes[mes] = 0;
    }
    garrafasPorMes[mes] += parseInt(item.garrafa, 10);*/
    if (!garrafasPorMes[mes]) {
      garrafasPorMes[mes] = {
        envase: 0,
        degorgment: 0,
        rotulagem: 0
      };
    };
    if (operacao == 'envase') {
      garrafasPorMes[mes].envase += parseInt(item.garrafa);
    } else if (operacao == 'degorgment') {
      garrafasPorMes[mes].degorgment += parseInt(item.garrafa);
    } else {
      garrafasPorMes[mes].rotulagem += parseInt(item.garrafa);
    };

  });
  const sortedKeys = Object.keys(garrafasPorMes).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  const labelsItem = Object.keys(pointDia).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  const valuesItem = labelsItem.map(dia => pointDia[dia]);
  const garrafasRot = sortedKeys.map(mes => (garrafasPorMes[mes].rotulagem != '' ? garrafasPorMes[mes].rotulagem : ''));
  const garrafasEnv = sortedKeys.map(mes => (garrafasPorMes[mes].envase != '' ? garrafasPorMes[mes].envase : ''));
  const garrafasDeg = sortedKeys.map(mes => (garrafasPorMes[mes].degorgment != '' ? garrafasPorMes[mes].degorgment : ''));
  return {
    labels: sortedKeys,
    valueRot: garrafasRot,
    valueEnv: garrafasEnv,
    valueDeg: garrafasDeg,
    itemValue: valuesItem,
  };
}
app.get('/garrafasMensal', (req, res) => {
  fs.readFile('bancoDeDados/dadosQuebrasParadas.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo:', err);
      return;
    }
    const data2 = JSON.parse(data);
    const result = getDataForGarrafasPorMes(data2);
    res.send(result);
  });

});
//produtividade 
function getDataForPercentualPorMes(data) {
  // Função para calcular a média acumulada
  function getAverageData(data) {
    const averageDataPmes = {};
    let acumulado = 0;

    data.labels.forEach(mes => {
      acumulado += data.values[data.labels.indexOf(mes)];
      averageDataPmes[mes] = Math.round(acumulado / (data.labels.indexOf(mes) + 1));
    });

    return {
      labels: data.labels,
      values: data.labels.map(mes => parseInt(averageDataPmes[mes])),
    };
  }

  const percentualPorMes = {};
  const contagemPorMes = {};

  data.forEach(item => {
    const mes = item.dataHora.slice(0, 7);
    const dia = item.dataHora.slice(0, 10);

    if (!percentualPorMes[mes]) {
      percentualPorMes[mes] = {};
      contagemPorMes[mes] = {};
    }

    if (!percentualPorMes[mes][dia]) {
      percentualPorMes[mes][dia] = 0;
      contagemPorMes[mes][dia] = 0;
    }

    percentualPorMes[mes][dia] += parseInt(item.percentual, 10);
    contagemPorMes[mes][dia]++;
  });

  // Calcula a média de cada dia dentro do mês
  Object.keys(percentualPorMes).forEach(mes => {
    Object.keys(percentualPorMes[mes]).forEach(dia => {
      percentualPorMes[mes][dia] /= contagemPorMes[mes][dia];
    });
  });

  // Calcula a média dos dias diferentes dentro do mês
  Object.keys(percentualPorMes).forEach(mes => {
    let totalPercentual = 0;
    let totalDias = 0;

    Object.keys(percentualPorMes[mes]).forEach(dia => {
      totalPercentual += percentualPorMes[mes][dia];
      totalDias++;
    });

    percentualPorMes[mes] = totalPercentual / totalDias;
  });

  const sortedKeys = Object.keys(percentualPorMes).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  const percentualPorMesData = {
    labels: sortedKeys,
    values: sortedKeys.map(mes => parseInt(percentualPorMes[mes])),
  };

  // Calcular a média acumulada
  const averageDataPmes = getAverageData(percentualPorMesData);

  return {
    percentualPorMesData,
    averageDataPmes,
  };
}
app.get('/prodMensal', (req, res) => {
  fs.readFile('bancoDeDados/dadosQuebrasParadas.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo:', err);
      return;
    }
    const data2 = JSON.parse(data);
    const result = getDataForPercentualPorMes(data2);
    res.send(result);
  });

});
//rendimento 
function getDataForPercentualRendPorMes(data) {
  // Função para calcular a média acumulada
  function getAverageData(data) {
    const averageDataPmes = {};
    let acumulado = 0;

    data.labels.forEach(mes => {
      acumulado += data.values[data.labels.indexOf(mes)];
      averageDataPmes[mes] = Math.round(acumulado / (data.labels.indexOf(mes) + 1));
    });

    return {
      labels: data.labels,
      values: data.labels.map(mes => parseInt(averageDataPmes[mes])),
    };
  }

  const percentualPorMes = {};
  const contagemPorMes = {};

  data.forEach(item => {
    const mes = item.dataHora.slice(0, 7);
    const dia = item.dataHora.slice(0, 10);

    if (!percentualPorMes[mes]) {
      percentualPorMes[mes] = {};
      contagemPorMes[mes] = {};
    }

    if (!percentualPorMes[mes][dia]) {
      percentualPorMes[mes][dia] = 0;
      contagemPorMes[mes][dia] = 0;
    }

    percentualPorMes[mes][dia] += parseInt(item.percentualRendimento, 10);
    contagemPorMes[mes][dia]++;
  });

  // Calcula a média de cada dia dentro do mês
  Object.keys(percentualPorMes).forEach(mes => {
    Object.keys(percentualPorMes[mes]).forEach(dia => {
      percentualPorMes[mes][dia] /= contagemPorMes[mes][dia];
    });
  });

  // Calcula a média dos dias diferentes dentro do mês
  Object.keys(percentualPorMes).forEach(mes => {
    let totalPercentual = 0;
    let totalDias = 0;

    Object.keys(percentualPorMes[mes]).forEach(dia => {
      totalPercentual += percentualPorMes[mes][dia];
      totalDias++;
    });

    percentualPorMes[mes] = totalPercentual / totalDias;
  });

  const sortedKeys = Object.keys(percentualPorMes).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  const percRendPorMesData = {
    labels: sortedKeys,
    values: sortedKeys.map(mes => parseInt(percentualPorMes[mes])),
  };

  // Calcular a média acumulada
  const aveRendDataPmes = getAverageData(percRendPorMesData);


  return {
    percRendPorMesData,
    aveRendDataPmes,
  };
}
app.get('/rendMensal', (req, res) => {
  fs.readFile('bancoDeDados/dadosQuebrasParadas.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo:', err);
      return;
    }
    const data2 = JSON.parse(data);
    const result = getDataForPercentualRendPorMes(data2);
    res.send(result);
  });

});
//ociosidade 
function getDataForOciosidadePorMes(data) {
  function getAverageData(data) {
    const averageDataOci = {};
    let acumulado = 0;

    data.labels.forEach(dia => {
      acumulado += data.values[data.labels.indexOf(dia)];
      averageDataOci[dia] = parseInt(acumulado / (data.labels.indexOf(dia) + 1));
    });

    return {
      labels: data.labels,
      values: data.labels.map(dia => averageDataOci[dia]),
    };
  }
  const ociosidadePorMes = {};
  const diasPorMes = {};
  const ordensProcessadas = {};

  data.forEach(item => {
    const mes = item.dataHora.slice(0, 7);
    const dia = item.dataHora.slice(0, 10);
    const ordem = item.operacao;
    const ordemNumero = item.ordemNumero;

    if (!ociosidadePorMes[mes]) {
      ociosidadePorMes[mes] = {};
      diasPorMes[mes] = {};
      ordensProcessadas[mes] = {};
    }

    if (!diasPorMes[mes][dia]) {
      diasPorMes[mes][dia] = true;
    }

    if (!ordensProcessadas[mes][ordemNumero]) {
      ordensProcessadas[mes][ordemNumero] = new Set();
    }

    if (!ordensProcessadas[mes][ordemNumero].has(ordem)) {
      if (!ociosidadePorMes[mes][ordem]) {
        ociosidadePorMes[mes][ordem] = 0;
      }
      ociosidadePorMes[mes][ordem] += parseFloat(item.tempoTotalProducao, 10);
      ordensProcessadas[mes][ordemNumero].add(ordem);
    }

  });


  const sortedKeys = Object.keys(ociosidadePorMes).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  const values = sortedKeys.map(mes => {
    const diasUteis = Object.keys(diasPorMes[mes]).length;
    const horasDisponiveis = diasUteis * 8.8;

    // Somar todas as horas de produção no mês
    const totalHorasProducao = Object.values(ociosidadePorMes[mes]).reduce((acc, curr) => acc + curr, 0);

    const horasOciosas = horasDisponiveis - totalHorasProducao;
    const ociosidade = parseInt((horasOciosas * 100) / horasDisponiveis);

    return ociosidade;
  });

  const ociosidadePorMesData = {
    labels: sortedKeys,
    values: values,
  };

  // Calcular a média acumulada
  const averageDataOci = getAverageData(ociosidadePorMesData);
  return {
    ociosidadePorMesData,
    averageDataOci,
  };
}
app.get('/ociosidadeMensal', (req, res) => {
  fs.readFile('bancoDeDados/dadosQuebrasParadas.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo:', err);
      return;
    }
    const data2 = JSON.parse(data);
    const result = getDataForOciosidadePorMes(data2);
    res.send(result);
  });

});

//------------ Gastos Gerais -------------------
function getDataGastosGeraisPorMes(data) {
  function getAverageData(data) {
    const averageDataPmes = {};
    let acumulado = 0;

    data.labels.forEach(mes => {
      acumulado += data.values[data.labels.indexOf(mes)];
      averageDataPmes[mes] = Math.round(acumulado / (data.labels.indexOf(mes) + 1));
    });

    return {
      labels: data.labels,
      values: data.labels.map(mes => parseInt(averageDataPmes[mes])),
    };
  }
  const gerais = {};
  const planejadoAnual = {};
  const realizadoAnual = {};
  const pointDia = {};
  data.forEach(ano => {
    const anoData = ano.Ano;
    for (let mes in ano) {
      if (ano[mes].Planejado != undefined && ano[mes].Realizado != 0) {
        if (!gerais[mes]) {
          gerais[mes] = 0;
        }
        gerais[mes] = ((ano[mes].Realizado / ano[mes].Planejado) * 100) - 100;
        //tooltip
        if (!pointDia[mes]) {
          pointDia[mes] = {
            Planejado: 0,
            Realizado: 0

          };
        }
        pointDia[mes].Planejado = (ano[mes].Planejado);
        pointDia[mes].Realizado = (ano[mes].Realizado);


        //tooltip



        if (!realizadoAnual[anoData]) {
          realizadoAnual[anoData] = 0;
        }
        realizadoAnual[anoData] += ano[mes].Realizado;
      }
      if (!planejadoAnual[anoData]) {
        planejadoAnual[anoData] = 0;
      }
      planejadoAnual[anoData] += ano[mes].Planejado;

      /*
              //tooltip
              const nomeItem = item.itemCode;
              if (!pointDia[dia]) {
                  pointDia[dia] = {};
              }
              if (!pointDia[dia][nomeItem]) {
                  pointDia[dia][nomeItem] = 0;
                  contagemPoint[dia] = 0;
              }
              pointDia[dia][nomeItem] += parseInt(item.percentual, 10);
              contagemPoint[dia]++;
              //tooltip
      */
    }
  });

  const labels = Object.keys(gerais);
  const geraisData = {
    labels: labels,
    values: labels.map(mes => parseInt(gerais[mes])),
  };
  const averageData = getAverageData(geraisData);
  const totais = {
    planejadoAnual,
    realizadoAnual
  }
  const labelsPoint = Object.keys(pointDia);
  const valuesPoint = labelsPoint.map(mes => pointDia[mes]);
  return {
    geraisData,
    averageData,
    totais,
    valuesPoint
  }
}
app.post('/gastosGeraisMensal', (req, res) => {
  const ano = req.body.ano;
  function filterQualidade(data2, year) {
    return data2.filter(obj => {
      if (obj.Ano === year) {
        return [data2];
      } else {
        return [];
      }
    });
  }

  fs.readFile('bancoDeDados/gastosGerais.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo:', err);
      return;
    }
    const dtParse = JSON.parse(data);
    const filteredData = filterQualidade(dtParse, ano);
    const result = getDataGastosGeraisPorMes(filteredData);
    res.send(result);
  });

});
app.post('/editarGastosGerais', (req, res) => {
  const planData = req.body.plan;
  const realData = req.body.real;
  fs.readFile('bancoDeDados/gastosGerais.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo:', err);
      return res.status(500).send('Erro ao ler o arquivo');
    }
    let DATA = JSON.parse(data);

    planData.forEach(planItem => {
      let mesSelecionado = planItem["Mes"];
      let indexAno = DATA.findIndex(anoData => mesSelecionado in anoData);
      if (indexAno !== -1) {
        let mesData = DATA[indexAno][mesSelecionado];
        if (mesData) {
          mesData.Planejado = parseInt(planItem["Planejado"]);
        } else {
          console.warn(`Dados de planejamento para ${mesSelecionado} não encontrados.`);
        }
      } else {
        console.warn(`O mês ${mesSelecionado} não existe nos dados.`);
      }
    });

    realData.forEach(realItem => {
      let mesSelecionado = realItem["Mes"];
      let indexAno = DATA.findIndex(anoData => mesSelecionado in anoData);
      if (indexAno !== -1) {
        let mesData = DATA[indexAno][mesSelecionado];
        if (mesData) {
          mesData.Realizado = parseInt(realItem["Realizado"]);
        } else {
          console.warn(`Dados reais para ${mesSelecionado} não encontrados.`);
        }
      } else {
        console.warn(`O mês ${mesSelecionado} não existe nos dados.`);
      }
    });
    // Escrever de volta no arquivo JSON
    fs.writeFile('bancoDeDados/gastosGerais.json', JSON.stringify(DATA, null, 2), 'utf8', (err) => {
      if (err) {
        console.error('Erro ao escrever de volta no arquivo JSON:', err);
        return res.status(500).send('Erro ao escrever de volta no arquivo JSON');
      }
      console.log('Valores atualizados com sucesso.');
      res.sendStatus(200);
    })
  });
});

//-----------Linha do Tempo pag3-------------
function linhaDoTempo(data, dataEnviada) {

  const resultado = {
    labels: [],
    values: [],
    horaFinal: [],
    horaInicial: []
  };

  data.forEach(item => {
    var datahora = item.dataHora;
    if (dataEnviada == datahora) {
      const paradasArray = item.vetorParada.split(', ');
      const registrosArray = item.registro.split(', ');

      if (paradasArray == '' || registrosArray == '') {
        // Não faz nada se os arrays estiverem vazios
        return;
      }

      for (let i = 0; i < paradasArray.length; i += 3) {
        const quantidade = parseInt(paradasArray[i], 10) || 0;
        const tempo = parseInt(paradasArray[i + 1], 10) || 0;
        const motivo = paradasArray[i + 2];

        const valorMultiplicado = quantidade * tempo;

        // Transforma o registro para minutos
        const registroMinutos = parseInt(registrosArray[i / 3].split(':')[0], 10) * 60 + parseInt(registrosArray[i / 3].split(':')[1], 10);

        // Subtrai o valor multiplicado dos minutos do registro
        const valueCalculadoMinutos = registroMinutos - valorMultiplicado;

        // Transforma o valor calculado de volta para horas e minutos
        const valueCalculadoHoras = Math.floor(valueCalculadoMinutos / 60);
        const valueCalculadoMinutosRestantes = valueCalculadoMinutos % 60;

        const valueCalculado = `${String(valueCalculadoHoras).padStart(2, '0')}:${String(valueCalculadoMinutosRestantes).padStart(2, '0')}`;

        resultado.labels.push(motivo);
        resultado.values.push([valueCalculado, registrosArray[i / 3]]);
        resultado.horaFinal.push(item.hf);
        resultado.horaInicial.push(item.hi);
      }
    }

  });
  return resultado;
}
app.post('/linhaTempo', (req, res) => {
  const dataEnviada = req.body.data;
  fs.readFile('bancoDeDados/dadosQuebrasParadas.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo:', err);
      return res.status(500).send('Erro interno do servidor');
    }

    const data2 = JSON.parse(data);
    const result = linhaDoTempo(data2, dataEnviada);
    res.json(result);
  });
});

//--------------Salva no Banco de Dados-------------
app.post('/salvar-dados-rapidos', async (req, res) => {

  try {
    const { dataHora, itemCode, operacao, ordemNumero, qtde } = req.body;
    var formData = {};
    const retornoApi = await getOrdemFabricacao();

    retornoApi.forEach(item => {
      const numOrdem = item.num_ordem;
      if (numOrdem == ordemNumero) {
        formData = {
          operacao,
          dataHora,
          numOrdem: numOrdem,
          diaHI: item.dt_inicial,
          diaHF: item.dt_final,
          codItem: itemCode,
          descItem: item.desc_tecnica,
          unMed: item.cod_unid_med,
          qtde: qtde,
          qtdePendente: item.qtde_pendente,
          obsOrdem: item.observacao
        };
      }
    });
    let jsonData = [];
    let fileName = '';
    fileName = 'bancoDeDados/dadosRapidos.json';

    try {
      const data = fs.readFileSync(fileName, 'utf8');
      jsonData = JSON.parse(data);
    } catch (err) {
      console.error(err);
    }

    jsonData.push(formData);
    var result = false;
    if (jsonData.length >= 2) {
      const ultimoObjeto = jsonData[jsonData.length - 1];
      const penultimoObjeto = jsonData[jsonData.length - 2];

      if (ultimoObjeto.numOrdem !== penultimoObjeto.numOrdem) {
        console.log('O valor de numOrdem do último objeto é diferente do penúltimo.');
        result = true;
      } else {
        console.log('O valor de numOrdem do último objeto é igual ao penúltimo.');
        result = false;
      }
    } else {
      console.log('jsonData não tem objetos suficientes para realizar a comparação.');
      result = false;
    }

    fs.writeFileSync(fileName, JSON.stringify(jsonData, null, 2));
    res.json(result);
  } catch (error) {
    console.error('Erro ao processar a requisição:', error.message);
    res.status(500).send('Erro ao processar a requisição');
  }


});
app.post('/apagarDadosRapidos', (req, res) => {
  let fileName = '';
  fileName = 'bancoDeDados/dadosRapidos.json';

  try {
    const dataLida = fs.readFileSync(fileName, 'utf8');
    let jsonData = JSON.parse(dataLida);
  } catch (err) {
    console.error(err);
  }

  jsonData = [];

  fs.writeFileSync(fileName, JSON.stringify(jsonData, null, 2), (err) => {
    if (err) {
      console.error('Erro ao escrever MONITORAMENTO:', err);
      return;
    }
    console.log('Conteúdo do arquivo MONITORAMENTO apagado com sucesso.');
  });
});
app.post('/salvar-quebras-paradas', (req, res) => {
  const { operacao, dataHora, itemCode, ordemNumero, garrafa, pessoas, pessoasPadrao, percentual, produtividade,
    produtividadePadrao, percentualRendimento, rendimento, rendimentoPadrao, hi, hf, tempoTotalProducao, tempoTotalParado,
    vetorQuebra, vetorParada, vetorAnalise, registro } = req.body;

  const formData = {
    operacao,
    dataHora,
    itemCode,
    ordemNumero,
    garrafa,
    pessoas,
    pessoasPadrao,
    percentual,
    produtividade,
    produtividadePadrao,
    percentualRendimento,
    rendimento,
    rendimentoPadrao,
    hi,
    hf,
    tempoTotalProducao,
    tempoTotalParado,
    vetorQuebra,
    vetorParada,
    vetorAnalise,
    registro
  };

  let jsonData = [];
  let fileName = '';
  fileName = 'bancoDeDados/dadosQuebrasParadas.json';

  try {
    const data = fs.readFileSync(fileName, 'utf8');
    jsonData = JSON.parse(data);
  } catch (err) {
    console.error(err);
  }

  jsonData.push(formData);

  fs.writeFileSync(fileName, JSON.stringify(jsonData, null, 2));

  res.send('Dados quebras-paradas salvos com sucesso!');
});
app.post('/salvar-dados', (req, res) => {
  const { operacao, dataHora, itemCode, ordemNumero, garrafa, pessoas, pessoasPadrao, percentual, produtividade,
    produtividadePadrao, percentualRendimento, rendimento, rendimentoPadrao, hi, hf, tempoTotalProducao, tempoTotalParado,
    vetorQuebra, vetorParada, vetorAnalise, registro } = req.body;

  const formData = {
    operacao,
    dataHora,
    itemCode,
    ordemNumero,
    garrafa,
    pessoas,
    pessoasPadrao,
    percentual,
    produtividade,
    produtividadePadrao,
    percentualRendimento,
    rendimento,
    rendimentoPadrao,
    hi,
    hf,
    tempoTotalProducao,
    tempoTotalParado,
    vetorQuebra,
    vetorParada,
    vetorAnalise,
    registro
  };


  let jsonData = [];
  let fileName = '';

  // Verifica o valor da variável 'operacao'
  if (operacao.toLowerCase() === 'rotulagem') {
    fileName = 'bancoDeDados/dadosRotulagem.json';
  } else {
    fileName = 'bancoDeDados/dadosEnvDeg.json'; // Nome do arquivo para outra operação
  }

  try {
    const data = fs.readFileSync(fileName, 'utf8');
    jsonData = JSON.parse(data);
  } catch (err) {
    console.error(err);
  }

  jsonData.push(formData);

  fs.writeFileSync(fileName, JSON.stringify(jsonData, null, 2));

  res.send('Dados salvos com sucesso!');
});

//-------------Email ao exportar--------------------
app.post('/enviar-email', async (req, res) => {
  try {
    const { operacao, dataHora, itemCode, ordemNumero, garrafa, pessoas, percentual, produtividade,
      produtividadePadrao, percentualRendimento, rendimento, rendimentoPadrao, hi, hf, tempoTotalParado,
      vetorQuebra, vetorParada, vetorAnalise, showTempoProducao } = req.body;
    const formData = {
      operacao, dataHora, itemCode, ordemNumero, garrafa, pessoas, percentual, produtividade,
      produtividadePadrao, percentualRendimento, rendimento, rendimentoPadrao, hi, hf, tempoTotalParado,
      vetorQuebra, vetorParada, vetorAnalise, showTempoProducao
    };

    // Criar o documento PDF
    const doc = new pdfkit();
    doc.text("Relatório de Controle de Produção - Casa Valduga Engarrafamento", {
      align: 'center',
      fontSize: 16,
      font: 'Helvetica-Bold'
    });
    doc.moveDown();
    doc.text("PRODUTIVIDADE E RENDIMENTO", {
      align: 'center',
      fontSize: 14,
      font: 'Helvetica-Bold'
    });
    if (percentual < 80) {
      doc.fillColor('red');
    } else {
      doc.fillColor('black');
    } if (percentualRendimento < 80) {
      doc.fillColor('red');
    } else {
      doc.fillColor('black');
    }
    doc.text(`Produtividade: ${formData.percentual}%`);
    doc.text(`Rendimento:    ${formData.percentualRendimento}%`);
    doc.fillColor('black');
    doc.moveDown();
    doc.text("DADOS GERAIS"
      , {
        align: 'center',
        fontSize: 14,
        font: 'Helvetica-Bold'
      });
    doc.text(`Código:   ${formData.itemCode}`);
    doc.text(`Data:      ${formData.dataHora}`);
    doc.text(`Operação: ${formData.operacao}`);
    doc.text(`Garrafas: ${formData.garrafa}`);
    doc.moveDown();
    doc.text("PARADAS E QUEBRA", {
      align: 'center',
      fontSize: 14,
      font: 'Helvetica-Bold'
    });
    doc.text(`Paradas: ${formData.vetorParada} |`);
    doc.text(`Quebra:  ${formData.vetorQuebra} |`);
    doc.moveDown();
    doc.text("TEMPOS", {
      align: 'center',
      fontSize: 14,
      font: 'Helvetica-Bold'
    });
    doc.text(`Início: ${formData.hi}h`);
    doc.text(`Final:  ${formData.hf}h`);
    doc.text(`Total Produção: ${formData.showTempoProducao}`);
    doc.text(`Total Parado:   ${formData.tempoTotalParado}min`);
    doc.moveDown();
    doc.text("REALIZADO X NOMINAL", {
      align: 'center',
      fontSize: 14,
      font: 'Helvetica-Bold'
    });
    doc.text(`Produtividade: ${formData.produtividade}GF/H`);
    doc.text(`Prod Padrão:   ${formData.produtividadePadrao}GF/H`);
    doc.text(`Rendimento:    ${formData.rendimento}GF.H/P`);
    doc.text(`Rend Padrão:   ${formData.rendimentoPadrao}GF.H/P`);
    doc.moveDown();
    doc.text("ANÁLISE", {
      align: 'center',
      fontSize: 14,
      font: 'Helvetica-Bold'
    });
    doc.text(`Análise: ${formData.vetorAnalise} |`);
    doc.end();

    // Converter o PDF para Buffer
    const pdfBuffer = await new Promise((resolve, reject) => {
      const buffers = [];
      doc.on('data', buffer => buffers.push(buffer));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);
    });

    // Configurar o transporte de e-mail
    const transporter = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false,
      auth: {
        user: 'controle.producao@famigliavalduga.com.br', // Seu e-mail Outlook
        pass: 'Cart2057' // Sua senha Outlook
      }
    });

    // Configurar o e-mail
    const mailOptions = {
      from: 'controle.producao@famigliavalduga.com.br',
      to: 'julio.vian@famigliavalduga.com.br',//michel.trevisol@famigliavalduga.com.br //manutencao@casavalduga.com.br
      //anildo.almeida@famigliavalduga.com.br//luiz.styburski@famigliavalduga.com.br //julio.vian@famigliavalduga.com.br
      subject: `${formData.itemCode} - Relatório de Controle de Produção - Casa Valduga Engarrafamento`,
      text: `Segue anexado referente ${formData.itemCode},  relatório de Controle de Produção referente ao processo de Engarrafamento da Casa Valduga.`,
      attachments: [
        {
          filename: 'Relatório CDP.pdf',
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    // Enviar e-mail
    const info = await transporter.sendMail(mailOptions);
    console.log('E-mail enviado com sucesso:', info.response);
    res.status(200).send('E-mail enviado com sucesso');
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    res.status(500).send('Erro ao enviar e-mail');
  }
});

//-------------------CONSULTAS----------------------
//editar
app.post('/editar', (req, res) => {
  const itensProd = req.body.item;
  const itemPessR = req.body.itemPR;
  const itemPessE = req.body.itemPE;
  const itemPessD = req.body.itemPD;

  fs.readFile('bancoDeDados/parametros.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo:', err);
      return res.status(500).send('Erro ao ler o arquivo');
    }

    let parametros = JSON.parse(data);

    itensProd.forEach(item => {
      const index = parametros.findIndex(prodItem => prodItem["Código"] === item["Código"]);
      if (index !== -1) {
        parametros[index]["Prod"] = parseInt(item["Prod"]);
      } else {
        console.warn(`Item com código ${item["Código"]} não encontrado.`);
      }
    });
    itemPessR.forEach(itemPR => {
      const index = parametros.findIndex(prodItem => prodItem["Código"] === itemPR["Código"]);
      if (index !== -1) {
        parametros[index]["Pessoas"].rotulagem = parseInt(itemPR["Pessoas"]);
      } else {
        console.warn(`Item com código ${itemPR["Código"]} não encontrado.`);
      }
    });
    itemPessE.forEach(itemPE => {
      const index = parametros.findIndex(prodItem => prodItem["Código"] === itemPE["Código"]);
      if (index !== -1) {
        parametros[index]["Pessoas"].envase = parseInt(itemPE["Pessoas"]);
      } else {
        console.warn(`Item com código ${itemPE["Código"]} não encontrado.`);
      }
    });
    itemPessD.forEach(itemPD => {
      const index = parametros.findIndex(prodItem => prodItem["Código"] === itemPD["Código"]);
      if (index !== -1) {
        parametros[index]["Pessoas"].degorgment = parseInt(itemPD["Pessoas"]);
      } else {
        console.warn(`Item com código ${itemPD["Código"]} não encontrado.`);
      }
    });
    // Escrever de volta no arquivo JSON
    fs.writeFile('bancoDeDados/parametros.json', JSON.stringify(parametros, null, 2), 'utf8', (err) => {
      if (err) {
        console.error('Erro ao escrever de volta no arquivo JSON:', err);
        return res.status(500).send('Erro ao escrever de volta no arquivo JSON');
      }

      console.log('Valores atualizados com sucesso.');
      res.sendStatus(200);
    });
  });
});
//adiciona
app.post('/addParametros', (req, res) => {
  const itemToAdd = req.body.item_add;
  const descToAdd = req.body.desc_add;
  const veloToAdd = req.body.velo_add;
  const pessEToAdd = req.body.pessEnvase_add
  const pessDToAdd = req.body.pessDegorg_add
  const pessRToAdd = req.body.pessRot_add
  var pessoasData = {};
  if (pessEToAdd != '') {
    pessoasData["envase"] = pessEToAdd;
  }
  if (pessDToAdd != '') {
    pessoasData["degorgment"] = pessDToAdd;
  }
  if (pessRToAdd != '') {
    pessoasData["rotulagem"] = pessRToAdd;
  }

  var formData = {
    "Código": itemToAdd,
    "Prod": veloToAdd,
    "Pessoas": pessoasData,
    "DESC": descToAdd
  };

  console.log(formData);

  let jsonData = [];
  let fileName = '';
  fileName = 'bancoDeDados/parametros.json';

  try {
    const data = fs.readFileSync(fileName, 'utf8');
    jsonData = JSON.parse(data);
  } catch (err) {
    console.error(err);
  }

  jsonData.push(formData);

  fs.writeFileSync(fileName, JSON.stringify(jsonData, null, 2));
});
//exclui
app.delete('/deleteParametros/:codigo', (req, res) => {
  const codigoParaExcluir = req.params.codigo;
  let fileName = 'bancoDeDados/parametros.json';

  try {
    let data = fs.readFileSync(fileName, 'utf8');
    let jsonData = JSON.parse(data);

    // Encontra o índice do item a ser excluído
    const indexToRemove = jsonData.findIndex(item => item['Código'] === codigoParaExcluir);

    if (indexToRemove !== -1) {
      // Remove o item do array
      jsonData.splice(indexToRemove, 1);

      // Escreve os dados atualizados de volta ao arquivo JSON
      fs.writeFileSync(fileName, JSON.stringify(jsonData, null, 2));

      res.status(200).json({ message: 'Parâmetro excluído com sucesso' });
    } else {
      res.status(404).json({ message: 'Parâmetro não encontrado' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao excluir parâmetro' });
  }
});

//------------------- Buscar Ordens --------------------------
/*
app.post('/buscarOrdem', (req, res) => {
  const itemEnviado = req.body.item;
  const idInicial = req.body.idInicial;
  const idFinal = req.body.idFinal;
  const xmlData = fs.readFileSync('relatorios/RPRD0301.xml', 'utf-8');
  const parserOptionsXml = {
    explicitArray: false,
  };
  const exportar = [];
  xml2js.parseString(xmlData, parserOptionsXml, (err, xmlParsedData) => {
    if (err) {
      console.error('Erro ao analisar o XML:', err);
      res.status(500).send('Erro ao analisar o XML');
      return;
    }

    const resultadosPorOrdem = {};
    const gDtInicial = Array.isArray(xmlParsedData.RPRD0301.LIST_G_DT_INICIAL.G_DT_INICIAL) ?
      xmlParsedData.RPRD0301.LIST_G_DT_INICIAL.G_DT_INICIAL :
      [xmlParsedData.RPRD0301.LIST_G_DT_INICIAL.G_DT_INICIAL];

    gDtInicial.forEach(item => {
      const numOrdem = item.NUM_ORDEM;
      const codigo = item.COD_ITEM
      const diaHI = (item.TO_CHAR_DT_INICIAL_DD_MM_RR);
      if (codigo.includes(itemEnviado)) {
        if (isBetweenDatesCod(idInicial, idFinal, diaHI)) {
          if (!resultadosPorOrdem[numOrdem]) {
            resultadosPorOrdem[numOrdem] = {};
          }
          resultadosPorOrdem[numOrdem] = {
            numOrdem: item.NUM_ORDEM,
            diaHI: item.TO_CHAR_DT_INICIAL_DD_MM_RR,
            diaHF: item.TO_CHAR_DT_FINAL_DD_MM_RR,
            codItem: item.COD_ITEM,
            descItem: item.DESCRICAO,
            qtdePendente: item.QTDE_PENDENTE,
            unMed: item.UNID_MED
          };
          exportar.push(resultadosPorOrdem[numOrdem])
        }

      }

    });

  });
  exportar.sort((a, b) => {
    const [diaA, mesA, anoA] = a.diaHI.split('/').map(Number);
    const [diaB, mesB, anoB] = b.diaHI.split('/').map(Number);
    const dataA = new Date(2000 + anoA, mesA - 1, diaA); // Ajuste do ano para 2000+
    const dataB = new Date(2000 + anoB, mesB - 1, diaB); // Ajuste do ano para 2000+

    return dataA - dataB;
  });
  res.json(exportar);
});
function parseDate2(dateStr) {
  if (typeof dateStr !== 'string') {
    console.error('Invalid date string:', dateStr);
    return new Date(NaN); // Return an invalid date
  }
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(2000 + year, month - 1, day); // Ajuste do ano para 2000+
}
*/
app.post('/buscarOrdem', async (req, res) => {
  try {
    const { item: itemEnviado, idInicial, idFinal } = req.body;
    const retornoApi = await getOrdemFabricacao();
    const resultadosPorOrdem = {};
    const exportar = [];

    // Check if all three fields are empty
    if (!itemEnviado && !idInicial && !idFinal) {
      retornoApi.forEach(item => {
        const numOrdem = item.num_ordem;

        if (!resultadosPorOrdem[numOrdem]) {
          resultadosPorOrdem[numOrdem] = {
            numOrdem: item.num_ordem,
            diaHI: item.dt_inicial,
            diaHF: item.dt_final,
            codItem: item.cod_item,
            descItem: item.desc_tecnica,
            qtdePendente: item.qtde_pendente,
            unMed: item.cod_unid_med
          };
          exportar.push(resultadosPorOrdem[numOrdem]);
        }
      });

      exportar.sort((a, b) => {
        const [anoA, mesA, diaA] = a.diaHI.split('-').map(Number);
        const [anoB, mesB, diaB] = b.diaHI.split('-').map(Number);
        const dataA = new Date(anoA, mesA - 1, diaA);
        const dataB = new Date(anoB, mesB - 1, diaB);

        return dataA - dataB;
      });

      // Return all results without filtering
      return res.json(exportar);
    }
    //checa se só tem item preenchido
    if (itemEnviado && !idInicial && !idFinal) {
      retornoApi.forEach(item => {
        const numOrdem = item.num_ordem;
        const codigo = item.cod_item;

        if (codigo.includes(itemEnviado)) {
          if (!resultadosPorOrdem[numOrdem]) {
            resultadosPorOrdem[numOrdem] = {
              numOrdem: item.num_ordem,
              diaHI: item.dt_inicial,
              diaHF: item.dt_final,
              codItem: item.cod_item,
              descItem: item.desc_tecnica,
              qtdePendente: item.qtde_pendente,
              unMed: item.cod_unid_med
            };
            exportar.push(resultadosPorOrdem[numOrdem]);
          }
        }
      });
    }
    // Continue with your original filtering logic if not all fields are empty
    retornoApi.forEach(item => {
      const numOrdem = item.num_ordem;
      const diaHI = item.dt_inicial.split('T')[0];
      const codigo = item.cod_item;

      if (codigo.includes(itemEnviado)) {
        if (isBetweenDatesCod(idInicial, idFinal, diaHI)) {
          if (!resultadosPorOrdem[numOrdem]) {
            resultadosPorOrdem[numOrdem] = {
              numOrdem: item.num_ordem,
              diaHI: item.dt_inicial,
              diaHF: item.dt_final,
              codItem: item.cod_item,
              descItem: item.desc_tecnica,
              qtdePendente: item.qtde_pendente,
              unMed: item.cod_unid_med
            };
            exportar.push(resultadosPorOrdem[numOrdem]);
          }
        }
      }
    });

    exportar.sort((a, b) => {
      const [anoA, mesA, diaA] = a.diaHI.split('-').map(Number);
      const [anoB, mesB, diaB] = b.diaHI.split('-').map(Number);
      const dataA = new Date(anoA, mesA - 1, diaA);
      const dataB = new Date(anoB, mesB - 1, diaB);

      return dataA - dataB;
    });

    res.json(exportar);

  } catch (error) {
    console.error('Erro ao buscar ordem:', error.message);
    res.status(500).send('Erro ao processar a requisição');
  }
});


function isBetweenDatesCod(startDate, endDate, dateToCheck) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const check = new Date(dateToCheck);
  return check >= start && check <= end;
}
app.post('/vizualizarOrdens', async (req, res) => {
  const ordensEnviadas = req.body.ordens;
  try {
    const retornoApi = await getOrdemFabricacao();
    const codAlmoxarifados = ["030", "010", "011", "012", "013", "190", "191", "200"];

    // Faz todas as chamadas de API para obter os saldos dos itens de cada almoxarifado em paralelo
    const retornoApiSaldos = await Promise.all(
      codAlmoxarifados.map(cod => getSaldoItens(cod))
    );

    // Combina os arrays de saldo em um só
    const saldoMap = retornoApiSaldos.flat().reduce((map, item) => {
      map[item.cod_item] = (map[item.cod_item] || 0) + item.sld_atual;  // Soma os saldos se houver duplicatas
      return map;
    }, {});

    let exportar = {};

    const processOrdem = (ordemEnviada) => {
      retornoApi.forEach(item => {
        if (ordemEnviada == item.num_ordem) {
          const saldoAtual = saldoMap[item.cod_item_d] || 0; // Obtém o saldo atual do item ou 0 se não encontrado

          if (exportar[item.cod_item_d]) {
            exportar[item.cod_item_d].qtde_d += item.qtde_d;
            exportar[item.cod_item_d].qtde_pendente_d += item.qtde_pendente_d;
            exportar[item.cod_item_d].diferenca = (saldoAtual - exportar[item.cod_item_d].qtde_pendente_d);
          } else {
            exportar[item.cod_item_d] = {
              cod_item_d: item.cod_item_d,
              desc_tecnica_d: item.desc_tecnica_d,
              qtde_d: item.qtde_d,
              qtde_pendente_d: item.qtde_pendente_d,
              cod_unid_med_d: item.cod_unid_med_d,
              estoque_atual: saldoAtual,
              diferenca: (saldoAtual - item.qtde_pendente_d)
            };
          }
        }
      });
    };

    if (Array.isArray(ordensEnviadas)) {
      ordensEnviadas.forEach(ordemEnviada => {
        processOrdem(ordemEnviada);
      });
    } else {
      processOrdem(ordensEnviadas);
    }
    const exportarArray = Object.values(exportar);
    //console.log("exportarArray:", exportarArray);
    exportarArray.sort((a, b) => a.cod_item_d.localeCompare(b.cod_item_d));
    res.json(exportarArray);

  } catch (error) {
    console.error('Erro ao buscar ordem:', error.message);
    res.status(500).send('Erro ao processar a requisição');
  }
});

/*
app.post('/vizualizarOrdens/:ordemText', (req, res) => {
  const ordemEnviada = req.params.ordemText;
  console.log('ordem enviada:', ordemEnviada);
  try {
    const xmlData = fs.readFileSync('relatorios/RPRD0301.xml', 'utf-8');
    const parserOptionsXml = { explicitArray: false };

    xml2js.parseString(xmlData, parserOptionsXml, (err, xmlParsedData) => {
      if (err) {
        console.error('Erro ao analisar o XML:', err);
        res.status(500).send('Erro ao analisar o XML');
        return;
      }

      const gDtInicialList = Array.isArray(xmlParsedData.RPRD0301.LIST_G_DT_INICIAL.G_DT_INICIAL)
        ? xmlParsedData.RPRD0301.LIST_G_DT_INICIAL.G_DT_INICIAL
        : [xmlParsedData.RPRD0301.LIST_G_DT_INICIAL.G_DT_INICIAL];

      let exportar = [];

      gDtInicialList.forEach(item => {
        const numOrdem = item.NUM_ORDEM;

        if (ordemEnviada == numOrdem) {
          const gDtOrdens = Array.isArray(item.LIST_G_WG_ORDENS_ID.G_WG_ORDENS_ID)
            ? item.LIST_G_WG_ORDENS_ID.G_WG_ORDENS_ID
            : [item.LIST_G_WG_ORDENS_ID.G_WG_ORDENS_ID];

          gDtOrdens.forEach(itemDemanda => {
            const demanda = {
              demanda: itemDemanda.COD_ITEM1,
              descricao: itemDemanda.DESC_TECNICA,
              quantidade: itemDemanda.QTDE1,
              qtdePendente: itemDemanda.QTDE_PENDENTE1,
              unidade: itemDemanda.COD_UNID_MED,
              dataDemanda: itemDemanda.DT_DEMANDA
            };
            exportar.push(demanda);
            console.log(demanda);
          });
        }
      });
      console.log("EXPORTAR:", exportar);

      res.json(exportar);
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao encontrar ordem' });
  }
});
*/


//-----------------API Ordens Produção-------------------------
// XML
/*
const xmlData = fs.readFileSync('relatorios/RPRD0301.xml', 'utf-8');
const parserOptionsXml = {
  explicitArray: false,
};

xml2js.parseString(xmlData, parserOptionsXml, (err, xmlParsedData) => {
  if (err) {
    console.error('Erro ao analisar o XML:', err);
    res.status(500).send('Erro ao analisar o XML');
    return;
  }

  const resultadosPorOrdem = {};

  // Verifica se é um array ou apenas um objeto
  const gDtInicial = Array.isArray(xmlParsedData.RPRD0301.LIST_G_DT_INICIAL.G_DT_INICIAL) ?
    xmlParsedData.RPRD0301.LIST_G_DT_INICIAL.G_DT_INICIAL :
    [xmlParsedData.RPRD0301.LIST_G_DT_INICIAL.G_DT_INICIAL];

  // Itera sobre os elementos G_DT_INICIAL no XML
  gDtInicial.forEach(item => {
    const numOrdem = item.NUM_ORDEM;
    const diaHI = parseDate(item.TO_CHAR_DT_INICIAL_DD_MM_RR); // Convertendo para objeto Date
    const diaHF = parseDate(item.TO_CHAR_DT_FINAL_DD_MM_RR); // Convertendo para objeto Date
    // Verifica se a ordem já existe no objeto resultadosPorOrdem
    if (!resultadosPorOrdem[numOrdem]) {
      resultadosPorOrdem[numOrdem] = [];
    }

    // Verifica se dataformatada está dentro do intervalo (diaHI, diaHF)
    if (isBetweenDates(dataformatada, diaHI, diaHF)) {
      resultadosPorOrdem[numOrdem].push({
        codItem: item.COD_ITEM,
        qtdePendente: item.QTDE_PENDENTE,
        diaHI: item.TO_CHAR_DT_INICIAL_DD_MM_RR,
        diaHF: item.TO_CHAR_DT_FINAL_DD_MM_RR,
        descItem: item.DESCRICAO,
        obsOrdem: item.OBS,
        numOrdem: item.NUM_ORDEM
      });
    }

  });

  // Retorna os resultados agrupados por NUM_ORDEM
  res.json(resultadosPorOrdem);
});
*/
/*
function isBetweenDates(dateToCheck, startDate, endDate) {
  startDate.setDate(startDate.getDate() - 1);
  endDate.setDate(endDate.getDate() + 1);
  return dateToCheck >= startDate && dateToCheck <= endDate;
}
*/

app.post('/apiOps', async (req, res) => {
  try {
    const dataEnviada = req.body.dataEnviar; // Certifique-se de que a estrutura do objeto corresponde ao esperado
    const dataformatada = new Date(dataEnviada);

    const retornoApi = await getOrdemFabricacao();
    const resultadosPorOrdem = {};

    retornoApi.forEach(item => {
      const numOrdem = item.num_ordem;
      const diaHI = (item.dt_inicial).split('T')[0];
      const diaHF = (item.dt_final).split('T')[0];
      if (!resultadosPorOrdem[numOrdem]) {
        resultadosPorOrdem[numOrdem] = {};
      }
      if (isBetweenDates(dataformatada, diaHI, diaHF)) {
        resultadosPorOrdem[numOrdem] = {
          codItem: item.cod_item,
          qtde: item.qtde,
          qtdePendente: item.qtde_pendente,
          unMed: item.cod_unid_med,
          diaHI: item.dt_inicial,
          diaHF: item.dt_final,
          descItem: item.desc_tecnica,
          numOrdem: numOrdem,
          obs: item.observacao
        };
      }
    });

    // Filtra objetos vazios
    const resultadosFiltrados = Object.keys(resultadosPorOrdem)
      .filter(key => Object.keys(resultadosPorOrdem[key]).length > 0)
      .reduce((acc, key) => {
        acc[key] = resultadosPorOrdem[key];
        return acc;
      }, {});

    res.json(resultadosFiltrados);
  } catch (error) {
    console.error('Erro ao processar a requisição:', error.message);
    res.status(500).send('Erro ao processar a requisição');
  }
});
// Função para analisar a data no formato "DD/MM/AA" e retornar um objeto Date
function parseDate(dateString) {
  const [day, month, year] = dateString.split('/').map(part => parseInt(part, 10));
  // Ano pode estar em formato YY, então precisamos converter para YYYY
  const fullYear = year > 50 ? 1900 + year : 2000 + year;
  return new Date(fullYear, month - 1, day);
}
function isBetweenDates(date, startDate, endDate) {
  return date >= new Date(startDate) && date <= new Date(endDate);
}

//--------------------------------------QUALIDADE------------------------------------
//EMAIL LOGIN E CADASTRO QUALIDADE
app.post('/login', (req, res) => {
  const emailData = req.body.email;
  const senhaData = req.body.senha;

  fs.readFile('bancoDeDados/cadastro.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo:', err);
      return;
    }
    const cadastroData = JSON.parse(data);
    var envMessage;
    let usuarioExistente = false;
    for (let i = 0; i < cadastroData.length; i++) {
      if (cadastroData[i].email === emailData && cadastroData[i].senha == senhaData) {
        envMessage = "Email encontrado !";
        usuarioExistente = true;
        res.json(usuarioExistente);
        break; // Sai do loop assim que encontrar um usuário existente
      }
    }

    if (!usuarioExistente) {

      fs.writeFileSync('bancoDeDados/cadastro.json', JSON.stringify(cadastroData, null, 2));
      envMessage = "Email ou senha incorreto(s) !";
      res.json(usuarioExistente);
    }
  });

});
app.post('/cadastro', (req, res) => {
  const emailData = req.body.email;
  const senhaData = req.body.senha;

  console.log(emailData, senhaData)
  var formData = {
    email: emailData,
    senha: senhaData
  };
  fs.readFile('bancoDeDados/cadastro.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo:', err);
      return;
    }
    const cadastroData = JSON.parse(data);
    var envMessage;
    let usuarioExistente = false;
    for (let i = 0; i < cadastroData.length; i++) {
      if (cadastroData[i].email === emailData) {
        envMessage = "Já existe um usuário com esse e-mail cadastrado.";
        console.log(envMessage);
        usuarioExistente = true;
        res.json(usuarioExistente);
        break; // Sai do loop assim que encontrar um usuário existente
      }
    }

    if (!usuarioExistente) {
      cadastroData.push(formData);
      fs.writeFileSync('bancoDeDados/cadastro.json', JSON.stringify(cadastroData, null, 2));
      envMessage = "Novo usuário cadastrado com sucesso.";
      console.log(envMessage);
      res.json(usuarioExistente);
    }
  });

});

app.post('/exportar-qualidade', (req, res) => {
  const {
    vetorA, vetorB, vetorC, vetorD, vetorE, obs, registro, itemCode, dataHora, ordemNumero, operacao, lote, tipo,
  } = req.body;

  const formData = {
    vetorA: vetorA,
    vetorB: vetorB,
    vetorC: vetorC,
    vetorD: vetorD,
    vetorE: vetorE,
    registro: registro,
    obs: obs
  };

  let fileName = 'bancoDeDados/dadosQualidade.json';

  try {
    let jsonData = fs.readFileSync(fileName, 'utf8');
    jsonData = JSON.parse(jsonData);
    let found = false;

    jsonData.forEach(entry => {
      const entryDataHora = Object.keys(entry)[0];
      const entryOrdemNumero = Object.keys(entry[entryDataHora])[0];
      const entryLote = entry[entryDataHora][entryOrdemNumero].lote;
      /*console.log("entryDataHora: ", entryDataHora);
      console.log("entryOrdemNumero", entryOrdemNumero);
      console.log("entryLote", entryLote);*/
      if (entryDataHora === dataHora && entryOrdemNumero === ordemNumero && entryLote == lote) {
        found = true;
        const existingEntry = entry[entryDataHora][entryOrdemNumero];
        existingEntry.registros.vetorA.push(...formData.vetorA);
        existingEntry.registros.vetorB.push(...formData.vetorB);
        existingEntry.registros.vetorC.push(...formData.vetorC);
        existingEntry.registros.vetorD.push(...formData.vetorD);
        existingEntry.registros.vetorE.push(...formData.vetorE);
        existingEntry.registros.registro.push(...formData.registro);
        existingEntry.registros.obs = existingEntry.registros.obs + ", " + formData.obs;

      }
    });

    if (!found) {
      const newEntry = {
        [dataHora]: {
          [ordemNumero]: {
            itemCode: itemCode,
            operacao: operacao,
            lote: lote,
            tipo: tipo,
            registros: formData
          }
        }
      };

      jsonData.push(newEntry);
    }
    fs.writeFileSync(fileName, JSON.stringify(jsonData, null, 2));

    res.send('Dados qualidade salvos com sucesso!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao salvar os dados de qualidade.');
  }
});
/*
app.post('/esqueci', async (req, res) => {
  var emailData = req.body.email;
  var codVerif = Math.floor(10000 + Math.random() * 90000);

  async function esqEmail(emailData) {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: {
          user: 'controle.producao@famigliavalduga.com.br',
          pass: 'Cart2057'
        }
      });

      const mailOptions = {
        from: 'controle.producao@famigliavalduga.com.br',
        to: emailData,
        //to: 'julio.vian@famigliavalduga.com.br',
        subject: `DataDecanter - Código de verificação`,
        text: `Segue código de verificação: ${codVerif} ;`
      };
      const info = await transporter.sendMail(mailOptions);
      console.log('E-mail enviado com sucesso:', info.response);
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
    }
  }

  fs.readFile('bancoDeDados/cadastro.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo:', err);
      return;
    }
    const cadastroData = JSON.parse(data);
    let usuarioExistente = false;

    for (let i = 0; i < cadastroData.length; i++) {
      if (cadastroData[i].email === emailData) {
        cadastroData[i].codigo = codVerif;
        usuarioExistente = true;
        esqEmail(emailData);
        res.json({ success: true, message: 'Código enviado para o email.' });
        return; 
      }
    }

    if (!usuarioExistente) {
      res.json({ success: false, message: 'Usuário não cadastrado!' });
    }
  });
});
*/
app.post('/esqueci', (req, res) => {
  var emailData = req.body.email;
  var codVerif = Math.floor(10000 + Math.random() * 90000);

  async function esqEmail(emailData) {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: {
          user: 'controle.producao@famigliavalduga.com.br',
          pass: 'Cart2057'
        }
      });

      const mailOptions = {
        from: 'controle.producao@famigliavalduga.com.br',
        to: emailData,
        subject: `DataDecanter - Código de verificação`,
        text: `Segue código de verificação: ${codVerif};`
      };
      const info = await transporter.sendMail(mailOptions);
      console.log('E-mail enviado com sucesso');
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
    }
  }

  fs.readFile('bancoDeDados/cadastro.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo:', err);
      return res.status(500).json({ success: false, message: 'Erro no servidor ao ler o arquivo.' });
    }
    const cadastroData = JSON.parse(data);
    let usuarioExistente = false;

    for (let i = 0; i < cadastroData.length; i++) {
      if (cadastroData[i].email === emailData) {
        cadastroData[i].codigo = codVerif; // Adiciona o código de verificação ao usuário encontrado
        usuarioExistente = true;

        fs.writeFile('bancoDeDados/cadastro.json', JSON.stringify(cadastroData, null, 2), (err) => {
          if (err) {
            console.error('Erro ao salvar o arquivo:', err);
            return res.status(500).json({ success: false, message: 'Erro no servidor ao salvar o arquivo.' });
          }

          esqEmail(emailData);
          res.json({ success: true, message: 'Código enviado para o email.' });
        });
        return;
      }
    }

    if (!usuarioExistente) {
      res.json({ success: false, message: 'Usuário não cadastrado!' });
    }
  });
});

app.post('/redefinir', (req, res) => {
  const { email, senha, senhaConf, codVerif } = req.body;
  if (senha !== senhaConf) {
    return res.json({ success: false, message: 'As senhas não coincidem!' });
  }

  fs.readFile('bancoDeDados/cadastro.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo:', err);
      return res.status(500).json({ success: false, message: 'Erro no servidor ao ler o arquivo.' });
    }

    const cadastroData = JSON.parse(data);
    let usuarioEncontrado = false;

    for (let i = 0; i < cadastroData.length; i++) {
      if (cadastroData[i].email == email && cadastroData[i].codigo == codVerif) { // Verifica email e código de verificação
        cadastroData[i].senha = senha;
        usuarioEncontrado = true;
        break; // Sai do loop assim que encontrar e alterar a senha do usuário
      }
    }

    if (!usuarioEncontrado) {
      return res.json({ success: false, message: 'Código de verificação inválido!' });
    }

    fs.writeFile('bancoDeDados/cadastro.json', JSON.stringify(cadastroData, null, 2), (err) => {
      if (err) {
        console.error('Erro ao salvar o arquivo:', err);
        return res.status(500).json({ success: false, message: 'Erro no servidor ao salvar o arquivo.' });
      }

      res.json({ success: true, message: 'Senha redefinida com sucesso!' });
    });
  });
});

//---------- % defeitos ----------
function getDefXanaMensal(data) {
  const garrafasPorDia = {};

  data.forEach(item => {
    const dia = Object.keys(item)[0];
    const anoMes = dia.substring(0, 7); // Extrai apenas o ano e o mês
    Object.keys(item[dia]).forEach(ordem => {
      //item[dia][ordem].registros.forEach(registro => {
      const somaVetorD = item[dia][ordem].registros.vetorD.reduce((acc, curr) => acc + parseInt(curr), 0);
      const somaVetorE = item[dia][ordem].registros.vetorE.reduce((acc, curr) => acc + (curr === "" ? 0 : parseInt(curr)), 0);

      // Verificando se já existe uma entrada para o dia no objeto garrafasPorDia
      if (!garrafasPorDia[anoMes]) {
        // Se não existir, criamos uma entrada com as somas de vetorD e vetorE
        garrafasPorDia[anoMes] = {
          somaVetorD: 0,
          somaVetorE: 0,
          percentual: 0
        };
      }

      // Incrementando as somas de vetorD e vetorE para o dia atual
      garrafasPorDia[anoMes].somaVetorD += somaVetorD;
      garrafasPorDia[anoMes].somaVetorE += somaVetorE;
      // });
    });
    garrafasPorDia[anoMes].percentual = ((garrafasPorDia[anoMes].somaVetorE / garrafasPorDia[anoMes].somaVetorD) * 100).toFixed(1);
  });

  // Convertendo o objeto em arrays para o formato desejado
  const labels = Object.keys(garrafasPorDia).sort();
  const valuesVetorD = labels.map(anoMes => garrafasPorDia[anoMes].somaVetorD);
  const valuesVetorE = labels.map(anoMes => garrafasPorDia[anoMes].somaVetorE);
  const percentuais = labels.map(anoMes => garrafasPorDia[anoMes].percentual);
  // Convertendo os percentuais para números, pois eles estão como strings (devido ao toFixed)
  const percentuaisNumericos = percentuais.map(p => parseFloat(p));

  // Aplicando a média usando a função getAverageData para os percentuais
  const averagePercentuais = getAverageData({ labels: labels, values: percentuaisNumericos });

  return {
    labels: labels,
    valuesVetorD: valuesVetorD,
    valuesVetorE: valuesVetorE,
    percentuais: percentuaisNumericos,
    averagePercentuais: averagePercentuais.values  // Média dos percentuais
  };
}
function getAverageData(data) {
  const averageDataPmes = {};
  let acumulado = 0;

  data.labels.forEach(mes => {
    acumulado += data.values[data.labels.indexOf(mes)];
    averageDataPmes[mes] = Math.round(acumulado / (data.labels.indexOf(mes) + 1));
  });

  return {
    labels: data.labels,
    values: data.labels.map(mes => parseInt(averageDataPmes[mes])),
  };
}
app.post('/defXanaMensal', (req, res) => {
  const ano = req.body.ano;
  const mes = req.body.mes;
  const tipo = req.body.tipo;

  function filterQualidade(data2, year, tipo) {
    return data2.filter(obj => {
      const dateKey = Object.keys(obj)[0];
      const [objYear] = dateKey.split("-");
      var tipoData;
      for (const dia in obj) {
        for (const ordem in obj[dia]) {
          tipoData = obj[dia][ordem].tipo;
        }
      }
      if (tipo == 'geral') {
        return objYear === year;
      } else {
        return objYear === year && tipoData === tipo;
      }
    });
  }
  fs.readFile('bancoDeDados/dadosQualidade.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo:', err);
      return;
    }
    const data2 = JSON.parse(data);
    const filteredData = filterQualidade(data2, ano, tipo);
    const result = getDefXanaMensal(filteredData);
    res.send(result);
  });

});
//---------- % ret X leve ----------
function getRetXleveMensal(data) {
  const garrafasPorDia = {};

  data.forEach(item => {
    const dia = Object.keys(item)[0];
    const anoMes = dia.substring(0, 7);
    Object.keys(item[dia]).forEach(ordem => {
      //item[dia][ordem].registros.forEach(registro => {
      // Total de defeitos (soma do vetorE)
      const totalDefeitos = item[dia][ordem].registros.vetorE.reduce((acc, curr) => acc + (curr === "" ? 0 : parseInt(curr)), 0);

      // Defeitos retrabalhados (correspondentes ao vetorC)
      const defeitosRetrabalhados = item[dia][ordem].registros.vetorC.reduce((acc, gravidade, index) => {
        if (gravidade === "retrabalho") {
          return acc + (parseInt(item[dia][ordem].registros.vetorE[index]) || 0);
        }
        return acc;
      }, 0);
      const defeitosLeves = item[dia][ordem].registros.vetorC.reduce((acc, gravidade, index) => {
        if (gravidade === "leve") {
          return acc + (parseInt(item[dia][ordem].registros.vetorE[index]) || 0);
        }
        return acc;
      }, 0);

      // Percentual de defeitos retrabalhados em relação ao total de defeitos
      const percentualRetrabalho = (defeitosRetrabalhados / totalDefeitos) * 100;
      const percentualLeve = (defeitosLeves / totalDefeitos) * 100;
      // Verificando se já existe uma entrada para o dia no objeto garrafasPorDia
      if (!garrafasPorDia[anoMes]) {
        // Se não existir, criamos uma entrada com os valores iniciais
        garrafasPorDia[anoMes] = {
          totalDefeitos: 0,
          percentualRetrabalho: 0,
          percentualLeve: 0,
          defeitosLeves: 0,
          defeitosRetrabalhados: 0

        };
      }

      // Atualizando os valores para o dia atual
      garrafasPorDia[anoMes].totalDefeitos += totalDefeitos;
      garrafasPorDia[anoMes].percentualRetrabalho += percentualRetrabalho;
      garrafasPorDia[anoMes].percentualLeve += percentualLeve;
      garrafasPorDia[anoMes].defeitosRetrabalhados += defeitosRetrabalhados;
      garrafasPorDia[anoMes].defeitosLeves += defeitosLeves;
      // });
    });
  });

  // Calculando a média dos percentuais para cada dia
  Object.keys(garrafasPorDia).forEach(anoMes => {
    //const numRegistros =(data.filter(item => Object.keys(item)[0] === anoMes).length)+1 ;
    //garrafasPorDia[anoMes].percentualRetrabalho /= (numRegistros);
    //garrafasPorDia[anoMes].percentualLeve /= (numRegistros);
    garrafasPorDia[anoMes].percentualRetrabalho = (garrafasPorDia[anoMes].defeitosRetrabalhados / garrafasPorDia[anoMes].totalDefeitos) * 100;
    garrafasPorDia[anoMes].percentualLeve = (garrafasPorDia[anoMes].defeitosLeves / garrafasPorDia[anoMes].totalDefeitos) * 100;

  });

  // Convertendo o objeto em arrays para o formato desejado
  const labels = Object.keys(garrafasPorDia).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  const percentuaisRetrabalho = labels.map(anoMes => (garrafasPorDia[anoMes].percentualRetrabalho != '' ? garrafasPorDia[anoMes].percentualRetrabalho.toFixed(1) : ''));
  const percentuaisLeve = labels.map(anoMes => (garrafasPorDia[anoMes].percentualLeve != '' ? garrafasPorDia[anoMes].percentualLeve.toFixed(1) : ''));

  const defRetrab = labels.map(anoMes => garrafasPorDia[anoMes].defeitosRetrabalhados);
  const defLeve = labels.map(anoMes => garrafasPorDia[anoMes].defeitosLeves);

  return {
    labels: labels,
    percentuaisRetrabalho: percentuaisRetrabalho,
    percentuaisLeve: percentuaisLeve,
    defRetrab: defRetrab,
    defLeve: defLeve
  };
}
app.post('/retXleveMensal', (req, res) => {
  const ano = req.body.ano;
  const tipo = req.body.tipo;

  function filterQualidade(data2, year, tipo) {
    return data2.filter(obj => {
      const dateKey = Object.keys(obj)[0];
      const [objYear] = dateKey.split("-");
      var tipoData;
      for (const dia in obj) {
        for (const ordem in obj[dia]) {
          tipoData = obj[dia][ordem].tipo;
        }
      }
      if (tipo == 'geral') {
        return objYear === year;
      } else {
        return objYear === year && tipoData === tipo;
      }
    });
  }
  fs.readFile('bancoDeDados/dadosQualidade.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo:', err);
      return;
    }
    const data2 = JSON.parse(data);
    const filteredData = filterQualidade(data2, ano, tipo);
    const result = getRetXleveMensal(filteredData);
    res.send(result);
  });

});
//------ defeitos -------
function getDefeitosMensal(data) {
  const garrafasPorDia = {};

  data.forEach(item => {
    const dia = Object.keys(item)[0];

    Object.keys(item[dia]).forEach(ordem => {
      const registros = item[dia][ordem].registros;
      const vetorB = registros.vetorB;
      const vetorE = registros.vetorE;
      const vetorC = registros.vetorC;

      vetorB.forEach((labelB, index) => {
        if (labelB !== "") {
          if (!garrafasPorDia[labelB]) {
            garrafasPorDia[labelB] = {
              'leve': 0,
              'retrabalho': 0
            };
          }
          garrafasPorDia[labelB][vetorC[index]] += (parseInt(vetorE[index]) || 0);
        }
      });
    });
  });

  const sortedLabels = Object.keys(garrafasPorDia).map(label => ({
    label,
    total: Object.values(garrafasPorDia[label]).reduce((acc, cur) => acc + cur, 0)
  }));
  sortedLabels.sort((a, b) => b.total - a.total);

  const labels = sortedLabels.map(item => item.label);
  const dataLeve = [];
  const dataRetrabalho = [];

  labels.forEach(label => {
    dataLeve.push(garrafasPorDia[label]['leve'] || '');
    dataRetrabalho.push(garrafasPorDia[label]['retrabalho'] || '');
  });

  return {
    labels: labels,
    values: {
      leve: dataLeve,
      retrabalho: dataRetrabalho
    }
  };
}
app.post('/defeitosMensal', (req, res) => {
  const ano = req.body.ano;
  const tipo = req.body.tipo;

  function filterQualidade(data2, year, tipo) {
    return data2.filter(obj => {
      const dateKey = Object.keys(obj)[0];
      const [objYear] = dateKey.split("-");
      var tipoData;
      for (const dia in obj) {
        for (const ordem in obj[dia]) {
          tipoData = obj[dia][ordem].tipo;
        }
      }
      if (tipo == 'geral') {
        return objYear === year;
      } else {
        return objYear === year && tipoData === tipo;
      }
    });
  }
  fs.readFile('bancoDeDados/dadosQualidade.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo:', err);
      return;
    }
    const data2 = JSON.parse(data);
    const filteredData = filterQualidade(data2, ano, tipo);
    const result = getDefeitosMensal(filteredData);
    res.send(result);
  });

});
//------ qtde defeitos por item-------
function getDefeitosPorItemMensal(data) {
  const garrafasPorItemCode = {};

  data.forEach(item => {
    const dia = Object.keys(item)[0];
    Object.keys(item[dia]).forEach(ordem => {
      const itemCode = item[dia][ordem].itemCode; // Supondo que itemCode está aqui
      const somaVetorD = item[dia][ordem].registros.vetorD.reduce((acc, curr) => acc + parseInt(curr), 0);
      const somaVetorE = item[dia][ordem].registros.vetorE.reduce((acc, curr) => acc + (curr === "" ? 0 : parseInt(curr)), 0);

      // Verificando se já existe uma entrada para o itemCode no objeto garrafasPorItemCode
      if (!garrafasPorItemCode[itemCode]) {
        // Se não existir, criamos uma entrada com as somas de vetorD e vetorE
        garrafasPorItemCode[itemCode] = {
          somaVetorD: 0,
          somaVetorE: 0,
          percentual: 0
        };
      }

      // Incrementando as somas de vetorD e vetorE para o itemCode atual
      garrafasPorItemCode[itemCode].somaVetorD += somaVetorD;
      garrafasPorItemCode[itemCode].somaVetorE += somaVetorE;
    });
  });

  // Atualizando o percentual
  Object.keys(garrafasPorItemCode).forEach(itemCode => {
    garrafasPorItemCode[itemCode].percentual = ((garrafasPorItemCode[itemCode].somaVetorE / garrafasPorItemCode[itemCode].somaVetorD) * 100).toFixed(1);
  });

  // Convertendo o objeto em uma array e ordenando pelo percentual mais alto
  const sortedArray = Object.keys(garrafasPorItemCode).map(itemCode => ({
    itemCode: itemCode,
    somaVetorD: garrafasPorItemCode[itemCode].somaVetorD,
    somaVetorE: garrafasPorItemCode[itemCode].somaVetorE,
    percentual: garrafasPorItemCode[itemCode].percentual
  })).sort((a, b) => b.percentual - a.percentual);
  const top15 = sortedArray.slice(0, 15);
  // Convertendo o array ordenado em arrays para o formato desejado
  const labels = top15.map(entry => entry.itemCode);
  const valuesVetorD = top15.map(entry => entry.somaVetorD);
  const valuesVetorE = top15.map(entry => entry.somaVetorE);
  const percentuais = top15.map(entry => entry.percentual);

  return {
    labels: labels,
    valuesVetorD: valuesVetorD,
    valuesVetorE: valuesVetorE,
    percentuais: percentuais
  };


}
app.post('/defeitosPorItemMensal', (req, res) => {
  const ano = req.body.ano;
  const tipo = req.body.tipo;

  function filterQualidade(data2, year, tipo) {
    return data2.filter(obj => {
      const dateKey = Object.keys(obj)[0];
      const [objYear] = dateKey.split("-");
      var tipoData;
      for (const dia in obj) {
        for (const ordem in obj[dia]) {
          tipoData = obj[dia][ordem].tipo;
        }
      }
      if (tipo == 'geral') {
        return objYear === year;
      } else {
        return objYear === year && tipoData === tipo;
      }
    });
  }
  fs.readFile('bancoDeDados/dadosQualidade.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo:', err);
      return;
    }
    const data2 = JSON.parse(data);
    const filteredData = filterQualidade(data2, ano, tipo);
    const result = getDefeitosPorItemMensal(filteredData);
    res.send(result);
  });

});

const server = http.createServer(app);
var io = require('socket.io')(server);

server.listen(porta, () => {
  console.log(`Servidor iniciado em http://${ipv4Address}:${porta}/home`);
  exec(`start http://localhost:${porta}/home`);
});

//https://appcom.famigliavalduga.com.br/proweb/FoccoIntegrador/api/v1/Exportacao/saldoitens_pcp?Chave=8999158608&COD_EMP=11&COD_ALMOX=001
//https://appcom.famigliavalduga.com.br/proweb/FoccoIntegrador/api/v1/Exportacao/ped_venda_pcp?Chave=8999158608&dt_entrega=%072024
//https://appcom.famigliavalduga.com.br/proweb/FoccoIntegrador/api/v1/Exportacao/resumo_mvestoque_pcp?Chave=8999158608&dt=%072024
//https://appcom.famigliavalduga.com.br/proweb/FoccoIntegrador/api/v1/Exportacao/ordemfabricacao_pcp?Chave=8999158608&Skip=0&Take=20
//-----------------------------------------------API Fetch Focco Integrador-------------------------------------------
/*
// Defina o endpoint e os parâmetros
const baseUrl = "https://appcom.famigliavalduga.com.br/proweb/FoccoIntegrador/api/v1/Exportacao";
const ordemFabricacaoEndpoint = `${baseUrl}/ordemfabricacao_pcp?Chave=8999158608&Skip=0&Take=20`;
const saldoItensEndpoint = `${baseUrl}/saldoitens_pcp?Chave=8999158608&Skip=0&Take=10&COD_EMP=11&COD_ALMOX=001`;
// Defina os cabeçalhos de autenticação
const headers = {
  'Authorization': 'Bearer CfDJ8OFC-ERSzHNLkWOv8JaMhikrYkFjff2uS0ewB-mBNl1DAfFWVRzx5lQDk6Tvc8rgWFbN2F4Tn3VPdXpqE1zKO_1-Y_OWKeVrVjgHSUah8jx2tfgWu0NvAEvMfwIIB-ZV2SqTvqNQD28iEJjq16hawsr4QzK25e6t9SGPU7SWHD3PRHsNJVdmq6ojya3DSWE4pKDTVwPjAHcHYGqPLezqRn35j5PWkidp9fF52DdTNx1I5gGBeRk-3xfbzx6Qzx_sRr5q-yknGveZBrErQbymhiRILhhbbv-upu4pyjKNtKeyruWwMw8jg6ewTuUmuMlYiVUWXqsjV4pVsUGeX0ZsqFVhewKOxgHavrBKfvTs_UJpOIB4ncPYqSII4hH81SIAcn-WErKcaikcvIc3GDa4sNyyYjZuFGBnvljnlBqbvUz37Vk1eMV7-QGEXcbb08vkgba5Z6ZcuUP3ll2VKr8CgCqQaRk-w68HdNcv7kwqxg6dhWVF9SA-aMs81tbjHSDdGyPHExXM3AaFtz7-AV5LJLj1eo_3Z9pXN3ozuxLqCk1CIKIlzWYWDekxRU-A9qeTlw'
};

// Função para obter os dados de ordem de fabricação
async function getOrdemFabricacao() {
  try {
    const response = await fetch(ordemFabricacaoEndpoint, { headers });
    if (!response.ok) {

      const errorDetail = await response.text();
      throw new Error(`Network response was not ok: ${response.status} - ${errorDetail}`);
    }
    const data = await response.json();
    console.log(data.value);
    console.log("lenght",data.value.length);
    return data.value;
  } catch (error) {
    console.error('Erro ao obter dados de ordem de fabricação:', error.message);
  }
}

// Função para obter os dados de saldo de itens
async function getSaldoItens() {
  try {
    const response = await fetch(saldoItensEndpoint, { headers });
    if (!response.ok) {
      const errorDetail = await response.text();
      throw new Error(`Network response was not ok: ${response.status} - ${errorDetail}`);
    }
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Erro ao obter dados de saldo de itens:', error.message);
  }
}

// Chame as funções
//getSaldoItens();
getOrdemFabricacao();
*/
#include <WiFi.h>           // Biblioteca para conexão Wi-Fi
#include <PubSubClient.h>    // Biblioteca para MQTT

// Definições de pinos
const int relayPin1 = 26;  // Primeiro pino de relé
const int relayPin2 = 14;  // Segundo pino de relé

// Variáveis de contagem de garrafas para o primeiro pino
volatile unsigned long bottleCount1 = 0;      // Contagem total de garrafas
volatile unsigned long lastSecondCount1 = 0;  // Contagem de garrafas no último segundo

// Variáveis de contagem de garrafas para o segundo pino
volatile unsigned long bottleCount2 = 0;      // Contagem total de garrafas
volatile unsigned long lastSecondCount2 = 0;  // Contagem de garrafas no último segundo

// Variáveis de tempo
unsigned long startTime;    // Tempo de início

// Variáveis de debounce para o primeiro pino
unsigned long lastDebounceTime1 = 0;  // Último tempo de debounce para o primeiro pino
unsigned long debounceDelay1 = 1000;  // Tempo de debounce para o primeiro pino

// Variáveis de debounce para o segundo pino
unsigned long lastDebounceTime2 = 0;  // Último tempo de debounce para o segundo pino
unsigned long debounceDelay2 = 1000;  // Tempo de debounce para o segundo pino

// Configurações de rede Wi-Fi
const char* ssid = "SEU_SSID";         // Substitua pelo SSID da sua rede Wi-Fi
const char* password = "SUA_SENHA";    // Substitua pela senha da sua rede Wi-Fi

// Configurações do MQTT
const char* mqttServer = "BROKER_IP";  // Substitua pelo IP do seu broker MQTT
const int mqttPort = 1883;
const char* mqttUser = "usuario";      // Se necessário, substitua pelo seu usuário MQTT
const char* mqttPassword = "senha";    // Se necessário, substitua pela sua senha MQTT

WiFiClient espClient;
PubSubClient client(espClient);

// Função de interrupção para contar garrafas no primeiro pino
void countBottle1() {
  if ((millis() - lastDebounceTime1) > debounceDelay1) {
    bottleCount1++;
    lastSecondCount1++;
    lastDebounceTime1 = millis();
  }
}

// Função de interrupção para contar garrafas no segundo pino
void countBottle2() {
  if ((millis() - lastDebounceTime2) > debounceDelay2) {
    bottleCount2++;
    lastSecondCount2++;
    lastDebounceTime2 = millis();
  }
}

// Função para conectar ao Wi-Fi
void setupWifi() {
  delay(10);
  Serial.println();
  Serial.print("Conectando-se a ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("Wi-Fi conectado");
  Serial.println("Endereço IP: ");
  Serial.println(WiFi.localIP());
}

// Função para conectar ao broker MQTT
void reconnect() {
  while (!client.connected()) {
    Serial.print("Conectando ao MQTT...");
    if (client.connect("ESP32Client", mqttUser, mqttPassword)) {
      Serial.println("Conectado!");
    } else {
      Serial.print("Falha na conexão. Erro: ");
      Serial.print(client.state());
      delay(2000);
    }
  }
}

void setup() {
  // Inicializa a comunicação serial para depuração
  Serial.begin(115200);

  // Configura os pinos de relé como entrada
  pinMode(relayPin1, INPUT_PULLUP);
  pinMode(relayPin2, INPUT_PULLDOWN);

  // Configura as interrupções nos pinos digitais
  attachInterrupt(digitalPinToInterrupt(relayPin1), countBottle1, FALLING);
  attachInterrupt(digitalPinToInterrupt(relayPin2), countBottle2, RISING);

  // Conecta ao Wi-Fi
  setupWifi();

  // Configura o client MQTT
  client.setServer(mqttServer, mqttPort);

  // Inicializa o tempo de início
  startTime = millis();
}

void loop() {
  // Verifica a conexão ao broker MQTT
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // Calcula o tempo decorrido
  unsigned long elapsedTime = millis() - startTime;

  // Verifica se passaram dez segundos
  if (elapsedTime >= 10000) {
    // Calcula a taxa de produção de garrafas por hora no último segundo para ambos os pinos
    float bottlesPerHourInstant1 = (float)lastSecondCount1 / 10.0 * 3600.0;
    float bottlesPerHourInstant2 = (float)lastSecondCount2 / 10.0 * 3600.0;

    // Formata os dados em JSON para enviar ao MQTT
    String payload = "{\"Garrafas Rotuladas\": ";
    payload += bottleCount1;
    payload += ", \"Velocidade Rotuladora\": ";
    payload += bottlesPerHourInstant1;
    payload += ", \"Garrafas Envasadas\": ";
    payload += bottleCount2;
    payload += ", \"Velocidade Envasadora\": ";
    payload += bottlesPerHourInstant2;
    payload += "}";

    // Publica os dados no tópico MQTT
    client.publish("fabrica/garrafas", payload.c_str());

    // Reinicia a contagem do último segundo para ambos os pinos
    lastSecondCount1 = 0;
    lastSecondCount2 = 0;
    startTime = millis();  // Reinicia o tempo de início
  }
}

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

// Função de interrupção para contar garrafas no primeiro pino
void countBottle1() {
  // Verifica se tempo suficiente passou desde a última contagem
  if ((millis() - lastDebounceTime1) > debounceDelay1) {
    bottleCount1++;      // Incrementa a contagem total de garrafas
    lastSecondCount1++;  // Incrementa a contagem de garrafas no último segundo

    // Atualiza o tempo de debounce
    lastDebounceTime1 = millis();
  }
}

// Função de interrupção para contar garrafas no segundo pino
void countBottle2() {
  // Verifica se tempo suficiente passou desde a última contagem
  if ((millis() - lastDebounceTime2) > debounceDelay2) {
    bottleCount2++;      // Incrementa a contagem total de garrafas
    lastSecondCount2++;  // Incrementa a contagem de garrafas no último segundo

    // Atualiza o tempo de debounce
    lastDebounceTime2 = millis();
  }
}

void setup() {
  // Inicializa a comunicação serial
  Serial.begin(115200);

  // Configura os pinos de relé como entrada com PULLDOWN (somente em microcontroladores que suportam INPUT_PULLDOWN)
  pinMode(relayPin1, INPUT_PULLUP);
  pinMode(relayPin2, INPUT_PULLDOWN);

  // Configura as interrupções nos pinos digitais 26 e 14 para detectar a borda de subida (RISING)
  attachInterrupt(digitalPinToInterrupt(relayPin1), countBottle1, FALLING);
  attachInterrupt(digitalPinToInterrupt(relayPin2), countBottle2, RISING);

  // Inicializa o tempo de início
  startTime = millis();
  
  pinMode(2, OUTPUT);
  digitalWrite(2, HIGH);
}


void loop() {
  // Reinicia
  if (Serial.available() > 0) {
    // Lê o caractere recebido
    char comando = Serial.read();

    // Verifica se o caractere recebido é o comando desejado para reiniciar a contagem
    if (comando == 'R') {
      // Reinicia as contagens
      bottleCount1 = 0;
      lastSecondCount1 = 0;

      bottleCount2 = 0;
      lastSecondCount2 = 0;

      startTime = millis();  // Reinicia o tempo de início
      Serial.println("Contagem reiniciada!");
    }
  }

  // Calcula o tempo decorrido
  unsigned long elapsedTime = millis() - startTime;

  // Verifica se passaram dez segundos
  if (elapsedTime >= 10000) {
    // Calcula a taxa de produção de garrafas por hora no último segundo para ambos os pinos
    float bottlesPerHourInstant1 = (float)lastSecondCount1 / 10.0 * 3600.0;
    float bottlesPerHourInstant2 = (float)lastSecondCount2 / 10.0 * 3600.0;

    // Exibe as contagens e velocidades para ambos os pinos
    Serial.print("Garrafas Rotuladas: ");
    Serial.print(bottleCount1);
    Serial.print(" | Velocidade Rotuladora: ");
    Serial.print(bottlesPerHourInstant1);
    Serial.print(" GF/H | Garrafas Envasadas: ");
    Serial.print(bottleCount2);
    Serial.print(" | Velocidade Envasadora: ");
    Serial.print(bottlesPerHourInstant2);
    Serial.println(" GF/H");

    // Reinicia a contagem do último segundo para ambos os pinos
    lastSecondCount1 = 0;
    lastSecondCount2 = 0;
    startTime = millis();  // Reinicia o tempo de início
  }
}

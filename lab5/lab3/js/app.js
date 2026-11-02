import { NoiseSensor } from "./models/NoiseSensor.js";
import { MobileNoiseSensor } from "./models/MobileNoiseSensor.js";
import { NoiseMeasurement } from "./models/NoiseMeasurement.js";
import { MonitoringSystem } from "./services/MonitoringSystem.js";

// ---------- Початкові дані ----------
const sensorsData = [
  { id: "NS-01", district: "Галицький", location: "просп. Свободи", noiseLevel: 58 },
  { id: "NS-02", district: "Франківський", location: "вул. Наукова", noiseLevel: 74 },
  { id: "NS-03", district: "Шевченківський", location: "просп. Чорновола", noiseLevel: 83 }
];

// ---------- Створення системи ----------
// map перетворює plain objects на екземпляри через static-фабрику fromObject.
const system = new MonitoringSystem();
sensorsData
  .map(data => NoiseSensor.fromObject(data))
  .forEach(sensor => system.addSensor(sensor));

// Мобільний датчик демонструє наслідування (extends / super).
system.addSensor(new MobileNoiseSensor("NS-04", "Личаківський", "вул. Городоцька", 49, 15));

// ---------- Шар представлення (DOM) ----------
const STATUS_LABELS = {
  normal: "Норма",
  warning: "Попередження",
  critical: "Критичний"
};

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  if (text !== undefined) {
    element.textContent = text;
  }
  return element;
}

// Не є методом NoiseSensor: створення HTML не належить до поведінки датчика.
// Правила 55 / 70 тут не дублюються — береться sensor.getStatus().
function renderSensorCard(sensor) {
  const status = sensor.getStatus();
  const card = createElement("article", `sensor-card ${status}`);

  card.append(
    createElement("h3", "sensor-card__id", sensor.id),
    createElement("p", "sensor-card__meta", `Район: ${sensor.district}`),
    createElement("p", "sensor-card__meta", `Адреса: ${sensor.location}`),
    createElement("p", "sensor-card__level", `${sensor.noiseLevel} dB`),
    createElement("span", "sensor-card__status", STATUS_LABELS[status])
  );

  if (sensor instanceof MobileNoiseSensor) {
    const batteryText = sensor.needsCharging()
      ? `Батарея: ${sensor.batteryLevel}% (потрібна зарядка)`
      : `Батарея: ${sensor.batteryLevel}%`;
    card.append(createElement("p", "sensor-card__meta", batteryText));
  }

  return card;
}

const sensorList = document.getElementById("sensor-list");
const districtSelect = document.getElementById("district-filter");
const sensorSelect = document.getElementById("sensor-select");
const levelInput = document.getElementById("level-input");
const messageBox = document.getElementById("form-message");
const measurementForm = document.getElementById("measurement-form");

function renderSensors() {
  const district = districtSelect.value;
  const sensors = district === "all"
    ? system.sensors
    : system.getSensorsByDistrict(district);

  sensorList.replaceChildren(...sensors.map(sensor => renderSensorCard(sensor)));
}

function renderSummary() {
  const average = system.getAverageNoiseLevel();
  document.getElementById("summary-count").textContent = system.sensors.length;
  document.getElementById("summary-average").textContent =
    average === null ? "—" : `${average.toFixed(2)} dB`;
  document.getElementById("summary-critical").textContent =
    system.getCriticalSensors().length;
}

function fillSelects() {
  const districts = [...new Set(system.sensors.map(sensor => sensor.district))];

  districtSelect.replaceChildren(new Option("Усі райони", "all"));
  districts.forEach(district => districtSelect.append(new Option(district, district)));

  sensorSelect.replaceChildren(
    ...system.sensors.map(sensor => new Option(`${sensor.id} (${sensor.district})`, sensor.id))
  );
}

function renderAll() {
  renderSensors();
  renderSummary();
}

// ---------- Обробники подій ----------
districtSelect.addEventListener("change", renderSensors);

measurementForm.addEventListener("submit", event => {
  event.preventDefault();
  messageBox.textContent = "";

  const sensor = system.findSensorById(sensorSelect.value);
  const value = Number(levelInput.value);

  try {
    sensor.addMeasurement(new NoiseMeasurement(value));
    messageBox.textContent = `Датчик ${sensor.id}: новий рівень ${value} dB, статус — ${STATUS_LABELS[sensor.getStatus()]}.`;
    levelInput.value = "";
    renderAll(); // повторний рендеринг показує новий рівень і статус
  } catch (error) {
    messageBox.textContent = `Помилка: ${error.message}`;
  }
});

// ---------- Консольні експерименти (prototype та власні властивості) ----------
function runExperiments() {
  console.group("Експерименти з класами");

  const sensorA = new NoiseSensor("T-A", "Тест", "точка A", 50);
  const sensorB = new NoiseSensor("T-B", "Тест", "точка B", 50);
  sensorA.updateNoiseLevel(80);
  console.log("sensorA:", sensorA.noiseLevel, "sensorB:", sensorB.noiseLevel); // 80 і 50

  console.log("sensorA.getStatus === sensorB.getStatus:", sensorA.getStatus === sensorB.getStatus); // true
  console.log("hasOwn noiseLevel:", Object.hasOwn(sensorA, "noiseLevel")); // true
  console.log("hasOwn getStatus:", Object.hasOwn(sensorA, "getStatus")); // false
  console.log("getStatus у prototype:", Object.hasOwn(NoiseSensor.prototype, "getStatus")); // true

  try {
    const fn = sensorA.getStatus;
    fn(); // втрачено this
  } catch (error) {
    console.log("Окремий виклик fn():", error.constructor.name);
  }

  // Контроль для стартових даних (без мобільного датчика)
  const control = new MonitoringSystem();
  sensorsData.forEach(data => control.addSensor(NoiseSensor.fromObject(data)));
  console.log("Контроль, середній рівень:", control.getAverageNoiseLevel().toFixed(2), "dB"); // 71.67
  console.log("Контроль, критичні:", control.getCriticalSensors().map(s => s.id));
  console.log("NS-01 статус:", control.findSensorById("NS-01").getStatus()); // warning

  console.groupEnd();
}

// ---------- Запуск ----------
fillSelects();
renderAll();
runExperiments();

// Для експериментів вручну в Console (модулі не потрапляють у глобальну область).
window.noiseApp = { system, NoiseSensor, MobileNoiseSensor, NoiseMeasurement, MonitoringSystem };
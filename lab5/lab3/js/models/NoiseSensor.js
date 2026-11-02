import { NOISE_LIMITS, VALID_RANGE } from "../config.js";
import { NoiseMeasurement } from "./NoiseMeasurement.js";

// Датчик шуму: має власний стан (id, район, рівень, вимірювання)
// і поведінку (статус, оновлення рівня, додавання вимірювань).
export class NoiseSensor {
  constructor(id, district, location, noiseLevel) {
    if (!NoiseSensor.isValidNoiseLevel(noiseLevel)) {
      throw new RangeError(`Некоректний рівень шуму: ${noiseLevel}`);
    }
    this.id = id;
    this.district = district;
    this.location = location;
    this.noiseLevel = noiseLevel;
    // Масив створюється в constructor, щоб кожен датчик мав власну історію.
    this.measurements = [];
  }

  // Статус визначається за централізованими межами NOISE_LIMITS.
  getStatus() {
    if (this.noiseLevel <= NOISE_LIMITS.normalMax) {
      return "normal";
    }
    if (this.noiseLevel <= NOISE_LIMITS.warningMax) {
      return "warning";
    }
    return "critical";
  }

  // Спочатку перевірка значення, і лише потім зміна стану.
  updateNoiseLevel(value) {
    if (!NoiseSensor.isValidNoiseLevel(value)) {
      throw new RangeError(`Некоректний рівень шуму: ${value}`);
    }
    this.noiseLevel = value;
  }

  // Композиція: датчик містить масив об'єктів NoiseMeasurement.
  addMeasurement(measurement) {
    if (!(measurement instanceof NoiseMeasurement)) {
      throw new Error("Очікується об'єкт NoiseMeasurement");
    }
    if (!measurement.isValid()) {
      throw new RangeError(`Некоректний рівень шуму: ${measurement.value}`);
    }
    this.measurements.push(measurement);
    this.noiseLevel = measurement.value;
  }

  // static: перевірка не залежить від стану конкретного датчика,
  // тому викликається через клас: NoiseSensor.isValidNoiseLevel(74).
  static isValidNoiseLevel(value) {
    return (
      Number.isFinite(value) &&
      value >= VALID_RANGE.min &&
      value <= VALID_RANGE.max
    );
  }

  // static-фабрика: створює екземпляр зі звичайного об'єкта.
  static fromObject(data) {
    const required = ["id", "district", "location", "noiseLevel"];
    for (const field of required) {
      if (data[field] === undefined) {
        throw new Error(`Відсутнє поле "${field}"`);
      }
    }
    return new NoiseSensor(data.id, data.district, data.location, data.noiseLevel);
  }
}
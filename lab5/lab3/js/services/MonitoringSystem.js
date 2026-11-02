import { NoiseSensor } from "../models/NoiseSensor.js";

// Система моніторингу: містить колекцію об'єктів NoiseSensor (композиція).
export class MonitoringSystem {
  constructor() {
    this.sensors = [];
  }

  addSensor(sensor) {
    if (!(sensor instanceof NoiseSensor)) {
      throw new Error("Можна додавати лише об'єкти NoiseSensor");
    }
    const sensorExists = this.sensors.some(item => item.id === sensor.id);
    if (sensorExists) {
      throw new Error(`Датчик ${sensor.id} вже існує`);
    }
    this.sensors.push(sensor);
  }

  // Якщо датчика немає, повертає null.
  findSensorById(id) {
    return this.sensors.find(sensor => sensor.id === id) ?? null;
  }

  // Повертає новий масив датчиків району.
  getSensorsByDistrict(district) {
    return this.sensors.filter(sensor => sensor.district === district);
  }

  // Умови класифікації не дублюються: використовується getStatus().
  getCriticalSensors() {
    return this.sensors.filter(sensor => sensor.getStatus() === "critical");
  }

  // Для порожньої колекції явно повертає null.
  getAverageNoiseLevel() {
    if (this.sensors.length === 0) {
      return null;
    }
    const total = this.sensors.reduce((sum, sensor) => sum + sensor.noiseLevel, 0);
    return total / this.sensors.length;
  }
}
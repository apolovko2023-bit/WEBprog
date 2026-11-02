import { NoiseSensor } from "./NoiseSensor.js";

// Мобільний датчик є різновидом NoiseSensor (is-a) і додає стан батареї.
export class MobileNoiseSensor extends NoiseSensor {
  constructor(id, district, location, noiseLevel, batteryLevel) {
    // До виклику super() звертатися до this не можна.
    super(id, district, location, noiseLevel);
    this.batteryLevel = batteryLevel;
  }

  needsCharging() {
    return this.batteryLevel < 20;
  }
}
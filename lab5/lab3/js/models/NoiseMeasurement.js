import { VALID_RANGE } from "../config.js";

// Одне вимірювання рівня шуму в певний момент часу.
export class NoiseMeasurement {
  constructor(value, measuredAt = new Date()) {
    this.value = value;
    this.measuredAt = measuredAt;
  }

  isValid() {
    return (
      Number.isFinite(this.value) &&
      this.value >= VALID_RANGE.min &&
      this.value <= VALID_RANGE.max
    );
  }

  toString() {
    const time = this.measuredAt.toLocaleTimeString("uk-UA");
    return `${this.value} dB о ${time}`;
  }
}
// ============================================================
// Акустична варта — аналіз вимірювань шуму (лабораторна робота 4)
// Скрипт нічого не змінює на сторінці, результат виводиться в Console.
// ============================================================

// ---------- Вихідні дані ----------
const noiseLevels = [
  42, 55, 61, 78, 83, 67, 49, 72, 91, 58, 64, 76,
  53, 47, 88, 69, 74, 82, 95, 51, 71, -1, 85, 63,
  79, 39, 141, 86
];

const warningLevel = 70;
const criticalLevel = 85;
const minValidLevel = 30;
const maxValidLevel = 130;

// ---------- Допоміжні функції (Arrow Function) ----------

// Arrow з одним параметром: дужки навколо параметра опущено.
const statusLabel = value => `Рівень: ${value} dB`;

// Arrow з кількома параметрами: параметри записані в дужках.
const isAbove = (value, threshold) => value > threshold;

// ---------- Перевірка коректності (Function Declaration) ----------
// Відповідає лише true/false і нічого не виводить у консоль.
function isValidLevel(level, min, max) {
  return Number.isFinite(level) && level >= min && level <= max;
}

// ---------- Середнє, мінімум, максимум ----------
// Повертає null, якщо коректних значень немає.
function calculateAverage(data, min, max) {
  let sum = 0;
  let count = 0;

  for (const level of data) {
    if (!isValidLevel(level, min, max)) {
      continue; // некоректний запис пропускаємо
    }
    sum += level;
    count++;
  }

  if (count === 0) {
    return null;
  }
  return sum / count;
}

function findMinimum(data, min, max) {
  let result = null;

  for (const level of data) {
    if (!isValidLevel(level, min, max)) {
      continue;
    }
    if (result === null || level < result) {
      result = level;
    }
  }
  return result;
}

function findMaximum(data, min, max) {
  let result = null;

  for (const level of data) {
    if (!isValidLevel(level, min, max)) {
      continue;
    }
    if (result === null || level > result) {
      result = level;
    }
  }
  return result;
}

// ---------- Перше критичне вимірювання (Function Declaration) ----------
// Цикл for з індексом, зупинка командою break.
// Через hoisting цю функцію можна викликати ДО її оголошення в коді.
function findFirstCritical(data, critical, min, max) {
  let found = null;

  for (let i = 0; i < data.length; i++) {
    if (!isValidLevel(data[i], min, max)) {
      continue;
    }
    if (data[i] > critical) {
      found = { value: data[i], position: i + 1 }; // позиція = індекс + 1
      break;
    }
  }
  return found;
}

// ---------- Відновлення: цикл while ----------
// Шукає три коректні безпечні вимірювання (<= warning) поспіль
// після першого критичного. Повертає позицію третього або null.
function findRecovery(data, warning, critical, min, max) {
  const critical1 = findFirstCritical(data, critical, min, max);
  if (critical1 === null) {
    return null;
  }

  let i = critical1.position; // індекс наступного елемента після критичного
  let safeInRow = 0;

  while (i < data.length) {
    if (isValidLevel(data[i], min, max) && data[i] <= warning) {
      safeInRow++;
      if (safeInRow === 3) {
        return i + 1; // позиція третього безпечного вимірювання
      }
    } else {
      safeInRow = 0; // серія перервана — починаємо відлік знову
    }
    i++; // збільшуємо індекс, щоб цикл не став нескінченним
  }
  return null;
}

// ---------- Перше коректне вимірювання: цикл do...while ----------
// Спочатку перевіряємо, що масив не порожній. Для непорожнього масиву
// перший елемент треба перевірити хоча б один раз, тому do...while доречний.
function findFirstValid(data, min, max) {
  if (data.length === 0) {
    return null;
  }

  let i = 0;
  do {
    if (isValidLevel(data[i], min, max)) {
      return { value: data[i], position: i + 1 };
    }
    i++;
  } while (i < data.length);

  return null;
}

// ---------- Підрахунок за категоріями (Function Expression) ----------
// Записана в const: доступна лише після рядка ініціалізації.
// Виклик до цього рядка дав би ReferenceError (змінна в «temporal dead zone»).
const countByCategory = function (data, warning, critical, min, max) {
  let normal = 0;
  let warn = 0;
  let crit = 0;

  for (const level of data) {
    if (!isValidLevel(level, min, max)) {
      continue;
    }
    if (level <= warning) {
      normal++;
    } else if (level <= critical) {
      warn++;
    } else {
      crit++;
    }
  }
  return { normal, warn, crit };
};

// ---------- Збір даних про некоректні записи ----------
function findInvalidRecords(data, min, max) {
  const invalid = [];
  for (let i = 0; i < data.length; i++) {
    if (!isValidLevel(data[i], min, max)) {
      invalid.push({ position: i + 1, value: data[i] });
    }
  }
  return invalid;
}

// ---------- Callback: функція передається як аргумент ----------
// counter викликається синхронно всередині analyze().
function analyze(data, counter) {
  const counts = counter(data, warningLevel, criticalLevel, minValidLevel, maxValidLevel);
  const validCount = counts.normal + counts.warn + counts.crit;

  return {
    total: data.length,
    valid: validCount,
    invalid: findInvalidRecords(data, minValidLevel, maxValidLevel),
    counts,
    average: calculateAverage(data, minValidLevel, maxValidLevel),
    min: findMinimum(data, minValidLevel, maxValidLevel),
    max: findMaximum(data, minValidLevel, maxValidLevel),
    firstCritical: findFirstCritical(data, criticalLevel, minValidLevel, maxValidLevel),
    recovery: findRecovery(data, warningLevel, criticalLevel, minValidLevel, maxValidLevel)
  };
}

// ---------- Форматування (відокремлено від обчислень) ----------
function formatNumber(value) {
  return value === null ? "немає даних" : value.toFixed(2).replace(".", ",");
}

function buildConclusion(result) {
  if (result.valid === 0) {
    return "коректних вимірювань немає, висновок зробити неможливо.";
  }
  if (result.counts.crit === 0) {
    return "критичних вимірювань не зафіксовано.";
  }
  if (result.recovery === null) {
    return `зафіксовано критичних вимірювань: ${result.counts.crit}; після першого з них стійкого відновлення не виявлено.`;
  }
  return `зафіксовано критичних вимірювань: ${result.counts.crit}; відновлення відбулося на позиції ${result.recovery}.`;
}

// ---------- Друк звіту ----------
function printReport(title, result) {
  const exceeded = result.counts.warn + result.counts.crit;

  console.group(title);
  console.log(`Пороги: попередження > ${warningLevel} dB; критичний рівень > ${criticalLevel} dB`);
  console.log(`Усього вимірювань: ${result.total}`);
  console.log(`Коректних: ${result.valid}`);
  console.log(`Некоректних: ${result.invalid.length}`);

  console.table({
    "Без перевищення": { Кількість: result.counts.normal },
    "Попередження": { Кількість: result.counts.warn },
    "Критичні": { Кількість: result.counts.crit }
  });

  if (result.average === null) {
    console.log("Середній, мінімальний та максимальний рівні: немає даних (null)");
  } else {
    console.log(`Середній рівень: ${formatNumber(result.average)} dB`);
    console.log(`Мінімальний рівень: ${result.min} dB`);
    console.log(`Максимальний рівень: ${result.max} dB`);
  }

  if (result.firstCritical === null) {
    console.log("Перше критичне вимірювання: не знайдено");
  } else {
    console.log(`Перше критичне вимірювання: ${result.firstCritical.value} dB, позиція ${result.firstCritical.position}`);
  }

  if (result.recovery === null) {
    console.log("Відновлення — три безпечні вимірювання поспіль: не знайдено");
  } else {
    console.log(`Відновлення — три безпечні вимірювання поспіль: так, позиція ${result.recovery}`);
  }

  if (exceeded > 0) {
    console.warn(`Поріг ${warningLevel} dB перевищено у ${exceeded} вимірюваннях.`);
  }

  if (result.invalid.length > 0) {
    const list = result.invalid.map(r => `позиція ${r.position} (${r.value} dB)`).join(", ");
    console.error(`Некоректні дані: ${list}.`);
  }

  console.log(`Висновок: ${buildConclusion(result)}`);
  console.groupEnd();
}

// ---------- Основна програма ----------
const hoistedCheck = findFirstCritical(noiseLevels, criticalLevel, minValidLevel, maxValidLevel);

const mainResult = analyze(noiseLevels, countByCategory);
printReport("Акустична варта — звіт моніторингу", mainResult);

// ---------- Перевірка на окремих наборах даних ----------
// Тестові масиви передаються як аргументи, основний масив не змінюється.
const testSets = [
  { name: "Порожній набір []", data: [] },
  { name: "Лише некоректні [-1, 141]", data: [-1, 141] },
  { name: "Межі порогів [70, 85, 86]", data: [70, 85, 86] },
  // Критичне 90, далі безпечні 60, 61, потім 75 перериває серію,
  // після нього 60, 61, 62 — третє безпечне на позиції 8.
  { name: "Перервана серія безпечних", data: [50, 90, 60, 61, 75, 60, 61, 62] }
];

for (const set of testSets) {
  const result = analyze(set.data, countByCategory);
  printReport(`Тест: ${set.name}`, result);
}

// Демонстрація arrow-функцій
console.log(statusLabel(mainResult.max));
console.log(`Максимум вище критичного порога: ${isAbove(mainResult.max, criticalLevel)}`);
console.log("findFirstCritical (hoisting):", hoistedCheck);
console.log("Перше коректне вимірювання (do...while):", findFirstValid(noiseLevels, minValidLevel, maxValidLevel));
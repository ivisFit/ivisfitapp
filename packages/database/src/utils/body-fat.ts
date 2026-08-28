export type Sexo = "hombre" | "mujer";

export type MetodoCalculo = "jp3" | "jp7" | "us-navy";

export type PlieguesJP3 = {
  tricipital?: number;
  suprailiaco?: number;
  pectoral?: number;
  abdominal?: number;
  muslo?: number;
};

export type PlieguesJP7 = {
  pectoral?: number;
  axilarMedia?: number;
  tricipital?: number;
  subescapular?: number;
  abdominal?: number;
  suprailiaco?: number;
  muslo?: number;
};

export type Circunferencias = {
  cuelloCm?: number;
  cinturaCm?: number;
  caderaCm?: number;
};

export type PlieguesMujer = {
  tricipital: number;
  suprailiaco: number;
  muslo: number;
};

export type PlieguesHombre = {
  pectoral: number;
  abdominal: number;
  muslo: number;
};

function roundGrasa(porcentaje: number) {
  return Math.round(porcentaje * 10) / 10;
}

const CM_PER_INCH = 2.54;

/** La fórmula log-lineal US Navy usa pulgadas; convertimos desde cm del perfil/medición. */
function cmToInches(cm: number) {
  return cm / CM_PER_INCH;
}

export function resolveMetodoCalculo(
  metodo?: MetodoCalculo | string | null,
): MetodoCalculo {
  if (metodo === "jp7" || metodo === "us-navy") {
    return metodo;
  }
  return "jp3";
}

export function calculateAgeYears(
  fechaNacimiento: Date,
  referenceDate: Date = new Date(),
): number {
  let age = referenceDate.getFullYear() - fechaNacimiento.getFullYear();
  const monthDiff = referenceDate.getMonth() - fechaNacimiento.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && referenceDate.getDate() < fechaNacimiento.getDate())
  ) {
    age--;
  }
  return age;
}

export function sumaPlieguesJP3(sexo: Sexo, pliegues: PlieguesJP3): number {
  if (sexo === "mujer") {
    return (
      (pliegues.tricipital ?? 0) +
      (pliegues.suprailiaco ?? 0) +
      (pliegues.muslo ?? 0)
    );
  }
  return (
    (pliegues.pectoral ?? 0) +
    (pliegues.abdominal ?? 0) +
    (pliegues.muslo ?? 0)
  );
}

const JP7_FIELDS = [
  "pectoral",
  "axilarMedia",
  "tricipital",
  "subescapular",
  "abdominal",
  "suprailiaco",
  "muslo",
] as const;

export function sumaPlieguesJP7(pliegues: PlieguesJP7): number {
  return JP7_FIELDS.reduce((sum, field) => sum + (pliegues[field] ?? 0), 0);
}

export function densidadCorporalJP3(
  sexo: Sexo,
  suma3: number,
  edad: number,
): number {
  if (sexo === "hombre") {
    return (
      1.10938 -
      0.0008267 * suma3 +
      0.0000016 * suma3 * suma3 -
      0.0002574 * edad
    );
  }
  return (
    1.0994921 -
    0.0009929 * suma3 +
    0.0000023 * suma3 * suma3 -
    0.0001392 * edad
  );
}

export function densidadCorporalJP7(
  sexo: Sexo,
  suma7: number,
  edad: number,
): number {
  if (sexo === "hombre") {
    return (
      1.112 -
      0.00043499 * suma7 +
      0.00000055 * suma7 * suma7 -
      0.00028826 * edad
    );
  }
  return (
    1.097 -
    0.00046971 * suma7 +
    0.00000056 * suma7 * suma7 -
    0.00012828 * edad
  );
}

export function porcentajeGrasaSiri(densidad: number): number {
  return 495 / densidad - 450;
}

export function validatePlieguesJP3(
  sexo: Sexo,
  pliegues: PlieguesJP3,
): string | null {
  const mujerFields = ["tricipital", "suprailiaco", "muslo"] as const;
  const hombreFields = ["pectoral", "abdominal", "muslo"] as const;
  const required = sexo === "mujer" ? mujerFields : hombreFields;
  const forbidden =
    sexo === "mujer"
      ? (["pectoral", "abdominal"] as const)
      : (["tricipital", "suprailiaco"] as const);

  for (const field of required) {
    const value = pliegues[field];
    if (value === undefined || value === null || Number.isNaN(value)) {
      return `El pliegue ${field} es requerido`;
    }
    if (value < 0) {
      return `El pliegue ${field} debe ser no negativo`;
    }
  }

  for (const field of forbidden) {
    if (pliegues[field] !== undefined && pliegues[field] !== null) {
      return `El pliegue ${field} no corresponde al sexo ${sexo}`;
    }
  }

  return null;
}

export function validatePlieguesJP7(pliegues: PlieguesJP7): string | null {
  for (const field of JP7_FIELDS) {
    const value = pliegues[field];
    if (value === undefined || value === null || Number.isNaN(value)) {
      return `El pliegue ${field} es requerido`;
    }
    if (value < 0) {
      return `El pliegue ${field} debe ser no negativo`;
    }
  }
  return null;
}

export function validateCircunferenciasUsNavy(
  sexo: Sexo,
  circunferencias: Circunferencias,
): string | null {
  const { cuelloCm, cinturaCm, caderaCm } = circunferencias;

  if (!cuelloCm || cuelloCm <= 0) {
    return "La circunferencia del cuello es requerida";
  }
  if (!cinturaCm || cinturaCm <= 0) {
    return "La circunferencia de la cintura es requerida";
  }
  if (sexo === "mujer" && (!caderaCm || caderaCm <= 0)) {
    return "La circunferencia de la cadera es requerida para mujeres";
  }
  if (sexo === "hombre" && caderaCm !== undefined && caderaCm !== null) {
    return "La circunferencia de la cadera no corresponde al sexo hombre";
  }

  return null;
}

export function calculateJacksonPollock3(
  sexo: Sexo,
  edad: number,
  pliegues: PlieguesJP3,
): { porcentajeGrasaCorporal: number; densidadCorporal: number } {
  const validationError = validatePlieguesJP3(sexo, pliegues);
  if (validationError) {
    throw new Error(validationError);
  }

  const suma3 = sumaPlieguesJP3(sexo, pliegues);
  const densidad = densidadCorporalJP3(sexo, suma3, edad);
  const porcentaje = porcentajeGrasaSiri(densidad);

  return {
    porcentajeGrasaCorporal: roundGrasa(porcentaje),
    densidadCorporal: densidad,
  };
}

export function calculateJacksonPollock7(
  sexo: Sexo,
  edad: number,
  pliegues: PlieguesJP7,
): { porcentajeGrasaCorporal: number; densidadCorporal: number } {
  const validationError = validatePlieguesJP7(pliegues);
  if (validationError) {
    throw new Error(validationError);
  }

  const suma7 = sumaPlieguesJP7(pliegues);
  const densidad = densidadCorporalJP7(sexo, suma7, edad);
  const porcentaje = porcentajeGrasaSiri(densidad);

  return {
    porcentajeGrasaCorporal: roundGrasa(porcentaje),
    densidadCorporal: densidad,
  };
}

export function calculateUsNavy(
  sexo: Sexo,
  alturaCm: number,
  circunferencias: Circunferencias,
): { porcentajeGrasaCorporal: number } {
  if (!alturaCm || alturaCm <= 0) {
    throw new Error("La altura en cm es requerida para el método US Navy");
  }

  const validationError = validateCircunferenciasUsNavy(sexo, circunferencias);
  if (validationError) {
    throw new Error(validationError);
  }

  const { cuelloCm, cinturaCm, caderaCm } = circunferencias;

  const neckIn = cmToInches(cuelloCm!);
  const waistIn = cmToInches(cinturaCm!);
  const heightIn = cmToInches(alturaCm);

  let porcentaje: number;
  if (sexo === "hombre") {
    const logArg = waistIn - neckIn;
    if (logArg <= 0) {
      throw new Error("La cintura debe ser mayor que el cuello");
    }
    porcentaje =
      86.01 * Math.log10(logArg) -
      70.041 * Math.log10(heightIn) +
      36.76;
  } else {
    const hipIn = cmToInches(caderaCm!);
    const logArg = waistIn + hipIn - neckIn;
    if (logArg <= 0) {
      throw new Error(
        "La suma de cintura y cadera debe ser mayor que el cuello",
      );
    }
    porcentaje =
      163.205 * Math.log10(logArg) -
      97.684 * Math.log10(heightIn) -
      78.387;
  }

  return {
    porcentajeGrasaCorporal: roundGrasa(porcentaje),
  };
}

export function calculateImc(pesoKg: number, alturaCm: number): number {
  const alturaM = alturaCm / 100;
  return Math.round((pesoKg / (alturaM * alturaM)) * 10) / 10;
}

export function getImcCategoria(imc: number): string {
  if (imc < 18.5) return "Bajo peso";
  if (imc < 25) return "Peso normal";
  if (imc < 30) return "Sobrepeso";
  return "Obesidad";
}

export function calculateMasaMagra(
  pesoKg: number,
  porcentajeGrasaCorporal: number,
): number {
  return Math.round(pesoKg * (1 - porcentajeGrasaCorporal / 100) * 10) / 10;
}

// Alias para compatibilidad
export const densidadCorporal = densidadCorporalJP3;
export const validatePlieguesForSexo = validatePlieguesJP3;

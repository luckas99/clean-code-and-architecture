// @ts-nocheck
function validateInput(cpf) {
  if (cpf == null) return false;
  if (cpf === undefined) return false;
  if (cpf.length <= 11 || cpf.length > 14) return false;
  return cleanInput(cpf);
}

function cleanInput(cpf) {
  return cpf
    .replace(".", "")
    .replace(".", "")
    .replace("-", "")
    .replace(" ", "");
}

function validateIfIsSequencialCPF(cpf) {
  if (cpf.split("").every((c) => c === cpf[0])) return false;
}

function validateCPF(cpf) {
  // TODO: Extract methods and rename variables
  let d1, d2;
  let dg1, dg2, rest;
  let digito;
  let nDigResult;
  d1 = d2 = 0;
  dg1 = dg2 = rest = 0;

  for (let nCount = 1; nCount < cpf.length - 1; nCount++) {
    digito = parseInt(cpf.substring(nCount - 1, nCount));
    d1 = d1 + (11 - nCount) * digito;
    d2 = d2 + (12 - nCount) * digito;
  }

  rest = d1 % 11;

  dg1 = rest < 2 ? (dg1 = 0) : 11 - rest;
  d2 += 2 * dg1;
  rest = d2 % 11;
  if (rest < 2) dg2 = 0;
  else dg2 = 11 - rest;

  let nDigVerific = cpf.substring(cpf.length - 2, cpf.length);
  nDigResult = "" + dg1 + "" + dg2;

  return nDigVerific == nDigResult;
}

export default function isValidCPF(cpf) {
  cpf = validateInput(cpf);
  validateIfIsSequencialCPF(cpf);
  return validateCPF(cpf);
}

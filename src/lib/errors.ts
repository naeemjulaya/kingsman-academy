export function getErrorMessage(error: unknown, fallback = "Ocorreu um erro inesperado") {
  return error instanceof Error ? error.message : fallback;
}

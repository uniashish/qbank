const OPTION_LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function getOptionLabel(index) {
  return OPTION_LABELS[index] ?? String(index + 1);
}

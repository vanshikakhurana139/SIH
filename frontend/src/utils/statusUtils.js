const STATUS_TO_STEP = {
  diagnosed:   3,
  approved:    4,
  resolved:    6,
  failed:      6,
  rejected:    4,
  undone:      4,
};

export function statusToStep(status) {
  return STATUS_TO_STEP[status] ?? 1;
}

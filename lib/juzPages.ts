/**
 * JUZ_PAGE_RANGES — standard Mushaf page ranges for each of the 30 Juz'.
 * Used by Progress_Service to validate submitted page numbers.
 * Requirements: 7.2, 7.4
 */
export const JUZ_PAGE_RANGES: Record<number, { start: number; end: number }> = {
  1:  { start: 1,   end: 21  },
  2:  { start: 22,  end: 41  },
  3:  { start: 42,  end: 61  },
  4:  { start: 62,  end: 81  },
  5:  { start: 82,  end: 101 },
  6:  { start: 102, end: 121 },
  7:  { start: 122, end: 141 },
  8:  { start: 142, end: 161 },
  9:  { start: 162, end: 181 },
  10: { start: 182, end: 201 },
  11: { start: 202, end: 221 },
  12: { start: 222, end: 241 },
  13: { start: 242, end: 261 },
  14: { start: 262, end: 281 },
  15: { start: 282, end: 301 },
  16: { start: 302, end: 321 },
  17: { start: 322, end: 341 },
  18: { start: 342, end: 361 },
  19: { start: 362, end: 381 },
  20: { start: 382, end: 401 },
  21: { start: 402, end: 421 },
  22: { start: 422, end: 441 },
  23: { start: 442, end: 461 },
  24: { start: 462, end: 481 },
  25: { start: 482, end: 501 },
  26: { start: 502, end: 521 },
  27: { start: 522, end: 541 },
  28: { start: 542, end: 561 },
  29: { start: 562, end: 581 },
  30: { start: 582, end: 604 },
}

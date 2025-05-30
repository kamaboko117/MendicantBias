import type { MusicQueue } from "../../../types/MusicQueue";

export const mendicantMove = (
  queue: MusicQueue["items"],
  src: number,
  dst: number
) => {
  console.log(`mendicantMove(${src}, ${dst})`);
  if (
    src === dst ||
    src < 1 ||
    src > queue.length ||
    dst < 1 ||
    dst > queue.length
  ) {
    return;
  }

  const item = queue[src];
  queue.splice(src, 1);
  queue.splice(dst, 0, item);
};

export type MusicQueue = {
  id: string;
  items: {
    id: string;
    title: string;
    length: number;
  }[];
};

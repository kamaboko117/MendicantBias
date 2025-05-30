import ytdl from "@distube/ytdl-core";

export const isValidHttpUrl = (string: string) => {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export const isPlaylist = (url: string) => {
  return (
    isValidHttpUrl(url) && (url.includes("&list=") || url.includes("?list="))
  );
};

export const getPlaylistId = (url: string) => {
  const keyword = url.includes("&list=") ? "&list=" : "?list=";
  const index = url.indexOf(keyword);
  const end = url.indexOf("&", index + 1);

  console.log(`index: ${index}`);
  return end === -1
    ? url.substring(index + keyword.length)
    : url.substring(index + keyword.length, end);
};

export const findVideoIndex = (url: string) => {
  if (!ytdl.validateURL(url)) {
    return 0;
  }

  const indexParam = "&index=";
  const indexStart = url.indexOf(indexParam) + indexParam.length;
  const index = parseInt(url.slice(indexStart));

  return isNaN(index) ? 0 : index;
};

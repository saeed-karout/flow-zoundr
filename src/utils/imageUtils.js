// في utils/index.js أو utils/imageUtils.js
export const isRealImage = (url) => {
  if (!url) return false;
  if (url === '/img/bgCardSongs/card1.png') return false;
  if (url.includes('bgCardSongs/card1.png')) return false;
  if (url.includes('defaultBackgroundImage')) return false;
  if (url.includes('storage') && !url.includes('bgCardSongs')) return true;
  if (url.startsWith('blob:')) return true;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    if (url.includes('bgCardSongs/card1.png')) return false;
    return true;
  }
  if (url.startsWith('data:image')) return true;
  return false;
};
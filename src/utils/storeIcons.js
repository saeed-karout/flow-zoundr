// utils/storeIcons.js
import * as si from 'simple-icons';

// خريطة لربط أسماء متاجرك مع مفاتيح المكتبة
const iconMap = {
  'spotify': 'siSpotify',
  'deezer': 'siDeezer',
  'tidal': 'siTidal',
  'apple music': 'siAppleMusic',
  'amazon music': 'siAmazonMusic',
  'youtube music': 'siYouTubeMusic',
  'soundcloud': 'siSoundcloud',
  'pandora': 'siPandora',
  'napster': 'siNapster',
  'anghami': 'siAnghami',
};

export function getStoreIconSvg(storeName) {
  if (!storeName) return null;
  const key = iconMap[storeName.toLowerCase()];
  if (key && si[key]) {
    return si[key].svg; 
  }
  return null;
}
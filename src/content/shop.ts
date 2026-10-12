// 店舗の連絡先と支払い方法。ページ本文と、index.html の店舗情報(JSON-LD)の両方でこの値を使う。
export const SITE_URL = "https://coffeehousehiro.vercel.app/";
export const POSTAL = "712-8046";
export const ADDRESS = "岡山県倉敷市福田町福田2370-6";
export const MAP_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`;
export const EMAIL = "coffeehousehiro@gmail.com";
export const INSTAGRAM_URL = "https://www.instagram.com/coffee_house_hiro/";
export const LINE_URL = "https://lin.ee/Zp3za2N";
export const LINE_OA_ID = "992mqixg";
/** 本文なしで公式アカウントのトーク画面を開く。住所や氏名を URL に載せないため、本文はコピーして貼ってもらう */
export const LINE_CHAT_URL = `https://line.me/R/oaMessage/%40${LINE_OA_ID}/`;
export const PAYMENTS = ["PayPay", "楽天ペイ", "銀行振込"] as const;

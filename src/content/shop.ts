// お店の事業情報。値は business.yaml にあり、ここでは名前を付けて渡すだけ。
// ページ本文と、index.html の店舗情報(JSON-LD)の両方でこの値を使う。
import { parseBusiness } from "./business.ts";
import data from "./business.yaml";

const { shop, legalNotice } = parseBusiness(data);

export const SITE_URL = "https://coffeehousehiro.vercel.app/";
export const SHOP_NAME = shop.name;
export const POSTAL = shop.postalCode;
/** JSON-LD では住所を分けて載せる */
export const ADDRESS_PARTS = { region: shop.region, locality: shop.locality, street: shop.street };
export const ADDRESS = `${shop.region}${shop.locality}${shop.street}`;
export const MAP_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`;
export const EMAIL = shop.email;
export const INSTAGRAM_HANDLE = shop.instagram.handle;
export const INSTAGRAM_URL = shop.instagram.url;
export const LINE_URL = shop.line.url;
export const LINE_OA_ID = shop.line.accountId;
/** 本文なしで公式アカウントのトーク画面を開く。住所や氏名を URL に載せないため、本文はコピーして貼ってもらう */
export const LINE_CHAT_URL = `https://line.me/R/oaMessage/%40${LINE_OA_ID}/`;
export const PAYMENTS = shop.payments;
/** 特定商取引法に基づく表記(/legal) */
export const LEGAL_NOTICE = legalNotice;

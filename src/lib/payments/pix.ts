import { PRECO_REAIS } from "@/lib/legal/constantes";
import { EMPRESA } from "@/lib/empresa";

export const PIX_CONFIG = {
  chave: EMPRESA.pixChave,
  titular: EMPRESA.pixTitular,
  cidade: EMPRESA.pixCidade,
  valorReais: PRECO_REAIS,
};

export function pixConfigurado() {
  return PIX_CONFIG.chave.trim().length > 0;
}

function emv(id: string, value: string) {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

/** CRC16-CCITT (0x1021), init 0xFFFF — padrão BR Code / EMV. */
export function crc16(payload: string) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = (crc & 0x8000) !== 0 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function soAscii(s: string, max: number) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase()
    .slice(0, max);
}

export function montarPayloadPix(opts: {
  chave: string;
  titular: string;
  cidade: string;
  valorReais: number;
  txid: string;
}) {
  const chave = opts.chave.trim();
  const nome = soAscii(opts.titular || "RECEBEDOR", 25) || "RECEBEDOR";
  const cidade = soAscii(opts.cidade || "SAO PAULO", 15) || "SAO PAULO";
  const valor = opts.valorReais.toFixed(2);
  const txid = (opts.txid || "***").replace(/[^A-Za-z0-9]/g, "").slice(0, 25) || "***";

  const merchant = emv("00", "br.gov.bcb.pix") + emv("01", chave);
  const additional = emv("62", emv("05", txid));

  const body =
    emv("00", "01") +
    emv("01", "11") +
    emv("26", merchant) +
    emv("52", "0000") +
    emv("53", "986") +
    emv("54", valor) +
    emv("58", "BR") +
    emv("59", nome) +
    emv("60", cidade) +
    additional +
    "6304";

  return body + crc16(body);
}

export function novoTxid() {
  const n = Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  return n.replace(/[^A-Za-z0-9]/g, "").slice(0, 25).toUpperCase();
}

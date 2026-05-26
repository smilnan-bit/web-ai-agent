import md5 from 'js-md5';

// 纯 JS SHA-1 实现，用于 HTTP 环境（crypto.subtle 只在 HTTPS/localhost 可用）
function sha1Fallback(str) {
  const data = Array.from(new TextEncoder().encode(str));
  const bitLen = data.length * 8;
  data.push(0x80);
  while (data.length % 64 !== 56) data.push(0);
  data.push(0, 0, 0, 0,
    (bitLen >>> 24) & 0xff, (bitLen >>> 16) & 0xff,
    (bitLen >>> 8) & 0xff, bitLen & 0xff);

  function rotL(n, s) { return (n << s) | (n >>> (32 - s)); }
  let h0 = 0x67452301, h1 = 0xefcdab89, h2 = 0x98badcfe,
      h3 = 0x10325476, h4 = 0xc3d2e1f0;

  for (let bi = 0; bi < data.length; bi += 64) {
    const w = new Array(80);
    for (let j = 0; j < 16; j++)
      w[j] = (data[bi+j*4]<<24)|(data[bi+j*4+1]<<16)|(data[bi+j*4+2]<<8)|data[bi+j*4+3];
    for (let j = 16; j < 80; j++)
      w[j] = rotL(w[j-3]^w[j-8]^w[j-14]^w[j-16], 1);

    let a = h0, b = h1, c = h2, d = h3, e = h4;
    for (let j = 0; j < 80; j++) {
      let f, k;
      if (j < 20)      { f = (b&c)|(~b&d);       k = 0x5a827999; }
      else if (j < 40) { f = b^c^d;               k = 0x6ed9eba1; }
      else if (j < 60) { f = (b&c)|(b&d)|(c&d);  k = 0x8f1bbcdc; }
      else             { f = b^c^d;               k = 0xca62c1d6; }
      const t = (rotL(a, 5) + f + e + k + w[j]) | 0;
      e = d; d = c; c = rotL(b, 30); b = a; a = t;
    }
    h0=(h0+a)|0; h1=(h1+b)|0; h2=(h2+c)|0; h3=(h3+d)|0; h4=(h4+e)|0;
  }
  return [h0, h1, h2, h3, h4]
    .map(n => ('0000000' + (n >>> 0).toString(16)).slice(-8))
    .join('');
}

async function sha1Hex(str) {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  return sha1Fallback(str);
}

export async function generateChecksum(appSecret, bodyStr) {
  const time = Math.floor(Date.now() / 1000);
  const bodyMd5 = md5(bodyStr);
  const checksum = await sha1Hex(appSecret + bodyMd5 + time);
  return { time, checksum };
}

/* ============================================================
   magicianed - minimal vector PDF writer
   No dependencies. Base-14 Helvetica with real AFM widths so
   centring is exact. Produces a single landscape A4 page.
   ============================================================ */
(function (w) {
  'use strict';

  /* Adobe base-14 widths, units/1000, for codes 32..126 */
  var HELV = [278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,
    556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,
    667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,
    278,278,278,469,556,333,
    556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,
    334,260,334,584];
  var HELVB = [278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,
    556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,
    722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,
    333,278,333,584,556,333,
    556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,
    389,280,389,584];

  function widthOf(str, size, bold) {
    var tbl = bold ? HELVB : HELV, total = 0;
    for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i);
      if (c >= 32 && c <= 126) total += tbl[c - 32];
      else if (c >= 160 && c <= 255) total += bold ? 556 : 556;
      else total += bold ? 556 : 556;
    }
    return total / 1000 * size;
  }

  function pdfEscape(str) {
    var out = '';
    for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i);
      var ch = str[i];
      if (ch === '(' || ch === ')' || ch === '\\') out += '\\' + ch;
      else if (c < 32) out += ' ';
      else if (c <= 255) out += ch;
      else out += '?';
    }
    return out;
  }

  function Doc(wd, ht) {
    this.w = wd; this.h = ht; this.ops = [];
  }
  Doc.prototype.rect = function (x, y, wd, ht, col) {
    this.ops.push(col.join(' ') + ' rg', fmt(x) + ' ' + fmt(y) + ' ' + fmt(wd) + ' ' + fmt(ht) + ' re f');
    return this;
  };
  Doc.prototype.line = function (x1, y1, x2, y2, col, lw) {
    this.ops.push(col.join(' ') + ' RG', fmt(lw || 1) + ' w',
      fmt(x1) + ' ' + fmt(y1) + ' m ' + fmt(x2) + ' ' + fmt(y2) + ' l S');
    return this;
  };
  Doc.prototype.frame = function (x, y, wd, ht, col, lw) {
    this.ops.push(col.join(' ') + ' RG', fmt(lw || 1) + ' w',
      fmt(x) + ' ' + fmt(y) + ' ' + fmt(wd) + ' ' + fmt(ht) + ' re S');
    return this;
  };
  /* align: 'l' | 'c' | 'r'  ; tracking in 1/1000 em */
  Doc.prototype.text = function (str, x, y, size, col, opt) {
    opt = opt || {};
    var bold = !!opt.bold;
    var track = opt.track || 0;
    var wdt = widthOf(str, size, bold) + (str.length ? (str.length - 1) * track / 1000 * size : 0);
    var tx = x;
    if (opt.align === 'c') tx = x - wdt / 2;
    else if (opt.align === 'r') tx = x - wdt;
    this.ops.push('BT');
    this.ops.push('/' + (bold ? 'F2' : 'F1') + ' ' + fmt(size) + ' Tf');
    if (track) this.ops.push(fmt(track / 1000 * size) + ' Tc');
    this.ops.push(col.join(' ') + ' rg');
    this.ops.push(fmt(tx) + ' ' + fmt(y) + ' Td');
    this.ops.push('(' + pdfEscape(str) + ') Tj');
    if (track) this.ops.push('0 Tc');
    this.ops.push('ET');
    return this;
  };
  Doc.prototype.textWidth = function (str, size, bold, track) {
    return widthOf(str, size, bold) + (str.length ? (str.length - 1) * (track || 0) / 1000 * size : 0);
  };

  function fmt(n) { return (Math.round(n * 100) / 100).toString(); }

  Doc.prototype.build = function () {
    var content = this.ops.join('\n');
    var objs = [];
    objs[1] = '<< /Type /Catalog /Pages 2 0 R >>';
    objs[2] = '<< /Type /Pages /Kids [3 0 R] /Count 1 >>';
    objs[3] = '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + fmt(this.w) + ' ' + fmt(this.h) + '] ' +
              '/Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>';
    objs[4] = '<< /Length ' + content.length + ' >>\nstream\n' + content + '\nendstream';
    objs[5] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
    objs[6] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';

    var out = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
    var offsets = [];
    for (var i = 1; i <= 6; i++) {
      offsets[i] = out.length;
      out += i + ' 0 obj\n' + objs[i] + '\nendobj\n';
    }
    var xref = out.length;
    out += 'xref\n0 7\n0000000000 65535 f \n';
    for (var j = 1; j <= 6; j++) {
      out += ('0000000000' + offsets[j]).slice(-10) + ' 00000 n \n';
    }
    out += 'trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF';

    var bytes = new Uint8Array(out.length);
    for (var k = 0; k < out.length; k++) bytes[k] = out.charCodeAt(k) & 0xff;
    return bytes;
  };

  Doc.prototype.download = function (filename) {
    var blob = new Blob([this.build()], { type: 'application/pdf' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 1200);
  };

  w.MiniPDF = { Doc: Doc, widthOf: widthOf };
})(window);

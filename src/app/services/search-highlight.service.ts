import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class SearchHighlightService {
  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Returns a ~80-char snippet centered around the first match of `query` in
   * `text`. Falls back to a plain leading truncation when there is no query or
   * the match already sits within the first 80 characters.
   */
  smartPreview(text: string, query: string): string {
    const q = query.trim();
    if (!q || !text) return this.preview(text);

    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1 || idx + q.length <= 80) return this.preview(text);

    const BEFORE = 30;
    const TOTAL = 80;
    const start = Math.max(0, idx - BEFORE);
    const end = Math.min(text.length, start + TOTAL);

    let snippet = text.slice(start, end);
    if (start > 0) snippet = '\u2026' + snippet;
    if (end < text.length) snippet += '\u2026';
    return snippet;
  }

  /**
   * HTML-escapes `text` and wraps every case-insensitive occurrence of `query`
   * in `<mark class="search-highlight">`. Safe to bind with [innerHTML].
   */
  highlight(text: string, query: string): SafeHtml {
    const q = query.trim();
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    if (!q) return this.sanitizer.bypassSecurityTrustHtml(escaped);

    const escapedQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const html = escaped.replace(
      new RegExp(escapedQ, 'gi'),
      (match) => `<mark class="search-highlight">${match}</mark>`,
    );
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private preview(text: string): string {
    return text.length > 80 ? text.slice(0, 80).trimEnd() + '\u2026' : text;
  }
}

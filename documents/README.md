# Library: articles & documents

The "Library" section on may21.org lists every entry in `documents.json`
(in the main folder of this repo). Newest dates appear first.

## To publish something

1. **If it's a file** (PDF, Word, image): upload it into this `documents` folder.
   On github.com: open the folder → **Add file → Upload files** → commit.
   Use a simple file name without spaces, e.g. `statement-2026-05-21.pdf`.
2. **Open `documents.json`**, click the pencil icon, and add an entry:

```json
[
  {
    "title": "Statement on May 21, 2026",
    "date": "2026-05-21",
    "type": "Statement",
    "lang": "EN",
    "description": "One or two sentences about the document.",
    "url": "documents/statement-2026-05-21.pdf"
  }
]
```

- `title` and `url` are required; the rest is optional.
- `url` is either a file in this folder (`documents/…`) or a full link to an
  article elsewhere (`https://…`).
- Separate entries with a comma. The whole list stays inside `[` `]`.
- `date` uses the format `YYYY-MM-DD`.

3. Commit. The site updates within a minute or two.


## Share buttons and link previews

Every article page loads the share bar with one line before `</body>`:

    <script src="../assets/share.js" defer></script>

It adds Facebook, X, WhatsApp, Telegram, VK, LinkedIn, email and copy-link buttons at the end of the article (before "Sources"), and a "Share ↓" link in the top menu. Shared links keep the language the reader is viewing (`?lang=`).

For a good preview when the link is posted, the page `<head>` also carries `og:title`, `og:description`, `og:url`, `og:image` and `twitter:card` tags; copy them from an existing article and change title, description and URL.


## Previews in every language

Link previews (Facebook, X, WhatsApp, Telegram…) cannot run JavaScript, so the article page itself only shows its English title. For the other languages the share buttons use `share/<lang>/<page>`: a small page with the title and summary in that language that forwards readers to `<page>?lang=<lang>`.

After adding or changing an article, rebuild them from the repository root:

    python3 tools/make-share-pages.py

Titles and summaries come from each language panel (`<h1>` and `<p class="dek">`). The Monuments page’s texts are in `tools/share-extra.json`.

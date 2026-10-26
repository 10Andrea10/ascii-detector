# ASCII Detector

A small, browser-only character inspector for **ascii-detector.adetomasi.com**.
Type or paste text to see each code point, its ASCII decimal code (0–127 only),
Unicode code, and character name. Spaces, control characters, combining marks,
and invisible characters are made visible. Text is never uploaded or saved.

## Local preview

No dependencies or build step. From the repository root:

```sh
python3 -m http.server 8080 --bind 127.0.0.1 --directory site
```

Open http://127.0.0.1:8080. Stop with Ctrl+C. Use an HTTP server rather than
opening the HTML file directly, because the app loads local Unicode data.

Run checks with Node.js 24 or later:

```sh
node --test tests/*.test.mjs
```

## Deployment

The prepared `.github/workflows/deploy.yml` checks pull requests and automatically
deploys `site/` on pushes to `main`. No npm install, build, or deployment secrets
are required. The Pages custom domain is configured in repository settings.
A repository `CNAME` file is unnecessary for this custom Actions workflow.
The local hosting and DNS handoff is in the ignored `operations/deployment.md`.

References: [GitHub custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site),
[Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages),
[Porkbun DNS records](https://kb.porkbun.com/article/231-how-to-add-dns-records-on-porkbun).

## Unicode data

`site/data/unicode.json` bundles names from Unicode **17.0.0**, including derived
names for Hangul and ideographs, plus control aliases. It is loaded from the same
site; there are no external fonts, analytics, APIs, or runtime dependencies.
The Unicode data license is included in `site/data/UNICODE-LICENSE.txt`.

To reproduce the bundled data, download the pinned
[DerivedName.txt](https://www.unicode.org/Public/17.0.0/ucd/extracted/DerivedName.txt)
and [NameAliases.txt](https://www.unicode.org/Public/17.0.0/ucd/NameAliases.txt), then run:

```sh
node scripts/generate-unicode.mjs /path/to/DerivedName.txt /path/to/NameAliases.txt
```

The inspector preserves code point sequences without Unicode normalization.
Browser textareas normalize CR/CRLF line endings to LF. Emoji sequences and
combining accents can occupy multiple rows. Results appear in batches of 200
to keep long inputs usable. Characters outside the bundled version are identified
as unassigned in that version; private-use and noncharacter values are labeled.

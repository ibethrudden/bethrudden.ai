# bethrudden.ai

Beth Rudden's personal professional site, hosted with GitHub Pages. The site centers her leadership, teams, business ownership, public work, and commitment to systems that help people.

## Pages

- `index.html`: personal introduction, five approved outcomes, and recent work
- `work.html`: leadership at Bast and IBM, board service, and public leadership; preserves the earlier URL
- `writing.html`: dated publications, books, and writing resources
- `speaking.html`: talks, podcasts, and explicitly labeled upcoming sessions
- `cv.html`: complete web CV with a section index
- `Beth-Rudden-CV.pdf`: downloadable full CV
- `privacy.html`: analytics choices, contact, and accessibility information
- `site.css`: shared responsive layout and navigation
- `analytics-consent.js`: optional analytics, off until consent

The site has no consulting packages, Bast Advisory pitch, or inquiry form. Bast is represented as Beth's company and part of her leadership experience. CV access is prominent in the navigation, homepage, and footer.

## Authoring

Use `python scripts/build_site.py` to rebuild all six HTML pages and the sitemap. Python's standard library is sufficient. Edit source content or this script rather than generated HTML.

- `content/career.json` contains Beth's approved profile, five outcomes, and appointment language.
- `content/cv-sections.json` preserves the complete approved CV sections as HTML fragments, including direct publication links.
- `content/recent-work.json` contains dated appearances, publications, and scheduled sessions verified October 15, 2026. Keep entries synchronized with the full CV sections when making future content edits.

IBM Distinguished Engineer is an appointment; never describe it as former. Keep the two IBM P&Ls distinct. Do not replace the approved leadership framing with a catalogue of metrics.

The website build does not regenerate either PDF. When CV content changes, run `python scripts/build_cv.py` with `reportlab` and `lxml` installed; it reads the generated web CV. Render and inspect every PDF page before publishing. The one-page executive CV is maintained separately and must remain unchanged unless Beth requests an edit.

## Preview and verification

Serve the directory with a static server. Check desktop and narrow mobile layouts, direct CV navigation, section anchors, PDF access, publication links, and consent controls before publishing. No runtime framework or JavaScript is needed for navigation or reading the content. The existing full PDF and one-page executive documents were preserved unchanged in the October 15 site overhaul.

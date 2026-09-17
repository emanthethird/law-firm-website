# Affiliation logos for the homepage proof bar

Drop four files here. SVG preferred, PNG with transparency also works.
The page tries .svg first and falls back to .png automatically.

  lexisnexis.svg   (or .png)
  brandeis.svg     (or .png)
  cwe.svg          (or .png)
  ali.svg          (or .png)

Until a file exists, that slot renders a text lockup instead, so the row
never shows a broken image.

Use the full-color version of each mark, not a white/knockout version.
The bar sits on a light warm-gray background and applies grayscale plus
75% opacity in CSS, so a white logo renders invisible.

# Post-Merge QA: Badges, PNGs, Cloudflare, Social Cards

## Scope

Validate the ERIFY™ badges + domain setup after merge.

## Tasks
	•	GitHub Pages renders SVG + PNG fallbacks
	•	Cloudflare cache rules active (Edge 30d / Browser 7d)
	•	Cache bust works (?v=2)
	•	Crown + status badges crisp @2x
	•	SVGO kept visuals identical (file sizes reduced)
	•	PNG export workflow passed (1x/2x generated)
	•	OG/Twitter previews correct
	•	Cross-browser/device pass
	•	README badges centered & linked

## Notes

If any badge looks soft on Retina:
	•	increase PNG crown export to 640×160 in the workflow and re-run.
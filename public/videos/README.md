# Videos

Same idea as the image slots (see `../images/README.md`): a fixed filename the
code already looks for. Drop a file in, it plays; delete it, and the spot falls
back to its still photo. No code changes either way.

| Slot | Where it shows |
| --- | --- |
| `hero` | Homepage hero background, behind the headline and the featured-machine cards |

`.mp4` is checked first, then `.webm`. H.264 in an MP4 container is the safe
choice — it plays in every current browser.

A few things the hero video should be, since it plays muted, on a loop, under
text:

- **Short and seamless.** It restarts every time it reaches the end, so pick a
  clip whose last frame sits close to its first.
- **Quiet in the top-left and bottom corners.** The headline, the card deck and
  the buttons sit over it. Busy, bright footage there costs legibility — the
  hero puts cream text straight onto the video with no scrim behind it.
- **Small.** It downloads before anything below the fold matters. Keep it
  around a few megabytes; 1080p is plenty, since it is a background.

Any audio track is ignored — the video is muted and has no controls. Stripping
it before uploading saves a little weight.

`hero/background` in the images folder is the still under all of this, and it
is what visitors who ask for reduced motion see: they never download the video
at all.

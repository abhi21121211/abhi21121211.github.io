"""Hero sequence for the light site's black 'Pro' tile: real frames, studio backdrop
crushed to pure black via a very soft matte (no visible cut-out edge)."""
import cv2, numpy as np, mediapipe as mp, os, sys, json
from PIL import Image
from mediapipe.tasks.python import vision, BaseOptions
V, OUT, MODEL = sys.argv[1], sys.argv[2], sys.argv[3]
N, LAST = 81, 200
seg = vision.ImageSegmenter.create_from_options(vision.ImageSegmenterOptions(base_options=BaseOptions(model_asset_path=MODEL), output_confidence_masks=True))
cap = cv2.VideoCapture(V); frames, conf = [], []
for i in range(LAST + 1):
    ok, f = cap.read()
    if not ok: break
    r = seg.segment(mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(cv2.cvtColor(f, cv2.COLOR_BGR2RGB))))
    frames.append(f); conf.append(1 - np.squeeze(r.confidence_masks[0].numpy_view()).astype(np.float32))
H, W = frames[0].shape[:2]
pick = np.round(np.linspace(0, len(frames) - 1, N)).astype(int)
tx = np.array([np.where(conf[i][int(H*.38):int(H*.62)] > .5)[1].mean() for i in pick])
tx = np.convolve(np.pad(tx, 3, mode='edge'), np.ones(7) / 7, mode='valid')
specs = {'d': (int(W * .9), int(H * .9), 1440, 810, 0.05), 'm': (1368, 2052, 720, 1080, 0.03)}  # crop w,h -> out w,h, top offset
for k in specs: os.makedirs(os.path.join(OUT, k), exist_ok=True)
for n, i in enumerate(pick):
    lo, hi = max(0, i - 2), min(len(conf), i + 3)
    a = np.clip((np.mean(conf[lo:hi], axis=0) - 0.15) / 0.5, 0, 1)
    a = cv2.GaussianBlur(a, (0, 0), 28)                      # very soft: backdrop just falls to black
    img = (frames[i].astype(np.float32) * a[..., None])
    img = np.clip((img - 3) * 1.03, 0, 255).astype(np.uint8)  # true black floor
    for key, (cw, ch, ow, oh, top) in specs.items():
        x0 = int(max(0, min(W - cw, tx[n] - cw / 2))); y0 = int(H * top) if ch < H else 0
        ch2 = min(ch, H - y0)
        crop = img[y0:y0 + ch2, x0:x0 + cw]
        out = cv2.resize(crop, (ow, oh), interpolation=cv2.INTER_AREA)
        Image.fromarray(cv2.cvtColor(out, cv2.COLOR_BGR2RGB)).save(os.path.join(OUT, key, f'{n:03d}.webp'), 'WEBP', quality=72 if key == 'd' else 70, method=6)
json.dump({'count': N, 'front': int(np.argmin(np.abs(pick - 120)))}, open(os.path.join(OUT, 'meta.json'), 'w'))
print('done', N)

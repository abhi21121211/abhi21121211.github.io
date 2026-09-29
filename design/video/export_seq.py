import cv2, numpy as np, mediapipe as mp, json, os, sys
from PIL import Image
from mediapipe.tasks.python import vision, BaseOptions
V, OUT = sys.argv[1], sys.argv[2]
FIRST, LAST, N = 0, 200, 81
seg = vision.ImageSegmenter.create_from_options(vision.ImageSegmenterOptions(
    base_options=BaseOptions(model_asset_path=os.environ.get('SEG_MODEL', 'seg.tflite')), output_confidence_masks=True))

cap = cv2.VideoCapture(V)
frames, conf = [], []
for i in range(LAST + 1):
    ok, f = cap.read()
    if not ok: break
    if i < FIRST: continue
    r = seg.segment(mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(cv2.cvtColor(f, cv2.COLOR_BGR2RGB))))
    frames.append(f)
    conf.append(1 - np.squeeze(r.confidence_masks[0].numpy_view()).astype(np.float32))
print('segmented', len(frames))

H, W = frames[0].shape[:2]
cw = int(H * 0.8); cx = int(W * 0.52)          # 4:5 crop, full height
pick = np.round(np.linspace(0, len(frames) - 1, N)).astype(int)
# Stabilise: keep the torso (shoulders→belt band) centred so only the head turn moves.
def torso_x(c):
    band = c[int(H * 0.38):int(H * 0.62)] > 0.5
    xs = np.where(band)[1]
    return xs.mean()
tx = np.array([torso_x(conf[i]) for i in pick])
tx = np.convolve(np.pad(tx, 3, mode='edge'), np.ones(7) / 7, mode='valid')  # smooth
print('torso drift px', int(tx.min()), int(tx.max()))
x0s = [int(max(0, min(W - cw, t - cw // 2))) for t in tx]
sizes = {'d': (720, 900), 'm': (432, 540)}
for k in sizes: os.makedirs(os.path.join(OUT, k), exist_ok=True)

bottom = np.ones((900, 1), np.float32)
fade0 = int(900 * 0.8)
bottom[fade0:, 0] = np.linspace(1, 0, 900 - fade0) ** 1.6
contours = []
for n, i in enumerate(pick):
    x0 = x0s[n]
    # Temporal smoothing of the matte (neighbours ±2) kills edge flicker.
    lo, hi = max(0, i - 2), min(len(conf), i + 3)
    a = np.mean(conf[lo:hi], axis=0)[:, x0:x0 + cw]
    a = np.clip((a - 0.3) / 0.45, 0, 1)
    a = cv2.erode(a, np.ones((5, 5), np.uint8))
    a = cv2.GaussianBlur(a, (0, 0), 2.2)
    rgb = cv2.cvtColor(frames[i][:, x0:x0 + cw], cv2.COLOR_BGR2RGB)
    for key, (w, h) in sizes.items():
        img = cv2.resize(rgb, (w, h), interpolation=cv2.INTER_AREA)
        al = cv2.resize(a, (w, h), interpolation=cv2.INTER_AREA) * cv2.resize(bottom, (1, h))
        rgba = np.dstack([img, (al * 255).astype(np.uint8)])
        Image.fromarray(rgba, 'RGBA').save(os.path.join(OUT, key, f'{n:03d}.webp'), 'WEBP', quality=74 if key == 'd' else 70, alpha_quality=70, method=6)
        if key == 'd':
            m = (cv2.resize(a, (w, h)) > 0.5).astype(np.uint8)
            cs, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
            c = max(cs, key=cv2.contourArea)[:, 0, :].astype(np.float32)
            top = int(np.argmin(c[:, 1] + np.abs(c[:, 0] - w / 2) * 0.05))  # start at crown of head
            c = np.roll(c, -top, axis=0)
            seglen = np.linalg.norm(np.diff(np.vstack([c, c[:1]]), axis=0), axis=1)
            cum = np.concatenate([[0], np.cumsum(seglen)])
            ts = np.linspace(0, cum[-1], 64, endpoint=False)
            pts = [c[np.searchsorted(cum, t, side='right') - 1] for t in ts]
            contours.append([[round(float(p[0]) / w, 4), round(float(p[1]) / h, 4)] for p in pts])
    if n % 10 == 0: print('frame', n, '<- video', i)

json.dump({'count': N, 'front': int(np.argmin(np.abs(pick - 120))), 'contours': contours}, open(os.path.join(OUT, 'meta.json'), 'w'), separators=(',', ':'))
print('front index', int(np.argmin(np.abs(pick - 120))))

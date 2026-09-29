"""
Orbit-of-skills centre video: person on pure black, portrait 3:4, looping.

  SEG_MODEL=seg.tflite FFMPEG=/path/to/ffmpeg [WIDE=1] python export_orbit_video.py <input video> <out dir>

WIDE=1 keeps the full 16:9 frame (for gestures that reach the edges).

Writes <out>/orbit.mp4 (H.264) and <out>/orbit.webm (VP9). The backdrop is
faded to true black with a very soft person matte (MediaPipe multiclass
selfie segmenter), so there is no visible cut-out edge on the black section.
"""
import cv2, numpy as np, mediapipe as mp, os, sys, subprocess
from mediapipe.tasks.python import vision, BaseOptions

src, out = sys.argv[1], sys.argv[2]
ff = os.environ.get('FFMPEG', 'ffmpeg')
seg = vision.ImageSegmenter.create_from_options(vision.ImageSegmenterOptions(
    base_options=BaseOptions(model_asset_path=os.environ.get('SEG_MODEL', 'seg.tflite')), output_confidence_masks=True))

cap = cv2.VideoCapture(src)
fps = cap.get(cv2.CAP_PROP_FPS) or 30
frames, conf = [], []
while True:
    ok, f = cap.read()
    if not ok: break
    small = cv2.resize(f, (f.shape[1] // 2, f.shape[0] // 2))  # half-res matte is plenty (it's blurred anyway)
    r = seg.segment(mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(cv2.cvtColor(small, cv2.COLOR_BGR2RGB))))
    frames.append(f); conf.append(1 - np.squeeze(r.confidence_masks[0].numpy_view()).astype(np.float32))
H, W = frames[0].shape[:2]
print('frames', len(frames), 'fps', fps)

# Portrait crop centred on a smoothed torso position.
tx = np.array([np.where(c[int(c.shape[0] * .38):int(c.shape[0] * .62)] > .5)[1].mean() * 2 if (c > .5).any() else W / 2 for c in conf])
tx = np.convolve(np.pad(tx, 7, mode='edge'), np.ones(15) / 15, mode='valid')
WIDE = os.environ.get('WIDE') == '1'
ch = H
cw = W if WIDE else int(ch * 3 / 4)
OW, OH = (1280, 720) if WIDE else (720, 960)

def encode(args, name):
    p = subprocess.Popen([ff, '-hide_banner', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{OW}x{OH}', '-r', str(fps), '-i', '-', '-an', *args, os.path.join(out, name)], stdin=subprocess.PIPE)
    return p

os.makedirs(out, exist_ok=True)
enc = [encode(['-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'], 'orbit.mp4'),
       encode(['-c:v', 'libvpx-vp9', '-crf', '36', '-b:v', '0', '-row-mt', '1', '-deadline', 'good'], 'orbit.webm')]
for i, f in enumerate(frames):
    lo, hi = max(0, i - 2), min(len(conf), i + 3)
    a = np.clip((np.mean(conf[lo:hi], axis=0) - 0.15) / 0.5, 0, 1)
    a = cv2.resize(cv2.GaussianBlur(a, (0, 0), 14), (W, H))
    img = np.clip((f.astype(np.float32) * a[..., None] - 3) * 1.03, 0, 255).astype(np.uint8)
    x0 = int(max(0, min(W - cw, tx[i] - cw / 2)))
    crop = cv2.resize(img[:, x0:x0 + cw], (OW, OH), interpolation=cv2.INTER_AREA)
    for p in enc: p.stdin.write(crop.tobytes())
for p in enc: p.stdin.close(); p.wait()
print('done')

# save.me

**save.me** — is a service that allows you to analyze a link from YouTube, TikTok, etc. The analysis will show in which formats you can download media content. The service is designed for local implementation.

<img width="1280" height="723" alt="save me-frontend-view" src="https://github.com/user-attachments/assets/f1d764d3-66ed-4a06-bf01-11f5d1f2ea8f" />

<!-- OLDER SCREENSHOTS -->
<!-- <img width="1280" height="723" alt="save me-frontend-view" src="https://github.com/user-attachments/assets/03a2a05c-3b90-4684-aa7d-5b4cbffd5d67" /> -->

---

## Basic features

- **Download video**: video content from YouTube, TikTok, etc is supported
- **Download audio**: downloading audio instead of video as a separate format in the list (In Dev)
- **Export audio from video**: tool to export audio tracks from video (In Dev)

---

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Vludd/save-me.git
cd save-me
```

2. Set dependencies for backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate    # Linux / Mac
venv\Scripts\activate       # Windows
pip install -r requirements.txt
```

3. Set dependencies for frontend:
```bash
cd ../frontend
npm install                 # or pnpm install
```

---

## RUN:

1. Backend:
```bash
cd backend
python run.py               # Start on 8000 port by default
```

2. Frontend:
```bash
cd frontend
npm run dev                 # Start on 5173 port by default
```

---

## Project Outline
```bash
.
├── backend/                # API Core with yt-dlp
├── frontend/               # Web-interface
├── LICENSE
├── README.md
```

---

## License
The project is distributed under the mit License. For more information, see the LICENSE file.

---

## Planned features:
```bash
- Download audio instead of video
- Export audio from video
```

# Guardian X (Arya) — AI-Powered Personal Safety Platform

## 1. Product Overview
Guardian X is a mobile-first personal safety platform designed to shift emergency response from **reactive** (manual SOS trigger) to **proactive** (autonomous danger detection and rapid escalation).

### Core Pillars:
1. **Autonomous Incident Assistant**: Detects danger, streams real-time GPS telemetry, and buffers/streams ambient audio to the cloud with zero-touch or minimal interaction.
2. **AI Distress Detection**: Real-time speech-to-text (STT) combined with acoustic distress/tone analysis (pitch, energy, vocal strain) to calculate a live composite Risk Score (0–100).
3. **Responder & Dispatch Dashboard**: Instantly aggregates telemetry, live transcripts, audio streams, route anomaly logs, and emergency contact details into an auto-generated **Incident Dossier** for emergency response teams and law enforcement.

---

## 2. System Architecture

```
┌──────────────────────────────────────┐
│       Mobile App (Client)            │
│  - On-device VAD (Voice Activity)    │
│  - Adaptive GPS logging (1-15s)      │
│  - Safe Ride & Route Deviation engine│
│  - Panic gestures & voice triggers   │
└──────────────────┬───────────────────┘
                   │
                   │ Secure WebSocket / REST
                   ▼
┌──────────────────────────────────────┐
│       Guardian X Backend Engine      │
│  - Session & Auth Manager            │
│  - Real-Time Telemetry & Audio Ingest│
│  - AI Risk Engine (STT + Tone / SER) │
│  - Alert & Notification Dispatcher   │
│  - PostGIS / Relational Store        │
└──────────────────┬───────────────────┘
                   │
                   │ WebSockets / Live Feed
                   ▼
┌──────────────────────────────────────┐
│     Responder / Police Dashboard     │
│  - Real-time active incident radar   │
│  - Live GPS trail & map tracking     │
│  - Auto-generated Case Dossier       │
│  - Audio playback & live transcript  │
│  - Case status & dispatch assignment │
└──────────────────────────────────────┘
```

---

## 3. Core Feature Specifications

### 3.1 Autonomous Incident Assistant (Background Service)
- **State Machine**:
  - `IDLE`: Low-power VAD listening, low-frequency GPS pings (30–60s).
  - `SUSPICION`: Local audio buffer initiated, GPS ping frequency tightened (5–10s).
  - `ACTIVE_INCIDENT`: Live WebSocket open, audio & GPS streamed continuously (1–2s pings).
- **Trigger Sources**:
  - Manual panic / discreet button
  - Wake-word / distress keyword spotting ("Arya help", "let go", "stop")
  - Accelerometer / shake / power-button sequences
  - Safe Ride anomaly / route deviation timeout
  - AI risk engine threshold crossing

### 3.2 AI Distress Monitoring Engine
- **Voice Activity Detection (VAD)**: On-device filtering to preserve battery and maintain privacy by only processing speech frames.
- **Speech-to-Text (STT)**: Streaming transcription (Deepgram / Whisper / AssemblyAI).
- **Speech Emotion & Tone Recognition (SER)**: Acoustic classifier analyzing pitch variation, vocal tension, jitter/shimmer, energy burst, and fear/distress indicators.
- **Dynamic Risk Score (0–100)**:
  - Keyword distress score (35%)
  - Acoustic distress score (35%)
  - Environmental / contextual flags (time of night, route deviation, sudden stop) (30%)
  - Score $\ge 70$: silent check-in prompt.
  - Score $\ge 85$ or timeout: immediate escalation to full incident.

### 3.3 Safe Ride & Route Anomaly Tracking
- Dynamic path corridor tracking against map routing APIs.
- Real-time detection of:
  - Route deviation corridor breach (> $X$ meters off path)
  - Unscheduled prolonged stops in high-risk zones
  - Sudden highway stops or abnormal velocity drops
  - ETA overruns without user confirmation

### 3.4 Responder / Police Dashboard
- Live WebSocket feed of active incidents.
- Auto-compiled incident dossiers:
  - Live breadcrumb map with speed/direction vector
  - Streaming transcript with highlighted distress keywords
  - Real-time acoustic risk meter
  - Direct playback of buffered audio clips
  - Victim emergency profile (medical info, trusted contacts, live sharing link)
  - One-click dispatch, unit assignment, and status auditing

---

## 4. Technology Stack Strategy

| Subsystem | Recommended Stack | Rationale |
| :--- | :--- | :--- |
| **Backend & Ingestion** | Python FastAPI / Node.js + WebSockets | Low-latency streaming, native integration with AI/ML pipelines |
| **AI Inference** | Python (PyTorch / ONNX / Whisper / Wav2Vec2) or Deepgram API | Fast audio processing, streaming STT + acoustic distress classification |
| **Database** | PostgreSQL + PostGIS, Redis | Fast geospatial calculations, incident caching, and real-time state |
| **Responder Dashboard** | React / Next.js / Vite + TailwindCSS / Leaflet / Mapbox | Modern, ultra-responsive operational command center |
| **Mobile App** | React Native / Flutter (or Native Kotlin/Swift) | Cross-platform rapid iteration with background location & audio services |

---

## 5. Security, Privacy & Chain of Custody
- End-to-end encryption for audio and location in transit (TLS 1.3 / WSS).
- Zero-cloud storage during `IDLE` state: Audio is only buffered in ephemeral memory on-device until a trigger condition is confirmed.
- Immutable audit trail for incident logs and audio evidence for law enforcement compliance.

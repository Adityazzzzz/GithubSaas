# Advanced Concepts: GitBrain

This document details the advanced engineering principles and algorithms driving GitBrain, specifically RAG Search, Canvas Compositing for Video Recording, and the Automations Rules Engine.

---

## 1. Codebase RAG Search (pgvector & Cosine Similarity)

GitBrain implements Retrieval-Augmented Generation (RAG) to answer natural language questions about a codebase.

### Cosine Similarity Query
When a search query is submitted, it is vectorized using the Google Gemini Embedding Model into a 768-dimension floating-point array. We execute similarity calculations inside PostgreSQL using the `pgvector` extension:

```sql
SELECT "id", "fileName", "summary", "sourceCode",
       1 - ("summaryEmbedding" <=> :queryVector::vector) AS similarity
FROM "SourceCodeEmbedding"
WHERE 1 - ("summaryEmbedding" <=> :queryVector::vector) > 0.35
  AND "projectId" = :projectId
ORDER BY similarity DESC
LIMIT 5;
```

* **The `<=>` Operator**: Computes the **cosine distance** between the search vector and the database summary vector.
* **Cosine Similarity**: Obtained by subtracting the cosine distance from 1:
  $$\text{Similarity} = 1 - \text{Distance}$$
* **Thresholding**: We filter out files with a similarity score $\le 0.35$ to ignore irrelevant background files and reduce context noise.

---

## 2. Canvas composite Loom Video Recording

In PM Studio's Calendar view, users can record asynchronous video status updates. To record both the user's screen share and camera feed (overlay bubble) simultaneously in a single WebM stream without expensive server-side rendering, GitBrain uses a client-side **HTML5 Canvas Composite Loop**.

```
+------------------------------------------------------+
|                                                      |
|                   [Screen Stream]                    |
|                (Main Background Feed)                |
|                                                      |
|                                                      |
|                                                      |
|   +------------------+                               |
|   |  (Camera Bubble) |                               |
|   |   Rounded Mask   |                               |
|   +------------------+                               |
+------------------------------------------------------+
```

### Rendering Pipeline (simplified)
```typescript
const canvas = document.createElement('canvas')
canvas.width = 1280
canvas.height = 720
const ctx = canvas.getContext('2d')

// Main background video node (Screen feed)
const screenVideo = document.createElement('video')
screenVideo.srcObject = screenStream
screenVideo.play()

// Bubble overlay video node (Camera feed)
const camVideo = document.createElement('video')
camVideo.srcObject = camStream
camVideo.play()

const draw = () => {
  if (!recording) return
  if (ctx) {
    // 1. Draw screen feed as background
    ctx.drawImage(screenVideo, 0, 0, 1280, 720)
    
    // 2. Render rounded circular mask for camera feed
    ctx.save()
    ctx.beginPath()
    ctx.arc(140, 580, 90, 0, Math.PI * 2) // Bottom-left corner bubble
    ctx.clip()
    ctx.drawImage(camVideo, 50, 490, 180, 180)
    ctx.restore()
    
    // 3. Draw outline border around the camera circle
    ctx.strokeStyle = '#2563eb'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(140, 580, 90, 0, Math.PI * 2)
    ctx.stroke()
  }
  requestAnimationFrame(draw)
}
```

* **Capturing Stream**: The canvas stream is captured via `canvas.captureStream(30)` at 30 FPS.
* **Audio Merging**: The video track of the canvas stream is combined with the audio track from the user's microphone (`camStream.getAudioTracks()`) into a single `MediaStream` which is passed to the browser's `MediaRecorder`.
* **Persistent Upload**: Once recording completes, the WebM binary blob is uploaded to Appwrite Cloud Storage, generating a persistent playback URL.

---

## 3. Automations Rules Engine

GitBrain features a light reactive rules engine in PM Studio. It allows team leads to automate workflows by binding specific **Triggers** to **Actions**.

### Design Pattern
The rules engine follows a decoupled Trigger-Action pattern. 

* **Rule Schema**:
```json
{
  "id": "cuid",
  "projectId": "cuid",
  "trigger": "TASK_COMPLETED | SPRINT_STARTED | MEMBER_ADDED",
  "action": "ASSIGN_TO_QA | SEND_SLACK_WEBHOOK | MARK_ARCHIVED",
  "isActive": true
}
```

### Execution Pipeline
Whenever a mutation occurs (e.g. `updateTaskStatus` changes status to `DONE`):
1. The server loads active rules matching `trigger: TASK_COMPLETED` for the project.
2. For each matching rule, it runs the designated action:
   - **`ASSIGN_TO_QA`**: Re-queries sub-team members, identifies QA leads, and updates the task `assigneeId` field.
   - **`SEND_SLACK_WEBHOOK`**: Pulls webhook credentials and dispatches a JSON payload containing the task description.
3. Next.js cache is invalidated to push the updated status back to the client interface.

from flask import Flask, request, jsonify, send_file
import subprocess
import os
import time

app = Flask(__name__)
DOWNLOADS_DIR = "/tmp/downloads"
os.makedirs(DOWNLOADS_DIR, exist_ok=True)

@app.route("/process", methods=["POST"])
def process_video():
    data = request.json or {}
    video_id = data.get("videoId")
    title = data.get("title", f"video_{video_id}")
    format_id = data.get("formatId", "video-720p")

    if not video_id:
        return jsonify({"error": "videoId is required"}), 400

    filename = f"{title}_{int(time.time())}.mp4"
    output_path = os.path.join(DOWNLOADS_DIR, filename)

    # Universal H.264 + AAC for Windows Media Player
    cmd = [
        "yt-dlp",
        "--no-check-certificates",
        "-f", "bestvideo[vcodec^=avc1]+bestaudio[acodec^=mp4a]/best[ext=mp4]/best",
        "--recode-video", "mp4",
        "--postprocessor-args", "VideoConvertor:-c:v libx264 -c:a aac",
        "-o", output_path,
        f"https://www.youtube.com/watch?v={video_id}"
    ]

    try:
        subprocess.run(cmd, check=True, timeout=300)
        file_size = os.path.getsize(output_path)
        base_url = request.host_url.rstrip("/")
        return jsonify({
            "success": True,
            "downloadUrl": f"{base_url}/download/{filename}",
            "fileName": filename,
            "fileSizeBytes": file_size
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/download/<filename>", methods=["GET"])
def download_file(filename):
    file_path = os.path.join(DOWNLOADS_DIR, filename)
    if os.path.exists(file_path):
        return send_file(file_path, as_attachment=True, download_name=filename)
    return jsonify({"error": "File not found"}), 404

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))

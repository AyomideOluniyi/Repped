import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "REPPED: Your Fitness Companion";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#0A0A0A",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid pattern overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(57,255,20,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,20,0.04) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Green radial glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "800px",
            height: "400px",
            background: "radial-gradient(ellipse at center, rgba(57,255,20,0.12) 0%, transparent 70%)",
          }}
        />

        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: "linear-gradient(90deg, transparent, #39FF14, transparent)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
            zIndex: 1,
            padding: "0 80px",
            textAlign: "center",
          }}
        >
          {/* Logo badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: "rgba(57,255,20,0.1)",
              border: "1px solid rgba(57,255,20,0.3)",
              borderRadius: "100px",
              padding: "8px 20px",
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#39FF14",
              }}
            />
            <span style={{ color: "#39FF14", fontSize: "16px", fontWeight: 600, letterSpacing: "0.1em" }}>
              REPPED
            </span>
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: "80px",
              fontWeight: 900,
              color: "#FFFFFF",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            Train.{" "}
            <span style={{ color: "#39FF14" }}>Track.</span>
            {" "}Level Up.
          </div>

          {/* Subheadline */}
          <div
            style={{
              fontSize: "24px",
              color: "#888888",
              fontWeight: 400,
              maxWidth: "700px",
              lineHeight: 1.5,
            }}
          >
            AI-powered workout tracking, meal analysis, and gym buddy finder. Your complete fitness companion.
          </div>

          {/* Feature pills */}
          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            {["Workout Tracker", "AI Nutrition", "Gym Buddies", "Progress Photos", "Reels"].map((f) => (
              <div
                key={f}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  color: "#CCCCCC",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom right watermark */}
        <div
          style={{
            position: "absolute",
            bottom: "28px",
            right: "48px",
            color: "#333333",
            fontSize: "14px",
          }}
        >
          repped.app
        </div>
      </div>
    ),
    size
  );
}

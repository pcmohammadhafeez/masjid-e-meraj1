import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
const QIBLA_BEARING = 282;
function QiblaPage() {
  const [heading, setHeading] = useState<number | null>(null);
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState(
    "Tap Start Compass — no location permission required.",
  );
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      const e = event as DeviceOrientationEvent & {
        webkitCompassHeading?: number;
      };
      let compassHeading: number | null = null;
      if (typeof e.webkitCompassHeading === "number") {
        compassHeading = e.webkitCompassHeading;
      } else if (typeof event.alpha === "number") {
        compassHeading = (360 - event.alpha + 360) % 360;
      }
      if (compassHeading !== null) {
        setHeading(compassHeading);
        setActive(true);
        setStatus("Compass active — rotate your phone until the arrow points forward.");
      }
    };
    window.addEventListener(
      "deviceorientationabsolute",
      handleOrientation,
      true,
    );
    window.addEventListener(
      "deviceorientation",
      handleOrientation,
      true,
    );
    return () => {
      window.removeEventListener(
        "deviceorientationabsolute",
        handleOrientation,
        true,
      );
      window.removeEventListener(
        "deviceorientation",
        handleOrientation,
        true,
      );
    };
  }, []);
  const rotation =
    heading === null
      ? 0
      : (QIBLA_BEARING - heading + 360) % 360;
  function startCompass() {
    setStatus("Starting compass...");
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof (
        DeviceOrientationEvent as typeof DeviceOrientationEvent & {
          requestPermission?: () => Promise<string>;
        }
      ).requestPermission === "function"
    ) {
      (
        DeviceOrientationEvent as typeof DeviceOrientationEvent & {
          requestPermission: () => Promise<string>;
        }
      )
        .requestPermission()
        .then((permission) => {
          if (permission === "granted") {
            setActive(true);
            setStatus("Compass active.");
          } else {
            setStatus("Compass permission was denied.");
          }
        })
        .catch(() => {
          setStatus("Unable to start compass.");
        });
    } else {
      setActive(true);
      setStatus(
        "Compass active — move your phone slowly until the direction updates.",
      );
    }
  }
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "24px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(160deg,#071a12,#0d2d20)",
        color: "white",
        fontFamily: "Arial,sans-serif",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "460px",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "30px", marginBottom: "6px" }}>
          Qibla Finder
        </h1>
        <p style={{ opacity: 0.7 }}>
          Masjid-e-Meraj
        </p>
        <p
          style={{
            fontSize: "13px",
            opacity: 0.6,
            marginBottom: "24px",
          }}
        >
          Works without GPS or location permission
        </p>
        <div
          style={{
            width: "min(82vw,330px)",
            height: "min(82vw,330px)",
            margin: "0 auto 24px",
            borderRadius: "50%",
            border: "3px solid rgba(255,255,255,.25)",
            background:
              "radial-gradient(circle,#163f2d,#092218)",
            position: "relative",
            boxShadow:
              "0 15px 50px rgba(0,0,0,.4)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "12px",
              border:
                "1px solid rgba(255,255,255,.15)",
              borderRadius: "50%",
            }}
          />
          <strong
            style={{
              position: "absolute",
              top: "16px",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "20px",
            }}
          >
            N
          </strong>
          <span
            style={{
              position: "absolute",
              bottom: "16px",
              left: "50%",
              transform: "translateX(-50%)",
              opacity: 0.55,
            }}
          >
            S
          </span>
          <span
            style={{
              position: "absolute",
              right: "18px",
              top: "50%",
              transform: "translateY(-50%)",
              opacity: 0.55,
            }}
          >
            E
          </span>
          <span
            style={{
              position: "absolute",
              left: "18px",
              top: "50%",
              transform: "translateY(-50%)",
              opacity: 0.55,
            }}
          >
            W
          </span>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: "8px",
              height: "125px",
              transformOrigin: "50% 100%",
              transform:
                `translate(-50%,-100%) rotate(${rotation}deg)`,
              transition: "transform 0.15s linear",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                borderLeft:
                  "18px solid transparent",
                borderRight:
                  "18px solid transparent",
                borderBottom:
                  "38px solid #d6b85a",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: "8px",
                height: "105px",
                background: "#d6b85a",
                borderRadius: "8px",
              }}
            />
          </div>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%)",
              width: "58px",
              height: "58px",
              borderRadius: "50%",
              background: "#111",
              border: "3px solid #d6b85a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "27px",
            }}
          >
            🕋
          </div>
        </div>
        <div
          style={{
            padding: "20px",
            borderRadius: "18px",
            background:
              "rgba(255,255,255,.08)",
            border:
              "1px solid rgba(255,255,255,.12)",
          }}
        >
          <div
            style={{
              fontSize: "32px",
              fontWeight: 700,
            }}
          >
            {QIBLA_BEARING}°
          </div>
          <div>
            Qibla bearing from Siddipet
          </div>
          <div
            style={{
              marginTop: "8px",
              opacity: 0.65,
              fontSize: "13px",
            }}
          >
            {heading === null
              ? "Compass not detected yet"
              : `Phone heading: ${Math.round(heading)}°`}
          </div>
        </div>
        <button
          type="button"
          onClick={startCompass}
          style={{
            marginTop: "18px",
            border: 0,
            borderRadius: "12px",
            padding: "15px 24px",
            fontSize: "16px",
            fontWeight: 700,
            cursor: "pointer",
            background: "#d6b85a",
            color: "#111",
          }}
        >
          {active
            ? "Compass Running"
            : "Start Compass"}
        </button>
        <p
          style={{
            marginTop: "16px",
            opacity: 0.8,
            fontSize: "14px",
            lineHeight: 1.5,
          }}
        >
          {status}
        </p>
        <p
          style={{
            marginTop: "22px",
            fontSize: "12px",
            opacity: 0.45,
            lineHeight: 1.5,
          }}
        >
          Keep your phone flat and away from magnets,
          speakers and metal objects.
        </p>
      </section>
    </main>
  );
}
export const Route = createFileRoute("/qibla")({
  component: QiblaPage,
});

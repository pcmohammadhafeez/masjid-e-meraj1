import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
const KAABA_LAT = 21.422487;
const KAABA_LON = 39.826206;
function degToRad(value: number) {
  return (value * Math.PI) / 180;
}
function calculateQibla(lat: number, lon: number) {
  const phi1 = degToRad(lat);
  const phi2 = degToRad(KAABA_LAT);
  const deltaLambda = degToRad(KAABA_LON - lon);
  const y = Math.sin(deltaLambda);
  const x =
    Math.cos(phi1) * Math.tan(phi2) -
    Math.sin(phi1) * Math.cos(deltaLambda);
  return (
    ((Math.atan2(y, x) * 180) / Math.PI + 360) %
    360
  );
}
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371;
  const phi1 = degToRad(lat1);
  const phi2 = degToRad(lat2);
  const deltaPhi = degToRad(lat2 - lat1);
  const deltaLambda = degToRad(lon2 - lon1);
  const a =
    Math.sin(deltaPhi / 2) ** 2 +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) ** 2;
  return (
    R *
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a),
    )
  );
}
function QiblaPage() {
  const [bearing, setBearing] = useState<number | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [status, setStatus] = useState(
    "Tap Enable Qibla Compass.",
  );
  useEffect(() => {
    const handleOrientation = (
      event: DeviceOrientationEvent,
    ) => {
      const safariHeading = (
        event as DeviceOrientationEvent & {
          webkitCompassHeading?: number;
        }
      ).webkitCompassHeading;
      if (
        typeof safariHeading === "number"
      ) {
        setHeading(safariHeading);
        return;
      }
      if (
        typeof event.alpha === "number"
      ) {
        setHeading(
          (360 - event.alpha + 360) % 360,
        );
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
  async function enableCompass() {
    try {
      if (
        typeof DeviceOrientationEvent !==
          "undefined" &&
        typeof (
          DeviceOrientationEvent as typeof DeviceOrientationEvent & {
            requestPermission?: () => Promise<string>;
          }
        ).requestPermission ===
          "function"
      ) {
        const permission =
          await (
            DeviceOrientationEvent as typeof DeviceOrientationEvent & {
              requestPermission: () => Promise<string>;
            }
          ).requestPermission();
        if (permission !== "granted") {
          throw new Error(
            "Motion permission was denied.",
          );
        }
      }
      if (!navigator.geolocation) {
        throw new Error(
          "Location is not supported by this device.",
        );
      }
      setStatus("Getting your location...");
      const position =
        await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              resolve,
              reject,
              {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 60000,
              },
            );
          },
        );
      const lat =
        position.coords.latitude;
      const lon =
        position.coords.longitude;
      const qibla =
        calculateQibla(lat, lon);
      setBearing(qibla);
      setDistance(
        calculateDistance(
          lat,
          lon,
          KAABA_LAT,
          KAABA_LON,
        ),
      );
      setStatus(
        "Compass active. Hold your phone flat and rotate until the arrow points to Qibla.",
      );
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Unable to start Qibla compass.",
      );
    }
  }
  const rotation =
    bearing !== null &&
    heading !== null
      ? (bearing - heading + 360) % 360
      : 0;
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
        color: "#fff",
        fontFamily:
          "Arial,sans-serif",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "460px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "30px",
            marginBottom: "8px",
          }}
        >
          Qibla Finder
        </h1>
        <p style={{ opacity: 0.75 }}>
          Masjid-e-Meraj
        </p>
        <div
          style={{
            width: "min(82vw,330px)",
            height: "min(82vw,330px)",
            margin: "28px auto",
            borderRadius: "50%",
            border:
              "3px solid rgba(255,255,255,.3)",
            background:
              "radial-gradient(circle,#163f2d,#092218)",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "12px",
              border:
                "1px solid rgba(255,255,255,.2)",
              borderRadius: "50%",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "18px",
              left: "50%",
              transform:
                "translateX(-50%)",
              fontWeight: 700,
            }}
          >
            N
          </div>
          <div
            style={{
              position: "absolute",
              bottom: "18px",
              left: "50%",
              transform:
                "translateX(-50%)",
              opacity: 0.6,
            }}
          >
            S
          </div>
          <div
            style={{
              position: "absolute",
              right: "20px",
              top: "50%",
              transform:
                "translateY(-50%)",
              opacity: 0.6,
            }}
          >
            E
          </div>
          <div
            style={{
              position: "absolute",
              left: "20px",
              top: "50%",
              transform:
                "translateY(-50%)",
              opacity: 0.6,
            }}
          >
            W
          </div>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: "8px",
              height: "125px",
              transformOrigin:
                "50% 100%",
              transform:
                `translate(-50%,-100%) rotate(${rotation}deg)`,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform:
                  "translateX(-50%)",
                borderLeft:
                  "18px solid transparent",
                borderRight:
                  "18px solid transparent",
                borderBottom:
                  "38px solid white",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: "50%",
                transform:
                  "translateX(-50%)",
                width: "8px",
                height: "105px",
                background: "white",
                borderRadius: "8px",
              }}
            />
          </div>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform:
                "translate(-50%,-50%)",
              width: "58px",
              height: "58px",
              borderRadius: "50%",
              background: "#111",
              border:
                "3px solid #d6b85a",
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
            {bearing === null
              ? "--°"
              : `${Math.round(bearing)}°`}
          </div>
          <div>
            Qibla direction from your location
          </div>
          <div
            style={{
              opacity: 0.7,
              marginTop: "6px",
            }}
          >
            {distance === null
              ? "Location not detected"
              : `${Math.round(distance)} km from the Kaaba`}
          </div>
        </div>
        <button
          type="button"
          onClick={enableCompass}
          style={{
            marginTop: "18px",
            border: 0,
            borderRadius: "12px",
            padding:
              "14px 22px",
            fontSize: "16px",
            fontWeight: 700,
            cursor: "pointer",
            background: "#d6b85a",
            color: "#111",
          }}
        >
          Enable Qibla Compass
        </button>
        <p
          style={{
            marginTop: "16px",
            opacity: 0.8,
            fontSize: "14px",
          }}
        >
          {status}
        </p>
      </section>
    </main>
  );
}
export const Route =
  createFileRoute("/qibla")({
    component: QiblaPage,
  });

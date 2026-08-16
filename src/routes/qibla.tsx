import { useEffect, useState } from "react";
const KAABA_LAT = 21.422487;
const KAABA_LON = 39.826206;
function degToRad(d: number) {
  return (d * Math.PI) / 180;
}
function calculateQibla(lat: number, lon: number) {
  const phi1 = degToRad(lat);
  const phi2 = degToRad(KAABA_LAT);
  const dlambda = degToRad(KAABA_LON - lon);
  const y = Math.sin(dlambda);
  const x =
    Math.cos(phi1) * Math.tan(phi2) -
    Math.sin(phi1) * Math.cos(dlambda);
  return (Math.atan2(y, x) * 180) / Math.PI + 360 % 360;
}
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371;
  const p1 = degToRad(lat1);
  const p2 = degToRad(lat2);
  const dp = degToRad(lat2 - lat1);
  const dl = degToRad(lon2 - lon1);
  const a =
    Math.sin(dp / 2) ** 2 +
    Math.cos(p1) *
      Math.cos(p2) *
      Math.sin(dl / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
export default function Qibla() {
  const [bearing, setBearing] = useState<number | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [status, setStatus] = useState("Tap Enable Qibla Compass.");
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      const safariHeading =
        (event as DeviceOrientationEvent & {
          webkitCompassHeading?: number;
        }).webkitCompassHeading;
      if (typeof safariHeading === "number") {
        setHeading(safariHeading);
      } else if (typeof event.alpha === "number") {
        setHeading((360 - event.alpha + 360) % 360);
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
  const enableCompass = async () => {
    try {
      if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof (
          DeviceOrientationEvent as typeof DeviceOrientationEvent & {
            requestPermission?: () => Promise<string>;
          }
        ).requestPermission === "function"
      ) {
        const permission =
          await (
            DeviceOrientationEvent as typeof DeviceOrientationEvent & {
              requestPermission: () => Promise<string>;
            }
          ).requestPermission();
        if (permission !== "granted") {
          throw new Error("Motion permission was denied.");
        }
      }
      setStatus("Getting your location...");
      const position = await new Promise<GeolocationPosition>(
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
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const qibla = ((calculateQibla(lat, lon) % 360) + 360) % 360;
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
        "Compass active. Hold your phone flat and rotate until the arrow points forward.",
      );
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Unable to start Qibla compass.",
      );
    }
  };
  const relativeRotation =
    bearing !== null && heading !== null
      ? (bearing - heading + 360) % 360
      : 0;
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 24,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(160deg,#071a12,#0d2d20)",
        color: "#fff",
        fontFamily: "Arial,sans-serif",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 460,
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: 30, marginBottom: 8 }}>
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
            border: "3px solid rgba(255,255,255,.3)",
            background:
              "radial-gradient(circle,#163f2d,#092218)",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 12,
              border: "1px solid rgba(255,255,255,.2)",
              borderRadius: "50%",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 18,
              left: "50%",
              transform: "translateX(-50%)",
              fontWeight: 700,
            }}
          >
            N
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 18,
              left: "50%",
              transform: "translateX(-50%)",
              opacity: 0.6,
            }}
          >
            S
          </div>
          <div
            style={{
              position: "absolute",
              right: 20,
              top: "50%",
              transform: "translateY(-50%)",
              opacity: 0.6,
            }}
          >
            E
          </div>
          <div
            style={{
              position: "absolute",
              left: 20,
              top: "50%",
              transform: "translateY(-50%)",
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
              width: 8,
              height: 125,
              transformOrigin: "50% 100%",
              transform:
                `translate(-50%,-100%) rotate(${relativeRotation}deg)`,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                borderLeft: "18px solid transparent",
                borderRight: "18px solid transparent",
                borderBottom: "38px solid white",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: 8,
                height: 105,
                background: "white",
                borderRadius: 8,
              }}
            />
          </div>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%)",
              width: 58,
              height: 58,
              borderRadius: "50%",
              background: "#111",
              border: "3px solid #d6b85a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 27,
            }}
          >
            🕋
          </div>
        </div>
        <div
          style={{
            padding: 20,
            borderRadius: 18,
            background: "rgba(255,255,255,.08)",
            border: "1px solid rgba(255,255,255,.12)",
          }}
        >
          <div style={{ fontSize: 32, fontWeight: 700 }}>
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
              marginTop: 6,
            }}
          >
            {distance === null
              ? "Location not detected"
              : `${Math.round(distance)} km from the Kaaba`}
          </div>
        </div>
        <button
          onClick={enableCompass}
          style={{
            marginTop: 18,
            border: 0,
            borderRadius: 12,
            padding: "14px 22px",
            fontSize: 16,
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
            marginTop: 16,
            opacity: 0.8,
            fontSize: 14,
          }}
        >
          {status}
        </p>
      </section>
    </main>
  );
}

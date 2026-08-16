import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
const QIBLA_BEARING = 282;
type SensorData = {
  heading: number;
  beta: number | null;
  gamma: number | null;
  accuracy: number | null;
  absolute: boolean;
};
function normalize(value: number) {
  return ((value % 360) + 360) % 360;
}
function shortestAngle(from: number, to: number) {
  return ((to - from + 540) % 360) - 180;
}
function smoothAngle(previous: number | null, next: number) {
  if (previous === null) return next;
  const delta = shortestAngle(previous, next);
  return normalize(previous + delta * 0.18);
}
function getScreenAngle() {
  if (
    typeof screen !== "undefined" &&
    screen.orientation &&
    typeof screen.orientation.angle === "number"
  ) {
    return screen.orientation.angle;
  }
  const legacy =
    typeof window !== "undefined"
      ? (window as Window & {
          orientation?: number;
        }).orientation
      : 0;
  return typeof legacy === "number" ? legacy : 0;
}
function getAndroidHeading(event: DeviceOrientationEvent) {
  if (typeof event.alpha !== "number") {
    return null;
  }
  const screenAngle = getScreenAngle();
  return normalize(
    360 - event.alpha + screenAngle,
  );
}
function QiblaPage() {
  const [sensor, setSensor] =
    useState<SensorData | null>(null);
  const [running, setRunning] = useState(false);
  const [permissionState, setPermissionState] =
    useState<
      "idle" | "requesting" | "granted" | "denied"
    >("idle");
  const [message, setMessage] = useState(
    "Start the compass to find Qibla.",
  );
  const [tilted, setTilted] = useState(false);
  const smoothedHeading =
    useRef<number | null>(null);
  const lastUpdate =
    useRef(0);
  const handleOrientation =
    useMemo(
      () =>
        (event: DeviceOrientationEvent) => {
          let heading: number | null = null;
          const extended =
            event as DeviceOrientationEvent & {
              webkitCompassHeading?: number;
              webkitCompassAccuracy?: number;
            };
          /*
           * iOS Safari / iOS Chrome
           * gives us the best compass heading directly.
           */
          if (
            typeof extended.webkitCompassHeading ===
              "number" &&
            Number.isFinite(
              extended.webkitCompassHeading,
            )
          ) {
            heading = normalize(
              extended.webkitCompassHeading,
            );
          }
          /*
           * Android absolute orientation.
           */
          if (
            heading === null &&
            typeof event.alpha === "number"
          ) {
            heading =
              getAndroidHeading(event);
          }
          if (heading === null) return;
          const now = performance.now();
          /*
           * Avoid excessive React updates.
           */
          if (
            now - lastUpdate.current <
            35
          ) {
            return;
          }
          lastUpdate.current = now;
          const filtered =
            smoothAngle(
              smoothedHeading.current,
              heading,
            );
          smoothedHeading.current =
            filtered;
          const beta =
            typeof event.beta === "number"
              ? event.beta
              : null;
          const gamma =
            typeof event.gamma === "number"
              ? event.gamma
              : null;
          /*
           * A compass becomes unreliable
           * when the phone is strongly tilted.
           */
          const isTilted =
            beta !== null &&
            gamma !== null &&
            (Math.abs(beta) > 28 ||
              Math.abs(gamma) > 28);
          setTilted(isTilted);
          const accuracy =
            typeof extended.webkitCompassAccuracy ===
              "number"
              ? extended.webkitCompassAccuracy
              : null;
          setSensor({
            heading: filtered,
            beta,
            gamma,
            accuracy,
            absolute:
              event.absolute === true,
          });
          setRunning(true);
          if (isTilted) {
            setMessage(
              "Hold your phone flatter for better accuracy.",
            );
          } else {
            setMessage(
              "Compass active — turn until Qibla reaches the gold marker.",
            );
          }
        },
      [],
    );
  useEffect(() => {
    if (!running) return;
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
  }, [running, handleOrientation]);
  async function startCompass() {
    setPermissionState("requesting");
    setMessage("Preparing compass sensor...");
    try {
      const Orientation =
        DeviceOrientationEvent as typeof DeviceOrientationEvent & {
          requestPermission?: (
            absolute?: boolean,
          ) => Promise<string>;
        };
      /*
       * iOS requires a user gesture.
       * Ask for ABSOLUTE orientation so the
       * magnetometer can be used.
       */
      if (
        typeof Orientation.requestPermission ===
        "function"
      ) {
        const result =
          await Orientation.requestPermission(
            true,
          );
        if (result !== "granted") {
          setPermissionState("denied");
          setMessage(
            "Compass permission was denied. Please allow motion/orientation access.",
          );
          return;
        }
      }
      setPermissionState("granted");
      setRunning(true);
      setMessage(
        "Calibrating compass sensor...",
      );
    } catch (error) {
      console.error(error);
      setPermissionState("denied");
      setMessage(
        "Unable to access the compass sensor.",
      );
    }
  }
  function stopCompass() {
    setRunning(false);
    setSensor(null);
    smoothedHeading.current = null;
    setPermissionState("idle");
    setMessage(
      "Compass stopped. Start again when ready.",
    );
  }
  const heading =
    sensor?.heading ?? null;
  const qiblaDifference =
    heading === null
      ? null
      : shortestAngle(
          heading,
          QIBLA_BEARING,
        );
  const absoluteDifference =
    qiblaDifference === null
      ? null
      : Math.abs(qiblaDifference);
  const directionText =
    qiblaDifference === null
      ? "Waiting for compass"
      : absoluteDifference < 2
        ? "You are facing Qibla"
        : qiblaDifference > 0
          ? `Turn right ${Math.round(
              absoluteDifference,
            )}°`
          : `Turn left ${Math.round(
              absoluteDifference,
            )}°`;
  const compassRotation =
    heading === null
      ? 0
      : -heading;
  const qiblaPosition =
    QIBLA_BEARING;
  const accuracyText =
    sensor?.accuracy !== null &&
    sensor?.accuracy !== undefined
      ? `±${Math.round(sensor.accuracy)}°`
      : sensor?.absolute
        ? "High"
        : "Standard";
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 50% 5%, #173f2c 0%, #071a12 42%, #03100b 100%)",
        color: "#fff",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        padding:
          "calc(18px + env(safe-area-inset-top)) 18px calc(28px + env(safe-area-inset-bottom))",
        overflowX: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          margin: "0 auto",
        }}
      >
        {/* HEADER */}
        <header
          style={{
            textAlign: "center",
            marginBottom: 18,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding:
                "7px 13px",
              borderRadius: 999,
              background:
                "rgba(214,184,90,.10)",
              border:
                "1px solid rgba(214,184,90,.22)",
              color: "#e7cf7a",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "1.6px",
              textTransform: "uppercase",
            }}
          >
            <span>✦</span>
            Qibla Direction
          </div>
          <h1
            style={{
              margin:
                "13px 0 4px",
              fontSize:
                "clamp(27px, 7vw, 38px)",
              letterSpacing:
                "-1.5px",
              fontWeight: 800,
            }}
          >
            Qibla Finder
          </h1>
          <p
            style={{
              margin: 0,
              color:
                "rgba(255,255,255,.58)",
              fontSize: 14,
            }}
          >
            Masjid-e-Meraj
          </p>
        </header>
        {/* COMPASS CARD */}
        <section
          style={{
            position: "relative",
            padding:
              "24px 14px 20px",
            borderRadius: 34,
            background:
              "linear-gradient(145deg, rgba(255,255,255,.075), rgba(255,255,255,.025))",
            border:
              "1px solid rgba(255,255,255,.10)",
            boxShadow:
              "0 25px 80px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.06)",
            backdropFilter:
              "blur(20px)",
            WebkitBackdropFilter:
              "blur(20px)",
          }}
        >
          {/* TOP FIXED POINTER */}
          <div
            style={{
              position: "absolute",
              zIndex: 20,
              top: 20,
              left: "50%",
              transform:
                "translateX(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft:
                  "9px solid transparent",
                borderRight:
                  "9px solid transparent",
                borderTop:
                  "18px solid #e7c85f",
                filter:
                  "drop-shadow(0 3px 8px rgba(214,184,90,.45))",
              }}
            />
            <div
              style={{
                width: 5,
                height: 25,
                borderRadius: 99,
                background:
                  "linear-gradient(#e7c85f,#a98830)",
              }}
            />
          </div>
          {/* COMPASS */}
          <div
            style={{
              width:
                "min(88vw, 410px)",
              height:
                "min(88vw, 410px)",
              maxWidth: 410,
              maxHeight: 410,
              margin:
                "8px auto 0",
              position: "relative",
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 50% 48%, #123d2a 0%, #0b291c 55%, #061910 100%)",
              border:
                "2px solid rgba(255,255,255,.16)",
              boxShadow:
                "0 0 0 7px rgba(255,255,255,.025), 0 20px 55px rgba(0,0,0,.38), inset 0 0 40px rgba(0,0,0,.38)",
              overflow: "hidden",
            }}
          >
            {/* outer glow */}
            <div
              style={{
                position: "absolute",
                inset: 12,
                borderRadius:
                  "50%",
                border:
                  "1px solid rgba(255,255,255,.10)",
              }}
            />
            {/* ROTATING DIAL */}
            <div
              style={{
                position:
                  "absolute",
                inset: 0,
                transform:
                  `rotate(${compassRotation}deg)`,
                transition:
                  "transform 120ms linear",
                willChange:
                  "transform",
              }}
            >
              {/* degree ticks */}
              {Array.from(
                { length: 72 },
                (_, index) => {
                  const angle =
                    index * 5;
                  const major =
                    angle % 45 === 0;
                  const medium =
                    angle % 15 === 0;
                  return (
                    <div
                      key={angle}
                      style={{
                        position:
                          "absolute",
                        left: "50%",
                        top: "50%",
                        width: major
                          ? 3
                          : medium
                            ? 2
                            : 1,
                        height: major
                          ? 18
                          : medium
                            ? 12
                            : 7,
                        transformOrigin:
                          "50% 0",
                        transform:
                          `rotate(${angle}deg) translateY(-190px)`,
                        borderRadius:
                          99,
                        background:
                          major
                            ? "rgba(255,255,255,.70)"
                            : "rgba(255,255,255,.25)",
                      }}
                    />
                  );
                },
              )}
              {/* CARDINAL LABELS */}
              {[
                {
                  label: "N",
                  angle: 0,
                },
                {
                  label: "NE",
                  angle: 45,
                },
                {
                  label: "E",
                  angle: 90,
                },
                {
                  label: "SE",
                  angle: 135,
                },
                {
                  label: "S",
                  angle: 180,
                },
                {
                  label: "SW",
                  angle: 225,
                },
                {
                  label: "W",
                  angle: 270,
                },
                {
                  label: "NW",
                  angle: 315,
                },
              ].map(
                ({
                  label,
                  angle,
                }) => (
                  <div
                    key={label}
                    style={{
                      position:
                        "absolute",
                      left: "50%",
                      top: "50%",
                      transform:
                        `rotate(${angle}deg) translateY(-158px) rotate(${-angle}deg)`,
                      transformOrigin:
                        "0 0",
                      width: 0,
                      height: 0,
                    }}
                  >
                    <span
                      style={{
                        position:
                          "absolute",
                        transform:
                          "translate(-50%,-50%)",
                        fontSize:
                          label.length === 1
                            ? 19
                            : 11,
                        fontWeight:
                          label.length === 1
                            ? 800
                            : 600,
                        color:
                          label === "N"
                            ? "#fff"
                            : "rgba(255,255,255,.48)",
                        letterSpacing:
                          "1px",
                      }}
                    >
                      {label}
                    </span>
                  </div>
                ),
              )}
              {/* QIBLA MARKER */}
              <div
                style={{
                  position:
                    "absolute",
                  left: "50%",
                  top: "50%",
                  width: 0,
                  height: 0,
                  transform:
                    `rotate(${qiblaPosition}deg) translateY(-143px)`,
                  transformOrigin:
                    "0 0",
                }}
              >
                <div
                  style={{
                    position:
                      "absolute",
                    transform:
                      "translate(-50%,-50%)",
                    width: 50,
                    height: 50,
                    borderRadius:
                      "50%",
                    background:
                      "linear-gradient(145deg,#f0d66e,#b89536)",
                    border:
                      "4px solid #071a12",
                    boxShadow:
                      "0 0 0 2px rgba(231,200,95,.7), 0 0 28px rgba(231,200,95,.35)",
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    fontSize: 22,
                  }}
                >
                  🕋
                </div>
                <div
                  style={{
                    position:
                      "absolute",
                    top: 32,
                    left: "50%",
                    transform:
                      "translateX(-50%)",
                    whiteSpace:
                      "nowrap",
                    padding:
                      "5px 9px",
                    borderRadius:
                      999,
                    background:
                      "rgba(0,0,0,.45)",
                    border:
                      "1px solid rgba(231,200,95,.35)",
                    color:
                      "#f1d879",
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing:
                      "1px",
                  }}
                >
                  QIBLA
                </div>
              </div>
            </div>
            {/* CENTER */}
            <div
              style={{
                position:
                  "absolute",
                left: "50%",
                top: "50%",
                transform:
                  "translate(-50%,-50%)",
                width: 86,
                height: 86,
                borderRadius:
                  "50%",
                background:
                  "radial-gradient(circle,#173d2b,#081b12)",
                border:
                  "1px solid rgba(255,255,255,.12)",
                boxShadow:
                  "0 12px 30px rgba(0,0,0,.35), inset 0 0 20px rgba(0,0,0,.35)",
                display: "flex",
                flexDirection:
                  "column",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                zIndex: 10,
              }}
            >
              <div
                style={{
                  fontSize: 24,
                  color: "#e5c75e",
                }}
              >
                ✦
              </div>
              <div
                style={{
                  marginTop: 2,
                  fontSize: 8,
                  letterSpacing:
                    "1.5px",
                  color:
                    "rgba(255,255,255,.45)",
                  fontWeight: 700,
                }}
              >
                NORTH
              </div>
            </div>
            {/* tilt overlay */}
            {tilted && (
              <div
                style={{
                  position:
                    "absolute",
                  inset: 20,
                  zIndex: 30,
                  borderRadius:
                    "50%",
                  display: "flex",
                  alignItems:
                    "flex-end",
                  justifyContent:
                    "center",
                  paddingBottom: 35,
                  background:
                    "linear-gradient(to top, rgba(3,16,11,.8), transparent 50%)",
                  pointerEvents:
                    "none",
                }}
              >
                <div
                  style={{
                    padding:
                      "8px 13px",
                    borderRadius:
                      999,
                    background:
                      "rgba(0,0,0,.58)",
                    border:
                      "1px solid rgba(231,200,95,.4)",
                    color:
                      "#f0d675",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  Keep phone flat
                </div>
              </div>
            )}
          </div>
          {/* TURN INSTRUCTION */}
          <div
            style={{
              textAlign: "center",
              marginTop: 20,
            }}
          >
            <div
              style={{
                fontSize: 23,
                fontWeight: 800,
                color:
                  absoluteDifference !== null &&
                  absoluteDifference < 2
                    ? "#e7d477"
                    : "#fff",
              }}
            >
              {directionText}
            </div>
            <div
              style={{
                marginTop: 5,
                color:
                  "rgba(255,255,255,.48)",
                fontSize: 12,
              }}
            >
              {heading === null
                ? "Waiting for compass heading"
                : `Facing ${Math.round(
                    heading,
                  )}°`}
            </div>
          </div>
        </section>
        {/* DATA CARDS */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3,1fr)",
            gap: 9,
            marginTop: 12,
          }}
        >
          {[
            {
              label: "QIBLA",
              value: `${QIBLA_BEARING}°`,
            },
            {
              label: "HEADING",
              value:
                heading === null
                  ? "--"
                  : `${Math.round(
                      heading,
                    )}°`,
            },
            {
              label: "ACCURACY",
              value:
                heading === null
                  ? "--"
                  : accuracyText,
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                padding:
                  "14px 7px",
                textAlign:
                  "center",
                borderRadius:
                  17,
                background:
                  "rgba(255,255,255,.045)",
                border:
                  "1px solid rgba(255,255,255,.07)",
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  letterSpacing:
                    "1.4px",
                  color:
                    "rgba(255,255,255,.38)",
                  fontWeight: 800,
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  marginTop: 5,
                  fontSize: 17,
                  fontWeight: 800,
                  color: "#e6ce71",
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </section>
        {/* CONTROL */}
        <button
          type="button"
          onClick={
            running
              ? stopCompass
              : startCompass
          }
          style={{
            width: "100%",
            marginTop: 14,
            padding:
              "16px 20px",
            border: 0,
            borderRadius: 17,
            background:
              running
                ? "rgba(255,255,255,.08)"
                : "linear-gradient(135deg,#edd16c,#c29d39)",
            color:
              running
                ? "#fff"
                : "#10150f",
            fontSize: 16,
            fontWeight: 800,
            letterSpacing:
              ".1px",
            boxShadow:
              running
                ? "none"
                : "0 10px 30px rgba(194,157,57,.18)",
            cursor: "pointer",
          }}
        >
          {running
            ? "Stop Compass"
            : "Start Qibla Compass"}
        </button>
        {/* STATUS */}
        <div
          style={{
            marginTop: 13,
            padding:
              "13px 15px",
            borderRadius: 15,
            background:
              "rgba(255,255,255,.035)",
            border:
              "1px solid rgba(255,255,255,.06)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              color:
                running
                  ? "#b8e1c8"
                  : "rgba(255,255,255,.55)",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background:
                  running
                    ? "#64d28b"
                    : "#777",
                boxShadow:
                  running
                    ? "0 0 10px rgba(100,210,139,.7)"
                    : "none",
              }}
            />
            {message}
          </div>
        </div>
        {/* PRIVACY / HELP */}
        <div
          style={{
            marginTop: 18,
            textAlign: "center",
            color:
              "rgba(255,255,255,.32)",
            fontSize: 11,
            lineHeight: 1.6,
          }}
        >
          <div>
            No GPS or location permission required.
          </div>
          <div>
            Uses your device compass sensor.
          </div>
          <div
            style={{
              marginTop: 5,
            }}
          >
            For best results, keep the phone flat
            and away from magnets and metal.
          </div>
        </div>
      </div>
    </main>
  );
}
export const Route =
  createFileRoute("/qibla")({
    component: QiblaPage,
  });

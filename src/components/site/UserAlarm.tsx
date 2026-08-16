import { useEffect, useState } from "react";
import { AlarmClock, Bell, BellOff, Plus, Trash2 } from "lucide-react";

type Alarm = {
  id: string;
  name: string;
  time: string;
  repeat: "daily" | "once";
  enabled: boolean;
};

const STORAGE_KEY = "masjid-e-meraj-user-alarms";

export function UserAlarm() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [name, setName] = useState("");
  const [time, setTime] = useState("05:00");
  const [repeat, setRepeat] = useState<Alarm["repeat"]>("daily");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setAlarms(JSON.parse(saved));
    } catch {
      setAlarms([]);
    }
  }, []);

  const save = (next: Alarm[]) => {
    setAlarms(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const addAlarm = async () => {
    if (!time) return;

    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }

    const alarm: Alarm = {
      id: crypto.randomUUID(),
      name: name.trim() || "My Alarm",
      time,
      repeat,
      enabled: true,
    };

    save([...alarms, alarm]);
    setName("");
  };

  const toggleAlarm = (id: string) => {
    save(
      alarms.map((alarm) =>
        alarm.id === id
          ? { ...alarm, enabled: !alarm.enabled }
          : alarm
      )
    );
  };

  const deleteAlarm = (id: string) => {
    save(alarms.filter((alarm) => alarm.id !== id));
  };

  return (
    <section className="user-alarm-panel">
      <div className="user-alarm-header">
        <div className="user-alarm-title">
          <span className="user-alarm-icon">
            <AlarmClock size={19} />
          </span>

          <div>
            <p>MY ALARMS</p>
            <h2>Personal Reminder</h2>
          </div>
        </div>

        <span className="user-alarm-count">
          {alarms.filter((alarm) => alarm.enabled).length} active
        </span>
      </div>

      <div className="user-alarm-form">
        <div className="user-alarm-field">
          <label>Alarm name</label>

          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Tahajjud, Quran, Wake up..."
            maxLength={40}
          />
        </div>

        <div className="user-alarm-field">
          <label>Time</label>

          <input
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
          />
        </div>

        <div className="user-alarm-field">
          <label>Repeat</label>

          <select
            value={repeat}
            onChange={(event) =>
              setRepeat(event.target.value as Alarm["repeat"])
            }
          >
            <option value="daily">Every day</option>
            <option value="once">One time</option>
          </select>
        </div>

        <button
          type="button"
          className="user-alarm-add"
          onClick={addAlarm}
        >
          <Plus size={17} />
          Set Alarm
        </button>
      </div>

      <div className="user-alarm-list">
        {alarms.length === 0 ? (
          <div className="user-alarm-empty">
            <Bell size={17} />
            No personal alarms yet
          </div>
        ) : (
          alarms.map((alarm) => (
            <div
              className={`user-alarm-row ${
                alarm.enabled ? "is-active" : "is-off"
              }`}
              key={alarm.id}
            >
              <span className="user-alarm-row-icon">
                {alarm.enabled ? (
                  <Bell size={17} />
                ) : (
                  <BellOff size={17} />
                )}
              </span>

              <div className="user-alarm-row-info">
                <strong>{alarm.name}</strong>
                <span>
                  {alarm.repeat === "daily"
                    ? "Every day"
                    : "One time"}
                </span>
              </div>

              <time>{alarm.time}</time>

              <button
                type="button"
                className="user-alarm-toggle"
                onClick={() => toggleAlarm(alarm.id)}
              >
                {alarm.enabled ? "ON" : "OFF"}
              </button>

              <button
                type="button"
                className="user-alarm-delete"
                onClick={() => deleteAlarm(alarm.id)}
                aria-label="Delete alarm"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
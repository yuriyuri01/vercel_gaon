"use client";

import { useMemo, useState, useEffect, useRef } from "react";

/* 아이콘 */
import { FaChevronLeft } from "react-icons/fa";
import { FiEdit2, FiPlus } from "react-icons/fi";
import { TbCalendarCheck } from "react-icons/tb";
import { MdDeleteOutline } from "react-icons/md";

/* CSS Module */
import styles from "@/styles/c-css/Calendar.module.css";

const ORANGE = "#F39535";
const ORANGE_SOFT = "rgba(243, 149, 53, 0.2)";

const fmt = (d) => d.toISOString().slice(0, 10);
const sameDay = (a, b) => a.toDateString() === b.toDateString();
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
const addDays = (d, n) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

function getMonthMatrix(viewDate) {
  const first = startOfMonth(viewDate);
  const last = endOfMonth(viewDate);
  const start = new Date(first);
  const firstDow = (first.getDay() + 6) % 7; // Mon=0
  start.setDate(first.getDate() - firstDow);
  const end = new Date(last);
  const lastDow = (last.getDay() + 6) % 7;
  end.setDate(last.getDate() + (6 - lastDow));
  const cells = [];
  for (let d = new Date(start); d <= end; d = addDays(d, 1))
    cells.push(new Date(d));
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export default function CalendarModal({ open, onClose }) {
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(startOfMonth(new Date()));
  const [selected, setSelected] = useState(new Date());

  const [events, setEvents] = useState({
    "2025-04-12": [
      { id: "e1", title: "반려동물관리사 1차 필기시험", time: "10:00" },
    ],
    "2025-05-18": [
      { id: "e2", title: "반려동물행동교정사 실기시험", time: "09:30" },
    ],
    "2025-06-22": [
      { id: "e3", title: "애견미용사 자격시험(2급)", time: "13:00" },
    ],
    "2025-09-07": [
      { id: "e4", title: "펫아로마테라피스트 자격시험", time: "11:00" },
    ],
    "2025-11-15": [
      { id: "e5", title: "반려동물행동상담사 자격시험", time: "10:30" },
    ],
  });

  const [mode, setMode] = useState("calendar");
  const [planText, setPlanText] = useState("");
  const [planTime, setPlanTime] = useState("09:00");

  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const h = String(Math.floor(i / 2)).padStart(2, "0");
    const m = i % 2 ? "30" : "00";
    return `${h}:${m}`;
  });

  const handleDelete = (dateKey, id) => {
    setEvents((prev) => {
      const next = { ...prev };
      next[dateKey] = (next[dateKey] || []).filter((ev) => ev.id !== id);
      if (next[dateKey].length === 0) delete next[dateKey];
      return next;
    });
  };

  const panelRef = useRef(null);
  const chipWrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (mode === "planner") setMode("calendar");
        else onClose?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, mode, onClose]);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (mode !== "planner") return;
    const el = chipWrapRef.current?.querySelector('[data-active="true"]');
    el?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [mode, selected]);

  const monthLabel = viewDate.toLocaleString("en-US", {
    month: "short",
    year: "numeric",
  });
  const weeks = getMonthMatrix(viewDate);
  const selKey = fmt(selected);
  const dayEvents = events[selKey] || [];

  if (!open) return null;

  return (
    <>
      <div
        onClick={() => (mode === "planner" ? setMode("calendar") : onClose?.())}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.35)",
          zIndex: 9998,
        }}
      />

      <div
        className={`${styles["cal-modal"]} ${mode === "planner" ? styles["is-planner"] : ""
          }`}
        ref={panelRef}
        tabIndex={-1}
      >
        <div className={styles["cal-header"]}>
          <div className={styles["cal-title"]}>
            <button
              className={styles["cal-backbtn"]}
              onClick={() =>
                mode === "planner" ? setMode("calendar") : onClose?.()
              }
              aria-label="뒤로"
            >
              <FaChevronLeft />
            </button>
            <h2>{mode === "planner" ? "Planner" : "Calendar"}</h2>
            <div className={styles["cal-line"]} />
          </div>

          <div className={styles["cal-month-nav"]}>
            <button
              onClick={() =>
                setViewDate(
                  new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)
                )
              }
            >
              ‹
            </button>
            <span>{monthLabel}</span>
            <button
              onClick={() =>
                setViewDate(
                  new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)
                )
              }
            >
              ›
            </button>
          </div>

          {mode === "planner" && (
            <div className={styles["cal-planner-chiprow"]}>
              <div className={styles["cal-chip-scroller"]} ref={chipWrapRef}>
                {Array.from({ length: 15 }, (_, i) =>
                  addDays(selected, i - 7)
                ).map((d) => {
                  const active = sameDay(d, selected);
                  return (
                    <button
                      key={fmt(d)}
                      type="button"
                      className={`${styles["cal-chip"]} ${active ? styles.active : ""
                        }`}
                      data-active={active ? "true" : "false"}
                      onClick={() => setSelected(d)}
                      aria-pressed={active}
                      title={d.toLocaleDateString("ko-KR")}
                    >
                      <span className={styles["cal-chip-day"]}>
                        {d.getDate()}
                      </span>
                      <span className={styles["cal-chip-week"]}>
                        {d.toLocaleDateString("en-US", { weekday: "short" })}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {mode === "calendar" ? (
          <>
            <div className={styles["cal-content"]}>
              <div className={styles["cal-weekdays"]}>
                {"MON TUE WED THU FRI SAT SUN".split(" ").map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              <div className={styles["cal-grid"]}>
                {weeks.flat().map((d, i) => {
                  const inMonth = d.getMonth() === viewDate.getMonth();
                  const isSelected = sameDay(d, selected);
                  const isToday = sameDay(d, today);
                  const hasEvents = (events[fmt(d)]?.length ?? 0) > 0;

                  let bg = "transparent";
                  let border = "transparent";
                  let text = inMonth ? "#374151" : "#D1D5DB";

                  if (hasEvents) {
                    bg = ORANGE_SOFT;
                    text = "#f39535";
                  }
                  if (isToday) {
                    bg = ORANGE;
                    text = "#fff";
                  }
                  if (isSelected) {
                    bg = "#fff";
                    border = ORANGE;
                    text = "#f39535";
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => setSelected(d)}
                      className={styles["cal-day"]}
                      style={{
                        background: bg,
                        color: text,
                        borderColor: border,
                        borderWidth: isSelected ? "2px" : "0",
                      }}
                      title={fmt(d)}
                    >
                      {d.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className={`${styles["cal-agenda"]} ${styles["cal-agenda--orange"]}`}
            >
              <div className={styles["cal-selected-date"]}>
                <TbCalendarCheck />
                {selected.toLocaleDateString("ko-KR", {
                  month: "long",
                  day: "numeric",
                  weekday: "short",
                })}
              </div>

              <div className={styles["cal-date-line"]}></div>

              {dayEvents.length === 0 ? (
                <p
                  className={`${styles["cal-noevent"]} ${styles["cal-noevent--on-orange"]}`}
                >
                  일정이 없습니다.
                </p>
              ) : (
                <ul className={styles["cal-eventlist"]}>
                  {dayEvents
                    .slice()
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((ev) => (
                      <li key={ev.id} className={styles["cal-event-item"]}>
                        <span className={styles["cal-time"]}>{ev.time}</span>
                        <span className={styles["cal-title-text"]}>
                          {ev.title}
                        </span>
                        <button
                          type="button"
                          className={styles["cal-delete"]}
                          onClick={() => handleDelete(selKey, ev.id)}
                          aria-label={`이 일정 삭제: ${ev.title}`}
                          title="삭제"
                        >
                          <MdDeleteOutline />
                        </button>
                      </li>
                    ))}
                </ul>
              )}

              <div className={styles["cal-footer-actions"]}>
                <button
                  type="button"
                  className={`${styles["cal-btn"]} ${styles["cal-btn--ghost"]}`}
                  onClick={() => alert("수정 모달 연결 자리")}
                >
                  <FiEdit2 /> 수정
                </button>
                <button
                  type="button"
                  className={`${styles["cal-btn"]} ${styles["cal-btn--primary"]}`}
                  onClick={() => setMode("planner")}
                >
                  <FiPlus /> 추가
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className={styles["cal-planner-body"]}>
            <label className={styles["cal-pl-label"]}>일정</label>
            <textarea
              className={styles["cal-pl-textarea"]}
              value={planText}
              onChange={(e) => setPlanText(e.target.value)}
              placeholder="일정을 입력하세요"
            />

            <div className={styles["cal-pl-time"]}>
              <label className={styles["cal-pl-label"]}>시간</label>
              <select
                className={styles["cal-pl-select"]}
                value={planTime}
                onChange={(e) => setPlanTime(e.target.value)}
              >
                {timeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <button
              className={styles["cal-pl-save"]}
              disabled={!planText.trim()}
              onClick={() => {
                const key = fmt(selected);
                const list = events[key] ? [...events[key]] : [];
                list.push({
                  id:
                    typeof crypto !== "undefined"
                      ? crypto.randomUUID()
                      : Date.now().toString(),
                  title: planText.trim(),
                  time: planTime,
                });
                setEvents({ ...events, [key]: list });
                setPlanText("");
                setPlanTime("09:00");
                setMode("calendar");
              }}
            >
              저장
            </button>
          </div>
        )}
      </div>
    </>
  );
}

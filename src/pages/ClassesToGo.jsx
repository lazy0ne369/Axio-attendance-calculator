import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import Footer from "../components/Footer";
import ThemeToggle from "../components/ThemeToggle";

const WEIGHTS = {
    Lecture: 1.0,
    Tutorial: 1.0,
    Practical: 0.5,
    Skill: 0.25,
};

const TYPE_SHORT = {
    Lecture: "L",
    Tutorial: "T",
    Practical: "P",
    Skill: "S",
};

function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

export default function ClassesToGo({ selectedTypes }) {
    const [data, setData] = useState(() => {
        const saved = localStorage.getItem("attendance_sim_data");
        return saved ? JSON.parse(saved) : { desiredPercentage: "85" };
    });
    const [sliders, setSliders] = useState({});
    const [calculated, setCalculated] = useState(false);
    const [minRequired, setMinRequired] = useState({});

    useEffect(() => {
        localStorage.setItem("attendance_sim_data", JSON.stringify(data));
    }, [data]);

    const fireConfetti = async () => {
        try {
            const confetti = (await import("https://cdn.skypack.dev/canvas-confetti")).default;
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#16a34a', '#4ade80', '#ffffff']
            });
        } catch (err) {
            console.error("Confetti failed to fly:", err);
        }
    };
// ... rest of the component

    const handleChange = (e, field) => {
        setData((d) => ({ ...d, [field]: e.target.value }));
        setCalculated(false);
    };

    // ── Core math ────────────────────────────────────────────────────────────

    /**
     * For a single type, how many of the remaining classes must be attended
     * so that the combined (current + planned) weighted attendance / (conducted + remaining)
     * satisfies desiredPerc AS PART OF THE OVERALL weighted formula.
     *
     * We solve per-type independently first for the table view, then recalculate
     * the true cross-type minimum via the greedy algorithm for the minimum label.
     */
    const calcPerTypeIndependent = useCallback(() => {
        const desiredPerc = parseFloat(data.desiredPercentage) || 85;
        const result = {};

        selectedTypes.forEach((type) => {
            const att = parseInt(data[`${type}_att`]) || 0;
            const total = parseInt(data[`${type}_total`]) || 0;
            const rem = parseInt(data[`${type}_rem`]) || 0;
            const w = WEIGHTS[type];

            // Overall future weighted total (this type contributes w * (total + rem))
            let currentWeightedAtt = 0;
            let currentWeightedTotal = 0;
            let futureWeightedTotal = 0;

            selectedTypes.forEach((t) => {
                const a = parseInt(data[`${t}_att`]) || 0;
                const to = parseInt(data[`${t}_total`]) || 0;
                const r = parseInt(data[`${t}_rem`]) || 0;
                const wt = WEIGHTS[t];
                currentWeightedAtt += a * wt;
                currentWeightedTotal += to * wt;
                futureWeightedTotal += r * wt;
            });

            const totalFuture = currentWeightedTotal + futureWeightedTotal;
            const needed = (desiredPerc / 100) * totalFuture;
            const deficit = needed - currentWeightedAtt;

            // How many of THIS type's remaining classes cover the deficit?
            const minForThisType =
                deficit <= 0 ? 0 : Math.min(rem, Math.ceil(deficit / w));

            result[type] = {
                att,
                total,
                rem,
                // Minimum classes of THIS type required (greedy, ignoring other types)
                minToAttend: clamp(minForThisType, 0, rem),
                currentPerc: total > 0 ? (att / total) * 100 : 0,
            };
        });

        return result;
    }, [data, selectedTypes]);

    // True greedy minimum across all types
    const calcGreedyMin = useCallback(() => {
        const desiredPerc = parseFloat(data.desiredPercentage) || 85;
        let currentWeightedAtt = 0;
        let currentWeightedTotal = 0;
        let futureWeightedTotal = 0;

        const remaining = [];

        selectedTypes.forEach((type) => {
            const att = parseInt(data[`${type}_att`]) || 0;
            const total = parseInt(data[`${type}_total`]) || 0;
            const rem = parseInt(data[`${type}_rem`]) || 0;
            const w = WEIGHTS[type];
            currentWeightedAtt += att * w;
            currentWeightedTotal += total * w;
            futureWeightedTotal += rem * w;
            if (rem > 0) remaining.push({ type, count: rem, weight: w });
        });

        const totalFuture = currentWeightedTotal + futureWeightedTotal;
        const needed = (desiredPerc / 100) * totalFuture;
        let deficit = needed - currentWeightedAtt;

        if (deficit <= 0) return { status: "achieved", breakdown: {} };
        if (deficit > futureWeightedTotal) return { status: "impossible", breakdown: {} };

        remaining.sort((a, b) => b.weight - a.weight);
        const toAttend = {};
        selectedTypes.forEach((t) => (toAttend[t] = 0));

        for (const cls of remaining) {
            if (deficit <= 0) break;
            const maxWeight = cls.count * cls.weight;
            if (deficit >= maxWeight) {
                toAttend[cls.type] = cls.count;
                deficit -= maxWeight;
            } else {
                const n = Math.ceil(deficit / cls.weight);
                toAttend[cls.type] = n;
                deficit -= n * cls.weight;
            }
        }

        return { status: "possible", breakdown: toAttend };
    }, [data, selectedTypes]);

    const getProjectedPerc = useCallback(
        (type, planned) => {
            const att = parseInt(data[`${type}_att`]) || 0;
            const total = parseInt(data[`${type}_total`]) || 0;
            const rem = parseInt(data[`${type}_rem`]) || 0;
            const newTotal = total + rem;
            if (newTotal === 0) return 0;
            return ((att + planned) / newTotal) * 100;
        },
        [data]
    );

    // Weighted overall projected percentage using slider values
    const getOverallProjected = useCallback(() => {
        let weightedAtt = 0;
        let weightedTotal = 0;

        selectedTypes.forEach((type) => {
            const att = parseInt(data[`${type}_att`]) || 0;
            const total = parseInt(data[`${type}_total`]) || 0;
            const rem = parseInt(data[`${type}_rem`]) || 0;
            const planned = sliders[type] ?? 0;
            const w = WEIGHTS[type];

            weightedAtt += (att + planned) * w;
            weightedTotal += (total + rem) * w;
        });

        return weightedTotal > 0 ? (weightedAtt / weightedTotal) * 100 : 0;
    }, [data, sliders, selectedTypes]);

    const getStatusInfo = (perc, threshold) => {
        if (perc >= threshold)
            return { emoji: "✅", label: `${perc.toFixed(1)}%`, color: "#16a34a", bg: "rgba(22,163,74,0.1)", border: "rgba(22,163,74,0.25)" };
        if (perc >= threshold - 5)
            return { emoji: "⚠️", label: `${perc.toFixed(1)}%`, color: "#d97706", bg: "rgba(217,119,6,0.1)", border: "rgba(217,119,6,0.25)" };
        return { emoji: "❌", label: `${perc.toFixed(1)}%`, color: "#dc2626", bg: "rgba(220,38,38,0.1)", border: "rgba(220,38,38,0.25)" };
    };

    // ── Actions ───────────────────────────────────────────────────────────────

    const handleCalculate = () => {
        const perType = calcPerTypeIndependent();
        const greedy = calcGreedyMin();

        // Build minRequired using greedy breakdown (most accurate cross-type minimum)
        const mr = {};
        selectedTypes.forEach((type) => {
            mr[type] = {
                ...perType[type],
                minToAttend:
                    greedy.status === "achieved"
                        ? 0
                        : greedy.status === "impossible"
                        ? parseInt(data[`${type}_rem`]) || 0
                        : greedy.breakdown[type] ?? 0,
                greedyStatus: greedy.status,
            };
        });
        setMinRequired(mr);

        // Default sliders to the greedy minimums
        const initSliders = {};
        selectedTypes.forEach((type) => {
            initSliders[type] = clamp(mr[type].minToAttend, 0, mr[type].rem);
        });
        setSliders(initSliders);
        setCalculated(true);

        // Achievement celebration
        const overall = (greedy.status === "achieved");
        if (overall) fireConfetti();
    };

    const handleSlider = (type, val) => {
        const newVal = parseInt(val);
        const oldOverall = getOverallProjected();
        
        setSliders((s) => ({ ...s, [type]: newVal }));
        
        // Trigger confetti if newly crossing the target threshold
        const newOverall = getOverallProjected(); // Note: setSliders is async, this won't reflect it yet.
        // We'll calculate it manually or use a useEffect for easier trigger.
    };

    useEffect(() => {
        if (!calculated) return;
        const currentOverall = getOverallProjected();
        const target = parseFloat(data.desiredPercentage) || 85;
        
        // Use a persistent ref to check if we just crossed into the safe zone
        if (currentOverall >= target && (window.lastOverall ?? 0) < target) {
            fireConfetti();
        }
        window.lastOverall = currentOverall;
    }, [sliders, data.desiredPercentage, calculated, getOverallProjected]);

    // ── Guards ────────────────────────────────────────────────────────────────

    const desiredPerc = parseFloat(data.desiredPercentage) || 85;
    const overallProjected = calculated ? getOverallProjected() : null;
    const overallStatus = overallProjected !== null ? getStatusInfo(overallProjected, desiredPerc) : null;

    // Largest remaining for bar chart scale
    const maxRem = calculated
        ? Math.max(...selectedTypes.map((t) => parseInt(data[`${t}_rem`]) || 0), 1)
        : 1;

    // ── Validation ────────────────────────────────────────────────────────────

    const isFormValid = () => {
        if (!data.desiredPercentage || parseFloat(data.desiredPercentage) < 1 || parseFloat(data.desiredPercentage) > 100) return false;
        for (const type of selectedTypes) {
            const att = parseInt(data[`${type}_att`]);
            const total = parseInt(data[`${type}_total`]);
            const rem = parseInt(data[`${type}_rem`]);
            if (isNaN(att) || isNaN(total) || isNaN(rem)) return false;
            if (att > total) return false;
            if (rem < 0) return false;
        }
        return true;
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="page-container">
            <ThemeToggle />
            <div className="sim-container">
                <Logo />
                <h2>Attendance Simulator</h2>
                <p>Plan which classes to attend and see your projected attendance in real time.</p>

                {selectedTypes.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "48px 0" }}>
                        <p style={{ color: "#64748b", marginBottom: "32px" }}>
                            No class types selected. Please go back and select at least one type.
                        </p>
                        <Link to="/select" state={{ destination: "/classes-to-go" }}>
                            <button>Select Class Types</button>
                        </Link>
                    </div>
                ) : (
                    <div className="sim-body">

                        {/* ══ SECTION 1 – INPUT FORM ══════════════════════════════ */}
                        <section className="sim-section">
                            <div className="sim-section-header">
                                <span className="sim-section-num">1</span>
                                <h3>Current Attendance Data</h3>
                            </div>

                            <div className="sim-goal-row">
                                <label className="sim-field-label">Desired Attendance %</label>
                                <input
                                    type="number"
                                    className="sim-input sim-input--goal"
                                    placeholder="85"
                                    value={data.desiredPercentage}
                                    onChange={(e) => handleChange(e, "desiredPercentage")}
                                    min="1"
                                    max="100"
                                />
                            </div>

                            <div className="sim-type-grid">
                                {selectedTypes.map((type) => {
                                    const att = parseInt(data[`${type}_att`]) || 0;
                                    const total = parseInt(data[`${type}_total`]) || 0;
                                    const attError = att > total && total > 0;
                                    return (
                                        <div key={type} className="sim-type-card">
                                            <div className="sim-type-card-header">
                                                <span className="sim-type-badge">{TYPE_SHORT[type]}</span>
                                                <span className="sim-type-name">{type}</span>
                                                <span className="sim-weight-pill">{WEIGHTS[type]}×</span>
                                            </div>
                                            <div className="sim-input-row">
                                                <div className="sim-input-wrap">
                                                    <span className="sim-input-label">Attended</span>
                                                    <input
                                                        type="number"
                                                        className={`sim-input${attError ? " sim-input--error" : ""}`}
                                                        placeholder="0"
                                                        value={data[`${type}_att`] || ""}
                                                        onChange={(e) => handleChange(e, `${type}_att`)}
                                                        min="0"
                                                    />
                                                </div>
                                                <div className="sim-input-sep">/</div>
                                                <div className="sim-input-wrap">
                                                    <span className="sim-input-label">Conducted</span>
                                                    <input
                                                        type="number"
                                                        className="sim-input"
                                                        placeholder="0"
                                                        value={data[`${type}_total`] || ""}
                                                        onChange={(e) => handleChange(e, `${type}_total`)}
                                                        min="0"
                                                    />
                                                </div>
                                                <div className="sim-input-wrap">
                                                    <span className="sim-input-label">Remaining</span>
                                                    <input
                                                        type="number"
                                                        className="sim-input"
                                                        placeholder="0"
                                                        value={data[`${type}_rem`] || ""}
                                                        onChange={(e) => handleChange(e, `${type}_rem`)}
                                                        min="0"
                                                    />
                                                </div>
                                            </div>
                                            {attError && (
                                                <span className="sim-validation-err">Attended cannot exceed conducted.</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <button
                                className="sim-cta-btn"
                                onClick={handleCalculate}
                                disabled={!isFormValid()}
                            >
                                Calculate & Simulate →
                            </button>
                        </section>

                        {/* ══ SECTION 2 – RESULTS TABLE ═══════════════════════════ */}
                        {calculated && (
                            <section className="sim-section">
                                <div className="sim-section-header">
                                    <span className="sim-section-num">2</span>
                                    <h3>Minimum Classes Required</h3>
                                </div>

                                {minRequired[selectedTypes[0]]?.greedyStatus === "achieved" && (
                                    <div className="sim-alert sim-alert--green">
                                        🎉 You've already met the {desiredPerc}% target! No additional classes are mandatory.
                                    </div>
                                )}
                                {minRequired[selectedTypes[0]]?.greedyStatus === "impossible" && (
                                    <div className="sim-alert sim-alert--red">
                                        ❌ The {desiredPerc}% target is mathematically impossible even if you attend every remaining class.
                                    </div>
                                )}

                                <div className="sim-table-wrap">
                                    <table className="sim-table">
                                        <thead>
                                            <tr>
                                                <th>Type</th>
                                                <th>Current %</th>
                                                <th>Min to Attend</th>
                                                <th>Projected %</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedTypes.map((type) => {
                                                const info = minRequired[type];
                                                const projected = getProjectedPerc(type, info.minToAttend);
                                                const st = getStatusInfo(projected, desiredPerc);
                                                return (
                                                    <tr key={type}>
                                                        <td>
                                                            <span className="sim-type-badge" style={{ fontSize: "13px" }}>
                                                                {TYPE_SHORT[type]}
                                                            </span>{" "}
                                                            {type}
                                                        </td>
                                                        <td>{info.currentPerc.toFixed(1)}%</td>
                                                        <td>
                                                            <span className="sim-min-pill">
                                                                {info.minToAttend} / {info.rem}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span
                                                                className="sim-proj-badge"
                                                                style={{ color: st.color, background: st.bg }}
                                                            >
                                                                {st.emoji} {projected.toFixed(1)}%
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        )}

                        {/* ══ SECTION 3 – BAR CHART + SLIDERS ════════════════════ */}
                        {calculated && (
                            <section className="sim-section">
                                <div className="sim-section-header">
                                    <span className="sim-section-num">3</span>
                                    <h3>Plan Your Attendance</h3>
                                </div>
                                <p className="sim-hint">
                                    Drag the sliders to explore different scenarios. Bars update in real time.
                                </p>

                                <div className="sim-legend">
                                    <span className="sim-legend-item">
                                        <span className="sim-legend-dot" style={{ background: "#e2e8f0" }}></span> Total Remaining
                                    </span>
                                    <span className="sim-legend-item">
                                        <span className="sim-legend-dot" style={{ background: "#fca5a5" }}></span> Min Required
                                    </span>
                                    <span className="sim-legend-item">
                                        <span className="sim-legend-dot" style={{ background: "#4ade80" }}></span> Your Plan
                                    </span>
                                </div>

                                <div className="sim-chart-area">
                                    {selectedTypes.map((type) => {
                                        const rem = parseInt(data[`${type}_rem`]) || 0;
                                        const minVal = minRequired[type]?.minToAttend ?? 0;
                                        const planned = sliders[type] ?? minVal;
                                        const projected = getProjectedPerc(type, planned);
                                        const st = getStatusInfo(projected, desiredPerc);

                                        const remPct = (rem / maxRem) * 100;
                                        const minPct = (minVal / maxRem) * 100;
                                        const planPct = (planned / maxRem) * 100;

                                        return (
                                            <div key={type} className="sim-bar-col">
                                                <div className="sim-bar-label-top">
                                                    <span className="sim-type-badge">{TYPE_SHORT[type]}</span>
                                                    <span
                                                        className="sim-proj-live"
                                                        style={{ color: st.color }}
                                                    >
                                                        {st.emoji} {projected.toFixed(1)}%
                                                    </span>
                                                </div>

                                                {/* Bar track */}
                                                <div className="sim-bar-track">
                                                    {/* Gray: total remaining */}
                                                    <div
                                                        className="sim-bar-fill sim-bar-fill--gray"
                                                        style={{ height: `${remPct}%` }}
                                                    />
                                                    {/* Red: minimum required */}
                                                    <div
                                                        className="sim-bar-fill sim-bar-fill--red"
                                                        style={{ height: `${minPct}%` }}
                                                    />
                                                    {/* Green: user plan */}
                                                    <div
                                                        className="sim-bar-fill sim-bar-fill--green"
                                                        style={{ height: `${planPct}%` }}
                                                    />
                                                    {/* Min threshold line */}
                                                    {minVal > 0 && (
                                                        <div
                                                            className="sim-threshold-line"
                                                            style={{ bottom: `${minPct}%` }}
                                                            title={`Minimum: ${minVal}`}
                                                        />
                                                    )}
                                                </div>

                                                <div className="sim-bar-nums">
                                                    <span>{planned}</span>
                                                    <span style={{ color: "#94a3b8" }}>/ {rem}</span>
                                                </div>

                                                {/* Slider */}
                                                <input
                                                    type="range"
                                                    className="sim-slider"
                                                    min="0"
                                                    max={rem}
                                                    value={planned}
                                                    onChange={(e) => handleSlider(type, e.target.value)}
                                                    disabled={rem === 0}
                                                    style={{
                                                        "--thumb-color": st.color,
                                                    }}
                                                />
                                                <div className="sim-slider-ticks">
                                                    <span>0</span>
                                                    <span>{rem}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {/* ══ SECTION 4 – OVERALL STATUS ══════════════════════════ */}
                        {calculated && overallStatus && (
                            <section className="sim-section sim-section--status">
                                <div className="sim-section-header">
                                    <span className="sim-section-num">4</span>
                                    <h3>Overall Status</h3>
                                </div>

                                <div
                                    className="sim-overall-block"
                                    style={{
                                        background: overallStatus.bg,
                                        borderColor: overallStatus.border,
                                    }}
                                >
                                    <div className="sim-overall-emoji">{overallStatus.emoji}</div>
                                    <div
                                        className="sim-overall-perc"
                                        style={{ color: overallStatus.color }}
                                    >
                                        {overallProjected.toFixed(2)}%
                                    </div>
                                    <div className="sim-overall-label">Weighted Projected Attendance</div>
                                    <div className="sim-overall-target">
                                        Target: {desiredPerc}%
                                    </div>

                                    <div className="sim-badges-row">
                                        {selectedTypes.map((type) => {
                                            const planned = sliders[type] ?? 0;
                                            const projected = getProjectedPerc(type, planned);
                                            const st = getStatusInfo(projected, desiredPerc);
                                            return (
                                                <div
                                                    key={type}
                                                    className="sim-badge-item"
                                                    style={{
                                                        background: st.bg,
                                                        borderColor: st.border,
                                                        color: st.color,
                                                    }}
                                                >
                                                    <span className="sim-badge-type">{TYPE_SHORT[type]}</span>
                                                    <span className="sim-badge-val">{projected.toFixed(1)}%</span>
                                                    <span className="sim-badge-icon">{st.emoji}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Back link */}
                        <div style={{ marginTop: "24px", textAlign: "center" }}>
                            <Link
                                to="/select"
                                state={{ destination: "/classes-to-go" }}
                                style={{ color: "#64748b", textDecoration: "none", fontSize: "15px", fontWeight: "500" }}
                            >
                                ← Change Selected Types
                            </Link>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}

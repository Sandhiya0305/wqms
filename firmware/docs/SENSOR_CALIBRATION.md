# Water Quality Sensor Calibration Procedures

Accurate water quality readings depend on proper physical calibration before field deployment.

## 1. pH Sensor Calibration (Two-Point Method)
Standard standard buffer solutions required: **pH 7.00 (Neutral)** and **pH 4.01 (Acidic)** (or pH 9.18).

### Steps:
1. Rinse the glass bulb of the pH probe with distilled water and gently pat dry with lint-free paper.
2. Submerge probe into the **pH 7.00** buffer solution at 25°C.
3. Observe raw voltage output in the Serial Monitor. Turn the potentiometer on the pH amplifier board until the output voltage reads `2.50V` (or note the reading, e.g. `V_neutral = 2.50V`).
4. Rinse probe with distilled water, then submerge into **pH 4.01** buffer solution.
5. Record the voltage `V_acid`.
6. Calculate slope $M$:
   $$M = \frac{7.00 - 4.01}{V_{neutral} - V_{acid}}$$
7. Update `PH_CALIBRATION_SLOPE` in `firmware/esp32_water_monitor/config.h`.

---

## 2. Turbidity Sensor Calibration (Clear Water Reference)
1. Immerse the optical turbidity probe in pure distilled water (0 NTU).
2. Measure the voltage output: typically $\approx 4.10\text{V}$ (or $\approx 3.0\text{V}$ on a 3.3V divider).
3. If using standard municipal tap water (usually $< 1.0\text{ NTU}$), set this as your baseline clear water reference.
4. Update `TURBIDITY_VOLTAGE_CLEAR` in `config.h`.

---

## 3. Total Dissolved Solids (TDS) Calibration
1. Prepare standard conductivity calibration solution (e.g. 1413 µS/cm or 707 ppm TDS solution).
2. Ensure temperature sensor is immersed simultaneously to allow automated $2\% / ^\circ\text{C}$ temperature compensation.
3. Adjust calibration factor if reading deviates from the solution certificate value.

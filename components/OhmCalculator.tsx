"use client";
import { useState } from "react";

type FieldKey = "V" | "I" | "R" | "P";
type Values = Record<FieldKey, string>;
type Result = Record<FieldKey, number | undefined>;

const fields: { key: FieldKey; label: string; unit: string; color: string }[] = [
  { key: "V", label: "電圧 V", unit: "V", color: "#F59E0B" },
  { key: "I", label: "電流 I", unit: "A", color: "#3B82F6" },
  { key: "R", label: "抵抗 R", unit: "Ω", color: "#10B981" },
  { key: "P", label: "電力 P", unit: "W", color: "#8B5CF6" },
];

const formulas = [
  ["V (電圧)", "I × R", "P / I", "√(P×R)"],
  ["I (電流)", "V / R", "P / V", "√(P/R)"],
  ["R (抵抗)", "V / I", "V² / P", "P / I²"],
  ["P (電力)", "V × I", "V² / R", "I² × R"],
];

export default function OhmCalculator() {
  const [vals, setVals] = useState<Values>({ V: "100", I: "", R: "", P: "" });
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  const set = (k: FieldKey, v: string) => setVals((p) => ({ ...p, [k]: v }));

  const calc = () => {
    setError("");
    setResult(null);
    const n: Partial<Record<FieldKey, number>> = {};
    for (const k of ["V", "I", "R", "P"] as FieldKey[]) {
      const v = parseFloat(vals[k]);
      if (!isNaN(v) && v > 0) n[k] = v;
    }
    if (Object.keys(n).length < 2) {
      setError("2つ以上の値を入力してください");
      return;
    }
    let { V, I, R, P } = n;
    if (V && I) { R = R ?? V / I; P = P ?? V * I; }
    else if (V && R) { I = I ?? V / R; P = P ?? (V * V) / R; }
    else if (V && P) { I = I ?? P / V; R = R ?? (V * V) / P; }
    else if (I && R) { V = V ?? I * R; P = P ?? I * I * R; }
    else if (I && P) { V = V ?? P / I; R = R ?? P / (I * I); }
    else if (R && P) { V = V ?? Math.sqrt(P * R); I = I ?? Math.sqrt(P / R); }
    else { setError("計算できない組み合わせです"); return; }
    setResult({ V, I, R, P });
  };

  const fmt = (v: number | undefined) =>
    v === undefined ? "—" : parseFloat(v.toFixed(4)).toString();

  return (
    <div>
      <div className="bg-slate-100 rounded-xl p-4 mb-4 text-sm text-slate-600 leading-relaxed">
        <strong className="text-slate-800">オームの法則</strong>
        <br />
        V=I×R ／ P=V×I ／ P=I²×R ／ P=V²/R
        <br />
        <span className="text-xs">2つ以上の値を入力して「計算する」を押してください</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {fields.map((f) => (
          <div key={f.key}>
            <label
              className="text-xs font-bold block mb-1"
              style={{ color: f.color }}
            >
              {f.label} ({f.unit})
            </label>
            <input
              type="number"
              value={vals[f.key]}
              onChange={(e) => set(f.key, e.target.value)}
              placeholder="例: 100"
              className="w-full border-2 rounded-lg px-3 py-2 text-sm outline-none bg-white"
              style={{
                borderColor: result ? `${f.color}66` : "#e2e8f0",
              }}
            />
          </div>
        ))}
      </div>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <button
        onClick={calc}
        className="w-full bg-slate-800 text-white rounded-xl py-3 text-sm font-bold cursor-pointer mb-4 hover:bg-slate-700 transition-colors"
      >
        計算する
      </button>

      {result && (
        <div className="border-2 border-slate-200 rounded-xl overflow-hidden mb-4">
          <div className="bg-slate-800 text-white px-4 py-2 text-sm font-bold">
            計算結果
          </div>
          {fields.map((f) => (
            <div
              key={f.key}
              className="flex justify-between items-center px-4 py-3 border-b border-slate-100 bg-white last:border-b-0"
            >
              <span className="text-sm text-slate-500">{f.label}</span>
              <span className="text-lg font-bold" style={{ color: f.color }}>
                {fmt(result[f.key])}{" "}
                <span className="text-sm font-normal">{f.unit}</span>
              </span>
            </div>
          ))}
        </div>
      )}

      <p className="text-sm font-bold text-slate-700 mb-2">公式早見表</p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100">
              {["求めるもの", "公式①", "公式②", "公式③"].map((h) => (
                <th
                  key={h}
                  className="border border-slate-200 px-2 py-1.5 text-slate-500 font-semibold"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {formulas.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                {row.map((c, ci) => (
                  <td
                    key={ci}
                    className="border border-slate-200 px-2 py-1.5 text-center"
                    style={{
                      color: ci === 0 ? "#1e293b" : "#7c3aed",
                      fontWeight: ci === 0 ? 700 : 400,
                    }}
                  >
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

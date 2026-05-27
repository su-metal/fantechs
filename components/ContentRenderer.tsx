import React from "react";

function inlineRender(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="text-slate-800">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    )
  );
}

export default function ContentRenderer({ content }: { content: string }) {
  const lines = content.split("\n");
  const out: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const l = lines[i];

    if (l.startsWith("## ")) {
      out.push(
        <h2
          key={i}
          className="text-lg font-bold text-slate-800 mt-5 mb-2 border-b-2 border-slate-200 pb-1"
        >
          {l.slice(3)}
        </h2>
      );
    } else if (l.startsWith("### ")) {
      out.push(
        <h3 key={i} className="text-sm font-bold text-slate-700 mt-4 mb-1.5">
          {l.slice(4)}
        </h3>
      );
    } else if (l.startsWith("**") && l.endsWith("**") && l.length > 4) {
      out.push(
        <p key={i} className="font-bold text-slate-800 my-1.5">
          {l.slice(2, -2)}
        </p>
      );
    } else if (l.startsWith("- ")) {
      out.push(
        <li key={i} className="ml-4 mb-1 text-slate-600 leading-relaxed list-disc">
          {inlineRender(l.slice(2))}
        </li>
      );
    } else if (l.startsWith("| ")) {
      const tbl: string[] = [];
      while (i < lines.length && lines[i].startsWith("| ")) {
        tbl.push(lines[i]);
        i++;
      }
      const rows = tbl.filter((r) => !r.match(/^\|[-| ]+\|$/));
      out.push(
        <div key={`t${i}`} className="overflow-x-auto my-3">
          <table className="border-collapse w-full text-xs">
            <tbody>
              {rows.map((r, ri) => {
                const cells = r
                  .split("|")
                  .filter((_, ci) => ci > 0 && ci < r.split("|").length - 1);
                return (
                  <tr
                    key={ri}
                    className={
                      ri === 0
                        ? "bg-slate-100"
                        : ri % 2 === 0
                        ? "bg-white"
                        : "bg-slate-50"
                    }
                  >
                    {cells.map((c, ci) => (
                      <td
                        key={ci}
                        className="border border-slate-200 px-2.5 py-1.5 text-slate-700 whitespace-nowrap"
                        style={{ fontWeight: ri === 0 ? 700 : 400 }}
                      >
                        {c.trim()}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
      continue;
    } else if (l.trim() === "") {
      out.push(<div key={i} className="h-1.5" />);
    } else {
      out.push(
        <p key={i} className="text-slate-600 leading-relaxed my-1">
          {inlineRender(l)}
        </p>
      );
    }
    i++;
  }

  return <>{out}</>;
}

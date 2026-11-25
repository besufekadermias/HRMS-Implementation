import { getDemoLogin } from "./installDemo.js";

export default function DemoLoginControls({ onSelect, disabled }) {
  return (
    <div className="mt-3 space-y-2">
      {["EMPLOYEE", "DEPARTMENT_HEAD"].map((role) => (
        <button
          key={role}
          type="button"
          disabled={disabled}
          className="min-h-11 w-full rounded-lg border border-border bg-white px-4 py-2 text-[13px] font-semibold text-text-secondary hover:bg-page disabled:opacity-50"
          onClick={() => onSelect(getDemoLogin(role))}
        >
          {role === "EMPLOYEE"
            ? "Use employee demo"
            : "Use department head demo"}
        </button>
      ))}
      <p className="text-center text-[11px] leading-relaxed text-muted">
        Demo accounts reset when you reload. If you change a password, use your
        new password until then.
      </p>
    </div>
  );
}

import { motion } from "framer-motion";
import { useState } from "react";

export const AuthPanel = ({
  title,
  subtitle,
  submitLabel,
  fields,
  onSubmit,
  footer
}) => {
  const [form, setForm] = useState(
    fields.reduce((accumulator, field) => {
      accumulator[field.name] = "";
      return accumulator;
    }, {})
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await onSubmit(form);
    } catch (submissionError) {
      setError(submissionError.response?.data?.message || "Unable to continue.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-[32px] border border-white/10 bg-white/10 p-8 shadow-glow backdrop-blur-2xl"
    >
      <p className="text-xs uppercase tracking-[0.35em] text-accent">NovaMind AI</p>
      <h1 className="mt-4 text-3xl font-semibold text-white">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-slate-300">{subtitle}</p>

      <div className="mt-8 space-y-4">
        {fields.map((field) => (
          <label key={field.name} className="block">
            <span className="mb-2 block text-sm text-slate-200">{field.label}</span>
            <input
              required
              name={field.name}
              type={field.type}
              value={form[field.name]}
              onChange={handleChange}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
            />
          </label>
        ))}
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 w-full rounded-2xl bg-gradient-to-r from-accent via-emerald-300 to-highlight px-4 py-3 font-medium text-slate-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? "Please wait..." : submitLabel}
      </button>

      <div className="mt-6">{footer}</div>
    </motion.form>
  );
};

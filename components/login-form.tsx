"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });

    const data = (await response.json()) as { error?: string; redirectTo?: string };

    if (!response.ok) {
      setError(data.error ?? "Login gagal.");
      setIsSubmitting(false);
      return;
    }

    router.push(data.redirectTo ?? "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Email */}
      <div className="lf-field">
        <label className="lf-label" htmlFor="email">
          Login / Email
        </label>
        <div className="lf-input-wrap">
          <svg className="lf-icon" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="9" cy="6.5" r="3" />
            <path d="M2 16c0-3.31 3.13-6 7-6s7 2.69 7 6" strokeLinecap="round" />
          </svg>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="nama@email.com"
            className="lf-input"
          />
        </div>
      </div>

      {/* Password */}
      <div className="lf-field">
        <label className="lf-label" htmlFor="password">
          Password
        </label>
        <div className="lf-input-wrap">
          <svg className="lf-icon" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3.5" y="8.5" width="11" height="7.5" rx="1.5" />
            <path d="M6 8.5V6a3 3 0 016 0v2.5" strokeLinecap="round" />
            <circle cx="9" cy="12.25" r="1.1" fill="currentColor" stroke="none" />
          </svg>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            placeholder="••••••••"
            className="lf-input lf-input-pwd"
          />
          <button
            type="button"
            className="lf-eye-btn"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
          >
            {showPassword ? (
              <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                <path d="M2 2l14 14" strokeLinecap="round" />
                <path d="M7.7 7.76a2.5 2.5 0 002.56 2.56" strokeLinecap="round" />
                <path d="M5.5 5.7C3.8 6.8 2.6 8.3 2 9c1.1 2.7 3.7 4.5 7 4.5 1.2 0 2.3-.3 3.3-.8M9 4.5c3.1.2 5.5 2.1 6.5 4.5-.4.9-1 1.8-1.7 2.5" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                <path d="M2 9c1.1-2.7 3.7-4.5 7-4.5S15.9 6.3 17 9c-1.1 2.7-3.7 4.5-7 4.5S3.1 11.7 2 9z" />
                <circle cx="9" cy="9" r="2.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="lf-error">
          <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 flex-shrink-0">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4" />
            <path d="M7 4.5v3M7 9.5v.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          {error}
        </div>
      )}

      {/* Submit */}
      <button type="submit" className="lf-submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <span className="lf-spinner" />
            Memproses...
          </>
        ) : (
          "Masuk"
        )}
      </button>
    </form>
  );
}

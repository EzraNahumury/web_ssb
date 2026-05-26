import { redirect } from "next/navigation";
import Image from "next/image";
import { LoginForm } from "@/components/login-form";
import { ParticleBackground } from "@/components/particle-background";
import { DashboardIllustration } from "@/components/dashboard-illustration";
import { LoginPreloader } from "@/components/login-preloader";
import { getAuthorizedAdminSession } from "@/lib/admin-access";
import { getAuthorizedDashboardSession } from "@/lib/dashboard-access";

export default async function LoginPage() {
  const adminSession = await getAuthorizedAdminSession();
  if (adminSession) redirect("/admin");

  const access = await getAuthorizedDashboardSession();
  if (access) redirect("/dashboard");

  return (
    <LoginPreloader>
    <div className="login-page">
      <ParticleBackground />

      <div className="login-split">

        {/* ── LEFT: Form Card ──────────────────────── */}
        <div className="ls-form-side">
          <div className="lc-card">
            {/* Top accent bar */}
            <div className="lc-accent-bar" />

            {/* Header — logo left, text right */}
            <div className="lc-header">
              <div className="lc-avatar">
                <Image
                  src="/logo/1.png"
                  alt="Ayres"
                  width={100}
                  height={28}
                  className="lc-avatar-img"
                  priority
                />
              </div>
              <div className="lc-header-text">
                <h2 className="lc-header-title">Selamat datang</h2>
                <p className="lc-header-sub">Masuk ke Dashboard Academy Partner</p>
              </div>
            </div>

            {/* Form body */}
            <div className="lc-body">
              <LoginForm />

              <p className="lc-terms">
                <svg viewBox="0 0 18 18" fill="none" width="14" height="14" style={{ minWidth: 14, flexShrink: 0 }}>
                  <circle cx="9" cy="9" r="8" fill="#FF3B30" />
                  <path d="M6 9.5l2 2 4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Dengan masuk, kamu setuju dengan <a href="#" className="lc-terms-link">Ketentuan Layanan</a></span>
              </p>

            </div>

            {/* Copyright di paling bawah card */}
            <p className="lc-footer-copy">© 2026 Ayres Apparel · Academy Partner</p>
          </div>
        </div>

        {/* ── RIGHT: Branding Visual ───────────────── */}
        <div className="ls-brand-side">
          <div className="ls-glow-a" />
          <div className="ls-glow-b" />

          <div className="ls-brand-content">
            {/* Heading */}
            <h1 className="ls-hero-title">
              <span className="ls-hero-italic">Welcome to the</span>
              <br />
              <span className="ls-hero-accent">Ayres Academy</span>
            </h1>

            <p className="ls-hero-sub">
              Kelola profil klub, peserta aktif, ukuran jersey,
              dan data wali dalam satu platform performa tinggi.
            </p>

            {/* 3D Illustration */}
            <div className="ls-illust-svg">
              <DashboardIllustration />
            </div>
          </div>
        </div>

      </div>
    </div>
    </LoginPreloader>
  );
}

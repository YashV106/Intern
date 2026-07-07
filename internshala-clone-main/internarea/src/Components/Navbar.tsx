import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { auth, provider } from "../firebase/firebase";
import { Search } from "lucide-react";
import { signInWithPopup, signOut } from "firebase/auth";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { selectuser } from "@/Feature/Userslice";
import { useLanguage } from "@/context/LanguageContext";

interface User {
  name: string;
  email: string;
  photo: string;
}

type OtpState = {
  email: string;
  otp: string;
  expiresAt: number | null;
};

const Navbar = () => {
  const user = useSelector(selectuser) as User | null;
  const { language, setLanguage, t } = useLanguage();

  const [showFrenchVerify, setShowFrenchVerify] = useState(false);
  const [otpState, setOtpState] = useState<OtpState>({
    email: "",
    otp: "",
    expiresAt: null,
  });
  const [otpError, setOtpError] = useState<string | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const apiBase = useMemo(() => {
    // Works for local dev and basic deployments.
    return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  }, []);

  useEffect(() => {
    if (!showFrenchVerify) return;
    if (!otpState.expiresAt) return;

    const update = () => {
      const diff = otpState.expiresAt ? otpState.expiresAt - Date.now() : 0;
      setSecondsLeft(Math.max(0, Math.floor(diff / 1000)));
    };

    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [showFrenchVerify, otpState.expiresAt]);

  const handlelogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      toast.success(t("loginSuccess"));
    } catch (error) {
      console.error(error);
      toast.error(t("loginFailed"));
    }
  };

  const handlelogout = () => {
    signOut(auth);
  };

  const openFrenchVerify = () => {
    setOtpError(null);
    setOtpState({ email: "", otp: "", expiresAt: null });
    setSecondsLeft(0);
    setShowFrenchVerify(true);
  };

const sendOtp = async () => {
    setOtpError(null);

    if (!otpState.email || otpState.email.trim().length < 3) {
      setOtpError(t("frEmailPlaceholder"));
      return;
    }

    setSendingOtp(true);
    try {
      const response = await fetch(`${apiBase}/api/french-otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpState.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setOtpError(data?.error || "Failed to send OTP");
        return;
      }

      setOtpState((prev) => ({
        ...prev,
        otp: "",
        expiresAt: data.expiresAt,
      }));
    } catch (e) {
      console.error(e);
      setOtpError("Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    setOtpError(null);

    if (!otpState.email) {
      setOtpError("Email missing");
      return;
    }

    if (!otpState.otp || otpState.otp.length !== 6) {
      setOtpError(t("frOtpInvalid"));
      return;
    }

    if (otpState.expiresAt && Date.now() > otpState.expiresAt) {
      setOtpError(t("frOtpExpired"));
      return;
    }

    setVerifyingOtp(true);
    try {
      const response = await fetch(`${apiBase}/api/french-otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpState.email, otp: otpState.otp }),
      });

      const data = await response.json();
      if (!response.ok) {
        setOtpError(data?.error || t("frOtpInvalid"));
        return;
      }

      setLanguage("fr");
      window.localStorage.setItem("selectedLanguage", "fr");
      toast.success(t("frLanguageEnabled"));
      setShowFrenchVerify(false);
    } catch (e) {
      console.error(e);
      setOtpError("OTP verification failed");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedLanguage = event.target.value as any;

    if (selectedLanguage === "fr") {
      // Do not switch language yet
      openFrenchVerify();
      return;
    }

    setLanguage(selectedLanguage);
    window.localStorage.setItem("selectedLanguage", selectedLanguage);
  };

  return (
    <div className="relative">
      {/* French verify modal */}
      {showFrenchVerify && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-[420px] rounded-lg shadow-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Verify</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowFrenchVerify(false)}
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={otpState.email}
                  onChange={(e) =>
                    setOtpState((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="Enter your email address"
                  className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={sendingOtp}
                />
              </div>

              {otpState.expiresAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("frOtpLabel")}
                    <div className="text-xs text-gray-500 mt-1">
                      {t("frOtpExpiresIn")} {secondsLeft}s
                    </div>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={otpState.otp}
                    onChange={(e) =>
                      setOtpState((prev) => ({ ...prev, otp: e.target.value }))
                    }
                    placeholder={t("frOtpPlaceholder")}
                    className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={verifyingOtp}
                  />
                </div>
              )}

              {otpError && (
                <div className="text-sm text-red-600">{otpError}</div>
              )}

              <div className="flex gap-2">
                {!otpState.expiresAt ? (
                  <button
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
                    onClick={sendOtp}
                    disabled={sendingOtp}
                  >
                    SEND OTP
                  </button>
                ) : (
                  <button
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
                    onClick={verifyOtp}
                    disabled={verifyingOtp}
                  >
                    {verifyingOtp ? t("frVerifyOtp") : t("frVerifyOtp")}
                  </button>
                )}

                {otpState.expiresAt && (
                  <button
                    className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-60"
                    onClick={sendOtp}
                    disabled={sendingOtp}
                  >
                    {t("frResendOtp")}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex-shrink-0">
              <a href="/" className="text-xl font-bold text-blue-600">
                <img src="/logo.png" alt={t("internArea")} className="h-16" />
                <span className="sr-only">{t("internArea")}</span>
              </a>
            </div>


            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
                <Link href="/internship">
                  <span>{t("navInternships")}</span>
                </Link>
              </button>
              <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
                <Link href="/job">
                  <span>{t("navJobs")}</span>
                </Link>
              </button>
              <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
                <Link href="/public-space">
                  <span>{t("navPublicSpace")}</span>
                </Link>
              </button>


              <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                <Search size={16} className="text-gray-400" />
                <input
                  type="text"
                  placeholder={t("navSearch")}
                  className="ml-2 bg-transparent focus:outline-none text-sm w-48"
                />
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <select
                value={language}
                onChange={handleLanguageChange}
                className="rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="hi">हिंदी</option>
                <option value="pt">Português</option>
                <option value="zh">中文</option>
                <option value="fr">Français</option>
              </select>

              {user ? (
                <div className="relative flex">
                  <button className="flex items-center space-x-2">
                    {" "}
                    <Link href="/profile">
                      <img
                        src={user.photo || "/file.svg"}
                        alt={user.name ? `${user.name} profile photo` : "Profile photo"}
                        className="w-8 h-8 rounded-full"
                      />
                    </Link>
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2  text-gray-700  hover:bg-gray-200 rounded-lg"
                    onClick={handlelogout}
                  >
                    {t("navLogout")}
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={handlelogin}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 flex items-center justify-center space-x-2 hover:bg-gray-50 "
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="text-gray-700">{t("navContinueWithGoogle")}</span>
                  </button>

                  <a href="/adminlogin" className="text-gray-600 hover:text-gray-800">
                    {t("navAdmin")}
                  </a>
                </>
              )}
            </div>
          </div>{" "}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;


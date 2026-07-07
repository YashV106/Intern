import axios from "axios";
import { useRouter } from "next/router";
import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useLanguage } from "@/context/LanguageContext";

type LoginChallenge = {
  challenge: "REQUIRES_OTP";
  email: string;
  expiresAt?: number;
};

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const apiBase = useMemo(() => {
    return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  }, []);

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const [otpRequired, setOtpRequired] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [challengeEmail, setChallengeEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [isLoading, setIsLoading] = useState(false);

  const verifyOtp = async () => {
    if (!challengeEmail) {
      setErrorMessage("Missing OTP challenge context. Please login again.");
      return;
    }
    if (!otpCode || otpCode.length !== 6) {
      setErrorMessage(t("frOtpInvalid") || "Enter a valid 6-digit OTP");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");

      const res = await axios.post(`${apiBase}/api/auth/verify-otp`, {
        email: challengeEmail,
        otp: otpCode,
      });

      const token = res.data?.token;
      if (!token) {
        throw new Error("Token missing");
      }

      window.localStorage.setItem("token", token);
      toast.success("Logged in successfully");
      if (router.pathname !== "/profile") router.push("/profile");
    } catch (e: any) {
      const msg = e?.response?.data?.error || "OTP verification failed";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const onLogin = async (forResend: boolean = false) => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const res = await axios.post(
        `${apiBase}/api/auth/login`,
        {
          email: credentials.email,
          password: credentials.password,
        },
        {
          validateStatus: (status) => true,
        }
      );

      if (res.status === 200) {
        const token = res.data?.token;
        if (!token) throw new Error("Token missing");
        window.localStorage.setItem("token", token);
        toast.success("Logged in successfully");
        if (router.pathname !== "/profile") router.push("/profile");
        return;
      }

      if (res.status === 403) {
        setErrorMessage(res.data?.error || "Mobile access is restricted");
        setOtpRequired(false);
        return;
      }

      if (res.status === 202) {
        const data = res.data as LoginChallenge;
        setChallengeEmail(data.email);
        setOtpRequired(true);
        setOtpCode("");
        return;
      }

      setErrorMessage(res.data?.error || "Login failed");
    } catch (err: any) {
      setErrorMessage(err?.message || "Login failed");
      if (!forResend) setOtpRequired(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-4 pt-[96px] pb-12">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Login
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your credentials to continue
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {!otpRequired ? (
            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                onLogin(false);
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={credentials.email}
                  onChange={(e) =>
                    setCredentials((p) => ({ ...p, email: e.target.value }))
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="you@example.com"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials((p) => ({ ...p, password: e.target.value }))
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>

              {errorMessage && (
                <div className="text-sm text-red-600">{errorMessage}</div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  OTP
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter 6-digit OTP"
                  disabled={isLoading}
                />
              </div>

              {errorMessage && (
                <div className="text-sm text-red-600">{errorMessage}</div>
              )}

              <button
                onClick={(e) => {
                  e.preventDefault();
                  verifyOtp();
                }}
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Verifying..." : "Verify"}
              </button>

              <button
                onClick={() => onLogin(true)}
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-800 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Resend OTP
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

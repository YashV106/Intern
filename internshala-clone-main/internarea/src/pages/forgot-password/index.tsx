import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const apiBase =
    process.env.NEXT_PUBLIC_BACKEND_URL || "https://internarea-a04s.onrender.com";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateLocal = () => {
    const value = inputValue.trim();

    if (!value) {
      setIsError(true);
      setStatusMessage("Please enter a valid email or phone number");
      return false;
    }

    const isEmail = emailRegex.test(value);
    const digits = value.replace(/[^0-9]/g, "");
    const isPhone = digits.length >= 10 && digits.length <= 15;

    if (!isEmail && !isPhone) {
      setIsError(true);
      setStatusMessage("Please enter a valid email or phone number");
      return false;
    }

    setIsError(false);
    setStatusMessage("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateLocal()) return;

    try {
      setIsLoading(true);

      await axios.post(`${apiBase}/api/auth/forgot-password`, {
        identifier: inputValue,
      });

      setIsError(false);
      setStatusMessage("Your new password has been sent via email/SMS.");
      setInputValue("");
      router.push("/");
    } catch (err: any) {
      const httpStatus = err?.response?.status;
      if (httpStatus === 429) {
        setIsError(true);
        setStatusMessage("You can use this option only once per day.");
        return;
      }

      const message = err?.response?.data?.error || "Unexpected error";
      setIsError(true);
      setStatusMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          {t("Forgot Password") || "Forgot Password"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your registered email address or phone number.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="identifier"
                className="block text-sm font-medium text-gray-700"
              >
                Email or Phone
              </label>

              {statusMessage && (
                <div
                  className={`mt-2 text-sm ${
                    isError ? "text-red-600" : "text-green-600"
                  }`}
                  role="alert"
                  aria-live="polite"
                >
                  {statusMessage}
                </div>
              )}

              <input
                id="identifier"
                name="identifier"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="mt-1 block w-full text-black rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com or 9876543210"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/")}
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60"
            >
              Back to home
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

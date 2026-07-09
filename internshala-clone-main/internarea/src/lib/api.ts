import axios from "axios";

const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL;
if (!apiBase) {
  // In production, localhost fallback breaks API calls. Fail fast.
  throw new Error(
    "Missing NEXT_PUBLIC_BACKEND_URL. Set it in Netlify environment variables to point to your Express backend (e.g. https://your-backend.onrender.com)."
  );
}

function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("token");
}

function withAuthHeaders() {
  const token = getToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export const api = {
  async getResumeLatest(studentId: string) {
    return axios.get(`${apiBase}/api/resume/latest`, {
      params: { studentId },
      headers: withAuthHeaders(),
    });
  },

  async submitPremiumResumeForm(payload: {
    studentId: string;
    name: string;
    qualifications?: string;
    experience?: string;
    personalInformation?: string;
    photoFile?: File;
  }) {
    const fd = new FormData();
    fd.append("studentId", payload.studentId);
    fd.append("name", payload.name);
    if (payload.qualifications !== undefined) fd.append("qualifications", payload.qualifications);
    if (payload.experience !== undefined) fd.append("experience", payload.experience);
    if (payload.personalInformation !== undefined)
      fd.append("personalInformation", payload.personalInformation);

    if (payload.photoFile) {
      fd.append("photo", payload.photoFile);
    }

    return axios.post(`${apiBase}/api/premium-resume/submit-form`, fd, {
      headers: {
        ...withAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
  },

  async sendPremiumResumeOtp(payload: { studentId: string; email: string }) {
    return axios.post(`${apiBase}/api/premium-resume/send-otp`, payload, {
      headers: { ...withAuthHeaders() },
    });
  },

  async verifyOtpAndCreateOrder(payload: { studentId: string; email: string; otp: string }) {
    return axios.post(
      `${apiBase}/api/premium-resume/verify-otp-and-create-order`,
      payload,
      { headers: { ...withAuthHeaders() } }
    );
  },

  async verifyPaymentAndGenerate(payload: {
    studentId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    return axios.post(
      `${apiBase}/api/premium-resume/verify-payment-and-generate`,
      payload,
      { headers: { ...withAuthHeaders() } }
    );
  },

  async createSubscriptionOrder(payload: {
    studentId: string;
    premiumEmailVerified: boolean;
    plan: "bronze" | "silver" | "gold";
  }) {
    return axios.post(`${apiBase}/api/payment/create-order`, payload, {
      headers: { ...withAuthHeaders() },
    });
  },

  async verifySubscriptionPayment(payload: {
    studentId: string;
    orderId: string;
    paymentId: string;
    signature: string;
  }) {
    return axios.post(`${apiBase}/api/payment/verify`, payload, {
      headers: { ...withAuthHeaders() },
    });
  },

  async getApplicationList() {
    return axios.get(`${apiBase}/api/application`, {
      headers: { ...withAuthHeaders() },
    });
  },

  async getProfileLoginHistory(params: { page: number; pageSize: number }) {
    return axios.get(`${apiBase}/api/users/profile/login-history`, {
      params,
      headers: { ...withAuthHeaders() },
    });
  },
};

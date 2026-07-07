import Footer from "@/Components/Fotter";
import Navbar from "@/Components/Navbar";
import AuthenticatedLayout from "@/Components/layouts/AuthenticatedLayout";
import { LanguageProvider } from "@/context/LanguageContext";
import type { AppProps } from "next/app";
import { store } from "../store/store";
import { Provider, useDispatch } from "react-redux";
import { useEffect } from "react";
import { auth } from "@/firebase/firebase";
import { login, logout } from "@/Feature/Userslice";
import { ToastContainer } from "react-toastify";
import { useRouter } from "next/router";

/**
 * Ensure CSS side-effects are applied even if TS lacks CSS module typings.
 * Next.js requires global CSS to be imported, but some TS configs may error on side-effect imports.
 */
require("../styles/globals.css");
require("react-toastify/dist/ReactToastify.css");

export default function App({ Component, pageProps }: AppProps) {
  function AuthListener() {
    const dispatch = useDispatch();
    useEffect(() => {
      auth.onAuthStateChanged((authuser) => {
        if (authuser) {
          dispatch(
            login({
              uid: authuser.uid,
              photo: authuser.photoURL,
              name: authuser.displayName,
              email: authuser.email,
              phoneNumber: authuser.phoneNumber,
            })
          );
        } else {
          dispatch(logout());
        }
      });
    }, [dispatch]);
    return null;
  }

  const router = useRouter();
  const path = router.asPath?.split("?")[0] || "";

  // Authenticated area routes (dashboard-style pages).
  // We show the existing Navbar via a shared layout and keep it fixed at the top.
  const isAuthRoute =
    path === "/profile" ||
    path === "/upgrade" ||
    path === "/resume-builder" ||
    path === "/payment-history" ||
    path === "/userapplication" ||
    path === "/applications" ||
    path.startsWith("/dashboard/") ||
    path.startsWith("/applications") ||
    path.startsWith("/adminpanel") ||
    path.startsWith("/adminlogin");

  return (
    <Provider store={store}>
      <LanguageProvider>
        <AuthListener />
        <div className="bg-white">
          <ToastContainer />

          {isAuthRoute ? (
            <AuthenticatedLayout>
              <Component {...pageProps} />
            </AuthenticatedLayout>
          ) : (
            <>
              <Navbar />
              <Component {...pageProps} />
              <Footer />
            </>
          )}
        </div>
      </LanguageProvider>
    </Provider>
  );
}

import "@/styles/globals.css";

if (typeof window !== "undefined") {
  fetch("/api/socket");
}

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

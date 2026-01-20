export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "1rem",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "4rem", margin: "0" }}>404</h1>
      <h2 style={{ fontSize: "1.5rem", margin: "1rem 0" }}>Page Not Found</h2>
      <p style={{ color: "#666", marginBottom: "2rem" }}>
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <a
        href="/"
        style={{
          padding: "0.75rem 1.5rem",
          background: "#0070f3",
          color: "white",
          textDecoration: "none",
          borderRadius: "0.5rem",
        }}
      >
        Go Home
      </a>
    </div>
  );
}

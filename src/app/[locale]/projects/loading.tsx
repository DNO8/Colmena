export default function ProjectsLoading() {
  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div
        style={{
          width: "200px",
          height: "32px",
          background: "#e0e0e0",
          borderRadius: "4px",
          marginBottom: "10px",
        }}
      />
      <div
        style={{
          width: "150px",
          height: "20px",
          background: "#e0e0e0",
          borderRadius: "4px",
          marginBottom: "20px",
        }}
      />

      <div
        style={{
          width: "150px",
          height: "40px",
          background: "#e0e0e0",
          borderRadius: "4px",
          marginBottom: "20px",
        }}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            style={{
              border: "1px solid #ddd",
              padding: "20px",
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "200px",
                background: "#e0e0e0",
                borderRadius: "4px",
                marginBottom: "15px",
              }}
            />
            <div
              style={{
                width: "80%",
                height: "24px",
                background: "#e0e0e0",
                borderRadius: "4px",
                marginBottom: "10px",
              }}
            />
            <div
              style={{
                width: "100%",
                height: "16px",
                background: "#e0e0e0",
                borderRadius: "4px",
                marginBottom: "8px",
              }}
            />
            <div
              style={{
                width: "60%",
                height: "16px",
                background: "#e0e0e0",
                borderRadius: "4px",
                marginBottom: "10px",
              }}
            />
            <div
              style={{
                width: "100px",
                height: "16px",
                background: "#e0e0e0",
                borderRadius: "4px",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

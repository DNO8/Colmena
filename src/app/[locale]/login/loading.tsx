export default function LoginLoading() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f5f5f5",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <div
          style={{
            width: "200px",
            height: "32px",
            background: "#e0e0e0",
            borderRadius: "4px",
            marginBottom: "30px",
          }}
        />

        {[1, 2].map((i) => (
          <div key={i} style={{ marginBottom: "20px" }}>
            <div
              style={{
                width: "100px",
                height: "16px",
                background: "#e0e0e0",
                borderRadius: "4px",
                marginBottom: "8px",
              }}
            />
            <div
              style={{
                width: "100%",
                height: "40px",
                background: "#e0e0e0",
                borderRadius: "4px",
              }}
            />
          </div>
        ))}

        <div
          style={{
            width: "100%",
            height: "45px",
            background: "#e0e0e0",
            borderRadius: "4px",
            marginTop: "20px",
          }}
        />
      </div>
    </div>
  );
}

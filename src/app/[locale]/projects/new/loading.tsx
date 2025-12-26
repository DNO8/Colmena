export default function NewProjectLoading() {
  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <div
        style={{
          width: "250px",
          height: "32px",
          background: "#e0e0e0",
          borderRadius: "4px",
          marginBottom: "20px",
        }}
      />

      <div style={{ marginTop: "20px" }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ marginBottom: "15px" }}>
            <div
              style={{
                width: "150px",
                height: "20px",
                background: "#e0e0e0",
                borderRadius: "4px",
                marginBottom: "5px",
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
            height: "50px",
            background: "#e0e0e0",
            borderRadius: "4px",
            marginTop: "20px",
          }}
        />
      </div>
    </div>
  );
}

"use client";

interface RoadmapItem {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  estimated_cost: string | null;
  order_index: number;
}

interface ProjectRoadmapProps {
  items: RoadmapItem[];
}

export default function ProjectRoadmap({ items }: ProjectRoadmapProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <h3 style={{ marginTop: "30px", marginBottom: "15px" }}>Roadmap</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {items.map((item, index) => (
          <div
            key={item.id}
            style={{
              padding: "15px",
              background: "#f9f9f9",
              borderRadius: "8px",
              borderLeft: "4px solid #0070f3",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <h4 style={{ margin: "0 0 8px 0" }}>
                {index + 1}. {item.title}
              </h4>
              {item.estimated_cost && (
                <span
                  style={{
                    background: "#0070f3",
                    color: "white",
                    padding: "4px 12px",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  {item.estimated_cost} XLM
                </span>
              )}
            </div>
            {item.description && (
              <p style={{ margin: "8px 0 0 0", color: "#666" }}>
                {item.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

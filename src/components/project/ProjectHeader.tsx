"use client";

import { useRouter } from "next/navigation";
import type { Project } from "@/lib/supabase/types";

interface ProjectHeaderProps {
  project: Project;
  isOwner: boolean;
  onPublish?: () => void;
  publishing?: boolean;
}

export default function ProjectHeader({
  project,
  isOwner,
  onPublish,
  publishing = false,
}: ProjectHeaderProps) {
  const router = useRouter();

  return (
    <>
      <img
        src={project.cover_image_url}
        alt={project.title}
        style={{
          width: "100%",
          height: "300px",
          objectFit: "cover",
          borderRadius: "8px",
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginTop: "20px",
        }}
      >
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: "0 0 10px 0" }}>{project.title}</h1>
          <p style={{ margin: "0 0 10px 0", color: "#666" }}>
            {project.short_description}
          </p>

          {project.status === "draft" && (
            <span
              style={{
                display: "inline-block",
                background: "#ffc107",
                color: "#000",
                padding: "4px 12px",
                borderRadius: "4px",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Draft
            </span>
          )}
        </div>

        {isOwner && (
          <div style={{ display: "flex", gap: "10px", marginLeft: "20px" }}>
            <button
              onClick={() => router.push(`/projects/${project.id}/edit`)}
              style={{
                padding: "10px 20px",
                background: "#0070f3",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "14px",
                whiteSpace: "nowrap",
              }}
            >
              ✏️ Edit Project
            </button>
            <button
              onClick={() => router.push(`/projects/${project.id}/roadmap`)}
              style={{
                padding: "10px 20px",
                background: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "14px",
                whiteSpace: "nowrap",
              }}
            >
              📋 Manage Roadmap
            </button>
            {project.status === "draft" && onPublish && (
              <button
                onClick={onPublish}
                disabled={publishing}
                style={{
                  padding: "10px 20px",
                  background: publishing ? "#ccc" : "#ff6b6b",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: publishing ? "not-allowed" : "pointer",
                  fontWeight: "500",
                  fontSize: "14px",
                  whiteSpace: "nowrap",
                }}
              >
                {publishing ? "Publishing..." : "🚀 Publish"}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Project } from "@/lib/supabase/types";

interface ProjectMedia {
  id: string;
  url: string;
  type: string;
  order_index: number;
}

interface RoadmapItem {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  estimated_cost: string | null;
  order_index: number;
}

interface Donation {
  id: string;
  donor_wallet: string;
  amount: string;
  asset: string;
  tx_hash: string;
  network: string;
  created_at: string;
}

export function useProject(projectId: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [galleryImages, setGalleryImages] = useState<ProjectMedia[]>([]);
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch project with cache busting
        console.log("[useProject] Fetching project:", projectId);
        const res = await fetch(`/api/projects/${projectId}?t=${Date.now()}`, {
          credentials: "include",
          cache: "no-store",
        });

        console.log("[useProject] Response status:", res.status);
        console.log("[useProject] Response headers:", {
          contentType: res.headers.get("content-type"),
          location: res.headers.get("location"),
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("[useProject] Error response:", text.substring(0, 200));
          throw new Error(`Failed to fetch project (${res.status})`);
        }

        // Verificar que la respuesta sea JSON
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text();
          console.error(
            "[useProject] Non-JSON response:",
            text.substring(0, 500),
          );
          throw new Error(`Invalid response format: ${contentType}`);
        }

        const data = await res.json();
        console.log("[useProject] Project data received:", data.project?.id);
        setProject(data.project);

        // Check ownership (solo si hay usuario)
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user && data.project.owner_id === user.id) {
          setIsOwner(true);
        }

        // Fetch gallery images
        console.log("[useProject] Fetching gallery images");
        const { data: mediaData } = await supabase
          .from("project_media")
          .select("*")
          .eq("project_id", projectId)
          .order("order_index", { ascending: true });

        if (mediaData) {
          console.log("[useProject] Gallery images loaded:", mediaData.length);
          setGalleryImages(mediaData as ProjectMedia[]);
        }

        // Fetch roadmap
        console.log("[useProject] Fetching roadmap");
        const roadmapRes = await fetch(`/api/projects/${projectId}/roadmap`, {
          credentials: "include",
        });

        console.log("[useProject] Roadmap response status:", roadmapRes.status);
        console.log(
          "[useProject] Roadmap content-type:",
          roadmapRes.headers.get("content-type"),
        );

        if (roadmapRes.ok) {
          const roadmapContentType = roadmapRes.headers.get("content-type");
          if (
            !roadmapContentType ||
            !roadmapContentType.includes("application/json")
          ) {
            const text = await roadmapRes.text();
            console.error(
              "[useProject] Roadmap non-JSON response:",
              text.substring(0, 500),
            );
          } else {
            const roadmapData = await roadmapRes.json();
            console.log(
              "[useProject] Roadmap items loaded:",
              roadmapData.items?.length || 0,
            );
            setRoadmapItems(roadmapData.items || []);
          }
        }

        // Fetch donations
        console.log("[useProject] Fetching donations");
        const { data: donationsData } = await supabase
          .from("donations")
          .select("*")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false })
          .limit(10);

        if (donationsData) {
          console.log("[useProject] Donations loaded:", donationsData.length);
          setDonations(donationsData as Donation[]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load project");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  return {
    project,
    galleryImages,
    roadmapItems,
    donations,
    isOwner,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      // Trigger re-fetch by updating a dependency
    },
  };
}

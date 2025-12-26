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

export function useProject(projectId: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [galleryImages, setGalleryImages] = useState<ProjectMedia[]>([]);
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch project with cache busting
        const res = await fetch(`/api/projects/${projectId}?t=${Date.now()}`, {
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch project");
        }

        const data = await res.json();
        setProject(data.project);

        // Check ownership
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user && data.project.owner_id === user.id) {
          setIsOwner(true);
        }

        // Fetch gallery images
        const { data: mediaData } = await supabase
          .from("project_media")
          .select("*")
          .eq("project_id", projectId)
          .order("order_index", { ascending: true });

        if (mediaData) {
          setGalleryImages(mediaData as ProjectMedia[]);
        }

        // Fetch roadmap
        const roadmapRes = await fetch(`/api/projects/${projectId}/roadmap`, {
          credentials: "include",
        });

        if (roadmapRes.ok) {
          const roadmapData = await roadmapRes.json();
          setRoadmapItems(roadmapData.items || []);
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
    isOwner,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      // Trigger re-fetch by updating a dependency
    },
  };
}

"use client";

import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

interface ProjectMedia {
  id: string;
  url: string;
  type: string;
  order_index: number;
}

interface ProjectGalleryProps {
  images: ProjectMedia[];
}

export default function ProjectGallery({ images }: ProjectGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      <h3 style={{ marginTop: "30px", marginBottom: "15px" }}>Gallery</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "10px",
        }}
      >
        {images.map((media, index) => (
          <img
            key={media.id}
            src={media.url}
            alt={`Gallery ${index + 1}`}
            onClick={() => {
              setLightboxIndex(index);
              setLightboxOpen(true);
            }}
            style={{
              width: "100%",
              height: "150px",
              objectFit: "cover",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          />
        ))}
      </div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={images.map((img) => ({ src: img.url }))}
        index={lightboxIndex}
      />
    </>
  );
}

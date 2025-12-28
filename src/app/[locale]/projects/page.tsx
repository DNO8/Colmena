import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { Project } from "@/lib/supabase/types";

async function getProjects(): Promise<Project[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/projects`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return data.projects || [];
  } catch (error) {
    return [];
  }
}

export default async function ProjectsPage() {
  const projects = await getProjects();
  const t = await getTranslations("projects");

  return (
    <div className="min-h-screen hex-pattern">
      {/* Header */}
      <div className="bg-[#FDCB6E] border-b-4 border-black py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-black mb-2">
                🐝 {t("projectsFeed")}
              </h1>
              <p className="font-mono text-black/70">
                {t("totalProjects")}: <span className="font-bold">{projects.length}</span> {t("activeProjects") || "proyectos activos"}
              </p>
            </div>
            <Link
              href="/projects/new"
              className="btn-brutal btn-brutal-dark text-lg self-start md:self-auto"
            >
              + {t("createProject")}
            </Link>
          </div>
        </div>
      </div>

      {/* Projects Grid - Masonry Style */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {projects.length === 0 ? (
          <div className="card-brutal p-12 text-center bg-white">
            <div className="text-6xl mb-4">🍯</div>
            <h2 className="text-2xl font-bold mb-2">{t("noProjects")}</h2>
            <p className="text-gray-600 mb-6">{t("beFirstToCreate") || "Sé el primero en crear un proyecto"}</p>
            <Link href="/projects/new" className="btn-brutal btn-brutal-primary">
              + {t("createProject")}
            </Link>
          </div>
        ) : (
          <div className="masonry-grid">
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} t={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ 
  project, 
  index, 
  t 
}: { 
  project: Project; 
  index: number;
  t: (key: string) => string;
}) {
  const progress = project.goal_amount 
    ? Math.min((Number(project.current_amount) / Number(project.goal_amount)) * 100, 100)
    : 0;

  return (
    <div className="masonry-item">
      <Link href={`/projects/${project.id}`} className="block group">
        <article className="card-brutal bg-white overflow-hidden">
          {/* Image */}
          <div className="relative overflow-hidden border-b-4 border-black">
            <Image
              src={project.cover_image_url}
              alt={project.title}
              width={400}
              height={300}
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI0ZEQ0I2RSIvPjwvc3ZnPg=="
            />
            {project.generated_cover && (
              <span className="absolute top-3 left-3 badge-brutal badge-brutal-secondary text-xs">
                ✨ AI
              </span>
            )}
            <span className="absolute top-3 right-3 badge-brutal badge-brutal-primary text-xs">
              {project.status === "published" ? "🟢 Live" : "📝 Draft"}
            </span>
          </div>

          {/* Content */}
          <div className="p-5">
            <h2 className="text-xl font-bold mb-2 group-hover:text-[#E67E22] transition-colors line-clamp-2">
              {project.title}
            </h2>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {project.short_description}
            </p>

            {/* Progress Bar */}
            {project.goal_amount && (
              <div className="mb-4">
                <div className="h-3 bg-gray-200 border-2 border-black overflow-hidden">
                  <div 
                    className="h-full bg-[#FDCB6E] transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 font-mono text-xs">
                  <span className="font-bold text-[#E67E22]">
                    {Number(project.current_amount).toLocaleString()} XLM
                  </span>
                  <span className="text-gray-500">
                    {Math.round(progress)}% of {Number(project.goal_amount).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t-2 border-black">
              <span className="font-mono text-xs text-gray-500">
                {project.category || "General"}
              </span>
              <span className="text-sm font-bold text-[#E67E22] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                {t("viewProject")} →
              </span>
            </div>
          </div>
        </article>
      </Link>
    </div>
  );
}

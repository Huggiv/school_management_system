import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=80",
];

interface Announcement {
  id: number;
  title: string;
  content: string;
}

interface EventItem {
  id: number;
  title: string;
  description: string;
  event_date: string;
}

interface GalleryItem {
  id: number;
  image: string;
  title: string;
  category: string;
}

export function HomePage() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const { data: announcements = [] } = useQuery({
    queryKey: ["home-announcements"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ items: Announcement[] }>("/api/v1/announcements", {
        params: { page: 1, size: 4, sort: "-id" },
      });
      return data.items;
    },
  });

  const { data: events = [] } = useQuery({
    queryKey: ["home-events"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ items: EventItem[] }>("/api/v1/events", {
        params: { page: 1, size: 4, sort: "event_date" },
      });
      return data.items;
    },
  });

  const { data: gallery = [] } = useQuery({
    queryKey: ["home-gallery"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ items: GalleryItem[] }>("/api/v1/gallery", {
        params: { page: 1, size: 6, sort: "-id" },
      });
      return data.items;
    },
  });

  const stats = useMemo(
    () => [
      { label: "Students", value: "10,000+" },
      { label: "Teachers", value: "500+" },
      { label: "Classes", value: "120" },
      { label: "Achievements", value: "300+" },
    ],
    [],
  );

  return (
    <main>
      <section
        className="hero"
        style={{ backgroundImage: `linear-gradient(120deg, rgba(7,27,63,.75), rgba(2,76,120,.5)), url(${HERO_IMAGES[activeIndex]})` }}
      >
        <div className="container hero-inner">
          <p className="eyebrow">Welcome to School Management Portal</p>
          <h1>Future-Focused Learning Community</h1>
          <p>
            A modern platform for students, parents, teachers, and administrators to connect, manage,
            and celebrate every milestone.
          </p>
        </div>
      </section>

      <section className="container stats-grid">
        {stats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </article>
        ))}
      </section>

      <section className="container feature-grid">
        <article className="panel">
          <h2>Principal Message</h2>
          <p>
            We believe in building character alongside academic excellence. This portal helps us stay
            transparent, responsive, and student-centered.
          </p>
        </article>
        <article className="panel">
          <h2>Latest Announcements</h2>
          <ul>
            {announcements.map((item) => (
              <li key={item.id}>
                <strong>{item.title}</strong>
                <p>{item.content}</p>
              </li>
            ))}
            {!announcements.length && <li>No announcements published yet.</li>}
          </ul>
        </article>
      </section>

      <section className="container feature-grid">
        <article className="panel">
          <h2>Upcoming Events</h2>
          <ul>
            {events.map((item) => (
              <li key={item.id}>
                <strong>{item.title}</strong>
                <p>
                  {item.description} • {new Date(item.event_date).toLocaleDateString()}
                </p>
              </li>
            ))}
            {!events.length && <li>No events scheduled yet.</li>}
          </ul>
        </article>
        <article className="panel">
          <h2>Featured Gallery</h2>
          <div className="gallery-grid">
            {gallery.slice(0, 4).map((item) => (
              <figure key={item.id}>
                <img alt={item.title} src={item.image} />
                <figcaption>{item.title}</figcaption>
              </figure>
            ))}
            {!gallery.length && <p>Gallery images will appear here.</p>}
          </div>
        </article>
      </section>

      <footer className="portal-footer">
        <div className="container">
          <p>Contact: +1 000-000-0000 • info@school.local</p>
          <div className="socials">
            <a href="#" rel="noreferrer" target="_blank">
              Facebook
            </a>
            <a href="#" rel="noreferrer" target="_blank">
              Instagram
            </a>
            <a href="#" rel="noreferrer" target="_blank">
              YouTube
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

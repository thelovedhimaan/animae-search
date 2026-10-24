import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return { name: "Anime Index", short_name: "Anime Index", description: "Discover anime, characters, ratings and official viewing links.", start_url: "/", display: "standalone", background_color: "#080b12", theme_color: "#d6ff4b", icons: [{ src: "/icon", sizes: "64x64", type: "image/png" }] };
}

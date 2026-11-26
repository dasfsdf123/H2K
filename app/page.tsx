import { getContent } from "@/lib/content";
import Home from "./Home";

// Sanity changes appear on the site within about a minute, and Sanity is called at most once per minute.
export const revalidate = 60;

export default async function Page() {
  const content = await getContent();
  return <Home content={content} />;
}

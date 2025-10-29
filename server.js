import { file } from "bun";
import { readdir } from "fs/promises";

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    let pathname = url.pathname;
    
    // Serve from dist folder
    if (pathname === "/" || pathname === "") {
      pathname = "/index.html";
    }
    
    const filePath = `./dist${pathname}`;
    const fileContent = file(filePath);
    
    if (await fileContent.exists()) {
      // Set proper content type
      const contentType = getContentType(pathname);
      return new Response(fileContent, {
        headers: { "Content-Type": contentType }
      });
    }
    
    return new Response("Not Found", { status: 404 });
  },
});

function getContentType(pathname) {
  if (pathname.endsWith(".html")) return "text/html";
  if (pathname.endsWith(".css")) return "text/css";
  if (pathname.endsWith(".js")) return "application/javascript";
  if (pathname.endsWith(".json")) return "application/json";
  return "text/plain";
}

console.log(`🚀 Server running at http://localhost:${server.port}`);

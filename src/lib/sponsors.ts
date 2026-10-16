import fs from "fs"; import path from "path";
export type SponsorRequest = { id:string; business:string; contact:string; email:string; website?:string; tier:string; message?:string; status:"pending_approval"; createdAt:string; };
const file = path.join(process.cwd(), "data", "sponsors.json");
export function readSponsors(): SponsorRequest[] { try { return JSON.parse(fs.readFileSync(file,"utf8")); } catch { return []; } }
export function addSponsor(r: Omit<SponsorRequest,"id"|"status"|"createdAt">): SponsorRequest {
  const all = readSponsors(); const item: SponsorRequest = { ...r, id: Date.now().toString(36), status:"pending_approval", createdAt:new Date().toISOString() };
  fs.mkdirSync(path.dirname(file),{recursive:true}); fs.writeFileSync(file, JSON.stringify([...all,item],null,2)); return item;
}

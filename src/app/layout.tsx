import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css"; import Nav from "@/components/Nav"; import Footer from "@/components/Footer";
const geistSans = Geist({ variable:"--font-geist-sans", subsets:["latin"] });
const geistMono = Geist_Mono({ variable:"--font-geist-mono", subsets:["latin"] });
export const metadata: Metadata = { title:"LearnAIRight | AI Fluency for Teams and Independent Professionals", description:"LearnAIRight turns scattered AI use into repeatable, measurable workflows. Workflow-first training, a free foundations module, and Premium resources for teams and independent professionals. Independent guide — not affiliated with xAI." };
export default function RootLayout({children}:{children:React.ReactNode}){return(<html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}><body className="min-h-full flex flex-col bg-[#0f0e0c] text-zinc-100"><Nav/><main className="flex-1">{children}</main><Footer/></body></html>)}

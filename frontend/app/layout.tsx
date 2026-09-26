import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'MerchPilot AI', description: 'Your intelligent merchant copilot' };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }

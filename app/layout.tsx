import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'CARIOX | Brazilian Martial Arts',description:'Discipline. Connection. Evolution. Explore CARIOX Brazilian Martial Arts and the Salomão BJJ Team academy concept.', robots:{index:false,follow:false}};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>}

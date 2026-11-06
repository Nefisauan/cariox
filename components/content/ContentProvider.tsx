'use client';
import { createContext, useContext, type ReactNode } from 'react';
import { fallbackContent } from '../../lib/content/fallback';
import type { AcademyContent } from '../../lib/content/types';
const ContentContext = createContext<AcademyContent>(fallbackContent);
export function AcademyContentProvider({ content, children }: { content: AcademyContent; children: ReactNode }) { return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>; }
export const useAcademyContent = () => useContext(ContentContext);

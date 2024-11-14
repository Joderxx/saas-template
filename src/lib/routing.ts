import {createNavigation} from 'next-intl/navigation';
import {defineRouting} from 'next-intl/routing';
import {defaultLocale, locales} from "@/lib/languages";

export const routing = defineRouting({
  locales: locales,
  defaultLocale: defaultLocale,
  pathnames: {
    '/': '/',
  }
});

export type Pathnames = keyof typeof routing.pathnames;
export type Locale = (typeof routing.locales)[number];

export const {Link, getPathname, redirect, usePathname, useRouter} =
  createNavigation(routing);
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Package, Database, GitCompare, FlaskConical, ListChecks } from 'lucide-react';

const TOOLS = [
    { href: '/',                    label: 'API Tester',  Icon: Package },
    { href: '/database',            label: 'Database',    Icon: Database },
    { href: '/json-diff',           label: 'JSON Diff',   Icon: GitCompare },
    { href: '/playwright-testing',  label: 'PW Tests',    Icon: FlaskConical },
    { href: '/batch-runner',        label: 'Batch Runner', Icon: ListChecks },
];

export default function TopNavBar() {
    const { pathname } = useRouter();

    return (
        <nav className="h-12 border-b border-slate-200 bg-white flex items-center px-6 gap-6 shrink-0 sticky top-0 z-50">
            <span className="text-sm font-bold text-violet-700 tracking-tight mr-2">
                Perry&nbsp;ParcelRunner
            </span>
            {TOOLS.map(({ href, label, Icon }) => {
                const active = pathname === href;
                return (
                    <Link
                        key={href}
                        href={href}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                            ${active
                                ? 'bg-sky-600 text-white'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                            }`}
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                    </Link>
                );
            })}
        </nav>
    );
}

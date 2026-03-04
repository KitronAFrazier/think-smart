"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ComponentType } from "react";
import {
  Brain,
  BookOpen,
  CalendarDays,
  ChartColumn,
  Code,
  FileBadge,
  Flag,
  Gamepad2,
  GraduationCap,
  House,
  LayoutDashboard,
  Menu,
  MessageSquare,
  ScrollText,
  Sparkles,
  SpellCheck,
  Star,
  Landmark,
} from "lucide-react";

type SidebarProps = {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
};

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
};

const navSections: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Home",
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Academics",
    items: [
      { href: "/students", label: "My Students", icon: GraduationCap },
      { href: "/planner", label: "Lesson Planner", icon: CalendarDays },
      { href: "/progress", label: "Progress & Grades", icon: ChartColumn },
    ],
  },
  {
    label: "Community",
    items: [
      { href: "/community", label: "Community Hub", icon: MessageSquare, badge: "NEW" },
      { href: "/resources", label: "Resources", icon: Sparkles },
      { href: "/txlaws", label: "TX Laws & Info", icon: FileBadge },
    ],
  },
];

const studentNavSections: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Student Home",
    items: [{ href: "/student-app", label: "Student Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Learning",
    items: [
      { href: "/student-app?panel=curriculum", label: "Grade Curriculum", icon: ScrollText },
      { href: "/student-app?panel=practice-quizzes", label: "Practice Quizzes", icon: Brain },
      { href: "/student-app?panel=final-test", label: "Final Test", icon: Flag },
    ],
  },
  {
    label: "Games",
    items: [
      { href: "/student-app?panel=game-numbers", label: "Numbers", icon: Gamepad2 },
      { href: "/student-app?panel=game-spelling-typing", label: "Spelling & Typing", icon: SpellCheck },
      { href: "/student-app?panel=game-coding", label: "Coding", icon: Code },
      { href: "/student-app?panel=game-history", label: "History", icon: Landmark },
    ],
  },
  {
    label: "Rewards",
    items: [{ href: "/student-app?panel=points", label: "Points & Rewards", icon: Star }],
  },
];

export default function Sidebar({ sidebarOpen, onToggleSidebar }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const studentView = pathname.startsWith("/student-app");
  const navToRender = studentView ? studentNavSections : navSections;
  const panel = searchParams.get("panel");
  const currentHref = panel ? `${pathname}?panel=${panel}` : pathname;

  return (
    <aside className={`sidebar ${sidebarOpen ? "mobile-open" : "collapsed"}`} id="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-row">
          <div className="brand-logo">
            <div className="brand-icon" aria-hidden>
              <House className="icon-svg" />
            </div>
            <div>
              <div className="brand-name">The Logic Branch</div>
              <div className="brand-tagline">Texas Homeschool</div>
            </div>
          </div>
          {sidebarOpen ? (
            <button className="sidebar-menu-btn" onClick={onToggleSidebar} aria-label="Collapse sidebar" type="button">
              <Menu className="icon-svg" />
            </button>
          ) : null}
        </div>
      </div>

      <nav className="sidebar-nav">
        {navToRender.map((section) => (
          <div key={section.label}>
            <div className="nav-section-label">{section.label}</div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = currentHref === item.href || (!panel && pathname === item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${active ? "active" : ""}`}
                >
                  <span className="nav-icon">
                    <Icon className="icon-svg" />
                  </span>
                  {item.label}
                  {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <Link className="student-mode-btn" href={studentView ? "/dashboard" : "/student-app"}>
          <BookOpen className="icon-svg" />
          <span>{studentView ? "Switch to Parent View" : "Switch to Student View"}</span>
        </Link>
      </div>
    </aside>
  );
}

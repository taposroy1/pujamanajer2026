import React from 'react';
import { Project } from '../types';
import { formatBengaliCurrency, formatBengaliPercentage } from '../utils/bengali';
import { Construction, BookOpen, GraduationCap, HeartHandshake } from 'lucide-react';

interface ProjectSectionProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
}

export const ProjectSection: React.FC<ProjectSectionProps> = ({ projects, onSelectProject }) => {
  const getProjectIcon = (type: Project['icon']) => {
    switch (type) {
      case 'crane':
        return (
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100 shadow-xs">
            <Construction className="w-6 h-6" />
          </div>
        );
      case 'book':
        return (
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-xs">
            <BookOpen className="w-6 h-6" />
          </div>
        );
      case 'education':
        return (
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 shadow-xs">
            <GraduationCap className="w-6 h-6" />
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <HeartHandshake className="w-6 h-6" />
          </div>
        );
    }
  };

  return (
    <section className="px-4 py-5 max-w-2xl mx-auto" id="projects-section">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            আমাদের প্রকল্পসমূহ
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            মন্দিরের চলমান উন্নয়নমূলক ও ধর্মীয় উদ্যোগ
          </p>
        </div>
      </div>

      <div className="space-y-3.5">
        {projects.map((project) => {
          const percentageNumber = Math.min(100, Math.round((project.collected / project.target) * 100));
          const percentageBn = formatBengaliPercentage(project.collected, project.target);

          return (
            <div
              key={project.id}
              className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200"
            >
              {/* Top row: Icon + Title + Description */}
              <div className="flex items-start gap-3.5">
                {getProjectIcon(project.icon)}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {project.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {project.description}
                  </p>
                </div>
              </div>

              {/* Amount stats */}
              <div className="mt-4 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#0DA983] text-sm sm:text-base">
                    {formatBengaliCurrency(project.collected)}
                  </span>
                  <span className="text-slate-500 ml-1 font-medium">সংগৃহীত</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 font-medium">লক্ষ্য: </span>
                  <span className="font-bold text-slate-800 text-xs sm:text-sm">
                    {formatBengaliCurrency(project.target)}
                  </span>
                </div>
              </div>

              {/* Dynamic progress bar */}
              <div className="mt-2 w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#0DA983] to-[#0E9776] h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.max(percentageNumber, 2)}%` }}
                />
              </div>

              {/* Bottom footer: percentage + Donate button */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">
                  {percentageBn} সম্পন্ন
                </span>

                <button
                  onClick={() => onSelectProject(project.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold active:scale-95 transition-all"
                >
                  <HeartHandshake className="w-3.5 h-3.5" />
                  <span>এই প্রকল্পে দান করুন</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

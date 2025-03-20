import React, { ReactNode } from "react";

interface PageLayoutProps {
  title: string;
  children: ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ title, children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white px-4 py-12">
      <div className="container mx-auto max-w-4xl bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-center text-3xl font-bold mb-6 text-purple-800">
          {title}
        </h1>
        <div className="prose prose-purple max-w-none">{children}</div>
      </div>
    </div>
  );
};

export default PageLayout;

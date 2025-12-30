import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-dark text-white pt-12 pb-8 border-t border-neutral-800">
      <div className="container">
        <div className="flex flex-col items-center text-center">
          <h3 className="font-body text-2xl mb-4">会议记录助手</h3>
          <p className="font-body text-neutral-400 text-sm leading-relaxed max-w-md mb-8">
            AI 驱动的会议转录和摘要工具。精准捕捉每一个细节。
          </p>
          
          <p className="font-heading text-xs text-neutral-600 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Meeting Notes App. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

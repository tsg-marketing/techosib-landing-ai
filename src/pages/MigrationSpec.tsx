import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { MIGRATION_SPEC } from '@/data/migrationSpec';

export default function MigrationSpec() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    const prevTitle = document.title;
    document.title = 'ТЗ: перенос лендинга';
    return () => {
      document.head.removeChild(meta);
      document.title = prevTitle;
    };
  }, []);

  const downloadTxt = () => {
    const blob = new Blob([MIGRATION_SPEC], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'TZ-perenos-lendinga-technosib.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(MIGRATION_SPEC);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              ТЗ: перенос лендинга на новый URL
            </h1>
            <p className="text-xs text-gray-500">
              Служебная страница. Не индексируется и не показана в меню сайта.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={copyText} variant="outline" size="sm">
              <Icon name={copied ? 'Check' : 'Copy'} size={16} className="mr-2" />
              {copied ? 'Скопировано' : 'Скопировать'}
            </Button>
            <Button onClick={downloadTxt} size="sm">
              <Icon name="Download" size={16} className="mr-2" />
              Скачать TXT
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <pre className="p-4 md:p-6 text-[11px] md:text-xs leading-relaxed text-gray-800 whitespace-pre-wrap font-mono overflow-x-auto">
            {MIGRATION_SPEC}
          </pre>
        </div>
      </div>
    </div>
  );
}
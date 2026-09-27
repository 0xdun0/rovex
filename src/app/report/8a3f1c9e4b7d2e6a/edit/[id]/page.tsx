'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ThemeEditorRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id || '');

  useEffect(() => {
    if (id) {
      router.replace(`/report/8a3f1c9e4b7d2e6a?edit=${encodeURIComponent(id)}`);
    } else {
      router.replace('/report/8a3f1c9e4b7d2e6a');
    }
  }, [id, router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

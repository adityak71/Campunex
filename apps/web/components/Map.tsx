import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent3"></div>
    </div>
  ),
});

export default function Map(props: any) {
  return <MapComponent {...props} />;
}

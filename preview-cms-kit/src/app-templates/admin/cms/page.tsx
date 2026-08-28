import CmsEditor from '../../components/CmsEditor';

export const dynamic = 'force-dynamic';

export default function AdminCmsPage() {
  return (
    <div className="flex min-h-screen flex-col p-6">
      <CmsEditor />
    </div>
  );
}

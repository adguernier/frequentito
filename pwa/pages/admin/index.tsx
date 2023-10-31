import dynamic from "next/dynamic";

const AdminApp = dynamic(
  () => import("@/components/admin/AdminApp").then((mod) => mod.AdminApp),
  {
    ssr: false,
    loading: () => <p>Loading...</p>,
  }
);

const Index = () => <AdminApp />;

export default Index;

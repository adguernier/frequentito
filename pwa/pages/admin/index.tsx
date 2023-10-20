import dynamic from "next/dynamic";

const AdminApp = dynamic(() =>
  import("@/components/admin/AdminApp").then((mod) => mod.AdminApp)
);

const Index = () => <AdminApp />;

export default Index;

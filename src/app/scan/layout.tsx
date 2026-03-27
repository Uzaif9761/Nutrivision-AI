import DashboardLayout from "../dashboard/layout";

export default function ScanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

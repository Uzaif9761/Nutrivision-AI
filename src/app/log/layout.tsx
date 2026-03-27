import DashboardLayout from "../dashboard/layout";

export default function LogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

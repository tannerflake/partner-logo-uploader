export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full bg-neutral-100 text-neutral-900">{children}</div>
  );
}

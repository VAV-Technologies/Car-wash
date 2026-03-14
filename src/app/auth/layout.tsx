export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16)-theme(spacing.16))] flex-col items-center justify-center px-4 py-12 bg-white section-lines-dark">
      {/* Adjust min-h if navbar/footer height changes. Current assumes h-16 for navbar. Footer height is variable. */}
      {/* Fallback min-h if calc doesn't work perfectly: min-h-screen py-12 (will cause double scroll with main layout footer) */}
      {/* Better: Use flex-grow on main in root layout and ensure this div takes up available space if not full screen. */}
      {/* The main layout's main tag has flex-grow, so this should just center within that. */}
      {/* Added px-4 for horizontal padding on small screens */}
      {children}
    </div>
  );
}

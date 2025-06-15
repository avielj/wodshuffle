import AuthTabs from '../src/app/auth/page';

export default function ProfilePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      {/* Profile details or user info can go here */}
      <div className="flex gap-4 mt-6 w-full max-w-md">
        <AuthTabs />
      </div>
    </main>
  );
}

export default function TestEnv() {
  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Environment Test</h1>
      <div className="space-y-2">
        <p>NEXTAUTH_URL: {process.env.NEXTAUTH_URL ? '✅ Set' : '❌ Missing'}</p>
        <p>NEXTAUTH_SECRET: {process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing'}</p>
        <p>GOOGLE_CLIENT_ID: {process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing'}</p>
        <p>GEMINI_API_KEY: {process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing'}</p>
      </div>
    </div>
  );
}
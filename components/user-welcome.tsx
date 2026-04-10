export function UserWelcome({ fullName }: { fullName: string | null | undefined }) {
  if (!fullName) {
    return null;
  }

  return (
    <div className="welcomePill">
      환영합니다, <strong>{fullName}</strong>님
    </div>
  );
}

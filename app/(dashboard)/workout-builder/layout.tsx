import "./workout-builder.css";

export default function WorkoutBuilderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="wb-app -mx-6 -my-8">
      {children}
    </div>
  );
}

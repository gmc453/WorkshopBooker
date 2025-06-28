// src/app/page.tsx
import WorkshopList from "./components/WorkshopList";

export default function Home() {
  return (
    <main className="container mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Dostępne Warsztaty
      </h1>
      <WorkshopList />
    </main>
  );
}
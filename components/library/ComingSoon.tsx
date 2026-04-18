import { Card, CardContent } from "@/components/ui/Card";
import { Clock } from "lucide-react";

export default function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardContent className="py-16 text-center">
        <div className="inline-flex w-12 h-12 bg-slate-100 rounded-full items-center justify-center mb-4">
          <Clock className="w-6 h-6 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">{description}</p>
      </CardContent>
    </Card>
  );
}

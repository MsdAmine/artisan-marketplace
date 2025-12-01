import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProductCard({ p, onAdd }) {
  return (
    <Card className="overflow-hidden border hover:shadow-lg transition shadow-sm rounded-xl">
      <div className="h-52 w-full bg-gray-200">
        <img
          src={p.images?.[0] || "https://via.placeholder.com/300"}
          className="w-full h-full object-cover"
          alt={p.name}
        />
      </div>

      <CardContent className="p-4">
        <h2 className="text-lg font-medium">{p.name}</h2>
        <p className="text-sm text-gray-500">{p.category}</p>
      </CardContent>

      <CardFooter className="p-4 flex items-center justify-between">
        <span className="font-semibold text-primary text-lg">
          {p.price} MAD
        </span>
        <Button onClick={onAdd} size="sm">
          Ajouter
        </Button>
      </CardFooter>
    </Card>
  );
}

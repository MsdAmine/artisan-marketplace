import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import ProductModal from "./ProductModal";

export default function ProductCard({ p }: any) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card
        className="shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 cursor-pointer"
        onClick={() => setOpen(true)}
      >
        {p.image && (
          <img
            src={`http://localhost:3000${p.image}`}
            className="w-full h-40 object-cover rounded-t-lg"
          />
        )}

        <CardHeader>
          <CardTitle className="text-lg font-semibold">{p.name}</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {p.description}
          </p>
          <p className="font-bold text-primary text-xl">{p.price} MAD</p>
        </CardContent>

        <CardFooter>
          <Button
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
          >
            Voir Détails
          </Button>
        </CardFooter>
      </Card>

      <ProductModal open={open} onClose={() => setOpen(false)} product={p} />
    </>
  );
}

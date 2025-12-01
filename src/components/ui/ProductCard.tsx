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
        className="rounded-xl border border-border shadow-sm 
             hover:shadow-lg hover:-translate-y-1
             transition-all duration-300 overflow-hidden cursor-pointer
             bg-gradient-to-b from-white to-gray-50 group"
        onClick={() => setOpen(true)}
      >
        {/* Image */}
        <div className="relative">
          <img
            src={p.image}
            alt={p.name}
            className="w-full h-52 object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-[17px] font-semibold text-primary tracking-tight">
            {p.name}
          </h3>

          <p className="text-secondary text-[14px] mt-1 line-clamp-2">
            {p.description}
          </p>

          <div className="text-[20px] font-bold text-primary mt-4 tracking-tight">
            {p.price} MAD
          </div>

          <Button
            className="w-full mt-5 bg-primary text-white rounded-lg
                 hover:bg-[#0f172a] active:scale-[0.98] transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
          >
            Voir Détails
          </Button>
        </div>
      </Card>

      <ProductModal open={open} onClose={() => setOpen(false)} product={p} />
    </>
  );
}

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function DeleteConfirmModal({ open, onClose, product, onDeleted }: any) {
  if (!product) return null;

  async function deleteProduct() {
    const res = await fetch(`http://localhost:3000/api/artisans/${product._id}`, {
      method: "DELETE"
    });

    if (res.ok) {
      onDeleted();
      onClose();
    } else {
      alert("Erreur lors de la suppression");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Supprimer ce produit ?</DialogTitle>
        </DialogHeader>

        <p className="mb-4">
          Voulez-vous vraiment supprimer <b>{product.name}</b> ?
        </p>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={deleteProduct}>
            Supprimer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  Upload,
  X,
  Package,
  DollarSign,
  Hash,
  Tag,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function AddProductModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    artisanId: "demo-artisan",
  });

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    "Textile",
    "Poterie",
    "Bijoux",
    "Décoration",
    "Cuir",
    "Bois",
    "Métal",
    "Autre",
  ];

  function updateField(field: string, value: any) {
    setForm({ ...form, [field]: value });
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        // 5MB limit
        setErrors((prev) => ({
          ...prev,
          image: "L'image doit faire moins de 5MB",
        }));
        return;
      }
      if (!selectedFile.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          image: "Veuillez sélectionner une image",
        }));
        return;
      }
      setFile(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  }

  function validateForm() {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) newErrors.name = "Le nom est requis";
    if (!form.description.trim())
      newErrors.description = "La description est requise";
    if (!form.price || Number(form.price) <= 0)
      newErrors.price = "Prix invalide";
    if (!form.stock || Number(form.stock) < 0)
      newErrors.stock = "Stock invalide";
    if (!form.category.trim()) newErrors.category = "La catégorie est requise";
    if (!file) newErrors.image = "Une image est requise";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function createProduct() {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      let imageUrl = "";

      // -----------------------------------------
      // 1. Upload image to Cloudinary
      // -----------------------------------------
      if (file) {
        const imgForm = new FormData();
        imgForm.append("image", file);

        const uploadRes = await fetch("http://localhost:3000/api/upload", {
          method: "POST",
          body: imgForm,
        });

        if (!uploadRes.ok) {
          setErrors((prev) => ({
            ...prev,
            submit: "Erreur lors de l'upload de l'image.",
          }));
          setLoading(false);
          return;
        }

        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }

      // -----------------------------------------
      // 2. Build product JSON body (MISSING)
      // -----------------------------------------
      const productBody = {
        ...form,
        image: imageUrl,
        price: Number(form.price),
        stock: Number(form.stock),
      };

      const res = await fetch("http://localhost:3000/api/artisans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productBody),
      });

      if (!res.ok) {
        setErrors((prev) => ({
          ...prev,
          submit: "Erreur lors de la création du produit.",
        }));
        setLoading(false);
        return;
      }

      const result = await res.json(); // ✅ REQUIRED

      // Success
      onCreated();
      onClose();
      resetForm();
      setLoading(false);
    } catch (error) {
      console.error(error);
      setErrors((prev) => ({
        ...prev,
        submit: "Erreur inattendue. Veuillez réessayer.",
      }));
    }

    setLoading(false);
  }

  function resetForm() {
    setForm({
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "",
      artisanId: "demo-artisan",
    });
    setFile(null);
    setImagePreview(null);
    setActiveStep(1);
    setErrors({});
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  const ProductSummary = () => (
    <Card className="border-border">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            {imagePreview ? (
              <div className="h-20 w-20 rounded-apple overflow-hidden border border-border">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="h-20 w-20 rounded-apple bg-muted flex items-center justify-center">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div>
              <h4 className="font-semibold">
                {form.name || "Nouveau produit"}
              </h4>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {form.description || "Aucune description"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Prix:</span>
              <span className="font-semibold ml-2">
                {form.price ? `${form.price} MAD` : "-"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Stock:</span>
              <span className="font-semibold ml-2">{form.stock || "0"}</span>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Catégorie:</span>
              <Badge className="ml-2 rounded-full" variant="outline">
                {form.category || "Non définie"}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl rounded-apple max-h-[90vh] md:max-h-[85vh] overflow-y-auto my-4 md:my-8">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Package className="h-6 w-6" />
            Ajouter un nouveau produit
          </DialogTitle>
          <DialogDescription>
            Remplissez les informations de votre produit artisanal
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          <div
            className={`flex items-center gap-2 ${
              activeStep >= 1 ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center border ${
                activeStep >= 1
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border"
              }`}
            >
              1
            </div>
            <span className="text-sm font-medium">Informations</span>
          </div>
          <div className="flex-1 h-px bg-border mx-4" />
          <div
            className={`flex items-center gap-2 ${
              activeStep >= 2 ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center border ${
                activeStep >= 2
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border"
              }`}
            >
              2
            </div>
            <span className="text-sm font-medium">Vérification</span>
          </div>
        </div>

        {activeStep === 1 ? (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Package className="h-4 w-4" />
                  Nom du produit
                </label>
                <Input
                  id="name"
                  placeholder="Ex: Tapis berbère premium"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="price"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <DollarSign className="h-4 w-4" />
                  Prix (MAD)
                </label>
                <Input
                  id="price"
                  placeholder="Ex: 890"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => updateField("price", e.target.value)}
                  className={errors.price ? "border-red-500" : ""}
                />
                {errors.price && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.price}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="stock"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Hash className="h-4 w-4" />
                  Quantité en stock
                </label>
                <Input
                  id="stock"
                  placeholder="Ex: 10"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => updateField("stock", e.target.value)}
                  className={errors.stock ? "border-red-500" : ""}
                />
                {errors.stock && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.stock}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="category"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Tag className="h-4 w-4" />
                  Catégorie
                </label>
                <select
                  id="category"
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-apple bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                    errors.category ? "border-red-500" : "border-border"
                  }`}
                >
                  <option value="">Sélectionnez une catégorie</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.category}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description du produit
              </label>
              <Textarea
                id="description"
                placeholder="Décrivez votre produit en détail..."
                rows={3}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <ImageIcon className="h-4 w-4" />
                Image du produit
              </label>

              {imagePreview ? (
                <div className="relative">
                  <div className="border border-border rounded-apple p-4">
                    <div className="flex items-center gap-4">
                      <div className="h-24 w-24 rounded-apple overflow-hidden">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-2">
                          {file?.name}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFile(null);
                            setImagePreview(null);
                          }}
                          className="gap-2 rounded-apple"
                        >
                          <X className="h-3 w-3" />
                          Changer l'image
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-apple p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="space-y-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                        <Upload className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          Glissez-déposez votre image ou cliquez pour parcourir
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          PNG, JPG, GIF jusqu'à 5MB
                        </p>
                      </div>
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
              {errors.image && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.image}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Preview Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">
                Vérifiez les informations
              </h3>
              <p className="text-muted-foreground">
                Vérifiez les détails de votre produit avant de le publier.
              </p>
              <ProductSummary />
            </div>

            {/* Warning if any fields are empty */}
            {(!form.name ||
              !form.description ||
              !form.price ||
              !form.stock ||
              !form.category ||
              !file) && (
              <div className="bg-amber-50 border border-amber-200 rounded-apple p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900 mb-1">
                      Informations manquantes
                    </p>
                    <p className="text-sm text-amber-700">
                      Tous les champs sont requis. Veuillez revenir à l'étape 1
                      pour compléter le formulaire.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-apple p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <p className="text-sm text-red-700">{errors.submit}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={handleClose}
            className="rounded-apple"
          >
            Annuler
          </Button>

          <div className="flex items-center gap-3">
            {activeStep === 1 ? (
              <Button
                variant="default"
                onClick={() => setActiveStep(2)}
                className="gap-2 rounded-apple"
                disabled={!form.name || !form.description}
              >
                Continuer
                <CheckCircle className="h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setActiveStep(1)}
                  className="rounded-apple"
                >
                  Retour
                </Button>
                <Button
                  onClick={createProduct}
                  disabled={
                    loading ||
                    !form.name ||
                    !form.description ||
                    !form.price ||
                    !form.stock ||
                    !form.category ||
                    !file
                  }
                  className="gap-2 rounded-apple"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Créer le produit
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ProductCard({ product, onAddToCart }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 flex flex-col">
      {product.images?.[0] && (
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-40 w-full object-cover rounded-lg mb-3"
        />
      )}
      <h3 className="font-semibold text-slate-800">{product.name}</h3>
      <p className="text-xs text-slate-500 mb-1">
        {product.category} • {product.artisanName}
      </p>
      <p className="text-lg font-bold text-indigo-600 mb-3">
        {product.price} {product.currency}
      </p>
      <button
        onClick={onAddToCart}
        className="mt-auto inline-flex justify-center rounded-lg px-3 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700"
      >
        Ajouter au panier
      </button>
    </div>
  );
}
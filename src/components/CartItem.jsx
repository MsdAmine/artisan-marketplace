export default function CartItem({ item }) {
  return (
    <div className="flex items-center justify-between bg-white rounded-lg border px-3 py-2 mb-2">
      <div>
        <p className="font-medium text-sm">{item.productName}</p>
        <p className="text-xs text-slate-500">
          {item.quantity} x {item.unitPrice} {item.currency}
        </p>
      </div>
      <p className="font-semibold text-sm">
        {item.subtotal} {item.currency}
      </p>
    </div>
  );
}
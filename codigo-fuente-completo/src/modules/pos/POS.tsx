import { useMemo, useState } from 'react';
import { AlertTriangle, ScanBarcode, Trash2 } from 'lucide-react';
import { Badge, Button, Card, CardDescription, CardHeader, CardTitle, Field, Input, Modal } from '@/design-system/components';
import { money, uid } from '@/lib/utils';
import { enqueueOperation } from '@/offline/offlineQueue';
import type { CartItem, Product } from '@/types';

const demoProducts: Product[] = [
  { id: 'p1', name: 'Acetaminofén 500mg', sku: 'MED-001', barcode: '7460001', price: 125, taxRate: 0.18, stock: 12, unit: 'UND', category: 'Farmacia', lot: 'L-230', expirationDate: '2027-02-01', requiresLot: true },
  { id: 'p2', name: 'Servicio de instalación', sku: 'SER-001', price: 1500, taxRate: 0.18, stock: 9999, unit: 'SERV', category: 'Servicios' },
  { id: 'p3', name: 'Producto sin existencia', sku: 'INV-000', price: 450, taxRate: 0.18, stock: 0, unit: 'UND', category: 'Inventario' }
];

export function POS() {
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [authorizationReason, setAuthorizationReason] = useState<string | null>(null);
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);

  const products = useMemo(() => demoProducts.filter((product) => `${product.name} ${product.sku} ${product.barcode}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const subtotal = cart.reduce((acc, item) => acc + item.quantity * item.unitPrice - item.discount, 0);
  const taxes = cart.reduce((acc, item) => acc + (item.quantity * item.unitPrice - item.discount) * item.product.taxRate, 0);
  const total = subtotal + taxes;

  function addProduct(product: Product) {
    if (product.stock <= 0) {
      setPendingProduct(product);
      setAuthorizationReason('Venta sin existencia');
      return;
    }
    setCart((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) return current.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...current, { product, quantity: 1, unitPrice: product.price, discount: 0 }];
    });
  }

  function approveAuthorization() {
    if (!pendingProduct) return;
    const authorizationId = uid('auth');
    setCart((current) => [...current, { product: pendingProduct, quantity: 1, unitPrice: pendingProduct.price, discount: 0, authorizationId }]);
    setPendingProduct(null);
    setAuthorizationReason(null);
  }

  async function finishSale() {
    const saleId = uid('sale');
    await enqueueOperation('sales', 'insert', {
      id: saleId,
      subtotal,
      tax_total: taxes,
      total,
      status: 'completed',
      items: cart.map((item) => ({ product_id: item.product.id, quantity: item.quantity, unit_price: item.unitPrice, discount: item.discount, authorization_id: item.authorizationId ?? null }))
    }, `sale:${saleId}`);
    setCart([]);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>POS</CardTitle>
            <CardDescription>Busca por nombre, SKU, código de barras o QR.</CardDescription>
          </div>
          <Badge tone={navigator.onLine ? 'success' : 'warning'}>{navigator.onLine ? 'Online' : 'Offline'}</Badge>
        </CardHeader>
        <div className="mb-4 flex items-center gap-2">
          <div className="relative flex-1">
            <ScanBarcode className="absolute left-3 top-3 text-slate-400" size={18} />
            <Input className="pl-10" placeholder="Buscar producto..." value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <Button variant="outline">Cliente</Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <button key={product.id} onClick={() => addProduct(product)} className="rounded-3xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <div className="font-bold">{product.name}</div>
              <div className="mt-1 text-xs text-muted">SKU {product.sku}</div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-lg font-black">{money(product.price)}</span>
                <Badge tone={product.stock > 0 ? 'success' : 'danger'}>{product.stock} disp.</Badge>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card className="xl:sticky xl:top-5 xl:self-start">
        <CardHeader>
          <div>
            <CardTitle>Carrito</CardTitle>
            <CardDescription>{cart.length} producto(s)</CardDescription>
          </div>
        </CardHeader>
        <div className="space-y-3">
          {cart.map((item) => (
            <div key={`${item.product.id}-${item.authorizationId ?? 'normal'}`} className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold">{item.product.name}</div>
                  <div className="text-xs text-muted">{item.quantity} x {money(item.unitPrice)}</div>
                  {item.authorizationId && <Badge tone="warning" className="mt-2">Autorizado</Badge>}
                </div>
                <Button variant="ghost" size="sm" onClick={() => setCart((current) => current.filter((cartItem) => cartItem !== item))}><Trash2 size={16} /></Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-2 border-t border-slate-200 pt-4 text-sm dark:border-slate-800">
          <div className="flex justify-between"><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
          <div className="flex justify-between"><span>Impuestos</span><strong>{money(taxes)}</strong></div>
          <div className="flex justify-between text-xl"><span>Total</span><strong>{money(total)}</strong></div>
        </div>
        <Button className="mt-5 w-full" size="lg" disabled={!cart.length} onClick={() => void finishSale()}>Cobrar</Button>
      </Card>

      <Modal open={!!authorizationReason} title="Autorización requerida" onClose={() => setAuthorizationReason(null)}>
        <div className="space-y-4">
          <div className="rounded-2xl bg-amber-50 p-4 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
            <div className="flex gap-3"><AlertTriangle /><p>Esta operación requiere autorización: <strong>{authorizationReason}</strong>.</p></div>
          </div>
          <Field label="Usuario autorizador"><Input placeholder="Supervisor o administrador" /></Field>
          <Field label="Contraseña/PIN"><Input type="password" placeholder="PIN de autorización" /></Field>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAuthorizationReason(null)}>Cancelar</Button>
            <Button onClick={approveAuthorization}>Autorizar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

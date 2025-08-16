'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';

type Order = {
  id: string;
  customerEmail: string;
  products: Array<{
    id: string;
    name: string;
    price: string;
    quantity: number;
  }>;
  total: string;
  status: 'pending' | 'paid' | 'shipped' | 'completed';
  createdAt: string;
};

export default function OrdersPage() {
  const router = useRouter();
  const { authenticated } = usePrivy();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authenticated) return;

    // Mock orders data (backend dev will replace with real API)
    const mockOrders: Order[] = [
      {
        id: '1',
        customerEmail: 'customer@example.com',
        products: [
          { id: '1', name: 'Sample T-Shirt', price: '29.99', quantity: 2 }
        ],
        total: '59.98',
        status: 'paid',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        customerEmail: 'buyer@test.com',
        products: [
          { id: '2', name: 'Coffee Mug', price: '15.50', quantity: 1 }
        ],
        total: '15.50',
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
    ];

    setTimeout(() => {
      setOrders(mockOrders);
      setIsLoading(false);
    }, 500);
  }, [authenticated]);

  if (!authenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Add back button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push('/onboarding/store')}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          ← Back to Dashboard
        </button>
      </div>

      <h1 className="text-2xl font-bold">Orders</h1>

      {isLoading ? (
        <div className="text-center py-8">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold">Order #{order.id}</h3>
                  <p className="text-sm text-gray-600">{order.customerEmail}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              <div className="space-y-2 mb-3">
                {order.products.map((product) => (
                  <div key={product.id} className="flex justify-between text-sm">
                    <span>{product.name} × {product.quantity}</span>
                    <span>${(parseFloat(product.price) * product.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <span className="font-semibold">Total: ${order.total}</span>
                <div className="space-x-2">
                  {order.status === 'paid' && (
                    <button className="text-blue-600 hover:text-blue-700 text-sm">
                      Mark as Shipped
                    </button>
                  )}
                  <button className="text-gray-600 hover:text-gray-700 text-sm">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
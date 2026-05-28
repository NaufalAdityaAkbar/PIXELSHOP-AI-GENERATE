"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/src/context/AppContext';
import ProductsView from '@/src/components/ProductsView';

export default function ProductsPage() {
  const { products, addProduct, editProduct, deleteProduct, selectProductForTool } = useAppContext();
  const router = useRouter();

  return (
    <ProductsView
      products={products}
      onAddProduct={addProduct}
      onEditProduct={editProduct}
      onDeleteProduct={deleteProduct}
      onSelectProductForTool={(p, toolId) => {
        selectProductForTool(p, toolId);
        router.push(`/${toolId.replace('_', '-')}`);
      }}
    />
  );
}

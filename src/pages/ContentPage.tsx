import { useCallback, useEffect, useState } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DataTable } from '../components/DataTable';
import { Layout } from '../components/Layout';
import { Pagination, formatDate } from '../components/Pagination';
import {
  PAGE_SIZE,
  deletePost,
  deleteProduct,
  fetchPosts,
  fetchProducts,
  fetchProfilesByIds,
} from '../services/adminApi';
import type { Post, Product, Profile } from '../types/database';

type Tab = 'posts' | 'products';

export function ContentPage() {
  const [tab, setTab] = useState<Tab>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [authors, setAuthors] = useState<Map<string, Profile>>(new Map());
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ type: Tab; id: string; label: string } | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (tab === 'posts') {
        const result = await fetchPosts(page);
        setPosts(result.rows);
        setTotal(result.total);
        const sellerIds = result.rows.map((p) => p.seller_id);
        setAuthors(await fetchProfilesByIds(sellerIds));
      } else {
        const result = await fetchProducts(page);
        setProducts(result.rows);
        setTotal(result.total);
        const sellerIds = result.rows.map((p) => p.seller_id);
        setAuthors(await fetchProfilesByIds(sellerIds));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  }, [page, tab]);

  useEffect(() => {
    load();
  }, [load]);

  function requestDelete(type: Tab, id: string, label: string) {
    setPendingDelete({ type, id, label });
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    setError(null);

    try {
      if (pendingDelete.type === 'posts') {
        await deletePost(pendingDelete.id);
      } else {
        await deleteProduct(pendingDelete.id);
      }
      setConfirmOpen(false);
      setPendingDelete(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Layout title="Content moderation">
      <div className="mb-6 flex gap-2">
        {(['posts', 'products'] as Tab[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setPage(0);
              setTab(key);
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${
              tab === key
                ? 'bg-primary text-white'
                : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {loading && <p className="text-gray-500">Loading…</p>}

      {!loading && tab === 'posts' && (
        <>
          <DataTable
            rows={posts}
            rowKey={(row) => row.id}
            columns={[
              {
                key: 'media',
                header: 'Preview',
                render: (row) =>
                  row.media_type === 'image' ? (
                    <img src={row.media_url} alt="" className="h-12 w-12 rounded object-cover" />
                  ) : (
                    <span className="text-xs text-gray-500">Video</span>
                  ),
              },
              {
                key: 'caption',
                header: 'Caption',
                render: (row) => (
                  <span className="line-clamp-2 max-w-xs">{row.caption || '—'}</span>
                ),
              },
              {
                key: 'author',
                header: 'Author',
                render: (row) => {
                  const author = authors.get(row.seller_id);
                  return author?.full_name || author?.username || row.seller_name || '—';
                },
              },
              {
                key: 'created',
                header: 'Created',
                render: (row) => formatDate(row.created_at),
              },
              {
                key: 'actions',
                header: 'Actions',
                render: (row) => (
                  <button
                    type="button"
                    onClick={() => requestDelete('posts', row.id, row.caption || row.id)}
                    className="text-sm font-medium text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                ),
              },
            ]}
          />
          <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </>
      )}

      {!loading && tab === 'products' && (
        <>
          <DataTable
            rows={products}
            rowKey={(row) => row.id}
            columns={[
              { key: 'title', header: 'Title', render: (row) => row.title },
              {
                key: 'seller',
                header: 'Seller',
                render: (row) => {
                  const seller = authors.get(row.seller_id);
                  return seller?.full_name || seller?.username || row.seller_id.slice(0, 8) + '…';
                },
              },
              {
                key: 'price',
                header: 'Price',
                render: (row) => `${row.currency} ${row.price.toLocaleString()}`,
              },
              {
                key: 'created',
                header: 'Created',
                render: (row) => formatDate(row.created_at),
              },
              {
                key: 'actions',
                header: 'Actions',
                render: (row) => (
                  <button
                    type="button"
                    onClick={() => requestDelete('products', row.id, row.title)}
                    className="text-sm font-medium text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                ),
              },
            ]}
          />
          <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete content"
        message={`Are you sure you want to delete "${pendingDelete?.label ?? ''}"? This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setPendingDelete(null);
        }}
      />
    </Layout>
  );
}

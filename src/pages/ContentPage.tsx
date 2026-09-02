import { useCallback, useEffect, useState } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DataTable } from '../components/DataTable';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { ErrorBanner, LoadingState } from '../components/ui/Feedback';
import { Tabs } from '../components/ui/Tabs';
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
    <Layout title="Content" subtitle="Moderate posts and product listings">
      <div className="mb-6">
        <Tabs
          tabs={[
            { id: 'posts' as Tab, label: 'Posts' },
            { id: 'products' as Tab, label: 'Products' },
          ]}
          active={tab}
          onChange={(id) => {
            setPage(0);
            setTab(id);
          }}
        />
      </div>

      {error && (
        <div className="mb-4">
          <ErrorBanner message="Something went wrong" detail={error} />
        </div>
      )}

      {loading && tab === 'posts' && <LoadingState label="Loading posts…" />}
      {loading && tab === 'products' && <LoadingState label="Loading products…" />}

      {!loading && tab === 'posts' && (
        <>
          <DataTable
            rows={posts}
            rowKey={(row) => row.id}
            emptyMessage="No posts found."
            columns={[
              {
                key: 'media',
                header: 'Preview',
                render: (row) =>
                  row.media_type === 'image' ? (
                    <img
                      src={row.media_url}
                      alt=""
                      className="h-12 w-12 rounded-lg object-cover ring-1 ring-slate-200"
                    />
                  ) : (
                    <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">
                      Video
                    </span>
                  ),
              },
              {
                key: 'caption',
                header: 'Caption',
                className: 'max-w-xs whitespace-normal',
                render: (row) => (
                  <span className="line-clamp-2">{row.caption || '—'}</span>
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
                className: 'text-right',
                render: (row) => (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => requestDelete('posts', row.id, row.caption || row.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
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
            emptyMessage="No products found."
            columns={[
              {
                key: 'title',
                header: 'Title',
                render: (row) => <span className="font-medium text-slate-900">{row.title}</span>,
              },
              {
                key: 'seller',
                header: 'Seller',
                render: (row) => {
                  const seller = authors.get(row.seller_id);
                  return seller?.full_name || seller?.username || `${row.seller_id.slice(0, 8)}…`;
                },
              },
              {
                key: 'price',
                header: 'Price',
                render: (row) => (
                  <span className="font-medium tabular-nums">
                    {row.currency} {row.price.toLocaleString()}
                  </span>
                ),
              },
              {
                key: 'created',
                header: 'Created',
                render: (row) => formatDate(row.created_at),
              },
              {
                key: 'actions',
                header: 'Actions',
                className: 'text-right',
                render: (row) => (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => requestDelete('products', row.id, row.title)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
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
        message={`Are you sure you want to delete "${pendingDelete?.label ?? ''}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
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

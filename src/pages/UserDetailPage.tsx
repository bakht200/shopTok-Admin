import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { formatDate } from '../components/Pagination';
import { fetchProfileById, fetchUserStats } from '../services/adminApi';
import type { Profile } from '../types/database';

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<{ orders: number; posts: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('Missing user id');
      return;
    }

    const userId = id;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const user = await fetchProfileById(userId);
        if (!user) {
          setError('User not found');
          return;
        }
        setProfile(user);
        const userStats = await fetchUserStats(userId);
        setStats(userStats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  return (
    <Layout title="User detail">
      <Link to="/users" className="mb-6 inline-block text-sm font-medium text-primary hover:underline">
        ← Back to users
      </Link>

      {loading && <p className="text-gray-500">Loading…</p>}
      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {profile && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Name</dt>
                <dd className="text-right font-medium">{profile.full_name || '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Username</dt>
                <dd className="text-right">{profile.username ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Phone</dt>
                <dd className="text-right">{profile.phone ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Role intent</dt>
                <dd className="text-right capitalize">{profile.role_intent}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Region</dt>
                <dd className="text-right">{profile.region}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Banned</dt>
                <dd className="text-right">{profile.is_banned ? 'Yes' : 'No'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Admin</dt>
                <dd className="text-right">{profile.is_admin ? 'Yes' : 'No'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Joined</dt>
                <dd className="text-right">{formatDate(profile.created_at)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">Activity</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Orders placed</dt>
                <dd className="font-medium">{stats?.orders ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Posts created</dt>
                <dd className="font-medium">{stats?.posts ?? '—'}</dd>
              </div>
            </dl>
            {profile.bio && (
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-500">Bio</p>
                <p className="mt-1 text-sm text-gray-700">{profile.bio}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}

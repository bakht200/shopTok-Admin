import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Avatar } from '../components/ui/Avatar';
import { DetailCard, DetailRow, ErrorBanner, LoadingState } from '../components/ui/Feedback';
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
    <Layout
      title={profile?.full_name || profile?.username || 'User detail'}
      subtitle={profile ? `@${profile.username ?? 'no-username'} · Joined ${formatDate(profile.created_at)}` : undefined}
      backTo={{ label: 'Back to users', href: '/users' }}
    >
      {loading && <LoadingState label="Loading user…" />}
      {error && <ErrorBanner message="Unable to load user" detail={error} />}

      {profile && (
        <div className="space-y-6">
          <div className="card flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
            <Avatar name={profile.full_name} src={profile.avatar_url} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{profile.full_name || 'Unnamed user'}</h2>
                {profile.is_admin && (
                  <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
                    Admin
                  </span>
                )}
                {profile.is_banned && (
                  <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                    Banned
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {profile.username ? `@${profile.username}` : 'No username'} · {profile.region}
              </p>
              {profile.bio && <p className="mt-2 max-w-xl text-sm text-slate-600">{profile.bio}</p>}
            </div>

            <div className="flex gap-6 rounded-lg bg-slate-50 px-6 py-4">
              <div className="text-center">
                <p className="text-2xl font-bold tabular-nums text-slate-900">{stats?.orders ?? '—'}</p>
                <p className="text-xs font-medium text-slate-500">Orders</p>
              </div>
              <div className="w-px bg-slate-200" />
              <div className="text-center">
                <p className="text-2xl font-bold tabular-nums text-slate-900">{stats?.posts ?? '—'}</p>
                <p className="text-xs font-medium text-slate-500">Posts</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <DetailCard title="Profile details">
              <dl>
                <DetailRow label="Full name" value={profile.full_name || '—'} />
                <DetailRow label="Username" value={profile.username ? `@${profile.username}` : '—'} />
                <DetailRow label="Phone" value={profile.phone ?? '—'} />
                <DetailRow label="Role intent" value={<span className="capitalize">{profile.role_intent}</span>} />
                <DetailRow label="Region" value={profile.region} />
                <DetailRow
                  label="Onboarding"
                  value={
                    profile.onboarding_complete ? (
                      <span className="text-emerald-600">Complete</span>
                    ) : (
                      <span className="text-amber-600">Incomplete</span>
                    )
                  }
                />
              </dl>
            </DetailCard>

            <DetailCard title="Account status">
              <dl>
                <DetailRow
                  label="Account status"
                  value={
                    profile.is_banned ? (
                      <span className="text-red-600">Banned</span>
                    ) : (
                      <span className="text-emerald-600">Active</span>
                    )
                  }
                />
                <DetailRow label="Admin privileges" value={profile.is_admin ? 'Yes' : 'No'} />
                <DetailRow label="Member since" value={formatDate(profile.created_at)} />
                <DetailRow label="Last updated" value={formatDate(profile.updated_at)} />
                {profile.cnic && <DetailRow label="CNIC" value={profile.cnic} />}
              </dl>
            </DetailCard>
          </div>
        </div>
      )}
    </Layout>
  );
}
